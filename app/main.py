from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db

app = FastAPI(title="Hackathon Obninsk API")

@app.get("/")
async def root():
    return {"message": "Новая сессия", "status": "ok"}

@app.get("/api/ping")
async def ping_db(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(text("SELECT 1"))
        val = result.scalar()
        return {"db_connection": "success", "result": val}
    except Exception as e:
        return {"db_connection": "error", "detail": str(e)}
