# AccessLens — Project Status & Roadmap

_Last updated: 25 September 2026_

This file exists so anyone picking this project up doesn't have to re-derive what's done, what's
missing, and what to do next. If you're new here, read `GETTING_STARTED.md` first to get the app
running on your machine — this file assumes it's already running and tells you what to build next.

## The original idea, in one paragraph

AccessLens is meant to be an AI that tries a website like a real disabled user, finds where it
breaks, explains the problem in plain human language (not raw WCAG codes), suggests a fix, and
checks everything against Indian accessibility law (RPwD Act, IS 17802, GIGW 3.0, SEBI). It's
explicitly **not** an overlay widget and **not** a one-click "100% compliant" promise — it's meant
to automate the easy ~30-40% of issues and clearly guide humans on the rest.

## Status at a glance

| Area | Status | Needs the Claude API key? |
|---|---|---|
| Real browser scanning (axe-core + custom checks) | ✅ Done | No |
| Persona tagging (color-blind / low-vision / motor / screen-reader) | ✅ Done | No |
| Plain-language, persona-voiced explanations | ⚠️ Built, untested — shows generic placeholder text without a key | **Yes** |
| Auto-fix code snippets | ⚠️ Built, untested — always shows "not auto-fixable" without a key | **Yes** |
| WCAG → RPwD/IS17802/GIGW3.0/SEBI compliance mapping | ✅ Done | No |
| IS 17802 readiness score + high-risk journeys | ✅ Done | No |
| Color-blindness visual simulator | ✅ Done | No |
| Screen-reader audio demo (text-to-speech) | ✅ Done | No |
| PDF report download | ✅ Done | No |
| Real user accounts (signup/login/email verify/password reset) | ✅ Done | No (needs Resend key for real email delivery) |
| Scan history dashboard (Overview / New Scan / History / Results tabs) | ✅ Done | No |
| **True multi-step journeys** (actually complete a signup, search+filter, checkout) | ❌ Not built | No — separate work regardless of the key |
| **Specific per-finding manual-test instructions** (e.g. "test this with NVDA") | ❌ Not built — only a generic blanket disclaimer exists | No — separate prompt work needed |
| Chrome extension | ❌ Broken — doesn't send a login token, so every scan gets rejected | No |
| Hosting / public URL | ❌ Not started | No |
| Automated tests | ❌ None — everything verified by hand so far | No |

## What to do next, in priority order

1. **Add the Claude API key and verify the AI narration actually works.**
   Follow `GETTING_STARTED.md` Section 10. Run a scan, open the Findings tab, and confirm the
   `user_impact` / `suggested_fix` text reads like a real sentence, not
   `"Review this element against the linked WCAG criterion..."`. If it still shows generic text
   with a key set, check `backend/app/ai/claude_client.py` — the API call is wrapped in a
   try/except that silently falls back to generic text on any error, so check the backend
   terminal for a logged exception.

2. **Add specific manual-test recommendations per finding.**
   This is a real gap from the original idea, not yet built. The fix: extend the prompt in
   `backend/app/ai/claude_client.py` (`SYSTEM_PROMPT`) to also ask Claude for a
   `manual_test_hint` field (e.g. "Test this field with NVDA or VoiceOver active" for a
   screen-reader finding, "Test this flow using only Tab/Enter/Esc" for a motor-impaired one),
   then thread that new field through `Finding` in `backend/app/models.py`, the narration parsing
   in `claude_client.py`, and `FindingCard.tsx` on the frontend to display it.

3. **Fix the Chrome extension's auth.**
   `extension/popup.js` calls `POST /api/scan` with no `Authorization` header, so it now always
   gets a 401. Simplest fix: add a tiny login form to `extension/popup.html`/`popup.js` that calls
   `/api/auth/login` and stores the returned token in `chrome.storage.local`, then attaches it as
   a Bearer header on the scan request — mirrors what `frontend/src/lib/AuthContext.tsx` already
   does, just in extension-storage form instead of `localStorage`.

4. **Build real multi-step journey simulation.**
   Currently, "journeys" are just "is this element inside a `<form>` tag or not" — see
   `backend/app/scanner/browser.py`. To actually simulate a signup/login/checkout flow, the
   scanner would need to identify and interact with real UI (fill fields, click submit, follow
   redirects) using Playwright's `fill()`/`click()` methods, per named flow. This is the biggest
   remaining piece of engineering work and should probably be scoped as its own task rather than
   bolted on quickly — it needs a plan for how to detect "this is a signup form" vs "this is a
   search box" reliably across arbitrary sites.

5. **Deploy it so it has a public link.**
   See `GETTING_STARTED.md` Section 14 for the beginner-level overview (Vercel for the frontend,
   Render/Railway/Fly.io for the backend, a real hosted database like Neon/Supabase Postgres
   instead of the local SQLite file). Nothing has been set up yet — this is a from-scratch task.

6. **Add automated tests.**
   None exist yet. Backend: `pytest` against the FastAPI endpoints (auth flow, scan persistence).
   Frontend: at minimum, component tests for `FindingCard`, `AuthModal`, and the results tabs.

## Known bugs already found and fixed (don't rediscover these)

- **`uvicorn --reload` breaks Playwright on Windows.** It ends up on an event loop that can't
  launch subprocesses (`NotImplementedError`). Fix already in `backend/app/main.py` (forces
  `WindowsProactorEventLoopPolicy`), but `--reload` itself still shouldn't be used — restart the
  backend manually after changes.
- **axe-core must be injected via `page.evaluate()`, not `<script src>`.** Many real sites (e.g.
  the W3C's own demo site) set a Content-Security-Policy that blocks loading scripts from external
  CDNs inside the page. `backend/app/scanner/browser.py` now reads a locally vendored copy
  (`backend/app/scanner/vendor/axe.min.js`) and runs it via `page.evaluate()`, which isn't subject
  to the page's script-src CSP the way an injected `<script>` tag is.
- **SQLite silently drops timezone info.** Comparing a timezone-aware `datetime.now(timezone.utc)`
  against a value read back from SQLite throws `TypeError: can't compare offset-naive and
  offset-aware datetimes`. Fix: everything goes through the naive-UTC `utcnow()` helper in
  `backend/app/db_models.py` — never call `datetime.now(timezone.utc)` directly when working with
  stored timestamps.
- **CORS must allow any localhost port, not just 3000.** Next.js auto-increments to 3001, 3002,
  etc. when a port is busy (common on a dev machine with other projects running). The backend's
  CORS config in `backend/app/main.py` uses a regex (`^http://localhost:\d+$`) instead of a fixed
  origin for this reason.
- **The PDF download can't be a plain `<a href>` link anymore.** Since `/api/report/{id}/pdf` now
  requires auth and a browser navigation can't send a custom `Authorization` header, the frontend
  fetches it with `fetch()` + the header and triggers a blob download instead (see
  `downloadReportPdf` in `frontend/src/lib/api.ts`).

## Where things live (quick map)

- Scanning logic: `backend/app/scanner/browser.py`
- AI narration: `backend/app/ai/claude_client.py`
- Compliance law mapping: `backend/app/compliance/mapping.py`
- Auth (signup/login/verify/reset): `backend/app/auth/`
- Email sending: `backend/app/email/`
- Database models: `backend/app/db_models.py`
- Frontend auth state (shared across the app): `frontend/src/lib/AuthContext.tsx`
- Dashboard pages: `frontend/src/app/dashboard/`
- Landing page: `frontend/src/app/page.tsx` + `frontend/src/app/landing.css`
