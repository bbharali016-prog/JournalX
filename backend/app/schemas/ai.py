from pydantic import BaseModel


class CoachInsight(BaseModel):
    title: str
    detail: str
    tone: str


class CoachSummary(BaseModel):
    summary: str
    strengths: list[str]
    weaknesses: list[str]
    next_actions: list[str]
    risk_note: str
    coach_score: int
    insights: list[CoachInsight]
