from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
import secrets
import json
from datetime import datetime, timezone
from typing import Optional
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.account import Account
from app.models.trade import Trade
from app.schemas.mt5 import MT5TradeSyncRequest

router = APIRouter(
    prefix="/api/v1/mt5",
    tags=["MT5 Integration"],
)

class MetaApiConnectRequest(BaseModel):
    metaapi_token: str
    metaapi_account_id: str

def parse_metaapi_date(date_str: str) -> datetime:
    for fmt in ("%Y-%m-%d %H:%M:%S.%f", "%Y-%m-%d %H:%M:%S"):
        try:
            dt = datetime.strptime(date_str, fmt)
            return dt.replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return datetime.now(timezone.utc)

# ==========================================
# 1. Local EA (MQL5) sync endpoints
# ==========================================

@router.get("/key")
def get_api_key(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve the current user's MT5 API key."""
    return {"api_key": current_user.mt5_api_key}

@router.post("/generate-key")
def generate_api_key(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a new MT5 API key for the current user."""
    new_key = secrets.token_hex(24)
    current_user.mt5_api_key = new_key
    db.commit()
    db.refresh(current_user)
    return {"api_key": new_key}

@router.get("/accounts")
def get_connected_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve distinct MT5 accounts connected to the user's trades."""
    accounts = (
        db.query(Trade.mt5_account)
        .filter(Trade.user_id == current_user.id, Trade.mt5_account != None)
        .distinct()
        .all()
    )
    # Return connected accounts from both MQL5 (mt5_account) and MetaApi (metaapi_account_id)
    account_list = [a[0] for a in accounts if a[0]]
    if current_user.metaapi_account_id and current_user.metaapi_account_id not in account_list:
        account_list.append(current_user.metaapi_account_id)
    return account_list

@router.post("/sync")
def sync_mt5_trades(
    payload: MT5TradeSyncRequest,
    x_mt5_api_key: Optional[str] = Header(None, alias="X-MT5-API-Key"),
    api_key: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Webhook endpoint for MT5 EA to upload trade history and updates."""
    auth_key = x_mt5_api_key or api_key
    if not auth_key:
        raise HTTPException(status_code=401, detail="MT5 API Key missing")

    user = db.query(User).filter(User.mt5_api_key == auth_key).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid MT5 API Key")

    synced_count = 0
    for item in payload.trades:
        existing_trade = (
            db.query(Trade)
            .filter(Trade.user_id == user.id, Trade.external_id == item.ticket)
            .first()
        )

        dt_created = datetime.fromtimestamp(item.created_at, tz=timezone.utc)

        if existing_trade:
            existing_trade.exit_price = item.exit_price
            existing_trade.profit = item.profit
            if item.notes:
                existing_trade.notes = item.notes
            existing_trade.mt5_account = item.mt5_account
        else:
            new_trade = Trade(
                symbol=item.symbol,
                side=item.side.upper(),
                lot_size=item.lot_size,
                entry_price=item.entry_price,
                exit_price=item.exit_price,
                profit=item.profit,
                notes=item.notes or "Synced via MT5",
                external_id=item.ticket,
                mt5_account=item.mt5_account,
                created_at=dt_created,
                user_id=user.id
            )
            db.add(new_trade)
            synced_count += 1

    db.commit()
    return {"status": "success", "synced": synced_count}

# ==========================================
# 2. MetaApi (Cloud) sync endpoints
# ==========================================

@router.post("/metaapi/connect")
def connect_metaapi(
    payload: MetaApiConnectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save MetaApi connection credentials."""
    current_user.metaapi_token = payload.metaapi_token
    current_user.metaapi_account_id = payload.metaapi_account_id
    db.commit()
    db.refresh(current_user)
    return {"message": "MetaApi credentials saved successfully"}

@router.get("/metaapi/connection")
def get_metaapi_connection(
    current_user: User = Depends(get_current_user)
):
    """Retrieve details of the connected MetaApi account."""
    return {
        "metaapi_account_id": current_user.metaapi_account_id,
        "metaapi_token_present": current_user.metaapi_token is not None
    }

@router.delete("/metaapi/connection")
def disconnect_metaapi(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Disconnect the MetaApi account."""
    current_user.metaapi_token = None
    current_user.metaapi_account_id = None
    db.commit()
    db.refresh(current_user)
    return {"message": "MetaApi credentials removed successfully"}

@router.post("/metaapi/sync")
def sync_metaapi_trades(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch closed trades from MetaStats cloud API and import them."""
    if not current_user.metaapi_token or not current_user.metaapi_account_id:
        raise HTTPException(
            status_code=400,
            detail="MetaApi connection credentials not found. Please connect first."
        )

    # 1. Fetch account region from global provisioning API
    account_url = f"https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts/{current_user.metaapi_account_id}"
    acc_request = Request(
        account_url,
        headers={
            "auth-token": current_user.metaapi_token,
            "Content-Type": "application/json"
        },
        method="GET"
    )

    region = "new-york"
    try:
        import ssl
        context = ssl._create_unverified_context()
        with urlopen(acc_request, timeout=15, context=context) as response:
            acc_data = json.loads(response.read().decode("utf-8"))
            region = acc_data.get("region", "new-york")
    except Exception as e:
        print(f"Failed to fetch account region, falling back to new-york: {e}")

    # 2. Build time range parameters
    from urllib.parse import quote
    from datetime import datetime
    start_time_str = "2020-01-01 00:00:00.000"
    end_time_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S.000")
    
    start_encoded = quote(start_time_str)
    end_encoded = quote(end_time_str)

    # 3. Call MetaStats API with correct regional domain and path parameters
    url = f"https://metastats-api-v1.{region}.agiliumtrade.ai/users/current/accounts/{current_user.metaapi_account_id}/historical-trades/{start_encoded}/{end_encoded}?updateHistory=true"
    request = Request(
        url,
        headers={
            "auth-token": current_user.metaapi_token,
            "Content-Type": "application/json"
        },
        method="GET"
    )

    try:
        import ssl
        context = ssl._create_unverified_context()
        with urlopen(request, timeout=30, context=context) as response:
            res_body = response.read().decode("utf-8")
            data = json.loads(res_body)
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore")
        raise HTTPException(
            status_code=502,
            detail=f"MetaStats API error: {exc.code} {detail}"
        )
    except URLError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to connect to MetaStats: {exc.reason}"
        )

    # Resolve or link MT5 Account for the user
    target_account = (
        db.query(Account)
        .filter(
            Account.user_id == current_user.id,
            (Account.login_id == "315063863") | (Account.name.ilike("%goat%")) | (Account.platform == "MT5")
        )
        .first()
    )
    if not target_account:
        target_account = db.query(Account).filter(Account.user_id == current_user.id).first()

    trades_list = data.get("trades", [])
    synced_count = 0

    for item in trades_list:
        ticket = item.get("positionId") or item.get("_id")
        if not ticket:
            continue

        raw_symbol = item.get("symbol")
        if not raw_symbol:
            continue

        # Format symbol e.g. GBPUSD.x -> GBP/USD
        clean_sym = raw_symbol.replace(".x", "").replace(".pro", "").replace(".raw", "").upper()
        if len(clean_sym) == 6 and "/" not in clean_sym:
            clean_sym = f"{clean_sym[:3]}/{clean_sym[3:]}"

        volume = float(item.get("volume", 0.0))
        profit = float(item.get("profit", 0.0))
        open_price = float(item.get("openPrice", 0.0))
        close_price = float(item.get("closePrice", 0.0))
        close_time_str = item.get("closeTime") or item.get("openTime")
        
        trade_type = item.get("type", "POSITION_TYPE_BUY")
        side = "BUY" if "BUY" in trade_type else "SELL"

        # Rich notes extraction
        comment = item.get("comment") or ""
        pips = item.get("pips")
        duration = item.get("durationInMinutes")
        
        notes_parts = []
        if comment:
            if "[tp" in comment.lower():
                notes_parts.append(f"TP Hit {comment}")
            elif "[sl" in comment.lower():
                notes_parts.append(f"SL Hit {comment}")
            else:
                notes_parts.append(comment)
        elif profit > 0:
            notes_parts.append("Take Profit")
        elif profit < 0:
            notes_parts.append("Stop Loss")
            
        if pips is not None:
            notes_parts.append(f"{pips:+} pips")
            
        if duration:
            hrs = duration // 60
            mins = duration % 60
            dur_str = f"{hrs}h {mins}m" if hrs else f"{mins}m"
            notes_parts.append(f"{dur_str}")
            
        notes_str = " | ".join(notes_parts) if notes_parts else "Synced via MT5"

        dt_created = parse_metaapi_date(close_time_str)

        # Check if trade already exists in our db
        existing_trade = (
            db.query(Trade)
            .filter(Trade.user_id == current_user.id, Trade.external_id == ticket)
            .first()
        )

        if existing_trade:
            # Update values with latest metrics
            existing_trade.symbol = clean_sym
            existing_trade.side = side
            existing_trade.lot_size = volume
            existing_trade.entry_price = open_price
            existing_trade.exit_price = close_price
            existing_trade.profit = profit
            existing_trade.notes = notes_str
            existing_trade.mt5_account = current_user.metaapi_account_id
            if target_account:
                existing_trade.account_id = target_account.id
        else:
            # Insert new trade
            new_trade = Trade(
                symbol=clean_sym,
                side=side,
                lot_size=volume,
                entry_price=open_price,
                exit_price=close_price,
                profit=profit,
                notes=notes_str,
                external_id=ticket,
                mt5_account=current_user.metaapi_account_id,
                created_at=dt_created,
                user_id=current_user.id,
                account_id=target_account.id if target_account else None
            )
            db.add(new_trade)
            synced_count += 1

    db.commit()
    return {"status": "success", "synced": synced_count}
