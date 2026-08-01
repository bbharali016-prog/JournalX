from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AccountBase(BaseModel):
    name: str
    platform: str  # "MT5", "MT4", "Manual"
    broker: Optional[str] = None
    funded_firm: Optional[str] = None
    login_id: Optional[str] = None
    server: Optional[str] = None
    account_size: float = 0.0
    daily_loss_limit: Optional[float] = None
    max_drawdown: Optional[float] = None
    profit_target: Optional[float] = None
    currency: str = "USD"
    sync_enabled: bool = True
    status: str = "Online"

class AccountCreate(AccountBase):
    password: Optional[str] = None  # Raw password for auto sync accounts

class AccountUpdate(BaseModel):
    name: Optional[str] = None
    sync_enabled: Optional[bool] = None
    status: Optional[str] = None
    account_size: Optional[float] = None
    daily_loss_limit: Optional[float] = None
    max_drawdown: Optional[float] = None
    profit_target: Optional[float] = None

class AccountResponse(AccountBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
