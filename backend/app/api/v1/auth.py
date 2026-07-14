from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.auth import UserRegister
from app.services.auth_service import create_user
from app.core.security import create_access_token
from app.schemas.auth import UserLogin
from app.services.auth_service import create_user, authenticate_user


router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    new_user = create_user(db, user)

    if not new_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    return {
        "message": "User registered successfully"
    }

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = authenticate_user(
        db,
        user.email,
        user.password,
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_access_token(
        {
            "sub": db_user.email,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }