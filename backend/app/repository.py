from sqlalchemy.orm import Session

from app.db_models import AIJourneyRecord, ScanRecord
from app.models import AIJourneyReport, ScanReport


def save_scan(db: Session, user_id: str, report: ScanReport) -> None:
    record = ScanRecord(
        id=report.id,
        user_id=user_id,
        url=report.url,
        barriers_found=report.summary.barriers_found,
        readiness_pct=report.summary.is17802_readiness_pct,
        report_json=report.model_dump(mode="json"),
    )
    db.add(record)
    db.commit()


def get_scan(db: Session, report_id: str, user_id: str) -> ScanReport | None:
    record = db.get(ScanRecord, report_id)
    if not record or record.user_id != user_id:
        return None
    return ScanReport.model_validate(record.report_json)


def list_scans(db: Session, user_id: str) -> list[ScanRecord]:
    return (
        db.query(ScanRecord)
        .filter(ScanRecord.user_id == user_id)
        .order_by(ScanRecord.created_at.desc())
        .all()
    )


def save_ai_journey(db: Session, user_id: str, report: AIJourneyReport) -> None:
    record = AIJourneyRecord(
        id=report.id,
        user_id=user_id,
        url=report.url,
        goal=report.goal,
        barriers_found=report.summary.barriers_found,
        steps_taken=len(report.steps),
        stop_reason=report.stop_reason,
        report_json=report.model_dump(mode="json"),
    )
    db.add(record)
    db.commit()


def get_ai_journey(db: Session, journey_id: str, user_id: str) -> AIJourneyReport | None:
    record = db.get(AIJourneyRecord, journey_id)
    if not record or record.user_id != user_id:
        return None
    return AIJourneyReport.model_validate(record.report_json)


def list_ai_journeys(db: Session, user_id: str) -> list[AIJourneyRecord]:
    return (
        db.query(AIJourneyRecord)
        .filter(AIJourneyRecord.user_id == user_id)
        .order_by(AIJourneyRecord.created_at.desc())
        .all()
    )
