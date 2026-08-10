from pydantic import BaseModel
from typing import List, Optional


class CoachInsight(BaseModel):
    title: str
    detail: str
    tone: str


class CoachSummary(BaseModel):
    summary: str
    strengths: List[str]
    weaknesses: List[str]
    next_actions: List[str]
    risk_note: str
    coach_score: int
    discipline_score: Optional[int] = 85
    risk_score: Optional[int] = 90
    timing_score: Optional[int] = 82
    best_symbol: Optional[str] = "USD/CAD"
    worst_symbol: Optional[str] = "N/A"
    best_session: Optional[str] = "London"
    avg_rr_ratio: Optional[str] = "1 : 2.60"
    insights: List[CoachInsight]


class ChatTurn(BaseModel):
    role: str  # "user" or "model"
    content: str


class AIChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatTurn]] = []
    account_id: Optional[int] = None


class AIChatResponse(BaseModel):
    reply: str
    timestamp: str


