from sqlalchemy.orm import Session

from app.models.trade import Trade
from sqlalchemy import extract, func
from calendar import month_abbr

def get_dashboard_stats(db: Session, user_id: int, account_id: int = None):
    query = db.query(Trade).filter(Trade.user_id == user_id)
    if account_id is not None:
        query = query.filter(Trade.account_id == account_id)
    trades = query.order_by(Trade.created_at.asc()).all()

    total = len(trades)

    winners = [t for t in trades if t.profit > 0]
    losers = [t for t in trades if t.profit < 0]

    winning = len(winners)
    losing = len(losers)

    win_rate = (
        winning / total * 100
        if total
        else 0
    )

    net_profit = sum(t.profit for t in trades)

    average_profit = (
        sum(t.profit for t in winners) / winning
        if winning
        else 0
    )

    average_loss = (
        sum(t.profit for t in losers) / losing
        if losing
        else 0
    )

    gross_profit = sum(t.profit for t in winners)
    gross_loss = abs(sum(t.profit for t in losers))

    profit_factor = (
        gross_profit / gross_loss
        if gross_loss > 0
        else 0
    )

    biggest_win = (
       max((t.profit for t in winners), default=0)
    )

    biggest_loss = (
       min((t.profit for t in losers), default=0)
    )

    # Win streak
    current_win = 0
    max_win = 0

    current_loss = 0
    max_loss = 0

    for trade in trades:
        if trade.profit > 0:
            current_win += 1
            current_loss = 0
        elif trade.profit < 0:
            current_loss += 1
            current_win = 0
        else:
            current_win = 0
            current_loss = 0

        max_win = max(max_win, current_win)
        max_loss = max(max_loss, current_loss)

    expectancy = (
        net_profit / total
        if total
        else 0
    )

    return {
        "total_trades": total,
        "winning_trades": winning,
        "losing_trades": losing,
        "win_rate": round(win_rate, 2),
        "net_profit": round(net_profit, 2),
        "average_profit": round(average_profit, 2),
        "average_loss": round(average_loss, 2),
        "profit_factor": round(profit_factor, 2),
        "biggest_win": round(biggest_win, 2),
        "biggest_loss": round(biggest_loss, 2),
        "win_streak": max_win,
        "loss_streak": max_loss,
        "expectancy": round(expectancy, 2),
    }
def get_monthly_performance(db: Session, user_id: int, account_id: int = None):
    query = db.query(
        extract("month", Trade.created_at).label("month"),
        Trade.profit,
    ).filter(Trade.user_id == user_id)
    if account_id is not None:
        query = query.filter(Trade.account_id == account_id)
    rows = query.all()

    monthly = {}

    for month, profit in rows:
        month = int(month)

        if month not in monthly:
            monthly[month] = 0

        monthly[month] += profit

    result = []

    for month in sorted(monthly.keys()):
        result.append(
            {
                "month": month_abbr[month],
                "profit": round(monthly[month], 2),
            }
        )

    return result

from sqlalchemy import func


def get_calendar_data(db: Session, user_id: int, account_id: int = None):
    query = db.query(
        func.date(Trade.created_at).label("date"),
        func.sum(Trade.profit).label("profit"),
        func.count(Trade.id).label("trades"),
    ).filter(Trade.user_id == user_id)
    if account_id is not None:
        query = query.filter(Trade.account_id == account_id)
        
    rows = (
        query.group_by(func.date(Trade.created_at))
        .order_by(func.date(Trade.created_at))
        .all()
    )

    return [
        {
            "date": str(row.date),
            "profit": round(float(row.profit), 2),
            "trades": row.trades,
        }
        for row in rows
    ]


def get_equity_curve(
    db: Session,
    user_id: int,
    account_id: int = None
):

    query = db.query(Trade).filter(Trade.user_id == user_id)
    if account_id is not None:
        query = query.filter(Trade.account_id == account_id)
        
    trades = query.order_by(Trade.created_at.asc()).all()


    equity = 0
    result = []


    for trade in trades:

        equity += trade.profit


        result.append(
            {
                "time": int(trade.created_at.timestamp()),
                "value": round(equity, 2),
            }
        )


    return result
