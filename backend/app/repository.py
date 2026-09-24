from sqlalchemy.orm import Session

from app.db_models import ScanRecord
from app.models import ScanReport


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
