from datetime import datetime
from app.database import Base, engine, get_db
from fastapi import Depends, FastAPI, Request
from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

app = FastAPI(title="Hackathon Backend")


class VisitLog(Base):
  __tablename__ = "visit_logs"

  id = Column(Integer, primary_key=True, index=True)
  visit_time = Column(DateTime, default=datetime.utcnow)
  ip_address = Column(String, nullable=True)
  status = Column(String, default="success")


@app.on_event("startup")
async def startup_event():
  async with engine.begin() as conn:
    await conn.run_sync(Base.metadata.create_all)


@app.get("/")
async def home_page(request: Request, db: AsyncSession = Depends(get_db)):
  client_ip = request.client.host if request.client else "unknown"

  new_visit = VisitLog(
      visit_time=datetime.utcnow(), ip_address=client_ip, status="success"
  )

  db.add(new_visit)
  await db.commit()
  await db.refresh(new_visit)

  return {
      "message": "Бэкенд работает!",
      "status": "ok",
      "visit_logged": {
          "id": new_visit.id,
          "time": str(new_visit.visit_time),
          "ip": new_visit.ip_address,
      },
  }


@app.get("/api/ping")
async def ping_db(db: AsyncSession = Depends(get_db)):
  try:
    result = await db.execute(select(1))
    val = result.scalar()
    return {"db_connection": "success", "result": val}
  except Exception as e:
    return {"db_connection": "error", "detail": str(e)}

