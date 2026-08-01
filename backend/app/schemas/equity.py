from pydantic import BaseModel

class EquityPoint(BaseModel):
    time: int
    value: float