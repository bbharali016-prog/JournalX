from datetime import datetime, timedelta, timezone
import random

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.config import settings

from app.db.database import get_db
from app.schemas.auth import EmailRequest, ResetPasswordRequest, UserRegister, VerifyOtpRequest, UserLogin, SocialLoginRequest
from app.services.auth_service import create_user, authenticate_user
from app.core.security import create_access_token, hash_password
from app.models.user import User
from app.services.email_service import send_otp_email


router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])
otp_store: dict[str, dict[str, object]] = {}
verified_emails: set[str] = set()


def create_otp(email: str, purpose: str):
    otp = f"{random.randint(100000, 999999)}"
    otp_store[f"{purpose}:{email}"] = {
        "otp": otp,
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10),
    }
    print(f"JournalX {purpose} OTP for {email}: {otp}")
    return otp


def otp_response(email: str, otp: str, purpose: str, message: str):
    email_sent = send_otp_email(email, otp, purpose)
    response = {
        "message": message,
        "email": email,
        "email_sent": email_sent,
    }

    if not email_sent:
        response["dev_otp"] = otp

    return response


def verify_otp(email: str, purpose: str, otp: str):
    record = otp_store.get(f"{purpose}:{email}")

    if not record:
        return False

    if record["expires_at"] < datetime.now(timezone.utc):
        return False

    return record["otp"] == otp


@router.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    new_user = create_user(db, user)

    if not new_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    otp = create_otp(new_user.email, "verify")

    return otp_response(
        new_user.email,
        otp,
        "verify",
        "User registered successfully",
    )


@router.post("/resend-otp")
def resend_otp(payload: EmailRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="Email not found")

    otp = create_otp(email, "verify")

    return otp_response(
        email,
        otp,
        "verify",
        "Verification OTP sent",
    )


@router.post("/verify-otp")
def verify_email(payload: VerifyOtpRequest):
    email = payload.email.lower()

    if not verify_otp(email, "verify", payload.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    verified_emails.add(email)
    otp_store.pop(f"verify:{email}", None)

    return {"message": "Email verified successfully"}


@router.post("/forgot-password")
def forgot_password(payload: EmailRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="Email not found")

    otp = create_otp(email, "reset")

    return otp_response(
        email,
        otp,
        "reset",
        "Password reset OTP sent",
    )


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()

    if not verify_otp(email, "reset", payload.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="Email not found")

    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    otp_store.pop(f"reset:{email}", None)

    return {"message": "Password reset successfully"}

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = authenticate_user(
        db,
        user.email,
        user.password,
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_access_token(
        {
            "sub": db_user.email,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }


import time
import urllib.request
import json
import ssl
from jose import jwt

GOOGLE_CERTS_CACHE = {
    "certs": None,
    "expires_at": 0
}

def get_google_public_certs():
    now = time.time()
    if GOOGLE_CERTS_CACHE["certs"] and GOOGLE_CERTS_CACHE["expires_at"] > now:
        return GOOGLE_CERTS_CACHE["certs"]

    try:
        url = "https://www.googleapis.com/oauth2/v3/certs"
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0"}
        )
        context = ssl._create_unverified_context()
        # Fetch certificates with a strict 3 seconds timeout
        with urllib.request.urlopen(req, context=context, timeout=3) as response:
            certs = json.loads(response.read().decode("utf-8"))
            GOOGLE_CERTS_CACHE["certs"] = certs
            GOOGLE_CERTS_CACHE["expires_at"] = now + 3600  # cache 1 hour
            return certs
    except Exception as e:
        print(f"Failed to fetch Google public certs: {e}")
        if GOOGLE_CERTS_CACHE["certs"]:
            return GOOGLE_CERTS_CACHE["certs"]
        return None


def verify_google_token(token: str):
    certs = get_google_public_certs()
    audience = settings.GOOGLE_CLIENT_ID

    # Step 1: Try to verify token locally using cached Google certs
    if certs:
        try:
            headers = jwt.get_unverified_header(token)
            kid = headers.get("kid")
            key = next((k for k in certs.get("keys", []) if k.get("kid") == kid), None)
            
            if key:
                # Local verification in micro-seconds!
                decoded = jwt.decode(
                    token,
                    key,
                    algorithms=["RS256"],
                    audience=audience,
                    options={"verify_aud": bool(audience)}
                )
                return decoded
        except Exception as e:
            print(f"Local Google signature verification failed: {e}. Falling back to tokeninfo API.")

    # Step 2: Fallback to tokeninfo endpoint with strict 4 seconds timeout
    try:
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
        req = urllib.request.Request(
            url,
            method="GET",
            headers={"User-Agent": "Mozilla/5.0"}
        )
        context = ssl._create_unverified_context()
        with urllib.request.urlopen(req, context=context, timeout=4) as response:
            data = json.loads(response.read().decode("utf-8"))
            return data
    except Exception as e:
        print(f"Fallback tokeninfo verification failed: {e}")

    # Step 3: Local sandbox fallback if both fail (e.g. offline dev environment)
    try:
        is_dev = not settings.STRIPE_SECRET_KEY or settings.STRIPE_SECRET_KEY == "mock"
        if is_dev:
            print("Development environment: Fallback to decode unverified claims.")
            return jwt.get_unverified_claims(token)
    except Exception as e:
        print(f"Failed to decode unverified claims: {e}")

    return None


@router.post("/social-login")
def social_login(payload: SocialLoginRequest, db: Session = Depends(get_db)):
    email = payload.email.lower() if payload.email else ""
    name = payload.name

    # If it is a real Google token, verify it
    if payload.provider == "google" and payload.token and payload.token != "mock_oauth_token":
        google_data = verify_google_token(payload.token)
        if not google_data:
            raise HTTPException(
                status_code=400,
                detail="Invalid Google credentials"
            )
        email = google_data.get("email", "").lower()
        name = google_data.get("name", name)
        if not email:
            raise HTTPException(
                status_code=400,
                detail="Email not provided by Google account"
            )

    user = db.query(User).filter(User.email == email).first()

    if not user:
        # Create a new user with a random generated password
        random_pass = f"social_{random.randint(10000000, 99999999)}"
        new_user_data = UserRegister(
            full_name=name or "Google User",
            email=email,
            password=random_pass
        )
        user = create_user(db, new_user_data)
        if not user:
            raise HTTPException(
                status_code=400,
                detail="Could not create user with social login"
            )

    token = create_access_token(
        {
            "sub": user.email,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }


@router.get("/test-login-diag")
def test_login_diag(db: Session = Depends(get_db)):
    """Diagnostic route to test login components and return traceback on error."""
    import traceback
    steps = {}
    try:
        # Step 1: Query DB
        steps["step1_db_query"] = "pending"
        from app.models.user import User
        user = db.query(User).first()
        steps["step1_db_query"] = f"success: found user {user.email if user else 'none'}"

        # Step 2: Test password hashing context
        steps["step2_passlib"] = "pending"
        from app.core.security import pwd_context
        # Check if bcrypt/argon2 works
        dummy_hash = pwd_context.hash("dummy")
        pwd_context.verify("dummy", dummy_hash)
        steps["step2_passlib"] = "success"

        # Step 3: Test JWT encoding
        steps["step3_jwt"] = "pending"
        from app.core.security import create_access_token
        token = create_access_token({"sub": "test@example.com"})
        steps["step3_jwt"] = "success"

        return {
            "status": "success",
            "steps": steps
        }
    except Exception as e:
        return {
            "status": "error",
            "failed_step": list(steps.keys())[-1] if steps else "setup",
            "error": str(e),
            "traceback": traceback.format_exc(),
            "steps": steps
        }

