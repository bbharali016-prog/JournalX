from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.trade import TradeCreate, TradeResponse
from app.services.trade_service import create_trade, get_trades

router = APIRouter(
    prefix="/api/v1/trades",
    tags=["Trades"],
)


@router.post("/", response_model=TradeResponse)
def add_trade(
    trade: TradeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_trade(db, trade, current_user.id)


@router.get("/", response_model=list[TradeResponse])
def list_trades(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_trades(db, current_user.id)

