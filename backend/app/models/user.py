from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String, nullable=False)

    email = Column(String, unique=True, index=True)

    hashed_password = Column(String, nullable=False)

    is_active = Column(Boolean, default=True)

    mt5_api_key = Column(String, unique=True, index=True, nullable=True)

    metaapi_token = Column(String, nullable=True)
    metaapi_account_id = Column(String, nullable=True)
    profile_image_url = Column(String, nullable=True)
    plan = Column(String, default="Free")
    is_admin = Column(Boolean, default=False, nullable=False)

    accounts = relationship("Account", back_populates="user", cascade="all, delete-orphan")