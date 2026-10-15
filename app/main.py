from app.database import Base, engine, get_db
from app.models import VisitLog
from fastapi import Depends, FastAPI, Request
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

app = FastAPI(title="Hackathon Obninsk API")


@app.on_event("startup")
async def startup():
  async with engine.begin() as conn:
    await conn.run_sync(Base.metadata.create_all)


@app.get("/")
async def root(request: Request, db: AsyncSession = Depends(get_db)):
  client_ip = request.client.host if request.client else "unknown"

  new_visit = VisitLog(ip_address=client_ip)
  db.add(new_visit)
  await db.commit()

  return {
      "message": "Сессия активна, визит записан в PostgreSQL!",
      "status": "ok",
      "client_ip": client_ip,
  }


@app.get("/api/ping")
async def ping_db(db: AsyncSession = Depends(get_db)):
  try:
    result = await db.execute(text("SELECT 1"))
    val = result.scalar()
    return {"db_connection": "success", "result": val}
  except Exception as e:
    return {"db_connection": "error", "detail": str(e)}
