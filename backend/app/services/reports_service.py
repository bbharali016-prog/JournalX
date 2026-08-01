import csv
import io
from sqlalchemy.orm import Session
from app.models.trade import Trade

def generate_csv_report(db: Session, user_id: int, account_id: int = None) -> str:
    query = db.query(Trade).filter(Trade.user_id == user_id)
    if account_id is not None:
        query = query.filter(Trade.account_id == account_id)
    trades = query.order_by(Trade.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Write CSV Header
    writer.writerow([
        "Trade ID", 
        "Symbol", 
        "Side", 
        "Lot Size", 
        "Entry Price", 
        "Exit Price", 
        "Profit/Loss (USD)", 
        "Notes", 
        "Date & Time (UTC)"
    ])

    # Write CSV Rows
    for t in trades:
        writer.writerow([
            t.id,
            t.symbol,
            t.side,
            t.lot_size,
            t.entry_price,
            t.exit_price,
            t.profit,
            t.notes or "",
            t.created_at.strftime("%Y-%m-%d %H:%M:%S")
        ])

    return output.getvalue()
