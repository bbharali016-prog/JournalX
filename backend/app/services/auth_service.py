from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.auth import UserRegister
from app.core.security import hash_password
from app.core.security import verify_password


def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user

def create_user(db: Session, user: UserRegister):
    existing = db.query(User).filter(User.email == user.email).first()
 
    if existing:
        return None

    db_user = User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=hash_password(user.password),
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user