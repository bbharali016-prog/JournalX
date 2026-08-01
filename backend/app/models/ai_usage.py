from sqlalchemy import Column, Date, Integer, ForeignKey, UniqueConstraint

from app.db.database import Base


class AIUsage(Base):
    __tablename__ = "ai_usages"
    __table_args__ = (
        UniqueConstraint("user_id", "usage_date", name="uq_ai_usage_user_date"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    usage_date = Column(Date, nullable=False, index=True)
    request_count = Column(Integer, nullable=False, default=0)
