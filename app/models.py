import datetime
from app.database import Base
from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column


class VisitLog(Base):
  __tablename__ = "visit_logs"

  id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
  ip_address: Mapped[str] = mapped_column(String, nullable=True)
  visited_at: Mapped[datetime.datetime] = mapped_column(
      DateTime, default=datetime.datetime.utcnow
  )


class PredictionLog(Base):
  __tablename__ = "prediction_logs"

  id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
  filename: Mapped[str] = mapped_column(String, nullable=False)
  result: Mapped[str] = mapped_column(String, nullable=False)
  created_at: Mapped[datetime.datetime] = mapped_column(
      DateTime, default=datetime.datetime.utcnow
  )
