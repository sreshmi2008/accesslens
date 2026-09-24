import asyncio
import logging
import sys

# Playwright launches the browser as a subprocess, which asyncio's default
# SelectorEventLoop can't do on Windows (it raises NotImplementedError).
# uvicorn --reload in particular ends up on SelectorEventLoop unless this is
# forced explicitly, so set it before anything creates an event loop.
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app import repository
from app.auth.dependencies import get_current_user
from app.auth.routes import router as auth_router
from app.config import settings
from app.db import get_db, init_db
from app.db_models import User
from app.models import ScanHistoryItem, ScanReport, ScanRequest
from app.orchestrator import run_full_scan
from app.reports.pdf import render_report_pdf

logger = logging.getLogger("accesslens")

app = FastAPI(title="AccessLens API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    # Next.js dev auto-increments past busy ports (3000, 3001, ...), so allow
    # any localhost port in addition to the configured origin, plus the extension.
    allow_origin_regex=r"^(http://localhost:\d+|chrome-extension://.*)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/scan", response_model=ScanReport)
async def scan(req: ScanRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        report = await run_full_scan(req.url)
    except Exception as exc:  # noqa: BLE001 - surfaced to the caller as a 502
        logger.exception("Scan failed for %s", req.url)
        raise HTTPException(status_code=502, detail=f"Could not scan URL: {exc}") from exc
    repository.save_scan(db, user.id, report)
    return report


@app.get("/api/reports", response_model=list[ScanHistoryItem])
def list_reports(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    records = repository.list_scans(db, user.id)
    return [
        ScanHistoryItem(
            id=r.id,
            url=r.url,
            created_at=r.created_at.isoformat(),
            barriers_found=r.barriers_found,
            readiness_pct=r.readiness_pct,
        )
        for r in records
    ]


@app.get("/api/report/{report_id}", response_model=ScanReport)
async def get_report_by_id(report_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    report = repository.get_scan(db, report_id, user.id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@app.get("/api/report/{report_id}/pdf")
async def get_report_pdf(report_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    report = repository.get_scan(db, report_id, user.id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    pdf_bytes = await render_report_pdf(report)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="accesslens-report-{report_id[:8]}.pdf"'},
    )
