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
        db.add(PortfolioMeta(key="valuation_date", value="May 5, 2026"))
        db.commit()
    # Seed transfers if empty
    if db.query(MonthlyTransfer).count() == 0:
        for bank, amount in [("SBI", 48000), ("ICICI", 37000), ("Fi", 35000), ("Kotak", 10000)]:
            db.add(MonthlyTransfer(bank=bank, amount=amount))
        db.commit()
    # Seed investments if empty
    if db.query(Investment).count() == 0:
        seeds = [
            ("MF", "ET Money", "ET Money", "SBI", 4300000, 43000, ""),
            ("MF", "Black by ClearTax", "Black", "SBI", 1200000, 12000, ""),
            ("MF", "Paytm Money", "Paytm", "SBI", 100000, 1000, ""),
            ("MF", "INDmoney MF", "INDmoney", "ICICI", 1000000, 10000, ""),
            ("MF", "Direct MF", "Direct", "SBI", 531000, 7000, ""),
            ("FD", "Stable Money FD", "Stable Money", "", 850000, 0, "8.5L"),
            ("FD", "Stable Money FD 2", "Stable Money", "", 750000, 0, "7.5L"),
            ("FD", "ET Money / Bajaj FD", "ET Money", "", 150000, 0, "1.5L"),
            ("FD", "ICICI FD", "ICICI", "", 2250000, 0, "22.5L"),
            ("FD", "OneCard FD", "OneCard", "", 2200, 0, "2.2K"),
            ("FD", "UBI FD", "UBI", "", 445000, 0, "4.45L"),
            ("Bond", "Stable Money Bonds", "Stable Money", "", 750000, 0, "7.5L"),
            ("Shares", "Zerodha Stocks", "Zerodha", "", 250000, 0, ""),
            ("ETF", "Paytm ETF", "Paytm", "", 25000, 0, ""),
            ("US", "INDmoney US Shares", "INDmoney", "ICICI", 144000, 3000, ""),
            ("Crypto", "WazirX", "WazirX", "", 833, 0, ""),
            ("Crypto", "CoinDCX", "CoinDCX", "", 833, 0, ""),
            ("Crypto", "Coinswitch", "Coinswitch", "", 834, 0, ""),
            ("NPS", "ET Money NPS", "ET Money", "SBI", 292000, 5000, ""),
            ("PPF", "ICICI PPF", "ICICI", "ICICI", 282000, 5000, ""),
            ("EPF", "EPFO", "EPFO", "", 670000, 0, ""),
            ("Gold", "PhonePe Gold", "PhonePe", "Fi", 65000, 3750, ""),
            ("Gold", "Cred Gold", "Cred", "ICICI", 65000, 3750, ""),
        ]
        for cat, name, platform, bank, val, monthly, notes in seeds:
            db.add(Investment(category=cat, name=name, platform=platform,
                              bank_account=bank, current_value=val,
                              monthly_amount=monthly, notes=notes))
        db.commit()
    db.close()
