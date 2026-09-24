# AccessLens

AI-powered accessibility testing for Indian websites. AccessLens drives a real headless browser
through a page, checks it against axe-core plus custom motor/keyboard heuristics, and has Claude
rewrite each finding from the point of view of the disabled user it actually affects (color-blind,
low-vision, motor-impaired, screen-reader) — then maps everything to RPwD Act / IS 17802 / GIGW 3.0 / SEBI.

This is an MVP: automated checks realistically catch ~30-40% of real-world accessibility barriers.
Everything else is flagged "needs manual review" rather than faked.

## Project layout

- `frontend/` — Next.js app: the marketing landing page (ported from the original `accesslens.html`)
  and a sidebar dashboard (Overview / New Scan / History / tabbed Results).
- `backend/` — Python FastAPI service: Playwright-driven scanner, Claude narration, compliance
  mapping, PDF report generation, real user accounts (SQLite via SQLAlchemy), and transactional
  email (Resend) for signup verification and password reset.
- `extension/` — a minimal Manifest V3 Chrome extension. **Currently broken** since accounts became
  real: it calls the scan endpoint without a login token, which now requires auth. Not yet fixed.

## Running it locally

### 1. Backend

```
cd backend
py -3.12 -m venv .venv        # already done if you followed setup
.\.venv\Scripts\python.exe -m pip install -r requirements.txt   # already done
copy .env.example .env
```

Edit `backend/.env` and set:
- `ANTHROPIC_API_KEY` — for real persona-voice findings (without it, findings use generic template text)
- `SECRET_KEY` — generate one: `python -c "import secrets; print(secrets.token_hex(32))"`
- `RESEND_API_KEY` — from [resend.com](https://resend.com) (free tier), needed for signup
  verification and password reset emails to actually send

Then start it (do **not** use `--reload` — see the note below):
```
.\.venv\Scripts\uvicorn.exe app.main:app --port 8000
```

The API is now at `http://localhost:8000`. Health check: `http://localhost:8000/api/health`.
A SQLite file (`backend/accesslens.db`, gitignored) is created automatically on first run and
holds users, scan history, and email tokens — this is what makes data survive a restart.

> **Why not `--reload`?** On Windows, uvicorn's `--reload` supervisor ends up on an event loop
> that can't launch subprocesses, which breaks Playwright (`NotImplementedError`). Restart the
> server manually after backend code changes instead.

### 2. Frontend

```
cd frontend
copy .env.local.example .env.local
npm run dev
```

Next.js picks the first free port starting at 3000 — check the terminal output for the actual
URL (it'll be `3000`, or `3001`/`3002`/etc. if others are already running on this machine).

### 3. Chrome extension (currently broken, see above)

1. Go to `chrome://extensions`, enable "Developer mode".
2. Click "Load unpacked" and select the `extension/` folder.
3. Clicking "Scan this page" will currently fail with a 401 (Not authenticated) until it's
   updated to carry a login token.

## Account flow

Signup requires email verification before login works:
1. Sign up on the landing page (name, email, password — 8+ characters).
2. AccessLens emails a verification link (via Resend) to that address.
3. Click the link → lands on `/verify-email`, which confirms the account.
4. Log in normally from there.

Forgot password: `/forgot-password` → emailed reset link → `/reset-password`.

If `RESEND_API_KEY` isn't set, signup/reset still succeed (the account/token is created), but the
email silently fails to send (logged server-side) — in that case, grab the verification/reset
token directly from the `email_tokens` table in `accesslens.db` for local testing.

## Notes on the MVP scope

- **Journeys**: findings are grouped into a "Page Load Journey" and, if the page has a `<form>`,
  a "Form Interaction Journey" — based on DOM location, not full multi-page navigation.
- **Auto-fix**: means AccessLens generates the corrected code snippet, not that it edits a live
  site you don't own.
- **Sender address**: emails come from `AccessLens <onboarding@resend.dev>` — Resend's shared
  address, since there's no custom domain configured yet.
- **IS 17802 readiness %**: a heuristic score (100 minus a severity-weighted penalty), not an
  official certification number.
- **Not deployed anywhere yet** — this all runs locally. Hosting (frontend on Vercel, backend on
  a host that supports Playwright like Render/Railway/Fly.io, database migrated to managed
  Postgres) is a deliberately separate next step.
