from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.ai import CoachSummary, AIChatRequest, AIChatResponse
from app.services.ai_service import get_ai_coach_summary, ai_chat_coach

router = APIRouter(
    prefix="/api/v1/ai",
    tags=["AI Coach"],
)


@router.get(
    "/coach",
    response_model=CoachSummary,
)
def ai_coach(
    account_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return get_ai_coach_summary(db, current_user.id, account_id=account_id)
    except PermissionError as exc:
        raise HTTPException(status_code=429, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post(
    "/chat",
    response_model=AIChatResponse,
)
def ai_chat(
    req: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return ai_chat_coach(db, current_user.id, req.message, account_id=req.account_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

