from sqlalchemy.orm import Session

from app.models.trade import Trade
from app.schemas.analytics import DrawdownPoint


def get_analytics_overview(
    db: Session,
    user_id: int,
    account_id: int = None,
    timezone_offset: int = 0
):
    query = db.query(Trade).filter(Trade.user_id == user_id)
    if account_id is not None:
        query = query.filter(Trade.account_id == account_id)
    trades = query.order_by(Trade.created_at.asc()).all()

    total = len(trades)

    winners = [
        t for t in trades
        if t.profit > 0
    ]

    losers = [
        t for t in trades
        if t.profit < 0
    ]

    winning = len(winners)
    losing = len(losers)

    net_profit = sum(
        t.profit for t in trades
    )

    gross_profit = sum(
        t.profit for t in winners
    )

    gross_loss = abs(
        sum(
            t.profit
            for t in losers
        )
    )

    win_rate = (
        winning / total * 100
        if total
        else 0
    )

    average_profit = (
        gross_profit / winning
        if winning
        else 0
    )

    average_loss = (
        sum(
            t.profit
            for t in losers
        ) / losing
        if losing
        else 0
    )

    profit_factor = (
        gross_profit / gross_loss
        if gross_loss > 0
        else 0
    )

    biggest_win = max(
        (
            t.profit
            for t in winners
        ),
        default=0,
    )

    biggest_loss = min(
        (
            t.profit
            for t in losers
        ),
        default=0,
    )

    expectancy = (
        net_profit / total
        if total
        else 0
    )

    current_win = 0
    current_loss = 0

    max_win = 0
    max_loss = 0

    equity = 0
    max_drawdown = 0.0

    for trade in trades:
        equity += trade.profit
        drawdown = max(0.0, -equity)
        if drawdown > max_drawdown:
            max_drawdown = drawdown

        if trade.profit > 0:

            current_win += 1
            current_loss = 0

        elif trade.profit < 0:

            current_loss += 1
            current_win = 0

        else:

            current_win = 0
            current_loss = 0

        max_win = max(
            max_win,
            current_win,
        )

        max_loss = max(
            max_loss,
            current_loss,
        )

    # Calculate daily loss (net negative profit for today in client's timezone)
    from datetime import datetime, timezone, timedelta
    client_now = datetime.now(timezone.utc) - timedelta(minutes=timezone_offset)
    client_today = client_now.date()

    today_trades = []
    for t in trades:
        local_created_at = t.created_at - timedelta(minutes=timezone_offset)
        if local_created_at.date() == client_today:
            today_trades.append(t)

    today_pnl = sum(t.profit for t in today_trades)
    daily_loss = abs(today_pnl) if today_pnl < 0 else 0.0

    # Placeholder until RR calculation is implemented
    avg_rr = 0

    return {
        "total_trades": total,
        "winning_trades": winning,
        "losing_trades": losing,
        "win_rate": round(win_rate, 2),
        "net_profit": round(net_profit, 2),
        "profit_factor": round(profit_factor, 2),
        "expectancy": round(expectancy, 2),
        "average_profit": round(average_profit, 2),
        "average_loss": round(average_loss, 2),
        "biggest_win": round(biggest_win, 2),
        "biggest_loss": round(biggest_loss, 2),
        "win_streak": max_win,
        "loss_streak": max_loss,
        "max_drawdown": round(max_drawdown, 2),
        "avg_rr": round(avg_rr, 2),
        "daily_loss": round(daily_loss, 2),
    }


def get_drawdown_series(
    db: Session,
    user_id: int,
    account_id: int = None,
):
    query = db.query(Trade).filter(Trade.user_id == user_id)
    if account_id is not None:
        query = query.filter(Trade.account_id == account_id)
    trades = query.order_by(Trade.created_at.asc()).all()

    equity = 0
    result = []
    last_time = 0

    for trade in trades:
        equity += trade.profit
        drawdown = max(0.0, -equity)

        t_val = int(trade.created_at.timestamp())
        if t_val <= last_time:
            t_val = last_time + 1
        last_time = t_val

        result.append(
            DrawdownPoint(
                time=t_val,
                value=round(drawdown, 2),
            )
        )

    return result


def get_today_stats(
    db: Session,
    user_id: int,
    account_id: int = None,
    timezone_offset: int = 0
):
    from datetime import datetime, timezone, timedelta
    client_now = datetime.now(timezone.utc) - timedelta(minutes=timezone_offset)
    client_today = client_now.date()

    query = db.query(Trade).filter(Trade.user_id == user_id)
    if account_id is not None:
        query = query.filter(Trade.account_id == account_id)
    trades = query.all()

    today_trades = []
    for t in trades:
        local_created_at = t.created_at - timedelta(minutes=timezone_offset)
        if local_created_at.date() == client_today:
            today_trades.append(t)

    total = len(today_trades)
    winners = [t for t in today_trades if t.profit > 0]
    losers = [t for t in today_trades if t.profit < 0]
    winning = len(winners)
    losing = len(losers)
    win_rate = (winning / total * 100) if total else 0.0
    total_pnl = sum(t.profit for t in today_trades)

    return {
        "trades": total,
        "winning_trades": winning,
        "losing_trades": losing,
        "win_rate": round(win_rate, 2),
        "total_pnl": round(total_pnl, 2),
    }


def get_performance_by_symbol(
    db: Session,
    user_id: int,
    account_id: int = None
):
    query = db.query(Trade).filter(Trade.user_id == user_id)
    if account_id is not None:
        query = query.filter(Trade.account_id == account_id)
    trades = query.all()

    symbols_map = {}
    for t in trades:
        sym = t.symbol.upper()
        if sym not in symbols_map:
            symbols_map[sym] = {"trades": 0, "wins": 0, "profit": 0.0}
        
        symbols_map[sym]["trades"] += 1
        symbols_map[sym]["profit"] += t.profit
        if t.profit > 0:
            symbols_map[sym]["wins"] += 1

    result = []
    for sym, stats in symbols_map.items():
        win_rate = (stats["wins"] / stats["trades"] * 100) if stats["trades"] > 0 else 0.0
        result.append({
            "symbol": sym,
            "trades": stats["trades"],
            "win_rate": round(win_rate, 2),
            "profit": round(stats["profit"], 2)
        })

    # Sort by profit descending
    result.sort(key=lambda x: x["profit"], reverse=True)
    return result


def get_performance_by_session(
    db: Session,
    user_id: int,
    account_id: int = None
):
    query = db.query(Trade).filter(Trade.user_id == user_id)
    if account_id is not None:
        query = query.filter(Trade.account_id == account_id)
    trades = query.all()

    # Session definitions based on UTC hour:
    # London: 07:00 to 15:00 UTC
    # New York: 15:00 to 23:00 UTC
    # Asian: 23:00 to 07:00 UTC
    sessions_data = {
        "London": {"profit": 0.0, "trades": 0},
        "New York": {"profit": 0.0, "trades": 0},
        "Asian": {"profit": 0.0, "trades": 0}
    }

    for t in trades:
        # Get hour in UTC
        hour = t.created_at.hour
        if 7 <= hour < 15:
            sess = "London"
        elif 15 <= hour < 23:
            sess = "New York"
        else:
            sess = "Asian"
        
        sessions_data[sess]["profit"] += t.profit
        sessions_data[sess]["trades"] += 1

    return [
        {
            "session": name,
            "profit": round(data["profit"], 2),
            "trades": data["trades"]
        }
        for name, data in sessions_data.items()
    ]
