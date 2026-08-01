from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.services.reports_service import generate_csv_report
from typing import Optional

router = APIRouter(
    prefix="/api/v1/reports",
    tags=["Reports"],
)

@router.get("/export")
def export_trades(
    account_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    csv_data = generate_csv_report(db, current_user.id, account_id)
    
    # Return as streaming file download
    response = StreamingResponse(
        io.StringIO(csv_data),
        media_type="text/csv"
    )
    filename = f"trade_log_report_{current_user.id}.csv"
    response.headers["Content-Disposition"] = f"attachment; filename={filename}"
    return response
