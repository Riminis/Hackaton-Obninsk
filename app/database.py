import os
import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/hackaton")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class PredictionRecord(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    predicted_class = Column(String, nullable=False)
    duration = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    filename = Column(String, nullable=False)

def init_db():
    Base.metadata.create_all(bind=engine)
