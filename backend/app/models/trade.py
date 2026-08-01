from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base


class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, index=True)

    symbol = Column(String, nullable=False)
    side = Column(String, nullable=False)      # BUY / SELL
    lot_size = Column(Float, nullable=False)
    entry_price = Column(Float, nullable=False)
    exit_price = Column(Float, nullable=False)
    profit = Column(Float, nullable=False)
    notes = Column(String)
    image_url = Column(String, nullable=True)
    external_id = Column(String, unique=True, index=True, nullable=True)
    mt5_account = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user_id = Column(Integer, ForeignKey("users.id"))
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True)

    user = relationship("User")
    account = relationship("Account", back_populates="trades")