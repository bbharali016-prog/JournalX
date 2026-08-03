from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import os
import uuid
from pydantic import BaseModel, EmailStr
from typing import Optional

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/api/v1/users",
    tags=["Users"],
)

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    profile_image_url: Optional[str] = None
    plan: Optional[str] = None


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "profile_image_url": current_user.profile_image_url,
        "plan": current_user.plan or "Free",
        "is_admin": current_user.is_admin,
    }


@router.put("/update")
def update_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.email and payload.email.lower() != current_user.email.lower():
        existing_user = db.query(User).filter(User.email == payload.email.lower()).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = payload.email.lower()

    if payload.full_name is not None:
        current_user.full_name = payload.full_name

    if payload.profile_image_url is not None:
        current_user.profile_image_url = payload.profile_image_url

    if payload.plan is not None:
        current_user.plan = payload.plan

    db.commit()
    db.refresh(current_user)

    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "profile_image_url": current_user.profile_image_url,
        "plan": current_user.plan or "Free",
    }


@router.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".gif"]:
        raise HTTPException(status_code=400, detail="Invalid image type")

    avatar_dir = "uploads/avatars"
    os.makedirs(avatar_dir, exist_ok=True)

    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(avatar_dir, filename)

    with open(filepath, "wb") as f:
        f.write(await file.read())

    avatar_url = f"/uploads/avatars/{filename}"
    return {"url": avatar_url}