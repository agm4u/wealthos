from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://wealthos:wealthos123@localhost:5432/wealthos")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Investment(Base):
    __tablename__ = "investments"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False)   # MF, FD, Bond, NPS, PPF, EPF, Gold, Shares, ETF, US, Crypto
    name = Column(String, nullable=False)
    platform = Column(String, nullable=True)
    bank_account = Column(String, nullable=True)
    current_value = Column(Float, default=0)
    monthly_amount = Column(Float, default=0)
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MonthlyTransfer(Base):
    __tablename__ = "monthly_transfers"
    id = Column(Integer, primary_key=True, index=True)
    bank = Column(String, nullable=False)
    amount = Column(Float, default=0)

class PortfolioMeta(Base):
    __tablename__ = "portfolio_meta"
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, nullable=False)
    value = Column(String, nullable=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    # Seed valuation date if not present
    meta = db.query(PortfolioMeta).filter_by(key="valuation_date").first()
    if not meta:
        db.add(PortfolioMeta(key="valuation_date", value="Today"))
        db.commit()
    db.close()
