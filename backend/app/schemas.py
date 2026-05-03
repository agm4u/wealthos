from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InvestmentBase(BaseModel):
    category: str
    name: str
    platform: Optional[str] = None
    bank_account: Optional[str] = None
    current_value: float = 0
    monthly_amount: float = 0
    notes: Optional[str] = None

class InvestmentCreate(InvestmentBase):
    pass

class InvestmentUpdate(BaseModel):
    category: Optional[str] = None
    name: Optional[str] = None
    platform: Optional[str] = None
    bank_account: Optional[str] = None
    current_value: Optional[float] = None
    monthly_amount: Optional[float] = None
    notes: Optional[str] = None

class InvestmentOut(InvestmentBase):
    id: int
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class TransferBase(BaseModel):
    bank: str
    amount: float

class TransferOut(TransferBase):
    id: int
    class Config:
        from_attributes = True

class MetaUpdate(BaseModel):
    value: str
