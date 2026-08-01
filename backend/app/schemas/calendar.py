from pydantic import BaseModel


class CalendarDay(BaseModel):
    date: str
    profit: float
    trades: int