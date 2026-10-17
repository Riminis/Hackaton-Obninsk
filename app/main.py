import os
import shutil
import uuid
from datetime import datetime, timezone
from pathlib import Path
from contextlib import asynccontextmanager
import joblib
import librosa
from fastapi import FastAPI, UploadFile, File, Request, Depends, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from app.audio_utils import preprocess_audio, extract_features, process_audio_file
from app.database import SessionLocal, init_db
from app.models import VisitLog, PredictionLog

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

MODEL_PATH = "model.joblib"
model_data = joblib.load(MODEL_PATH)
model = model_data["model"]
classes = model_data["classes"]

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.middleware("http")
async def log_visits(request: Request, call_next):
    db = SessionLocal()
    try:
        client_ip = request.client.host if request.client else "127.0.0.1"
        visit = VisitLog(ip_address=client_ip)
        db.add(visit)
        db.commit()
    except Exception:
        pass
    finally:
        db.close()

    response = await call_next(request)
    return response

@app.post("/api/predict")
async def predict(
    request: Request, 
    file: UploadFile = File(...), 
    denoise: bool = Form(True), 
    db: Session = Depends(get_db)
):
    try:
        original_name = file.filename or "audio.mp3"
        file_ext = Path(original_name).suffix
        if not file_ext:
            file_ext = ".mp3"

        unique_filename = f"{uuid.uuid4().hex}_{original_name}"
        if not unique_filename.endswith(file_ext):
            unique_filename += file_ext

        file_location = os.path.join(UPLOAD_DIR, unique_filename)

        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        processed_filename = f"denoised_{uuid.uuid4().hex}.wav"
        processed_location = os.path.join(UPLOAD_DIR, processed_filename)

        y_data, sr = process_audio_file(file_location, processed_location, apply_denoise=denoise)
        duration = float(len(y_data) / sr)

        waveform = preprocess_audio(file_location, apply_denoise=denoise)
        features = extract_features(waveform).numpy().reshape(1, -1)

        pred_idx = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        confidence = float(probabilities[pred_idx])
        predicted_class = classes[pred_idx]

        client_ip = request.client.host if request.client else "127.0.0.1"
        record = PredictionLog(
            ip_address=client_ip,
            timestamp=datetime.now(timezone.utc),
            predicted_class=predicted_class,
            duration=duration,
            confidence=confidence,
            filename=unique_filename
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        base_url = str(request.base_url).rstrip("/")
        processed_url = f"{base_url}/uploads/{processed_filename}"

        return {
            "predicted_class": predicted_class,
            "confidence": confidence,
            "material": predicted_class,
            "label": predicted_class,
            "prediction": predicted_class,
            "probability": confidence,
            "denoised_audio_url": processed_url,
            "processed_file": processed_url,
            "audio_url": processed_url,
        }

    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))
    except Exception as err:
        print(f"ERROR in /api/predict: {str(err)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Ошибка обработки: {str(err)}")
