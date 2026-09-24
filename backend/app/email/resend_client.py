import httpx

from app.config import settings

RESEND_API_URL = "https://api.resend.com/emails"


async def send_email(to: str, subject: str, html: str) -> None:
    if not settings.resend_api_key:
        raise RuntimeError("RESEND_API_KEY is not configured")

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            RESEND_API_URL,
            headers={"Authorization": f"Bearer {settings.resend_api_key}"},
            json={
                "from": settings.email_from,
                "to": [to],
                "subject": subject,
                "html": html,
            },
        )
        response.raise_for_status()
