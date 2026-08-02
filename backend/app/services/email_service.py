import json
import ssl
import urllib.error
import urllib.request

from app.core.config import settings


def send_otp_email(email: str, otp: str, purpose: str):
    if not settings.RESEND_API_KEY:
        print("RESEND_API_KEY missing. Email not sent; using dev OTP only.")
        return False

    subject = "Your JournalX verification code"
    heading = "Verify your JournalX account"

    if purpose == "reset":
        subject = "Reset your JournalX password"
        heading = "Reset your JournalX password"

    payload = json.dumps(
        {
            "from": settings.FROM_EMAIL,
            "to": [email],
            "subject": subject,
            "html": f"""
                <div style="font-family:Arial,sans-serif;background:#050b18;color:#ffffff;padding:32px;">
                    <div style="max-width:520px;margin:auto;background:#0b1220;border:1px solid #1f2937;border-radius:20px;padding:28px;">
                        <h1 style="margin:0 0 12px;font-size:24px;">{heading}</h1>
                        <p style="color:#cbd5e1;margin:0 0 20px;">Use this OTP code. It expires in 10 minutes.</p>
                        <div style="font-size:36px;letter-spacing:8px;font-weight:700;background:#111827;border-radius:16px;padding:18px;text-align:center;">
                            {otp}
                        </div>
                        <p style="color:#94a3b8;margin-top:20px;font-size:13px;">If you did not request this, you can ignore this email.</p>
                    </div>
                </div>
            """,
        }
    ).encode("utf-8")

    request = urllib.request.Request(
        "https://api.resend.com/emails",
        data=payload,
        headers={
            "Authorization": f"Bearer {settings.RESEND_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "JournalX/1.0",
        },
        method="POST",
    )

    try:
        context = ssl.create_default_context()

        with urllib.request.urlopen(request, timeout=12, context=context) as response:
            return 200 <= response.status < 300
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="ignore")
        print(f"Resend email failed: {error.code} {detail}")
        return False
    except Exception as error:
        print(f"Resend email failed: {error}")
        return False
