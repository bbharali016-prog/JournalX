from pydantic import BaseModel
from typing import List, Optional

class MT5TradeSyncItem(BaseModel):
    ticket: str
    symbol: str
    side: str
    lot_size: float
    entry_price: float
    exit_price: float
    profit: float
    created_at: int  # Unix timestamp (seconds)
    notes: Optional[str] = None
    mt5_account: Optional[str] = None

class MT5TradeSyncRequest(BaseModel):
    trades: List[MT5TradeSyncItem]
