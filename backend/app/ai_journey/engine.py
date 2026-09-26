import logging
from urllib.parse import urlparse

from anthropic import AsyncAnthropic
from playwright.async_api import async_playwright

from app.ai_journey.actions import execute_action, screenshot_b64
from app.ai_journey.prompts import DEFAULT_GOAL, SYSTEM_PROMPT
from app.config import settings
from app.models import JourneyAction, RawFinding
from app.scanner.browser import run_axe_on_page

logger = logging.getLogger("accesslens")

MAX_STEPS = 12


class StopReason:
    COMPLETED = "completed"
    MAX_STEPS = "max_steps_reached"
    LEFT_SITE = "left_target_site"
    ERROR = "error"


class StepRecord:
    def __init__(self, step_number: int, url: str, actions: list[JourneyAction], screenshot_base64: str | None):
        self.step_number = step_number
        self.url = url
        self.actions = actions
        self.screenshot_base64 = screenshot_base64


class EngineResult:
    def __init__(self, steps: list[StepRecord], raw_findings: list[RawFinding], stop_reason: str):
        self.steps = steps
        self.raw_findings = raw_findings
        self.stop_reason = stop_reason


def _tool_error(tool_use_id: str, text: str) -> dict:
    return {
        "type": "tool_result",
        "tool_use_id": tool_use_id,
        "toolset_name": "computer",
        "is_error": True,
        "content": [{"type": "text", "text": text}],
    }


async def run_ai_journey(url: str, goal: str | None) -> EngineResult:
    """Drive a real browser through `url` using Claude's Computer Use tool,
    checking accessibility at every step along the way. See prompts.py for
    the safety rules given to the model (no real payments/destructive
    actions, fake test data only, stay on the same domain)."""

    if not settings.anthropic_api_key:
        raise RuntimeError("An Anthropic API key is required for AI-driven journeys.")

    client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    start_origin = urlparse(url).netloc

    steps: list[StepRecord] = []
    raw_findings: list[RawFinding] = []
    stop_reason = StopReason.MAX_STEPS

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        await page.goto(url, wait_until="networkidle", timeout=45000)

        system_prompt = SYSTEM_PROMPT.format(goal=goal or DEFAULT_GOAL)
        first_shot = await screenshot_b64(page)
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": f"You are on {page.url}. Here is the current screenshot. Begin the journey."},
                    {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": first_shot}},
                ],
            }
        ]

        step_num = 0
        for step_num in range(1, MAX_STEPS + 1):
            try:
                response = await client.messages.create(
                    model=settings.claude_model,
                    max_tokens=2048,
                    system=system_prompt,
                    tools=[{"type": "computer_toolset_20260801"}],
                    messages=messages,
                )
            except Exception as exc:
                logger.exception("AI journey step %s failed calling Claude", step_num)
                if step_num == 1:
                    # First-step failure is almost always a config/auth problem
                    # (bad key, no computer-use access), not a transient one -
                    # raise so the caller returns a real error instead of
                    # silently saving an empty "0 barriers, 100% ready" report.
                    await browser.close()
                    raise RuntimeError(f"Could not start the AI journey: {exc}") from exc
                stop_reason = StopReason.ERROR
                break

            messages.append({"role": "assistant", "content": response.content})

            tool_use_blocks = [b for b in response.content if getattr(b, "type", None) == "tool_use"]
            if not tool_use_blocks:
                stop_reason = StopReason.COMPLETED
                break

            tool_results = []
            actions_this_step: list[JourneyAction] = []
            halted = False
            for block in tool_use_blocks:
                if halted:
                    tool_results.append(_tool_error(block.id, "Not executed: an earlier computer action in this turn failed."))
                    continue
                try:
                    content = await execute_action(page, block.name, block.input)
                    tool_results.append(
                        {"type": "tool_result", "tool_use_id": block.id, "toolset_name": "computer", "content": content}
                    )
                    actions_this_step.append(JourneyAction(name=block.name, input=block.input))
                except Exception as exc:
                    tool_results.append(_tool_error(block.id, f"Error: {exc}"))
                    halted = True

            messages.append({"role": "user", "content": tool_results})

            shot = await screenshot_b64(page)
            raw_findings.extend(await run_axe_on_page(page, journey_name=f"Step {step_num}"))
            steps.append(StepRecord(step_num, page.url, actions_this_step, shot))

            current_origin = urlparse(page.url).netloc
            if current_origin and current_origin != start_origin:
                stop_reason = StopReason.LEFT_SITE
                break

            if response.stop_reason != "tool_use":
                stop_reason = StopReason.COMPLETED
                break
        else:
            stop_reason = StopReason.MAX_STEPS

        await browser.close()

    return EngineResult(steps=steps, raw_findings=raw_findings, stop_reason=stop_reason)
