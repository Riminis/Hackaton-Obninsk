from app.database import Base, engine, get_db
from app.models import PredictionLog, VisitLog
from fastapi import Depends, FastAPI, File, Request, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession

app = FastAPI(title="Hackathon Obninsk API")


@app.on_event("startup")
async def startup():
  async with engine.begin() as conn:
    await conn.run_sync(Base.metadata.create_all)


app.mount(
    "/assets", StaticFiles(directory="frontend/dist/assets"), name="assets"
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
  dummy_result = "Класс А (тестовый ответ)"

  prediction_log = PredictionLog(
      filename=file.filename or "unknown", result=dummy_result
  )
  db.add(prediction_log)
  await db.commit()

  return {"filename": file.filename, "prediction": dummy_result}
