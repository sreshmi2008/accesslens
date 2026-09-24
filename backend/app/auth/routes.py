import logging
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.auth.schemas import (
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    ResendVerificationRequest,
    ResetPasswordRequest,
    SignupRequest,
    TokenResponse,
    UserOut,
    VerifyEmailRequest,
)
from app.auth.security import create_access_token, generate_url_token, hash_password, verify_password
from app.config import settings
from app.db import get_db
from app.db_models import EmailToken, User, utcnow
from app.email.resend_client import send_email
from app.email.templates import reset_password_email_html, verification_email_html

logger = logging.getLogger("accesslens")
router = APIRouter(prefix="/api/auth", tags=["auth"])

VERIFY_TOKEN_TTL = timedelta(hours=24)
RESET_TOKEN_TTL = timedelta(hours=1)


def _issue_token(db: Session, user_id: str, purpose: str, ttl: timedelta) -> str:
    token = generate_url_token()
    db.add(EmailToken(user_id=user_id, token=token, purpose=purpose, expires_at=utcnow() + ttl))
    db.commit()
    return token


@router.post("/signup", response_model=MessageResponse)
async def signup(req: SignupRequest, db: Session = Depends(get_db)):
    email = req.email.lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    user = User(email=email, name=req.name, password_hash=hash_password(req.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    token = _issue_token(db, user.id, "verify", VERIFY_TOKEN_TTL)
    link = f"{settings.frontend_origin}/verify-email?token={token}"
    try:
        await send_email(user.email, "Verify your AccessLens account", verification_email_html(user.name, link))
    except Exception:
        logger.exception("Failed to send verification email to %s", user.email)

    return MessageResponse(message="Account created. Check your email to verify your account before logging in.")


@router.post("/verify-email", response_model=MessageResponse)
def verify_email(req: VerifyEmailRequest, db: Session = Depends(get_db)):
    record = db.query(EmailToken).filter(EmailToken.token == req.token, EmailToken.purpose == "verify").first()
    if not record or record.used_at or record.expires_at < utcnow():
        raise HTTPException(status_code=400, detail="This verification link is invalid or has expired.")

    user = db.get(User, record.user_id)
    user.email_verified = True
    record.used_at = utcnow()
    db.commit()
    return MessageResponse(message="Email verified. You can now log in.")


@router.post("/resend-verification", response_model=MessageResponse)
async def resend_verification(req: ResendVerificationRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if user and not user.email_verified:
        token = _issue_token(db, user.id, "verify", VERIFY_TOKEN_TTL)
        link = f"{settings.frontend_origin}/verify-email?token={token}"
        try:
            await send_email(user.email, "Verify your AccessLens account", verification_email_html(user.name, link))
        except Exception:
            logger.exception("Failed to resend verification email to %s", user.email)

    # Same message regardless of whether the account exists, so this endpoint
    # can't be used to check which emails are registered.
    return MessageResponse(message="If that account exists and isn't verified yet, a new link has been sent.")


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    if not user.email_verified:
        raise HTTPException(status_code=403, detail="Please verify your email before logging in.")

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=UserOut(id=user.id, name=user.name, email=user.email))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return UserOut(id=user.id, name=user.name, email=user.email)


@router.post("/request-password-reset", response_model=MessageResponse)
async def request_password_reset(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if user:
        token = _issue_token(db, user.id, "reset", RESET_TOKEN_TTL)
        link = f"{settings.frontend_origin}/reset-password?token={token}"
        try:
            await send_email(user.email, "Reset your AccessLens password", reset_password_email_html(user.name, link))
        except Exception:
            logger.exception("Failed to send password reset email to %s", user.email)

    return MessageResponse(message="If that email is registered, a reset link has been sent.")


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    record = db.query(EmailToken).filter(EmailToken.token == req.token, EmailToken.purpose == "reset").first()
    if not record or record.used_at or record.expires_at < utcnow():
        raise HTTPException(status_code=400, detail="This reset link is invalid or has expired.")

    user = db.get(User, record.user_id)
    user.password_hash = hash_password(req.new_password)
    record.used_at = utcnow()
    db.commit()
    return MessageResponse(message="Password updated. You can now log in.")
