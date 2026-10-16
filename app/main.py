import os
import shutil
import datetime
import joblib
import librosa
from fastapi import FastAPI, UploadFile, File, Request, Depends
from sqlalchemy.orm import Session
from app.audio_utils import preprocess_audio, extract_features
from app.database import SessionLocal, init_db, PredictionRecord

app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

MODEL_PATH = "model.joblib"
model_data = joblib.load(MODEL_PATH)
model = model_data["model"]
classes = model_data["classes"]

@app.on_event("startup")
def startup_event():
    init_db()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/predict")
async def predict(request: Request, file: UploadFile = File(...), db: Session = Depends(get_db)):
    filename = file.filename or "audio.mp3"
    file_location = os.path.join(UPLOAD_DIR, filename)
    with open(file_location, "wb+") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    y_data, sr = librosa.load(file_location, sr=None)
    duration = float(len(y_data) / sr)
    
    waveform = preprocess_audio(file_location)
    features = extract_features(waveform).numpy().reshape(1, -1)
    
    pred_idx = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]
    confidence = float(probabilities[pred_idx])
    predicted_class = classes[pred_idx]
    
    client_ip = request.client.host if request.client else "127.0.0.1"
    
    record = PredictionRecord(
        ip_address=client_ip,
        timestamp=datetime.datetime.utcnow(),
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
