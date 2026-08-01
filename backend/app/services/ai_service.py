import json
from datetime import date, datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.ai_usage import AIUsage
from app.models.trade import Trade
from app.schemas.ai import CoachSummary
from app.services.analytics_service import get_analytics_overview

FREE_DAILY_LIMIT = 10

GEMINI_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "summary": {"type": "string"},
        "strengths": {"type": "array", "items": {"type": "string"}},
        "weaknesses": {"type": "array", "items": {"type": "string"}},
        "next_actions": {"type": "array", "items": {"type": "string"}},
        "risk_note": {"type": "string"},
        "coach_score": {"type": "integer"},
        "insights": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "detail": {"type": "string"},
                    "tone": {
                        "type": "string",
                        "enum": ["good", "warning", "danger"],
                    },
                },
                "required": ["title", "detail", "tone"],
            },
        },
    },
    "required": [
        "summary",
        "strengths",
        "weaknesses",
        "next_actions",
        "risk_note",
        "coach_score",
        "insights",
    ],
}


def build_trade_context(trades: list[Trade]) -> str:
    recent_trades = trades[-20:]

    lines = []
    for trade in recent_trades:
        lines.append(
            f"{trade.created_at.date().isoformat()} | {trade.symbol} | {trade.side} | "
            f"profit={trade.profit} | lot={trade.lot_size} | entry={trade.entry_price} | exit={trade.exit_price}"
        )

    return "\n".join(lines) if lines else "No trade history available."


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


def parse_json_response(raw_text: str):
    text = raw_text.strip()

    if text.startswith("```"):
        text = text.strip("`")
        if text.startswith("json"):
            text = text[4:].strip()

    start = text.find("{")
    end = text.rfind("}")

    if start != -1 and end != -1 and end > start:
        text = text[start : end + 1]

    return json.loads(text)


def get_ai_coach_summary(
    db: Session,
    user_id: int,
):
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured")

    today = datetime.now(timezone.utc).date()
    usage = get_daily_usage(db, user_id, today)

    if usage and usage.request_count >= FREE_DAILY_LIMIT:
        raise PermissionError(
            f"Free AI Coach limit reached. You can use it {FREE_DAILY_LIMIT} times per day."
        )

    trades = (
        db.query(Trade)
        .filter(Trade.user_id == user_id)
        .order_by(Trade.created_at.asc())
        .all()
    )

    analytics = get_analytics_overview(db, user_id)
    trade_context = build_trade_context(trades)

    prompt = f"""
You are an AI trading coach for a professional trading journal.

Use the trader stats and trade history to produce concise, practical coaching.

Trader stats:
{json.dumps(analytics, indent=2)}

Recent trade log:
{trade_context}

Return JSON with exactly these keys:
- summary: one short paragraph
- strengths: array of 3 short bullets
- weaknesses: array of 3 short bullets
- next_actions: array of 3 short bullets
- risk_note: one short sentence about risk or drawdown
- coach_score: integer from 0 to 100
- insights: array of objects with title, detail, tone where tone is one of good, warning, danger

Keep the advice specific to the trader data. Avoid generic motivational filler.
"""

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ],
        "generationConfig": {
            "temperature": 0.4,
            "responseMimeType": "application/json",
            "responseSchema": GEMINI_JSON_SCHEMA,
        },
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

    try:
        with urlopen(request, timeout=60) as response:
            response_data = json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Gemini request failed: {exc.code} {detail}") from exc
    except URLError as exc:
        raise RuntimeError(f"Gemini request failed: {exc.reason}") from exc

    candidate_text = ""
    candidates = response_data.get("candidates", [])
    if candidates:
        content = candidates[0].get("content", {})
        parts = content.get("parts", [])
        if parts:
            candidate_text = parts[0].get("text", "")

    if not candidate_text:
        raise RuntimeError("Gemini returned no coach content")

    parsed = parse_json_response(candidate_text)
    increment_daily_usage(db, user_id, today)

    # Log to MongoDB
    try:
        from app.db.mongodb import get_mongo_db
        mongo_db = get_mongo_db()
        mongo_db.ai_coach_logs.insert_one({
            "user_id": user_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "analytics_snapshot": analytics,
            "response": parsed
        })
    except Exception as e:
        print(f"Failed to log AI coach summary to MongoDB: {e}")

    return CoachSummary.model_validate(parsed)
