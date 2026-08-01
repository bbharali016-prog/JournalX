from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.database import Base

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    platform = Column(String, nullable=False, default="Manual")  # "MT5", "MT4", "Manual"
    broker = Column(String, nullable=True)
    funded_firm = Column(String, nullable=True)
    login_id = Column(String, nullable=True)
    server = Column(String, nullable=True)
    password_encrypted = Column(String, nullable=True)
    account_size = Column(Float, default=0.0)
    daily_loss_limit = Column(Float, nullable=True)
    max_drawdown = Column(Float, nullable=True)
    profit_target = Column(Float, nullable=True)
    currency = Column(String, default="USD")
    sync_enabled = Column(Boolean, default=True)
    status = Column(String, default="Online")  # "Online", "Offline"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="accounts")
    trades = relationship("Trade", back_populates="account", cascade="all, delete-orphan")
