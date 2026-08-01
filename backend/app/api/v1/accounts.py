from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.account import Account
from app.schemas.account import AccountCreate, AccountUpdate, AccountResponse

router = APIRouter(
    prefix="/api/v1/accounts",
    tags=["Trading Accounts"],
)

@router.get("/", response_model=List[AccountResponse])
def get_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all trading accounts for the logged-in user."""
    accounts = db.query(Account).filter(Account.user_id == current_user.id).order_by(Account.created_at.desc()).all()
    return accounts

@router.post("/", response_model=AccountResponse)
def create_account(
    payload: AccountCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new trading account (manual or auto sync)."""
    # For manual accounts, status is Offline
    status_val = "Offline" if payload.platform == "Manual" else "Online"
    
    db_account = Account(
        name=payload.name,
        platform=payload.platform,
        broker=payload.broker,
        funded_firm=payload.funded_firm,
        login_id=payload.login_id,
        server=payload.server,
        password_encrypted=payload.password,  # simple obf/storage for demo purposes
        account_size=payload.account_size,
        daily_loss_limit=payload.daily_loss_limit,
        max_drawdown=payload.max_drawdown,
        profit_target=payload.profit_target,
        currency=payload.currency,
        sync_enabled=payload.sync_enabled,
        status=status_val,
        user_id=current_user.id
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

@router.patch("/{account_id}", response_model=AccountResponse)
def update_account(
    account_id: int,
    payload: AccountUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update trading account settings (e.g. sync toggle, risk parameters)."""
    account = (
        db.query(Account)
        .filter(Account.id == account_id, Account.user_id == current_user.id)
        .first()
    )
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
        
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(account, key, value)
        
    db.commit()
    db.refresh(account)
    return account

@router.delete("/{account_id}")
def delete_account(
    account_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a trading account."""
    account = (
        db.query(Account)
        .filter(Account.id == account_id, Account.user_id == current_user.id)
        .first()
    )
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
        
    db.delete(account)
    db.commit()
    return {"message": "Account deleted successfully"}
