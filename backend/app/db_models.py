import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


def utcnow() -> datetime:
    # Naive UTC on purpose: SQLite silently drops tzinfo on round-trip, so a
    # timezone-aware value written here would come back naive and blow up any
    # comparison against a fresh timezone-aware datetime. Every read/write of
    # these DateTime columns must go through this helper to stay consistent.
    return datetime.now(timezone.utc).replace(tzinfo=None)


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    email_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    scans = relationship("ScanRecord", back_populates="user", cascade="all, delete-orphan")
    tokens = relationship("EmailToken", back_populates="user", cascade="all, delete-orphan")
    ai_journeys = relationship("AIJourneyRecord", back_populates="user", cascade="all, delete-orphan")


class EmailToken(Base):
    __tablename__ = "email_tokens"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    purpose = Column(String, nullable=False)  # "verify" | "reset"
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="tokens")


class ScanRecord(Base):
    __tablename__ = "scans"

    id = Column(String, primary_key=True)  # same id as the ScanReport it stores
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    url = Column(String, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    barriers_found = Column(Integer, default=0, nullable=False)
    readiness_pct = Column(Integer, default=0, nullable=False)
    report_json = Column(JSON, nullable=False)

    user = relationship("User", back_populates="scans")


class AIJourneyRecord(Base):
    __tablename__ = "ai_journeys"

    id = Column(String, primary_key=True)  # same id as the AIJourneyReport it stores
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    url = Column(String, nullable=False)
    goal = Column(String, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    barriers_found = Column(Integer, default=0, nullable=False)
    steps_taken = Column(Integer, default=0, nullable=False)
    stop_reason = Column(String, nullable=False)
    report_json = Column(JSON, nullable=False)

    user = relationship("User", back_populates="ai_journeys")
