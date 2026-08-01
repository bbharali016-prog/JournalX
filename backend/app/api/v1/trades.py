from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
)

import os
import shutil
import uuid
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.trade import TradeCreate, TradeResponse
from app.services.trade_service import (
    create_trade,
    get_trades,
    delete_trade,
    update_trade,
)

from typing import Optional, List

router = APIRouter(
    prefix="/api/v1/trades",
    tags=["Trades"],
)


@router.post("/", response_model=TradeResponse)
def add_trade(
    trade: TradeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_trade(db, trade, current_user.id)


@router.get("/", response_model=List[TradeResponse])
def list_trades(
    account_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_trades(db, current_user.id, account_id)

@router.delete("/{trade_id}")
def remove_trade(
    trade_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    trade = delete_trade(
        db,
        trade_id,
        current_user.id,
    )

    if not trade:
        raise HTTPException(
            status_code=404,
            detail="Trade not found",
        )

    return {"message": "Trade deleted"}
@router.put("/{trade_id}", response_model=TradeResponse)
def edit_trade(
    trade_id: int,
    trade: TradeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated = update_trade(
        db,
        trade_id,
        trade,
        current_user.id,
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Trade not found",
        )

    return updated
@router.post("/upload-image")
async def upload_trade_image(
    image: UploadFile = File(...),
):
    os.makedirs("uploads", exist_ok=True)

    extension = image.filename.split(".")[-1]

    filename = f"{uuid.uuid4()}.{extension}"

    filepath = os.path.join(
        "uploads",
        filename,
    )

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(
            image.file,
            buffer,
        )

    return {
        "image_url": f"/uploads/{filename}"
    }