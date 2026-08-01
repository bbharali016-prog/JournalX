from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float
    net_profit: float
    average_profit: float
    average_loss: float

    profit_factor: float
    biggest_win: float
    biggest_loss: float
    win_streak: int
    loss_streak: int
    expectancy: float


class MonthlyPerformance(BaseModel):
    month: str
    profit: float