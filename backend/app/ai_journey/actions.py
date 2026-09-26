import asyncio
import base64

STEP_ACTION_TIMEOUT_MS = 20000

# Computer Use sends xdotool-style key names; Playwright expects its own
# naming convention. Best-effort translation covering the common cases.
_KEY_NAME_MAP = {
    "return": "Enter",
    "enter": "Enter",
    "escape": "Escape",
    "esc": "Escape",
    "tab": "Tab",
    "backspace": "Backspace",
    "delete": "Delete",
    "space": "Space",
    "up": "ArrowUp",
    "down": "ArrowDown",
    "left": "ArrowLeft",
    "right": "ArrowRight",
    "home": "Home",
    "end": "End",
    "pageup": "PageUp",
    "pagedown": "PageDown",
    "ctrl": "Control",
    "control": "Control",
    "alt": "Alt",
    "shift": "Shift",
    "super": "Meta",
    "cmd": "Meta",
    "meta": "Meta",
}


def translate_key(text: str) -> str:
    parts = text.split("+")
    translated = []
    for part in parts:
        key = part.strip()
        lower = key.lower()
        if lower in _KEY_NAME_MAP:
            translated.append(_KEY_NAME_MAP[lower])
        elif len(key) == 1:
            translated.append(key.upper() if key.isalpha() else key)
        else:
            translated.append(key.capitalize())
    return "+".join(translated)


async def screenshot_b64(page) -> str:
    data = await page.screenshot(type="png")
    return base64.b64encode(data).decode("ascii")


_CLICK_BUTTON = {
    "left_click": "left",
    "right_click": "right",
    "middle_click": "middle",
    "double_click": "left",
    "triple_click": "left",
}
_CLICK_COUNT = {"double_click": 2, "triple_click": 3}


async def execute_action(page, name: str, input_: dict) -> list[dict]:
    """Execute one computer_toolset_20260801 member action against a real
    Playwright page, and return the tool_result content blocks for it (per
    the documented shape: image blocks for screenshot/zoom, text "OK" for
    everything else)."""

    if name == "screenshot":
        b64 = await screenshot_b64(page)
        return [{"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": b64}}]

    if name == "zoom":
        x0, y0, x1, y1 = input_.get("region", [0, 0, 200, 200])
        data = await page.screenshot(
            clip={"x": x0, "y": y0, "width": max(1, x1 - x0), "height": max(1, y1 - y0)}, type="png"
        )
        b64 = base64.b64encode(data).decode("ascii")
        return [{"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": b64}}]

    if name in _CLICK_BUTTON:
        coord = input_.get("coordinate")
        button = _CLICK_BUTTON[name]
        click_count = _CLICK_COUNT.get(name, 1)
        if coord:
            await page.mouse.click(coord[0], coord[1], button=button, click_count=click_count, timeout=STEP_ACTION_TIMEOUT_MS)
        else:
            await page.mouse.down(button=button)
            await page.mouse.up(button=button)
        return [{"type": "text", "text": "OK"}]

    if name == "left_click_drag":
        start = input_["start_coordinate"]
        end = input_["coordinate"]
        await page.mouse.move(start[0], start[1])
        await page.mouse.down()
        await page.mouse.move(end[0], end[1], steps=10)
        await page.mouse.up()
        return [{"type": "text", "text": "OK"}]

    if name == "mouse_move":
        x, y = input_["coordinate"]
        await page.mouse.move(x, y)
        return [{"type": "text", "text": "OK"}]

    if name == "left_mouse_down":
        await page.mouse.down()
        return [{"type": "text", "text": "OK"}]

    if name == "left_mouse_up":
        await page.mouse.up()
        return [{"type": "text", "text": "OK"}]

    if name == "cursor_position":
        # Playwright doesn't expose live cursor position; we don't track it
        # separately, so report the origin. Claude relies on screenshots, not
        # this value, for positioning decisions.
        return [{"type": "text", "text": "X=0, Y=0"}]

    if name == "scroll":
        direction = input_.get("scroll_direction", "down")
        amount = input_.get("scroll_amount", 3) * 100
        coord = input_.get("coordinate")
        if coord:
            await page.mouse.move(coord[0], coord[1])
        dx = {"left": -amount, "right": amount}.get(direction, 0)
        dy = {"up": -amount, "down": amount}.get(direction, 0)
        await page.mouse.wheel(dx, dy)
        return [{"type": "text", "text": "OK"}]

    if name == "type":
        await page.keyboard.type(input_.get("text", ""), delay=15)
        return [{"type": "text", "text": "OK"}]

    if name == "key":
        key = translate_key(input_.get("text", ""))
        repeat = max(1, min(100, input_.get("repeat", 1)))
        for _ in range(repeat):
            await page.keyboard.press(key)
        return [{"type": "text", "text": "OK"}]

    if name == "hold_key":
        key = translate_key(input_.get("text", ""))
        duration = min(300, input_.get("duration", 1))
        await page.keyboard.down(key)
        await asyncio.sleep(duration)
        await page.keyboard.up(key)
        return [{"type": "text", "text": "OK"}]

    if name == "wait":
        await asyncio.sleep(min(300, input_.get("duration", 1)))
        return [{"type": "text", "text": "OK"}]

    raise ValueError(f"Unsupported computer-use action: {name}")
