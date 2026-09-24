# AccessLens

AI-powered accessibility testing for Indian websites. AccessLens drives a real headless browser
through a page, checks it against axe-core plus custom motor/keyboard heuristics, and has Claude
rewrite each finding from the point of view of the disabled user it actually affects (color-blind,
low-vision, motor-impaired, screen-reader) — then maps everything to RPwD Act / IS 17802 / GIGW 3.0 / SEBI.

This is an MVP: automated checks realistically catch ~30-40% of real-world accessibility barriers.
Everything else is flagged "needs manual review" rather than faked.

## Project layout

- `frontend/` — Next.js app: the marketing landing page (ported from the original `accesslens.html`) and the `/scan` results dashboard.
- `backend/` — Python FastAPI service: Playwright-driven scanner, Claude narration, compliance mapping, PDF report generation.
- `extension/` — a minimal Manifest V3 Chrome extension: a popup with a "Scan this page" button that calls the same backend and opens the results in the dashboard.

## Running it locally

### 1. Backend

```
cd backend
py -3.12 -m venv .venv        # already done if you followed setup
.\.venv\Scripts\python.exe -m pip install -r requirements.txt   # already done
copy .env.example .env
# edit .env and set ANTHROPIC_API_KEY=sk-ant-...
.\.venv\Scripts\uvicorn.exe app.main:app --reload --port 8000
```

The API is now at `http://localhost:8000`. Health check: `http://localhost:8000/api/health`.

### 2. Frontend

```
cd frontend
copy .env.local.example .env.local
npm run dev
```

Open `http://localhost:3000`. Enter a URL (or use one of the demo buttons) to run a real scan.

### 3. Chrome extension (optional)

1. Go to `chrome://extensions`, enable "Developer mode".
2. Click "Load unpacked" and select the `extension/` folder.
3. With the backend running on port 8000 and the frontend on port 3000, click the AccessLens
   toolbar icon on any page and hit "Scan this page" — it opens the results in the dashboard.

## Notes on the MVP scope

- **Journeys**: findings are grouped into a "Page Load Journey" and, if the page has a `<form>`,
  a "Form Interaction Journey" — based on DOM location, not full multi-page navigation.
- **Auto-fix**: means AccessLens generates the corrected code snippet, not that it edits a live
  site you don't own.
- **Auth**: the landing page's login/signup is a hackathon-demo `localStorage` mock, not real
  accounts — same as the original static page, called out explicitly in the UI.
- **IS 17802 readiness %**: a heuristic score (100 minus a severity-weighted penalty), not an
  official certification number.
