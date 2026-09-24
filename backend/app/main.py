import asyncio
import logging
import sys

# Playwright launches the browser as a subprocess, which asyncio's default
# SelectorEventLoop can't do on Windows (it raises NotImplementedError).
# uvicorn --reload in particular ends up on SelectorEventLoop unless this is
# forced explicitly, so set it before anything creates an event loop.
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from app.config import settings
from app.models import ScanReport, ScanRequest
from app.orchestrator import run_full_scan
from app.reports.pdf import render_report_pdf
from app.store import get as get_report
from app.store import save as save_report

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


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/scan", response_model=ScanReport)
async def scan(req: ScanRequest):
    try:
        report = await run_full_scan(req.url)
    except Exception as exc:  # noqa: BLE001 - surfaced to the caller as a 502
        logger.exception("Scan failed for %s", req.url)
        raise HTTPException(status_code=502, detail=f"Could not scan URL: {exc}") from exc
    save_report(report)
    return report


@app.get("/api/report/{report_id}", response_model=ScanReport)
async def get_report_by_id(report_id: str):
    report = get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@app.get("/api/report/{report_id}/pdf")
async def get_report_pdf(report_id: str):
    report = get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    pdf_bytes = await render_report_pdf(report)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="accesslens-report-{report_id[:8]}.pdf"'},
    )
