from playwright.async_api import async_playwright

from app.models import ScanReport
from app.reports.template import render_report_html


async def render_report_pdf(report: ScanReport) -> bytes:
    html_content = render_report_html(report)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.set_content(html_content, wait_until="load")
        pdf_bytes = await page.pdf(format="A4", print_background=True, margin={"top": "20px", "bottom": "20px"})
        await browser.close()
    return pdf_bytes
