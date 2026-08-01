from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User

from app.schemas.analytics import AnalyticsOverview, DrawdownPoint, TodaysSummaryResponse, SymbolPerformance, SessionPerformance
from app.services.analytics_service import (
    get_analytics_overview,
    get_drawdown_series,
    get_today_stats,
    get_performance_by_symbol,
    get_performance_by_session,
)

from typing import Optional, List

router = APIRouter(
    prefix="/api/v1/analytics",
    tags=["Analytics"],
)


@router.get(
    "/overview",
    response_model=AnalyticsOverview,
)
def analytics_overview(
    account_id: Optional[int] = None,
    timezone_offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_analytics_overview(
        db,
        current_user.id,
        account_id,
        timezone_offset,
    )


@router.get(
    "/today",
    response_model=TodaysSummaryResponse,
)
def today_summary(
    account_id: Optional[int] = None,
    timezone_offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_today_stats(
        db,
        current_user.id,
        account_id,
        timezone_offset,
    )


@router.get(
    "/drawdown",
    response_model=List[DrawdownPoint],
)
def drawdown_series(
    account_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_drawdown_series(
        db,
        current_user.id,
        account_id,
    )


@router.get(
    "/symbol",
    response_model=List[SymbolPerformance],
)
def symbol_performance(
    account_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_performance_by_symbol(
        db,
        current_user.id,
        account_id,
    )


@router.get(
    "/session",
    response_model=List[SessionPerformance],
)
def session_performance(
    account_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_performance_by_session(
        db,
        current_user.id,
        account_id,
    )
