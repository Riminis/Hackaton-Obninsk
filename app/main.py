from fastapi import Depends, FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import Base, engine, get_db
from app.models import VisitLog

app = FastAPI(title="Hackathon Obninsk API")


@app.on_event("startup")
async def startup():
  async with engine.begin() as conn:
    await conn.run_sync(Base.metadata.create_all)


# 1. Монтируем папку со стадией сборки Vite (скрипты, стили, картинки)
app.mount(
    "/assets", StaticFiles(directory="frontend/dist/assets"), name="assets"
)


# 2. Главный корень сайта отдаем с логикой логирования визита и рендером index.html
@app.get("/")
async def serve_frontend(request: Request, db: AsyncSession = Depends(get_db)):
  # Записываем визит в базу данных PostgreSQL
  client_ip = request.client.host if request.client else "unknown"
  new_visit = VisitLog(ip_address=client_ip)
  db.add(new_visit)
  await db.commit()

  # Отдаем собранный React-файл
  return FileResponse("frontend/dist/index.html")


@app.get("/api/ping")
async def ping_db(db: AsyncSession = Depends(get_db)):
  return {"db_connection": "success"}
