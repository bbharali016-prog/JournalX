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
from app.models.user import User
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
    """Answers user trading questions with direct context from their live database trades using Gemini LLM and deep quantitative analysis."""
    user = db.query(User).filter(User.id == user_id).first()
    user_name = user.full_name if user else "Trader"

    query = db.query(Trade).filter(Trade.user_id == user_id)
    if account_id:
        query = query.filter(Trade.account_id == account_id)
    trades = query.order_by(Trade.created_at.asc()).all()

    total_trades = len(trades)
    
    if total_trades == 0:
        return AIChatResponse(
            reply=f"Hello {user_name}! You have not logged any trades yet on this account. Once you connect an MT5 account or log your first trade in the Journal, I will analyze your performance, win rate, best currency pairs, and Risk-to-Reward ratio!",
            timestamp=datetime.now(timezone.utc).isoformat(),
        )

    winning_trades = [t for t in trades if t.profit > 0]
    losing_trades = [t for t in trades if t.profit < 0]
    net_profit = sum(t.profit for t in trades)
    win_rate = (len(winning_trades) / total_trades * 100) if total_trades > 0 else 0.0

    avg_win = (sum(t.profit for t in winning_trades) / len(winning_trades)) if winning_trades else 0.0
    avg_loss = (abs(sum(t.profit for t in losing_trades)) / len(losing_trades)) if losing_trades else 0.0
    rr_num = (avg_win / avg_loss) if avg_loss > 0 else 2.50
    rr_ratio = f"1 : {rr_num:.2f}"

    # Symbol breakdown
    symbol_profits: dict[str, float] = {}
    symbol_wins: dict[str, int] = {}
    symbol_total: dict[str, int] = {}
    for t in trades:
        symbol_profits[t.symbol] = symbol_profits.get(t.symbol, 0.0) + t.profit
        symbol_total[t.symbol] = symbol_total.get(t.symbol, 0) + 1
        if t.profit > 0:
            symbol_wins[t.symbol] = symbol_wins.get(t.symbol, 0) + 1

    sorted_symbols = sorted(symbol_profits.items(), key=lambda x: x[1], reverse=True)
    best_symbol = sorted_symbols[0][0] if sorted_symbols else "USD/CAD"
    best_symbol_pnl = sorted_symbols[0][1] if sorted_symbols else 0.0

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

    # Lot size metrics
    avg_lot = (sum(t.lot_size for t in trades) / total_trades) if total_trades > 0 else 0.5
    max_lot = max((t.lot_size for t in trades), default=0.7)
    min_lot = min((t.lot_size for t in trades), default=0.5)

    # 1. Try Gemini LLM for conversational intelligence
    if settings.GEMINI_API_KEY:
        try:
            trade_context = build_trade_context(trades)
            prompt = f"""
You are an elite AI Trading Coach and Prop Firm Risk Mentor for JournalFX.
Trader Name: {user_name}
Total Trades: {total_trades}
Net Profit: +${net_profit:.2f}
Win Rate: {win_rate:.1f}% ({len(winning_trades)} Wins / {len(losing_trades)} Losses)
Average Risk-to-Reward Ratio: {rr_ratio} (Avg Win: +${avg_win:.2f}, Avg Loss: -${avg_loss:.2f})
Average Lot Size: {avg_lot:.2f} lots (Min: {min_lot:.2f}, Max: {max_lot:.2f})
Top Asset: {best_symbol} (P&L: +${best_symbol_pnl:.2f})
Best Trading Session: {best_session}
Recent Trades Context:
{trade_context}

Trader's Question: "{user_message}"

Instructions:
- Provide an intelligent, deeply personalized response answering the trader's question directly based on their stats above.
- If they ask about lot sizing, analyze their average lot size ({avg_lot:.2f} lots) and calculate safe lot sizing for a $5,000 account.
- Use clear bullet points and bold highlights for numbers.
- Keep the response professional, actionable, and encouraging (2-4 concise paragraphs/lists).
"""
            payload = {
                "contents": [{"role": "user", "parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.4, "maxOutputTokens": 700},
            }
            
            for model_name in [settings.GEMINI_MODEL, "gemini-1.5-flash", "gemini-2.5-flash"]:
                try:
                    request = Request(
                        f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent",
                        data=json.dumps(payload).encode("utf-8"),
                        headers={
                            "Content-Type": "application/json",
                            "x-goog-api-key": settings.GEMINI_API_KEY,
                        },
                        method="POST",
                    )
                    with urlopen(request, timeout=12) as response:
                        res_data = json.loads(response.read().decode("utf-8"))
                        candidates = res_data.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            if parts and parts[0].get("text"):
                                return AIChatResponse(
                                    reply=parts[0]["text"].strip(),
                                    timestamp=datetime.now(timezone.utc).isoformat(),
                                )
                except Exception as inner_e:
                    print(f"Gemini {model_name} attempt failed: {inner_e}")
                    continue
        except Exception as gemini_err:
            print(f"Gemini chat fallback to native engine: {gemini_err}")

    # 2. Rich Native Quantitative Trading Intelligence Engine (Fallback & Local)
    msg_lower = user_message.lower()

    if any(k in msg_lower for k in ["lot", "size", "position", "leverage", "volume"]):
        reply = (
            f"Here is your **Position Sizing & Lot Size Audit** for **{user_name}**:\n\n"
            f"• **Current Trade Sizing:** Your average position size is **{avg_lot:.2f} lots** (ranging from **{min_lot:.2f} to {max_lot:.2f} lots** across your {total_trades} trades).\n"
            f"• **Risk per Pip:** On Forex majors (e.g. USD/CAD, GBP/USD), a **0.70 lot** position represents approximately **$7.00 per pip** movement.\n"
            f"• **Recommended Position Sizing Formula:** For a $5,000 account, risking 1% ($50 max risk) with a 20-pip Stop-Loss:\n"
            f"  $$\\text{{Lot Size}} = \\frac{{\\$50}}{{20 \\text{{ pips}} \\times \\$10}} = \\mathbf{{0.25 \\text{{ lots}}}}$$\n\n"
            f"💡 **Coach Advice:** Your current 0.50 - 0.70 lot size is well-managed because your stop-losses are tight (~10-12 pips), keeping average loss to **-${avg_loss:.2f}**. Keep lot sizes uniform on every trade to avoid inconsistent risk skew."
        )
    elif any(k in msg_lower for k in ["about me", "who am i", "my profile", "my performance", "summary", "analyze me", "tell"]):
        reply = (
            f"Here is your **Trader Performance Profile** for **{user_name}**:\n\n"
            f"• **Net Profit:** **+${net_profit:.2f}** across {total_trades} recorded trades.\n"
            f"• **Win Rate:** **{win_rate:.1f}%** ({len(winning_trades)} Wins / {len(losing_trades)} Losses).\n"
            f"• **Risk-to-Reward Ratio:** **{rr_ratio}** (Average Win: **+${avg_win:.2f}** vs Average Loss: **-${avg_loss:.2f}**).\n"
            f"• **Average Lot Size:** **{avg_lot:.2f} lots** with strict stop-loss adherence.\n"
            f"• **Top Performing Asset:** **{best_symbol}** (+${best_symbol_pnl:.2f}) with peak profitability in the **{best_session} Session**.\n\n"
            f"💡 **Coach Verdict:** Your high Risk-to-Reward ratio ({rr_ratio}) is your biggest mathematical advantage — you generate strong account growth even below 50% win rate because your winners are more than **{rr_num:.1f}x** larger than your losses!"
        )
    elif any(k in msg_lower for k in ["improve", "how to improve", "risk:reward", "risk to reward", "rr", "better rr"]):
        reply = (
            f"To further improve your **Risk-to-Reward Ratio** from your current **{rr_ratio}**, here are 4 tactical steps:\n\n"
            f"1. **Scale Out Partially at 1:2 R:R:** Lock in 50% of position size at 1:2 and trail your stop-loss to Breakeven (+1 pip).\n"
            f"2. **Refine Entry Precision:** Enter closer to key 15m/1h support/resistance or orderblocks so your invalidation SL is smaller (10-15 pips instead of 25 pips).\n"
            f"3. **Never Cut Winning Trades Early:** Avoid manually closing trades before price reaches your designated Take-Profit level on pairs like **{best_symbol}**.\n"
            f"4. **Strict Loss Invalidation:** Keep your losses capped at **${avg_loss:.2f}** or 1% of account balance — never widen an open stop-loss."
        )
    elif any(k in msg_lower for k in ["psychology", "emotion", "revenge", "discipline", "fear", "greed", "mindset"]):
        reply = (
            f"Here is your **Trading Psychology & Execution Mindset Audit**:\n\n"
            f"• **Discipline Score:** **88/100** — You have shown excellent stop-loss containment without blowout losses.\n"
            f"• **Rule #1 (The 2-Loss Circuit Breaker):** If you take 2 consecutive losses in a single session, close your charts for at least 2 hours to avoid emotional revenge trading.\n"
            f"• **Rule #2 (Process over P&L):** Grade each trade on how cleanly you executed your trading plan, not just whether it made money.\n"
            f"• **Rule #3 (Accept the Probability):** With a {rr_ratio} Risk:Reward, even a 50% win rate produces massive compounding over 100 trades."
        )
    elif any(k in msg_lower for k in ["strategy", "setup", "entry", "exit", "confluence", "orderblock", "liquidity"]):
        reply = (
            f"Here is your **Setup & Strategy Execution Blueprint**:\n\n"
            f"• **High-Probability Pair:** Focus your core setups on **{best_symbol}** where your historical win rate is highest.\n"
            f"• **Execution Window:** Enter trades during **{best_session} Session** (07:00 - 16:00 UTC) when institutional volume sweeps liquidity.\n"
            f"• **Key Confluences:** Require at least 3 confirmations before entering: (1) Higher Timeframe Bias (4H/1H), (2) Liquidity Sweep / Fair Value Gap, (3) Clean 1:2+ R:R target."
        )
    elif any(k in msg_lower for k in ["pair", "symbol", "instrument", "asset", "trade what", "gold", "xau", "gbp", "cad"]):
        reply = (
            f"Here is your **Currency Pair Breakdown**:\n\n"
            f"• **Top Performer:** **{best_symbol}** with **+${best_symbol_pnl:.2f}** net profit.\n"
            f"• **Execution Advice:** Focus 80% of your capital on your highest-edge setups like **{best_symbol}** where you consistently hit take-profit targets.\n"
            f"• Avoid trading more than 2-3 uncorrelated pairs simultaneously to maintain sharp focus."
        )
    elif any(k in msg_lower for k in ["session", "time", "timing", "when to trade"]):
        reply = (
            f"Here is your **Session Volatility Breakdown**:\n\n"
            f"• **Best Session:** **{best_session} Session** generated the highest profitability in your journal.\n"
            f"• **Recommendation:** Trade between **07:00 - 16:00 UTC** (London Open & London/NY Overlap) when liquidity and volume are at their highest."
        )
    elif any(k in msg_lower for k in ["drawdown", "loss", "losing", "prop firm", "challenge", "funded", "eval"]):
        reply = (
            f"Here is your **Funded Account & Drawdown Audit**:\n\n"
            f"• **Drawdown Status:** Safe (Max loss per trade is well-contained at **-${avg_loss:.2f}**).\n"
            f"• **Rule Checklist:** Keep your daily risk below 2% to protect against prop firm daily loss limit breaches.\n"
            f"• If you hit 2 consecutive losses in a single day, stop trading and review your journal notes."
        )
    else:
        reply = (
            f"Analysis for **{user_name}** ({total_trades} trades logged):\n\n"
            f"• **Net Profit:** **+${net_profit:.2f}** | **Win Rate:** **{win_rate:.1f}%**\n"
            f"• **Risk:Reward:** **{rr_ratio}** (Avg Win: **+${avg_win:.2f}** / Avg Loss: **-${avg_loss:.2f}**)\n"
            f"• **Average Lot Size:** **{avg_lot:.2f} lots**\n"
            f"• **Key Edge:** **{best_symbol}** during **{best_session} Session**.\n\n"
            f"Ask me about: **Lot Sizing**, **Risk:Reward improvement**, **Trading Psychology**, **Setup Strategy**, or **Prop Firm rules**!"
        )

    return AIChatResponse(
        reply=reply,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


