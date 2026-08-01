from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.ai import CoachSummary
from app.services.ai_service import get_ai_coach_summary

router = APIRouter(
    prefix="/api/v1/ai",
    tags=["AI Coach"],
)


@router.get(
    "/coach",
    response_model=CoachSummary,
)
def ai_coach(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return get_ai_coach_summary(db, current_user.id)
    except PermissionError as exc:
        raise HTTPException(status_code=429, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
