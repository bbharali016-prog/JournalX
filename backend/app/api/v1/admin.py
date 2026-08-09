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


@router.delete("/users/{user_id}", dependencies=[Depends(get_current_admin)])
def delete_user_admin(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Permanently delete a user and all their trades/accounts."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_admin:
        raise HTTPException(status_code=400, detail="Cannot delete an admin user")

    db.query(Trade).filter(Trade.user_id == user_id).delete()
    db.query(Account).filter(Account.user_id == user_id).delete()
    db.delete(user)
    db.commit()
    return {"message": f"User {user.email} successfully deleted"}


@router.get("/users/{user_id}/details", dependencies=[Depends(get_current_admin)])
def get_user_full_details(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Fetch complete account and trade records for any user on the platform."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    accounts = db.query(Account).filter(Account.user_id == user_id).all()
    trades = db.query(Trade).filter(Trade.user_id == user_id).order_by(Trade.created_at.desc()).all()

    total_trades = len(trades)
    winning_trades = sum(1 for t in trades if t.profit > 0)
    net_profit = sum(t.profit for t in trades)
    win_rate = round((winning_trades / total_trades * 100), 1) if total_trades > 0 else 0.0

    acc_list = []
    for a in accounts:
        acc_trades_count = sum(1 for t in trades if t.account_id == a.id)
        acc_list.append({
            "id": a.id,
            "name": a.name,
            "platform": a.platform,
            "broker": a.broker,
            "funded_firm": a.funded_firm,
            "login_id": a.login_id,
            "server": a.server,
            "account_size": a.account_size,
            "profit_target": a.profit_target,
            "status": a.status,
            "sync_enabled": a.sync_enabled,
            "created_at": a.created_at,
            "trades_count": acc_trades_count,
        })

    trade_list = []
    for t in trades:
        acc = next((a for a in accounts if a.id == t.account_id), None)
        trade_list.append({
            "id": t.id,
            "symbol": t.symbol,
            "side": t.side,
            "lot_size": t.lot_size,
            "entry_price": t.entry_price,
            "exit_price": t.exit_price,
            "profit": t.profit,
            "notes": t.notes,
            "created_at": t.created_at,
            "account_id": t.account_id,
            "account_name": acc.name if acc else "Default",
        })

    return {
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "plan": user.plan,
            "is_active": user.is_active,
            "is_admin": user.is_admin,
            "metaapi_account_id": user.metaapi_account_id,
        },
        "stats": {
            "total_trades": total_trades,
            "winning_trades": winning_trades,
            "net_profit": round(net_profit, 2),
            "win_rate": win_rate,
            "accounts_count": len(accounts),
        },
        "accounts": acc_list,
        "trades": trade_list,
    }


@router.get("/trades", dependencies=[Depends(get_current_admin)])
def get_all_platform_trades(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    user_id: Optional[int] = Query(None),
):
    """Retrieve all trades across all users for live platform monitoring."""
    query = db.query(Trade)
    if user_id:
        query = query.filter(Trade.user_id == user_id)

    total_count = query.count()
    offset = (page - 1) * limit
    trades = query.order_by(Trade.created_at.desc()).offset(offset).limit(limit).all()

    # Enrich with user info
    trade_list = []
    user_cache = {}
    account_cache = {}

    for t in trades:
        if t.user_id not in user_cache:
            user_cache[t.user_id] = db.query(User).filter(User.id == t.user_id).first()
        u = user_cache[t.user_id]

        if t.account_id and t.account_id not in account_cache:
            account_cache[t.account_id] = db.query(Account).filter(Account.id == t.account_id).first()
        acc = account_cache.get(t.account_id)

        trade_list.append({
            "id": t.id,
            "user_id": t.user_id,
            "user_name": u.full_name if u else "Unknown",
            "user_email": u.email if u else "Unknown",
            "account_name": acc.name if acc else "Default",
            "symbol": t.symbol,
            "side": t.side,
            "lot_size": t.lot_size,
            "entry_price": t.entry_price,
            "exit_price": t.exit_price,
            "profit": t.profit,
            "notes": t.notes,
            "created_at": t.created_at,
        })

    return {
        "trades": trade_list,
        "total_count": total_count,
        "page": page,
        "limit": limit,
    }

