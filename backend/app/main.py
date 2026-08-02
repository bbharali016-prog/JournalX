from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from app.core.security import hash_password


def run_migrations():
    """Run alembic migrations on startup."""
    try:
        from alembic.config import Config
        from alembic import command
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
        print("✅ Database migrations applied successfully")
    except Exception as e:
        print(f"⚠️ Migration warning (tables may already exist): {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    run_migrations()
    yield

from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.trades import router as trades_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.ai import router as ai_router
from app.api.v1.mt5 import router as mt5_router
from app.api.v1.accounts import router as accounts_router
from app.api.v1.reports import router as reports_router
from app.api.v1.stripe import router as stripe_router

app = FastAPI(
    title="JournalX API",
    version="1.0.0",
    lifespan=lifespan,
)
os.makedirs("uploads", exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads",
)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(trades_router)
app.include_router(dashboard_router)
app.include_router(analytics_router)
app.include_router(ai_router)
app.include_router(mt5_router)
app.include_router(accounts_router)
app.include_router(reports_router)
app.include_router(stripe_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://jouranfx.vercel.app",        # production frontend
        "https://journalx.vercel.app",         # alternate
        "https://*.vercel.app",                # all Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "JournalX API Running 🚀"}


@app.get("/health")
def health_check():
    """Health check endpoint with database diagnostics to troubleshoot Render connection issues."""
    db_status = "unknown"
    error_msg = None
    try:
        from sqlalchemy import text
        from app.db.database import SessionLocal
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_status = "connected"
    except Exception as e:
        db_status = "failed"
        import traceback
        error_msg = traceback.format_exc()

    db_url = os.getenv("DATABASE_URL")
    db_url_info = None
    if db_url:
        db_url_info = {
            "length": len(db_url),
            "scheme": db_url.split(":")[0] if ":" in db_url else "none",
            "has_percent": "%" in db_url,
            "has_at": "@" in db_url,
            "at_count": db_url.count("@"),
            "masked": db_url[:15] + "..." + db_url[-15:] if len(db_url) > 30 else "too short"
        }

    return {
        "status": "ok" if db_status == "connected" else "error",
        "service": "JournalX API",
        "db": {
            "status": db_status,
            "info": db_url_info,
            "error": error_msg
        }
    }

