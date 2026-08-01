from sqlalchemy.orm import Session

from app.models.trade import Trade
from app.schemas.trade import TradeCreate


def create_trade(db: Session, trade: TradeCreate, user_id: int):
    db_trade = Trade(
        **trade.model_dump(exclude_none=True),
        user_id=user_id,
    )

    db.add(db_trade)
    db.commit()
    db.refresh(db_trade)

    return db_trade


def get_trades(db: Session, user_id: int, account_id: int = None):
    query = db.query(Trade).filter(Trade.user_id == user_id)
    if account_id is not None:
        query = query.filter(Trade.account_id == account_id)
    return query.order_by(Trade.created_at.desc()).all()

def delete_trade(db, trade_id: int, user_id: int):
    trade = (
        db.query(Trade)
        .filter(
            Trade.id == trade_id,
            Trade.user_id == user_id,
        )
        .first()
    )

    if not trade:
        return None

    db.delete(trade)
    db.commit()

    return trade

def update_trade(db, trade_id: int, trade_data, user_id: int):
    trade = (
        db.query(Trade)
        .filter(
            Trade.id == trade_id,
            Trade.user_id == user_id,
        )
        .first()
    )

    if not trade:
        return None

    trade.symbol = trade_data.symbol
    trade.side = trade_data.side
    trade.lot_size = trade_data.lot_size
    trade.entry_price = trade_data.entry_price
    trade.exit_price = trade_data.exit_price
    trade.profit = trade_data.profit
    trade.notes = trade_data.notes
    trade.image_url = trade_data.image_url
    trade.account_id = trade_data.account_id
    if trade_data.created_at:
        trade.created_at = trade_data.created_at

    db.commit()
    db.refresh(trade)

    return trade
