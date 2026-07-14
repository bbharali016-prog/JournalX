from pydantic import BaseModel
from typing import Optional


class TradeCreate(BaseModel):
    symbol: str
    side: str
    lot_size: float
    entry_price: float
    exit_price: float
    profit: float
    notes: Optional[str] = None


class TradeResponse(TradeCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True