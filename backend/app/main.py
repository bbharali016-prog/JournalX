from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.security import hash_password

from app.api.v1.auth import router as auth_router

from app.db.database import Base, engine
from app.models.user import User
from app.api.v1.users import router as users_router
from app.models.trade import Trade
from app.api.v1.trades import router as trades_router

app = FastAPI(
    title="JournalX API",
    version="1.0.0",
)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(trades_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "JournalX API Running 🚀"}