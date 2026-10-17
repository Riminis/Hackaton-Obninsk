import os
import shutil
from datetime import datetime, timezone
from contextlib import asynccontextmanager
import joblib
import librosa
from fastapi import FastAPI, UploadFile, File, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.audio_utils import preprocess_audio, extract_features
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
async def predict(request: Request, file: UploadFile = File(...), db: Session = Depends(get_db)):
    filename = file.filename or "audio.mp3"
    file_location = os.path.join(UPLOAD_DIR, filename)
    
    with open(file_location, "wb+") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        y_data, sr = librosa.load(file_location, sr=None)
        duration = float(len(y_data) / sr)

        waveform = preprocess_audio(file_location)
        features = extract_features(waveform).numpy().reshape(1, -1)
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))
    except Exception as err:
        raise HTTPException(status_code=500, detail="Ошибка обработки аудиофайла.")

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
        filename=filename
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "predicted_class": predicted_class,
        "confidence": confidence,
        "duration": duration,
        "filename": filename
    }
