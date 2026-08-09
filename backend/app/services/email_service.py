import json
import smtplib
import ssl
import urllib.error
import urllib.request
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings


def send_otp_email(email: str, otp: str, purpose: str):
    subject = "Your JournalFX verification code"
    heading = "Verify your JournalFX account"

    if purpose == "reset":
        subject = "Reset your JournalFX password"
        heading = "Reset your JournalFX password"

    html_content = f"""
        <div style="font-family:Arial,sans-serif;background:#050b18;color:#ffffff;padding:32px;">
            <div style="max-width:520px;margin:auto;background:#0b1220;border:1px solid #1f2937;border-radius:20px;padding:28px;">
                <div style="text-align:center;margin-bottom:20px;">
                    <h2 style="color:#8b5cf6;margin:0;font-size:22px;letter-spacing:1px;">JournalFX</h2>
                </div>
                <h1 style="margin:0 0 12px;font-size:22px;color:#ffffff;">{heading}</h1>
                <p style="color:#cbd5e1;margin:0 0 20px;font-size:14px;line-height:1.5;">Use this 6-digit OTP code to continue. This code will expire in 10 minutes.</p>
                <div style="font-size:36px;letter-spacing:8px;font-weight:800;color:#8b5cf6;background:#111827;border:1px solid rgba(139,92,246,0.3);border-radius:16px;padding:20px;text-align:center;margin:24px 0;">
                    {otp}
                </div>
                <p style="color:#94a3b8;margin-top:20px;font-size:12px;line-height:1.4;">If you did not request this OTP, you can safely ignore this email. Do not share this code with anyone.</p>
            </div>
        </div>
    """

    # 1. Try sending via SMTP if configured (Gmail / Hostinger / Custom Domain)
    if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
        clean_user = settings.SMTP_USER.strip().strip("'").strip('"')
        clean_pass = settings.SMTP_PASSWORD.replace(" ", "").strip().strip("'").strip('"')
        clean_host = settings.SMTP_HOST.strip().strip("'").strip('"')
        clean_from = settings.FROM_EMAIL or clean_user

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = clean_from
        msg["To"] = email

        part = MIMEText(html_content, "html")
        msg.attach(part)

        # Attempt 1: Try Port 465 (SSL)
        try:
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(clean_host, 465, context=context, timeout=10) as server:
                server.login(clean_user, clean_pass)
                server.sendmail(clean_user, [email], msg.as_string())
            print(f"OTP Email successfully sent via SMTP (Port 465 SSL) to {email}")
            return True
        except Exception as ssl_err:
            print(f"SMTP Port 465 SSL failed: {ssl_err}, attempting Port 587 STARTTLS...")

        # Attempt 2: Try Port 587 (TLS)
        try:
            with smtplib.SMTP(clean_host, 587, timeout=10) as server:
                server.starttls()
                server.login(clean_user, clean_pass)
                server.sendmail(clean_user, [email], msg.as_string())
            print(f"OTP Email successfully sent via SMTP (Port 587 TLS) to {email}")
            return True
        except Exception as tls_err:
            print(f"SMTP Port 587 TLS failed: {tls_err}")

    # 2. Try sending via Resend HTTP API if RESEND_API_KEY is configured
    if settings.RESEND_API_KEY:
        payload = json.dumps(
            {
                "from": settings.FROM_EMAIL,
                "to": [email],
                "subject": subject,
                "html": html_content,
            }
        ).encode("utf-8")

        request = urllib.request.Request(
            "https://api.resend.com/emails",
            data=payload,
            headers={
                "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                "Content-Type": "application/json",
                "User-Agent": "JournalFX/1.0",
            },
            method="POST",
        )

        try:
            context = ssl.create_default_context()
            with urllib.request.urlopen(request, timeout=12, context=context) as response:
                if 200 <= response.status < 300:
                    print(f"OTP Email successfully sent via Resend to {email}")
                    return True
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", errors="ignore")
            print(f"Resend email failed: {error.code} {detail}")
        except Exception as error:
            print(f"Resend email failed: {error}")

    print(f"No active email provider succeeded. Generated OTP for {email}: {otp}")
    return False

