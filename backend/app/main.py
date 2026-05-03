from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from .database import get_db, init_db, Investment, MonthlyTransfer, PortfolioMeta
from .schemas import (InvestmentCreate, InvestmentUpdate, InvestmentOut,
                       TransferBase, TransferOut, MetaUpdate)

app = FastAPI(title="WealthOS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()

# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok"}

# ── Dashboard summary ─────────────────────────────────────────────────────────
@app.get("/api/summary")
def summary(db: Session = Depends(get_db)):
    investments = db.query(Investment).all()
    transfers = db.query(MonthlyTransfer).all()
    meta = db.query(PortfolioMeta).all()
    meta_dict = {m.key: m.value for m in meta}

    total = sum(i.current_value for i in investments)
    monthly_invest = sum(i.monthly_amount for i in investments)
    monthly_transfer = sum(t.amount for t in transfers)

    by_category = {}
    for inv in investments:
        cat = inv.category
        if cat not in by_category:
            by_category[cat] = {"value": 0, "monthly": 0, "count": 0}
        by_category[cat]["value"] += inv.current_value
        by_category[cat]["monthly"] += inv.monthly_amount
        by_category[cat]["count"] += 1

    return {
        "total_portfolio": total,
        "monthly_investment": monthly_invest,
        "monthly_transfer_in": monthly_transfer,
        "valuation_date": meta_dict.get("valuation_date", ""),
        "by_category": by_category,
        "transfers": [{"id": t.id, "bank": t.bank, "amount": t.amount} for t in transfers],
    }

# ── Investments CRUD ──────────────────────────────────────────────────────────
@app.get("/api/investments", response_model=List[InvestmentOut])
def get_investments(category: str = None, db: Session = Depends(get_db)):
    q = db.query(Investment)
    if category:
        q = q.filter(Investment.category == category)
    return q.order_by(Investment.category, Investment.id).all()

@app.post("/api/investments", response_model=InvestmentOut)
def create_investment(data: InvestmentCreate, db: Session = Depends(get_db)):
    inv = Investment(**data.model_dump())
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv

@app.patch("/api/investments/{inv_id}", response_model=InvestmentOut)
def update_investment(inv_id: int, data: InvestmentUpdate, db: Session = Depends(get_db)):
    inv = db.query(Investment).filter(Investment.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Not found")
    for field, val in data.model_dump(exclude_none=True).items():
        setattr(inv, field, val)
    db.commit()
    db.refresh(inv)
    return inv

@app.delete("/api/investments/{inv_id}")
def delete_investment(inv_id: int, db: Session = Depends(get_db)):
    inv = db.query(Investment).filter(Investment.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(inv)
    db.commit()
    return {"ok": True}

# ── Transfers CRUD ────────────────────────────────────────────────────────────
@app.get("/api/transfers", response_model=List[TransferOut])
def get_transfers(db: Session = Depends(get_db)):
    return db.query(MonthlyTransfer).all()

@app.post("/api/transfers", response_model=TransferOut)
def create_transfer(data: TransferBase, db: Session = Depends(get_db)):
    t = MonthlyTransfer(**data.model_dump())
    db.add(t)
    db.commit()
    db.refresh(t)
    return t

@app.patch("/api/transfers/{t_id}", response_model=TransferOut)
def update_transfer(t_id: int, data: TransferBase, db: Session = Depends(get_db)):
    t = db.query(MonthlyTransfer).filter(MonthlyTransfer.id == t_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Not found")
    t.bank = data.bank
    t.amount = data.amount
    db.commit()
    db.refresh(t)
    return t

@app.delete("/api/transfers/{t_id}")
def delete_transfer(t_id: int, db: Session = Depends(get_db)):
    t = db.query(MonthlyTransfer).filter(MonthlyTransfer.id == t_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(t)
    db.commit()
    return {"ok": True}

# ── Meta ──────────────────────────────────────────────────────────────────────
@app.patch("/api/meta/{key}")
def update_meta(key: str, data: MetaUpdate, db: Session = Depends(get_db)):
    meta = db.query(PortfolioMeta).filter(PortfolioMeta.key == key).first()
    if not meta:
        meta = PortfolioMeta(key=key, value=data.value)
        db.add(meta)
    else:
        meta.value = data.value
    db.commit()
    return {"key": key, "value": data.value}
