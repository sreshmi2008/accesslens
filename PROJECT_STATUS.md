# AccessLens — Project Status & Roadmap

_Last updated: 26 September 2026 (evening)_

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
| **AI-driven journeys** (Claude actually clicks/types through signup, forms, checkout like a real user, using Anthropic's Computer Use) | ✅ Code complete, unverified — needs a Claude key with Computer Use access to test for real; see below | **Yes — no fallback exists for this one** |
| Specific per-finding manual-test instructions (e.g. "test this with NVDA") | ✅ Done — every finding now shows a "Manual test:" hint, tested end-to-end | No (works via the fallback table without a key; gets more specific per-element with one) |
| Chrome extension | ✅ Fixed — now has its own login form, stores a token, sends it on scans. Tested end-to-end in real Chromium (login → authenticated scan → opens results). | No |
| **Database migration to Supabase (hosted Postgres)** | ✅ Done — live and verified. Data survives a full backend restart (tested). | No |
| Light/dark theme + minimal single-accent redesign | ✅ Done — dashboard, login popup, all themed and verified in both modes | No |
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

2. ~~Add specific manual-test recommendations per finding.~~ **Done.** Claude's prompt now asks
   for a `manual_test_hint` per finding, with a persona-keyed fallback table
   (`_MANUAL_TEST_HINT_BY_PERSONA` in `backend/app/ai/claude_client.py`) for when there's no key.
   Shown on every finding card and in the PDF report.

3. ~~Fix the Chrome extension's auth.~~ **Done.** `extension/popup.html`/`popup.js` now have a
   login form; the token is stored in `chrome.storage.local` and sent as a Bearer header on scans.
   Verified end-to-end in a real (non-headless) Chromium instance with the extension actually
   loaded: login succeeds, the scan request carries the auth header, the scan completes, and it
   opens the results page — same as the web dashboard's flow.

4. ~~Migrate the database to Supabase.~~ **Done.** `backend/.env`'s `DATABASE_URL` now points at
   Supabase Postgres via the **session pooler** (not the direct connection — see the known-bugs
   note below for why). Verified: signup, login, scanning, and history all work against it, and
   data survives a full backend restart.

5. ~~Build real multi-step journey simulation.~~ **Code complete, needs a real key to verify.**
   Built as "AI-driven journeys" (`backend/app/ai_journey/`): Claude uses Anthropic's Computer Use
   tool (`computer_toolset_20260801`) to actually click, type, and navigate a real Playwright
   browser step by step — a real person's worth of interaction, not a guessed heuristic. Safety
   guardrails baked in: capped at 12 steps, a fixed set of fake test data for any form fields
   (never real personal info), a same-domain guard that stops the journey if a click navigates to
   a different site, and an explicit system-prompt rule to never complete a real payment or
   destructive action. New endpoints (`POST /api/ai-journey`, `GET /api/ai-journeys`,
   `GET /api/ai-journey/{id}`), a new `ai_journeys` DB table, and a full frontend flow
   (`/dashboard/ai-journey` to start one + view history, `/dashboard/ai-journey/results` for the
   step-by-step viewer with screenshots and per-step findings). **Verified as far as possible
   without a real key**: the whole pipeline (frontend → backend → engine → first Claude call)
   works correctly and surfaces a clear error on an invalid/placeholder key instead of silently
   saving an empty "success" — but the actual click/type decisions have never been tested against
   a real site, since that requires a working key. Test this **first** once the key is in, before
   trusting it on anything important — it's the least-proven piece of the whole app.

6. **Deploy it so it has a public link.**
   See `GETTING_STARTED.md` Section 14 for the beginner-level overview (Vercel for the frontend,
   Render/Railway/Fly.io for the backend). With Supabase already handling the database, this step
   is just about hosting the frontend and backend themselves. Nothing has been set up yet — this
   is a from-scratch task.

7. **Add automated tests.**
   None exist yet. Backend: `pytest` against the FastAPI endpoints (auth flow, scan persistence).
   Frontend: at minimum, component tests for `FindingCard`, `AuthModal`, and the results tabs.

## Known bugs already found and fixed (don't rediscover these)

- **Supabase's "Direct connection" string fails with `could not translate host name` on many
  networks.** New Supabase projects' direct connection hostname (`db.<project-ref>.supabase.co`)
  only resolves to an IPv6 address, and plenty of networks (including whatever this was set up on)
  can't reach IPv6-only hosts. The fix isn't the paid "IPv4 add-on" Supabase upsells for this — use
  the free **Session pooler** connection string instead (in the Supabase dashboard's "Connect"
  modal → Direct tab → "Connection Method" → select "Session pooler"). Note its username format is
  different too: `postgres.<project-ref>` instead of plain `postgres`, and the host becomes
  `aws-0-<region>.pooler.supabase.com`. Also: if the database password contains `@` or other
  URL-special characters, percent-encode them in the connection string (`@` → `%40`) or the URI
  parser will misread where the password ends and the host begins.
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
- **The extension needs the `"storage"` permission in `manifest.json`** to save the login token via
  `chrome.storage.local` — easy to forget when adding new `chrome.*` API usage.
- **You can't automate-test the extension's "current tab" detection.** `activeTab` (the permission
  that lets the extension read the current tab's URL) only activates on a genuine user gesture
  (an actual click on the toolbar icon) — Playwright opening `popup.html` directly as a page
  doesn't count, so `chrome.tabs.query` returns a tab with no `url` field in that scenario. This
  is expected and not a bug; it's why `extension/popup.js` was tested for its login/auth-header
  logic by forcing `currentTabUrl` directly in an evaluated script rather than relying on tab
  detection during automated tests.

## Where things live (quick map)

- Scanning logic: `backend/app/scanner/browser.py`
- AI-driven journeys (Computer Use loop): `backend/app/ai_journey/` (`engine.py` = the action loop,
  `actions.py` = mapping Claude's actions to real Playwright calls, `prompts.py` = the safety rules)
- AI narration: `backend/app/ai/claude_client.py`
- Theme system: `frontend/src/lib/ThemeContext.tsx` + tokens in `frontend/src/app/globals.css`
- Compliance law mapping: `backend/app/compliance/mapping.py`
- Auth (signup/login/verify/reset): `backend/app/auth/`
- Email sending: `backend/app/email/`
- Database models: `backend/app/db_models.py`
- Frontend auth state (shared across the app): `frontend/src/lib/AuthContext.tsx`
- Dashboard pages: `frontend/src/app/dashboard/`
- Landing page: `frontend/src/app/page.tsx` + `frontend/src/app/landing.css`
- Chrome extension: `extension/` (`popup.html`/`popup.js`/`popup.css`, `manifest.json`)
