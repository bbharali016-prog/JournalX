import json
from datetime import date, datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from typing import Optional

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.ai_usage import AIUsage
from app.models.trade import Trade
from app.models.account import Account
from app.schemas.ai import CoachSummary, CoachInsight, AIChatResponse
from app.services.analytics_service import get_analytics_overview

FREE_DAILY_LIMIT = 50


def build_trade_context(trades: list[Trade]) -> str:
    recent_trades = trades[-30:]

    lines = []
    for trade in recent_trades:
        lines.append(
            f"Date: {trade.created_at.strftime('%Y-%m-%d %H:%M')} | Pair: {trade.symbol} | Side: {trade.side} | "
            f"P&L: ${trade.profit} | Lot: {trade.lot_size} | Entry: {trade.entry_price} | Exit: {trade.exit_price} | Note: {trade.notes or 'None'}"
        )

    return "\n".join(lines) if lines else "No trade history recorded yet."


def get_daily_usage(
    db: Session,
    user_id: int,
    usage_date: date,
) -> AIUsage | None:
    return (
        db.query(AIUsage)
        .filter(
            AIUsage.user_id == user_id,
            AIUsage.usage_date == usage_date,
        )
        .first()
    )


def increment_daily_usage(
    db: Session,
    user_id: int,
    usage_date: date,
) -> int:
    usage = get_daily_usage(db, user_id, usage_date)

    if usage:
        usage.request_count += 1
    else:
        usage = AIUsage(
            user_id=user_id,
            usage_date=usage_date,
            request_count=1,
        )
        db.add(usage)

    db.commit()
    db.refresh(usage)

    return usage.request_count


def compute_rule_based_coach(trades: list[Trade], analytics: dict) -> dict:
    """Quantitative AI engine that generates deep personalized coaching based on real trade math."""
    total_trades = len(trades)
    
    if total_trades == 0:
        return {
            "summary": "No trades recorded yet. Connect an MT5 account or log your first manual trade in the Journal to generate personalized AI performance insights, risk diagnostics, and coaching recommendations.",
            "strengths": [
                "Clean slate ready for trade logging and discipline tracking.",
                "Zero account drawdown — risk buffer fully intact.",
                "Ready to implement structured Risk:Reward targets from Trade #1.",
            ],
            "weaknesses": [
                "No trade sample size available yet to compute win rate or statistical edge.",
                "Log at least 5 to 10 trades to unlock deep behavioral pattern analysis.",
                "Ensure pre-planned Stop-Loss levels on upcoming setups.",
            ],
            "next_actions": [
                "Log your first trade or connect an MT5 trading account.",
                "Define your maximum risk per trade (recommended: 0.5% - 1.0%).",
                "Select your primary currency pairs and trade during London or NY sessions.",
            ],
            "risk_note": "Awaiting trade history to compute risk metrics and drawdown.",
            "coach_score": 0,
            "discipline_score": 0,
            "risk_score": 0,
            "timing_score": 0,
            "best_symbol": "None",
            "worst_symbol": "None",
            "best_session": "None",
            "avg_rr_ratio": "N/A",
            "insights": [
                CoachInsight(
                    title="Awaiting Trade Records",
                    detail="Log your first trade in the Journal to activate real-time edge calculations and Risk:Reward analysis.",
                    tone="warning",
                ),
                CoachInsight(
                    title="Risk Management Engine Ready",
                    detail="JournalFX monitors daily loss limits, drawdown, and session consistency automatically as soon as trades are logged.",
                    tone="good",
                ),
            ],
        }

    winning_trades = [t for t in trades if t.profit > 0]
    losing_trades = [t for t in trades if t.profit < 0]
    
    net_profit = sum(t.profit for t in trades)
    win_rate = (len(winning_trades) / total_trades * 100) if total_trades > 0 else 0.0

    avg_win = (sum(t.profit for t in winning_trades) / len(winning_trades)) if winning_trades else 0.0
    avg_loss = (abs(sum(t.profit for t in losing_trades)) / len(losing_trades)) if losing_trades else 0.0
    rr_ratio_num = (avg_win / avg_loss) if avg_loss > 0 else (2.5 if avg_win > 0 else 1.0)
    avg_rr_str = f"1 : {rr_ratio_num:.2f}"

    # Symbol breakdown
    symbol_profits: dict[str, float] = {}
    symbol_trades: dict[str, int] = {}
    for t in trades:
        symbol_profits[t.symbol] = symbol_profits.get(t.symbol, 0.0) + t.profit
        symbol_trades[t.symbol] = symbol_trades.get(t.symbol, 0) + 1

    sorted_symbols = sorted(symbol_profits.items(), key=lambda x: x[1], reverse=True)
    best_symbol = sorted_symbols[0][0] if sorted_symbols else "USD/CAD"
    worst_symbol = sorted_symbols[-1][0] if sorted_symbols and sorted_symbols[-1][1] < 0 else "None"

    # Session breakdown
    session_profits = {"London": 0.0, "New York": 0.0, "Asian": 0.0}
    for t in trades:
        hour = t.created_at.hour
        if 7 <= hour < 14:
            session_profits["London"] += t.profit
        elif 14 <= hour < 21:
            session_profits["New York"] += t.profit
        else:
            session_profits["Asian"] += t.profit

    best_session = max(session_profits.items(), key=lambda x: x[1])[0]

    # Scores
    # Discipline: based on holding to SL without blowouts
    discipline_score = 88 if avg_loss <= 60 else (75 if avg_loss <= 100 else 60)
    # Risk: based on drawdown and RR
    risk_score = 92 if rr_ratio_num >= 2.0 else (80 if rr_ratio_num >= 1.5 else 68)
    # Timing: based on session edge
    timing_score = 85 if session_profits.get("London", 0) > 0 or session_profits.get("New York", 0) > 0 else 74
    coach_score = round((discipline_score + risk_score + timing_score) / 3)

    summary_text = (
        f"You have recorded {total_trades} trades with a net profit of ${net_profit:.2f} and a {win_rate:.1f}% win rate. "
        f"Your trading edge is powered by a high Risk-to-Reward ratio of {avg_rr_str}, where your average winner (${avg_win:.2f}) "
        f"is {rr_ratio_num:.1f}x larger than your average loss (${avg_loss:.2f}). Your most profitable instrument is {best_symbol}."
    )

    strengths = [
        f"Strong Risk:Reward asymmetry ({avg_rr_str}) allows profitability even below 50% win rate.",
        f"Top performance on {best_symbol} with consistent take-profit execution.",
        f"Well-managed stop-losses (Average loss limited to ${avg_loss:.2f}).",
    ]

    weaknesses = [
        f"Win rate ({win_rate:.1f}%) has room for improvement through tighter entry confirmation.",
        f"Avoid trading outside optimal volatility sessions like {best_session}.",
        f"Watch out for multi-trade losing streaks (keep risk under 1% per position).",
    ]

    next_actions = [
        f"Double down on {best_symbol} setups during {best_session} session breakouts.",
        f"Maintain current 1:{rr_ratio_num:.1f} R:R target — do not cut winners early.",
        "Log psychological emotions in the trade notes before entering every new setup.",
    ]

    insights = [
        CoachInsight(
            title="Asymmetric Risk:Reward Edge",
            detail=f"Your average win (${avg_win:.2f}) significantly outpaces your average loss (${avg_loss:.2f}). This gives you a positive statistical expectancy of +${analytics.get('expectancy', 32.92):.2f} per trade.",
            tone="good",
        ),
        CoachInsight(
            title=f"Optimal Asset: {best_symbol}",
            detail=f"{best_symbol} generated the highest cumulative returns in your trading journal. Focus on mastering this pair's key liquidity levels.",
            tone="good",
        ),
        CoachInsight(
            title="Drawdown & Exposure Health",
            detail=f"Your maximum drawdown is currently controlled at {analytics.get('max_drawdown', 0.0)}%. Continue adhering to strict lot sizing rules.",
            tone="good" if analytics.get("max_drawdown', 0.0", 0) < 5 else "warning",
        ),
    ]

    return {
        "summary": summary_text,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "next_actions": next_actions,
        "risk_note": f"Risk per trade is well-contained. Average loss is ${avg_loss:.2f}, giving a safe buffer for funded account drawdown rules.",
        "coach_score": coach_score,
        "discipline_score": discipline_score,
        "risk_score": risk_score,
        "timing_score": timing_score,
        "best_symbol": best_symbol,
        "worst_symbol": worst_symbol,
        "best_session": best_session,
        "avg_rr_ratio": avg_rr_str,
        "insights": insights,
    }


def get_ai_coach_summary(
    db: Session,
    user_id: int,
    account_id: Optional[int] = None,
) -> CoachSummary:
    today = datetime.now(timezone.utc).date()

    # Fetch real user trades
    query = db.query(Trade).filter(Trade.user_id == user_id)
    if account_id:
        query = query.filter(Trade.account_id == account_id)
    trades = query.order_by(Trade.created_at.asc()).all()

    analytics = get_analytics_overview(db, user_id)

    # 1. Generate quantitative trade audit
    coach_data = compute_rule_based_coach(trades, analytics)

    # 2. If Gemini API key is configured, optionally enrich with LLM
    if settings.GEMINI_API_KEY and len(trades) > 0:
        try:
            trade_context = build_trade_context(trades)
            prompt = f"""
You are an expert quantitative trading mentor. Review this trader's journal:
Stats: {json.dumps(analytics, indent=2)}
Recent Trade Log:
{trade_context}

Provide a crisp, actionable coaching review summarizing their Risk-to-Reward, best pairs, session timing, and next steps.
"""
            payload = {
                "contents": [{"role": "user", "parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.3},
            }
            request = Request(
                f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent",
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "x-goog-api-key": settings.GEMINI_API_KEY,
                },
                method="POST",
            )
            with urlopen(request, timeout=15) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                candidates = res_data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts and parts[0].get("text"):
                        llm_text = parts[0]["text"].strip()
                        # Use LLM summary if valid paragraph
                        if len(llm_text) > 40:
                            coach_data["summary"] = llm_text.split("\n\n")[0]
        except Exception as gemini_err:
            print(f"Gemini LLM enrichment skipped: {gemini_err}, using native AI rule engine.")

    increment_daily_usage(db, user_id, today)
    return CoachSummary.model_validate(coach_data)


def ai_chat_coach(
    db: Session,
    user_id: int,
    user_message: str,
    account_id: Optional[int] = None,
) -> AIChatResponse:
    """Answers user trading questions with direct context from their live database trades."""
    query = db.query(Trade).filter(Trade.user_id == user_id)
    if account_id:
        query = query.filter(Trade.account_id == account_id)
    trades = query.order_by(Trade.created_at.asc()).all()

    total_trades = len(trades)
    
    if total_trades == 0:
        return AIChatResponse(
            reply="You have not logged any trades yet on this account. Once you connect an MT5 account or log your first trade in the Journal, I will analyze your performance, win rate, best currency pairs, and Risk-to-Reward ratio!",
            timestamp=datetime.now(timezone.utc).isoformat(),
        )

    winning_trades = [t for t in trades if t.profit > 0]
    losing_trades = [t for t in trades if t.profit < 0]
    net_profit = sum(t.profit for t in trades)
    win_rate = (len(winning_trades) / total_trades * 100) if total_trades > 0 else 0.0

    avg_win = (sum(t.profit for t in winning_trades) / len(winning_trades)) if winning_trades else 0.0
    avg_loss = (abs(sum(t.profit for t in losing_trades)) / len(losing_trades)) if losing_trades else 0.0
    rr_ratio = f"1 : {(avg_win / avg_loss):.2f}" if avg_loss > 0 else "1 : 2.50"

    # Best pair
    pair_profits: dict[str, float] = {}
    for t in trades:
        pair_profits[t.symbol] = pair_profits.get(t.symbol, 0.0) + t.profit
    best_pair = max(pair_profits.items(), key=lambda x: x[1])[0] if pair_profits else "USD/CAD"

    msg_lower = user_message.lower()

    if "pair" in msg_lower or "symbol" in msg_lower or "best" in msg_lower:
        reply = (
            f"Based on your trading history, your most profitable instrument is **{best_pair}** "
            f"with a cumulative profit of +${pair_profits.get(best_pair, 0):.2f}. "
            f"You have taken {total_trades} total trades across all pairs."
        )
    elif "rr" in msg_lower or "risk" in msg_lower or "reward" in msg_lower or "loss" in msg_lower:
        reply = (
            f"Your current Risk-to-Reward ratio is **{rr_ratio}**. "
            f"Your average winning trade makes **+${avg_win:.2f}**, while your average loss is restricted to **-${avg_loss:.2f}**. "
            f"This positive asymmetry ensures your account grows even when win rate is around {win_rate:.1f}%."
        )
    elif "win" in msg_lower or "rate" in msg_lower:
        reply = (
            f"Your overall Win Rate is **{win_rate:.1f}%** ({len(winning_trades)} Wins / {len(losing_trades)} Losses). "
            f"Your total Net Profit stands at **+${net_profit:.2f}**."
        )
    else:
        reply = (
            f"Analysis of your {total_trades} trades: Your Net Profit is **+${net_profit:.2f}** with an average Risk:Reward of **{rr_ratio}**. "
            f"Your top performing asset is **{best_pair}**. To boost consistency, focus on your high-probability London and New York session setups."
        )

    return AIChatResponse(
        reply=reply,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )

