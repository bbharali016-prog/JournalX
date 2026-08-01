from pydantic import BaseModel


class AnalyticsOverview(BaseModel):
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float
    net_profit: float
    profit_factor: float
    expectancy: float
    average_profit: float
    average_loss: float
    biggest_win: float
    biggest_loss: float
    win_streak: int
    loss_streak: int
    max_drawdown: float
    avg_rr: float
    daily_loss: float

class DrawdownPoint(BaseModel):
    time: int
    value: float


class TodaysSummaryResponse(BaseModel):
    trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float
    total_pnl: float


class MonthlyPerformance(BaseModel):
    month: str
    profit: float


class WinLossData(BaseModel):
    label: str
    value: int


class SymbolPerformance(BaseModel):
    symbol: str
    trades: int
    win_rate: float
    profit: float


class WeekdayPerformance(BaseModel):
    weekday: str
    profit: float


class SessionPerformance(BaseModel):
    session: str
    profit: float
    trades: int
