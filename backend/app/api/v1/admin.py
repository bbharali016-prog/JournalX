from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, EmailStr
from typing import List, Optional

from app.db.database import get_db
from app.models.user import User
from app.models.trade import Trade
from app.models.account import Account
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/api/v1/admin", tags=["Admin Operations"])


# Admin authorization dependency
def get_current_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Admin access required",
        )
    return current_user


# Schemas
class AdminStats(BaseModel):
    total_users: int
    free_users: int
    pro_users: int
    elite_users: int
    active_accounts: int
    total_trades: int


class UserAdminView(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    is_active: bool
    plan: str
    is_admin: bool

    class Config:
        from_attributes = True


class UsersListResponse(BaseModel):
    users: List[UserAdminView]
    total_count: int
    page: int
    limit: int


class UpdatePlanPayload(BaseModel):
    plan: str


class UpdateStatusPayload(BaseModel):
    is_active: bool


# Endpoints
@router.get("/stats", response_model=AdminStats, dependencies=[Depends(get_current_admin)])
def get_admin_stats(db: Session = Depends(get_db)):
    """Retrieve overview metrics for the JournalX platform."""
    total_users = db.query(User).count()
    free_users = db.query(User).filter(User.plan == "Free").count()
    pro_users = db.query(User).filter(User.plan == "Pro").count()
    elite_users = db.query(User).filter(User.plan == "Elite").count()
    active_accounts = db.query(Account).count()
    total_trades = db.query(Trade).count()

    return {
        "total_users": total_users,
        "free_users": free_users,
        "pro_users": pro_users,
        "elite_users": elite_users,
        "active_accounts": active_accounts,
        "total_trades": total_trades,
    }


@router.get("/users", response_model=UsersListResponse, dependencies=[Depends(get_current_admin)])
def get_admin_users(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    plan: Optional[str] = Query(None),
):
    """Retrieve paginated list of users with search and plan filter capabilities."""
    query = db.query(User)

    if search:
        search_filter = f"%{search.strip().lower()}%"
        query = query.filter(
            (func.lower(User.full_name).like(search_filter)) |
            (func.lower(User.email).like(search_filter))
        )

    if plan:
        query = query.filter(User.plan == plan)

    total_count = query.count()
    
    # Paginate and fetch
    offset = (page - 1) * limit
    users = query.order_by(User.id.desc()).offset(offset).limit(limit).all()

    return {
        "users": users,
        "total_count": total_count,
        "page": page,
        "limit": limit,
    }


@router.put("/users/{user_id}/plan", response_model=UserAdminView, dependencies=[Depends(get_current_admin)])
def update_user_plan(
    user_id: int,
    payload: UpdatePlanPayload,
    db: Session = Depends(get_db)
):
    """Manually change subscription plan tier of a user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    valid_plans = ["Free", "Pro", "Elite"]
    if payload.plan not in valid_plans:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid plan. Must be one of {valid_plans}",
        )

    user.plan = payload.plan
    db.commit()
    db.refresh(user)
    return user


@router.put("/users/{user_id}/status", response_model=UserAdminView, dependencies=[Depends(get_current_admin)])
def update_user_status(
    user_id: int,
    payload: UpdateStatusPayload,
    db: Session = Depends(get_db)
):
    """Disable or enable a user account."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)
    return user
