from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.security import hash_password

print(hash_password("journalx123"))
from app.api.v1.auth import router as auth_router

from app.db.database import Base, engine
from app.models.user import User

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="JournalX API",
    version="1.0.0",
)
app.include_router(auth_router)

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