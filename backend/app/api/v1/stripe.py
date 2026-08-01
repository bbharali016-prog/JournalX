from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import stripe
import uuid

from app.core.config import settings
from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/api/v1/stripe",
    tags=["Stripe"],
)

if settings.STRIPE_SECRET_KEY:
    stripe.api_key = settings.STRIPE_SECRET_KEY


class CheckoutRequest(BaseModel):
    plan: str  # "Pro" or "Elite"


class MockSuccessRequest(BaseModel):
    plan: str
    session_id: str


@router.post("/create-checkout-session")
def create_checkout_session(
    payload: CheckoutRequest,
    current_user: User = Depends(get_current_user),
):
    # Determine if Stripe API keys are configured (Production/Mock Mode selector)
    is_mock = not settings.STRIPE_SECRET_KEY or settings.STRIPE_SECRET_KEY == "mock"

    if is_mock:
        # Mock mode redirect url
        mock_session_id = f"mock_{uuid.uuid4().hex[:10]}"
        success_url = f"{settings.FRONTEND_URL}/plans/success?session_id={mock_session_id}&plan={payload.plan}"
        return {"url": success_url}

    # Stripe production mode
    price_id = None
    if payload.plan == "Pro":
        price_id = settings.STRIPE_PRO_PRICE_ID
    elif payload.plan == "Elite":
        price_id = settings.STRIPE_ELITE_PRICE_ID

    if not price_id:
        raise HTTPException(
            status_code=400,
            detail=f"Stripe price ID for plan '{payload.plan}' is not configured on the server."
        )

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price": price_id,
                    "quantity": 1,
                }
            ],
            mode="subscription",
            success_url=f"{settings.FRONTEND_URL}/plans/success?session_id={{CHECKOUT_SESSION_ID}}&plan={payload.plan}",
            cancel_url=f"{settings.FRONTEND_URL}/plans",
            client_reference_id=str(current_user.id),
            customer_email=current_user.email,
            metadata={
                "user_id": str(current_user.id),
                "plan": payload.plan,
            },
        )
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create-portal-session")
def create_portal_session(
    current_user: User = Depends(get_current_user),
):
    is_mock = not settings.STRIPE_SECRET_KEY or settings.STRIPE_SECRET_KEY == "mock"

    if is_mock:
        # Redirect to settings in mock mode
        return {"url": f"{settings.FRONTEND_URL}/settings"}

    try:
        # Retrieve customer by email
        customers = stripe.Customer.list(email=current_user.email, limit=1)
        if not customers.data:
            # If no Stripe customer exists, send back to plans page
            return {"url": f"{settings.FRONTEND_URL}/plans"}

        customer_id = customers.data[0].id
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=f"{settings.FRONTEND_URL}/settings",
        )
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mock-success")
def mock_success(
    payload: MockSuccessRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify we are indeed running in mock/sandbox mode
    is_mock = not settings.STRIPE_SECRET_KEY or settings.STRIPE_SECRET_KEY == "mock"
    if not is_mock:
        raise HTTPException(status_code=403, detail="Mock success payments are disabled in production mode.")

    # Upgrade the user's plan to selected subscription
    current_user.plan = payload.plan
    db.commit()
    db.refresh(current_user)

    return {"status": "success", "plan": current_user.plan}


@router.post("/webhook")
async def webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    if not stripe_signature:
        raise HTTPException(status_code=400, detail="Missing stripe-signature header")

    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle Stripe Webhook Events
    event_type = event["type"]

    if event_type == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session.get("client_reference_id") or session.get("metadata", {}).get("user_id")
        plan_name = session.get("metadata", {}).get("plan", "Free")

        if user_id:
            user = db.query(User).filter(User.id == int(user_id)).first()
            if user:
                user.plan = plan_name
                db.commit()

    elif event_type in ["customer.subscription.updated", "customer.subscription.deleted"]:
        subscription = event["data"]["object"]
        customer_id = subscription.get("customer")

        # Fetch stripe customer to map back to local user email
        try:
            stripe_customer = stripe.Customer.retrieve(customer_id)
            email = stripe_customer.get("email")
            if email:
                user = db.query(User).filter(User.email == email.lower()).first()
                if user:
                    if event_type == "customer.subscription.deleted":
                        # Downgrade user plan back to Free if subscription ended
                        user.plan = "Free"
                    else:
                        # Update plan based on status
                        status = subscription.get("status")
                        if status in ["active", "trialing"]:
                            # Attempt to map from Stripe Product to Plan name if needed
                            # Default back to current plan or query items
                            pass
                        else:
                            user.plan = "Free"
                    db.commit()
        except Exception as e:
            print(f"Error handling subscription webhook event: {e}")

    return {"status": "success"}
