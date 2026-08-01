from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.dashboard import (
    DashboardStats,
    MonthlyPerformance,
)

from app.schemas.calendar import CalendarDay
from app.schemas.equity import EquityPoint
from app.services.dashboard_service import (
    get_dashboard_stats,
    get_monthly_performance,
    get_calendar_data,
    get_equity_curve,
)
from typing import Optional, List

router = APIRouter(
    prefix="/api/v1/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "/stats",
    response_model=DashboardStats,
)
def dashboard_stats(
    account_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_dashboard_stats(
        db,
        current_user.id,
        account_id,
    )


@router.get(
    "/monthly-performance",
    response_model=List[MonthlyPerformance],
)
def monthly_performance(
    account_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_monthly_performance(
        db,
        current_user.id,
        account_id,
    )

@router.get(
    "/calendar",
    response_model=List[CalendarDay],
)
def calendar_data(
    account_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_calendar_data(
        db,
        current_user.id,
        account_id,
    )
@router.get(
    "/equity",
    response_model=List[EquityPoint],
)
def equity_curve(
    account_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    return get_equity_curve(
        db,
        current_user.id,
        account_id,
    )
