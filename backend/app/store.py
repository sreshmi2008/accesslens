from app.models import ScanReport

_reports: dict[str, ScanReport] = {}


def save(report: ScanReport) -> None:
    _reports[report.id] = report


def get(report_id: str) -> ScanReport | None:
    return _reports.get(report_id)
