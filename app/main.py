import os
import shutil
import joblib
from fastapi import Depends, FastAPI, File, Request, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import Base, engine, get_db
from app.models import PredictionLog, VisitLog
from app.audio_utils import preprocess_audio, extract_features

app = FastAPI(title="Hackaton Obninsk API")

ml_model = None
classes_list = []

@app.on_event("startup")
async def startup():
    global ml_model, classes_list
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    if os.path.exists("model.joblib"):
        saved_data = joblib.load("model.joblib")
        ml_model = saved_data["model"]
        classes_list = saved_data["classes"]

app.mount(
    "/assets",
    StaticFiles(directory="frontend/dist/assets"),
    name="assets"
)

@app.get("/")
async def serve_frontend(request: Request, db: AsyncSession = Depends(get_db)):
    client_ip = request.client.host if request.client else "unknown"
    new_visit = VisitLog(ip_address=client_ip)
    db.add(new_visit)
    await db.commit()
    
    return FileResponse("frontend/dist/index.html")

@app.get("/api/ping")
async def ping_db(db: AsyncSession = Depends(get_db)):
    return {"db_connection": "success"}

@app.post("/api/predict")
async def predict_audio(
    file: UploadFile = File(...), db: AsyncSession = Depends(get_db)
):
    temp_file_path = f"temp_{file.filename}"
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        waveform = preprocess_audio(temp_file_path)
        features = extract_features(waveform)
        
        if ml_model is not None:
            prediction_idx = ml_model.predict([features.numpy()])[0]
            prediction_result = classes_list[prediction_idx]
        else:
            prediction_result = "Модель не загружена"
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

    prediction_log = PredictionLog(
        filename=file.filename or "unknown", result=prediction_result
    )
    db.add(prediction_log)
    await db.commit()

    return {"filename": file.filename, "prediction": prediction_result}
