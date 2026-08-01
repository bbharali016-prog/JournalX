from datetime import datetime
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
    image_url: Optional[str] = None
    account_id: Optional[int] = None
    created_at: Optional[datetime] = None


class TradeResponse(TradeCreate):
    id: int
    user_id: int
    created_at: datetime
    image_url: Optional[str]
    account_id: Optional[int]

    class Config:
        from_attributes = True
