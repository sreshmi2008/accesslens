# AccessLens — Complete Beginner's Guide

Welcome! This guide assumes you're brand new to software development — you don't need to know
what HTML, an API, or a `.env` file is before reading this. Every technical word is explained the
first time it shows up. Read this top to bottom the first time; after that, use the table of
contents to jump to what you need.

If a step doesn't work exactly as described, that's normal — computers differ. Read the error
message carefully, and see the **Troubleshooting** section near the end before asking for help.

## Table of contents

1. [What is AccessLens?](#1-what-is-accesslens)
2. [The absolute basics — words you'll see everywhere](#2-the-absolute-basics--words-youll-see-everywhere)
3. [How this project is organized](#3-how-this-project-is-organized)
4. [What's already built and working](#4-whats-already-built-and-working)
5. [What's NOT done yet — your job](#5-whats-not-done-yet--your-job)
6. [Step 1: Get the code onto your computer](#6-step-1-get-the-code-onto-your-computer)
7. [Step 2: Install the tools you need](#7-step-2-install-the-tools-you-need)
8. [Step 3: Set up and run the backend](#8-step-3-set-up-and-run-the-backend)
9. [Step 4: Set up and run the frontend](#9-step-4-set-up-and-run-the-frontend)
10. [Step 5: Get your own Claude (Anthropic) API key](#10-step-5-get-your-own-claude-anthropic-api-key)
11. [Step 6: Get your own Resend (email) API key](#11-step-6-get-your-own-resend-email-api-key)
12. [Step 7: Try the whole app yourself](#12-step-7-try-the-whole-app-yourself)
13. [Why we made certain decisions](#13-why-we-made-certain-decisions)
14. [How to put this online so anyone can visit a link](#14-how-to-put-this-online-so-anyone-can-visit-a-link)
15. [Troubleshooting](#15-troubleshooting)
16. [Glossary — quick lookup](#16-glossary--quick-lookup)

---

## 1. What is AccessLens?

Millions of people in India have disabilities — some can't see well or at all, some can't hear,
some can't use a mouse, some use a "screen reader" (software that reads a webpage out loud). Most
websites are hard or impossible for them to use, even though Indian law now requires websites to
be accessible.

**AccessLens is a tool that checks a website for these problems automatically**, and explains each
problem in plain human language instead of confusing technical codes. For example, instead of
saying "WCAG 1.4.3 failed," it says: *"A color-blind user may not see that this form failed,
because the error is only shown as a red border."* It also suggests a fix, and tells you which
Indian law or rule the problem relates to (like the RPwD Act or IS 17802).

You enter a website's address, AccessLens visits that real website with an automated robot browser,
checks it, and shows you a report.

---

## 2. The absolute basics — words you'll see everywhere

Skim this once. You'll understand it better once you see these words in action later.

| Word | What it means |
|---|---|
| **HTML** | The "skeleton" of a webpage — the text, buttons, and images, with no color or styling. |
| **CSS** | The "styling" — colors, fonts, spacing, layout. Makes HTML look nice. |
| **JavaScript / TypeScript** | The "behavior" — code that makes a webpage interactive (e.g. what happens when you click a button). TypeScript is JavaScript with extra safety checks. |
| **Frontend** | The part of an app that runs in your browser — what you see and click. Built with HTML/CSS/JavaScript. In this project, that's the `frontend/` folder (using a tool called **Next.js**, which is a popular way to build frontends with JavaScript/TypeScript). |
| **Backend** | The part of an app that runs on a server, out of sight, doing the "real work" (like actually scanning a website, talking to a database, checking passwords). Users never see this code directly. In this project, that's the `backend/` folder, written in **Python**, using a tool called **FastAPI**. |
| **API** | "Application Programming Interface" — a defined way for two programs to talk to each other. When the frontend needs the backend to scan a website, it sends a request to the backend's API, and the API sends back a response. Think of it like a restaurant menu: you (frontend) don't cook the food yourself, you ask the kitchen (backend) through a defined menu of options (the API). |
| **Database** | A permanent digital filing cabinet where data is stored — user accounts, scan results, etc. Without one, data disappears when the program restarts. This project uses **SQLite** (a database that's just a single file on disk) locally. |
| **Server** | A computer that's always turned on and running a program, so other people's computers can connect to it. Your own laptop can act as a server for testing (that's what "running it locally" means), but a real server for the public needs to be a computer that never turns off — that's what "hosting" (Section 14) is for. |
| **Terminal / Command line** | A text-based way of giving your computer instructions, instead of clicking icons. You type a command, press Enter, and it runs. This guide gives you exact commands to type. |
| **Git** | A tool that tracks every change ever made to a project's code, like a very detailed "undo history." |
| **GitHub** | A website that stores Git projects online, so people can share code and work on it together. |
| **Clone** | Downloading a full copy of a GitHub project onto your own computer, including its entire history. |
| **`localhost`** | A special address that means "this very computer." When you see `http://localhost:3000`, that's a website running on your own machine — not visible to anyone else, only you, until it's hosted publicly (Section 14). |
| **Port** | A "door number" a program listens on for connections on your computer. `localhost:3000` means "door number 3000 on this computer." Different programs use different doors so they don't collide. |
| **`.env` file** | A special file that holds secret values — passwords, API keys — that should **never** be shared publicly or uploaded to GitHub. Explained in detail in Section 8. |
| **API key** | A secret password-like code that proves to another company's service ("Claude"/Anthropic, "Resend") that you're allowed to use it, and that lets them bill you for usage. Never share these or put them in code that goes on GitHub. |
| **Deploy / Host** | Putting your project on a server that's always on and has a public web address, so *anyone* — not just you — can open a link and use it. Covered in Section 14. |
| **Repository ("repo")** | A GitHub project. This whole AccessLens codebase is "the repo." |
| **Dependency / package** | Someone else's pre-written code that your project uses instead of writing everything from scratch (e.g. code that draws charts, or talks to a database). Installed with commands like `npm install` or `pip install`. |

---

## 3. How this project is organized

Open the project folder. You'll see three main folders:

```
accesslens/
├── frontend/     ← the website (what users see in their browser)
├── backend/      ← the "engine" (scans websites, talks to the database, sends emails)
└── extension/    ← a small Chrome browser extension (currently incomplete, see Section 5)
```

- **`frontend/`** is a Next.js (React/TypeScript) app. It has the marketing landing page, and a
  dashboard with a sidebar (Overview, New Scan, History, and the Results screen).
- **`backend/`** is a Python FastAPI app. It does the actual work: launches a real invisible
  ("headless") browser to visit and check websites, asks Claude (an AI) to explain the findings in
  plain language, stores user accounts and scan history in a database, and sends emails.
- **`extension/`** is a tiny Chrome add-on for scanning the page you're currently browsing. It's
  not finished — see Section 5.

---

## 4. What's already built and working

This is real, tested, working software — not a mockup. Specifically:

- **A real scanning engine.** It opens an actual browser (invisibly, in the background), visits
  the URL you give it, and checks it against ~100 real accessibility rules (using a well-known
  tool called `axe-core`), plus custom checks we wrote for touch-target size, keyboard navigation,
  and missing focus indicators.
- **AI-written explanations.** Once Claude has an API key (Section 10), it rewrites each technical
  finding in plain language, from the point of view of the specific disabled user it affects.
- **Indian law mapping.** Every finding is tagged with the relevant law/standard (RPwD Act,
  IS 17802, GIGW 3.0, and SEBI where relevant).
- **A dashboard** with a sidebar: an Overview page (stats + recent scans), a New Scan page, a
  History page (every scan you've ever run), and a Results page split into tabs (Summary,
  Simulations, Findings).
- **Two demo features:**
  - A **color-blindness simulator** — a screenshot of the scanned site with filters you can toggle
    (protanopia, deuteranopia, tritanopia) to see it the way a color-blind user would.
  - A **screen-reader audio demo** — click Play and your own computer's text-to-speech reads the
    page aloud the way a screen reader would announce it.
- **A downloadable PDF report.**
- **Real user accounts** — signup, login, email verification, and "forgot password," all backed by
  a real database (not fake/pretend login).
- **Scan history that survives restarts** — every scan is saved to the database tied to your
  account, so it's there next time you log in, even on a different day.

---

## 5. What's NOT done yet — your job

Be honest with yourselves and whoever you're demoing to about these gaps:

1. **No Claude API key added yet.** Without it, the app still runs and still finds real problems,
   but the written explanations are generic template text instead of Claude's natural,
   persona-voice writing. **This is the single most important thing to add.** See Section 10.
2. **No Resend (email) API key added yet.** Without it, signup still works, but the verification
   email never actually arrives — you'd have to dig the verification link out of the database
   manually (Section 12 shows you how, as a workaround). See Section 11.
3. **The Chrome extension is broken.** It was built before real user accounts existed, and now
   every scan requires being logged in — the extension doesn't know how to log in yet, so it will
   fail with an "Unauthorized" error if you click it. It needs someone to add a login step to it.
4. **Nothing is hosted publicly yet.** The whole app only runs on your own computer right now
   (`localhost`). Nobody else can open a link and use it until you deploy it — see Section 14.
5. **No automated tests.** Every feature so far has been checked by hand (running real scans,
   taking screenshots, clicking through flows). There's no `npm test` or `pytest` safety net that
   automatically checks nothing broke when you change code.
6. **The "AI acts as a disabled user" feature is narration, not navigation.** Claude explains
   findings a rule-based scan already found — it doesn't independently click around the site
   pretending to be a screen-reader user. This was a deliberate cost/speed/reliability tradeoff.
   See Section 13 for why.

---

## 6. Step 1: Get the code onto your computer

1. Install **Git** if you don't have it: go to [git-scm.com/downloads](https://git-scm.com/downloads),
   download it for your operating system, and install it with the default options.
2. Open a terminal (on Windows, search for "Git Bash" or "PowerShell" in the Start menu).
3. Navigate to a folder where you want the project to live, e.g.:
   ```
   cd D:\
   ```
4. Download ("clone") the project:
   ```
   git clone https://github.com/sreshmi2008/accesslens.git
   cd accesslens
   ```
   You now have a full copy of the code on your computer, in a folder called `accesslens`.

---

## 7. Step 2: Install the tools you need

You need two "runtimes" — programs that know how to run the project's code:

1. **Python 3.12** (runs the backend). Download from
   [python.org/downloads](https://www.python.org/downloads/). During install on Windows, tick
   "Add python.exe to PATH."
2. **Node.js** (runs the frontend). Download the "LTS" version from
   [nodejs.org](https://nodejs.org/).

To check they installed correctly, open a terminal and run:
```
python --version
node --version
npm --version
```
Each should print a version number, not an error.

---

## 8. Step 3: Set up and run the backend

### 8.1 Create a virtual environment

A "virtual environment" is an isolated folder that holds only this project's Python packages, so
they don't clash with other Python projects on your computer.

```
cd backend
python -m venv .venv
```

### 8.2 Activate it and install packages

On Windows (PowerShell):
```
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

This reads `requirements.txt` (a plain list of every package the backend needs) and installs them
all, plus the real browser Playwright uses to scan sites:
```
.\.venv\Scripts\python.exe -m playwright install chromium
```

### 8.3 Create your `.env` file

**What is a `.env` file, and why does it exist?** It's a plain text file that holds secret values
— API keys, passwords, database connection details — that the program needs to run, but that
should **never** be uploaded to GitHub, because anyone who saw them could use your paid API keys
or access your database. That's why you won't find a real `.env` file in the GitHub repo — it's
deliberately excluded (there's a rule for it in a file called `.gitignore`).

Instead, the repo has `.env.example` — a template showing *which* values are needed, with fake
placeholder values. You copy it to a real `.env` file and fill in your own real values.

**Where does it live?** Right inside the `backend/` folder, next to `.env.example`. The backend
code automatically reads `backend/.env` when it starts.

Create it:
```
copy .env.example .env
```
(On Mac/Linux, use `cp .env.example .env` instead.)

Now open `backend/.env` in any text editor and fill in:

| Setting | What it's for | Where to get it |
|---|---|---|
| `ANTHROPIC_API_KEY` | Lets the backend ask Claude to write plain-language explanations | Section 10 |
| `SECRET_KEY` | A random secret used to sign login sessions securely | Generate one yourself — see below |
| `RESEND_API_KEY` | Lets the backend send real verification/reset emails | Section 11 |
| `DATABASE_URL`, `FRONTEND_ORIGIN`, etc. | Already filled in with sensible defaults — you don't need to touch these for local use | — |

To generate a real `SECRET_KEY`, run:
```
.\.venv\Scripts\python.exe -c "import secrets; print(secrets.token_hex(32))"
```
Copy the long string it prints and paste it as the value of `SECRET_KEY` in `.env`.

### 8.4 Start the backend

```
.\.venv\Scripts\uvicorn.exe app.main:app --port 8000
```

> **Important:** don't add `--reload` here. On Windows it causes a real bug that breaks the
> scanning browser. If you change backend code, stop this command (Ctrl+C) and re-run it.

If it worked, you'll see `Uvicorn running on http://127.0.0.1:8000`. Leave this terminal window
open and running — closing it stops the backend. Open a **second** terminal window for the next
step.

---

## 9. Step 4: Set up and run the frontend

In your second terminal window:

```
cd frontend
copy .env.local.example .env.local
npm install
npm run dev
```

`npm install` downloads all the frontend's packages (this can take a minute or two). `npm run dev`
starts the website. Watch the terminal output — it'll tell you the address, something like:

```
- Local: http://localhost:3000
```

(If port 3000 is already busy with something else on your computer, Next.js automatically tries
3001, 3002, and so on — just use whichever address it actually prints.)

Open that address in your browser. You should see the AccessLens landing page.

---

## 10. Step 5: Get your own Claude (Anthropic) API key

This is the most important missing piece. Claude is what writes the plain-language explanations.

1. Go to **[console.anthropic.com](https://console.anthropic.com)** and sign up.
2. This is a **paid, pay-as-you-go service** — you only pay for what you actually use, and it's
   usually cheap for testing (a handful of scans costs cents, not dollars), but you do need to add
   a payment method and put a small amount of credit on the account before it'll work.
3. Once signed in, find **"API Keys"** in the left sidebar, click **"Create Key"**, give it any
   name (e.g. "AccessLens dev"), and copy the key it shows you. It starts with `sk-ant-...`.
   **You can only see this key once** — if you lose it, delete it and make a new one.
4. Open `backend/.env` and set:
   ```
   ANTHROPIC_API_KEY=sk-ant-the-key-you-copied
   ```
5. Stop the backend (Ctrl+C in its terminal) and restart it (Section 8.4) so it picks up the change.

---

## 11. Step 6: Get your own Resend (email) API key

Resend sends the "verify your email" and "reset your password" emails. It's free for this project's
scale (100 emails/day).

1. Go to **[resend.com](https://resend.com)** and sign up free — no credit card needed.
2. Once logged in, find **"API Keys"**, click to create one, and copy it (starts with `re_...`).
3. Open `backend/.env` and set:
   ```
   RESEND_API_KEY=re_the_key_you_copied
   ```
4. Restart the backend.

Since we don't own a custom domain (like `accesslens.com`), emails send from Resend's shared
address, `onboarding@resend.dev` — that's expected and fine for now; it'll just look a little
generic instead of branded.

---

## 12. Step 7: Try the whole app yourself

With both the backend and frontend running (Sections 8 and 9):

1. Open the frontend address in your browser (e.g. `http://localhost:3000`).
2. Click **"Get Started Free."**
3. Fill in a name, a real email address you can check, and a password (8+ characters). Submit.
4. You'll see "Check your email" — go check that inbox (including spam) for a message from
   AccessLens, and click the verification link inside it.
   - **If you haven't set up `RESEND_API_KEY` yet**, no email will arrive. As a workaround for
     local testing only, open `backend/accesslens.db` with any SQLite viewer (e.g. the free
     "DB Browser for SQLite" app), open the `email_tokens` table, copy the newest `token` value,
     and visit `http://localhost:3000/verify-email?token=PASTE_TOKEN_HERE` in your browser.
5. Log in with the email/password you just verified.
6. You'll land on the **Dashboard**. Click **"New Scan"**, then click one of the demo site cards
   (or type a URL).
7. Wait on the loading screen (this is a real browser scanning a real website, so it can take
   20-60 seconds).
8. Look at the **Summary**, **Simulations**, and **Findings** tabs. Try the color-blindness filter
   buttons and the screen-reader "Play" button.
9. Go back to the sidebar's **History** — your scan should be listed there.

If every step above worked, the whole app is functioning correctly on your machine.

---

## 13. Why we made certain decisions

Questions likely to come up when explaining this project to others:

- **"Why doesn't the AI actually click around the site like a disabled user would?"** — It could,
  using Claude's agentic/"computer use" abilities, but that would mean one Claude API call per
  *action* (click, read, decide-next-step) instead of one call per whole scan — 20-50x more
  expensive and much slower per scan, and less reliable (two runs of the same site could explore
  it differently and report different things, which is bad for a tool meant to support legal
  compliance claims). Instead, deterministic rule-based checks (which always give the same,
  provable answer) find the raw problems, and Claude's one job is explaining them in human terms.
- **"Why is login required before you can scan anything?"** — So scan history can be saved
  per-person and revisited later, instead of disappearing.
- **"Why a database instead of just files?"** — Before the database existed, every scan result
  was stored only in the running program's memory — restarting the backend (even just to apply a
  code change) wiped everything. A real database (Section 8) makes data permanent.
- **"Why SQLite and not something fancier?"** — SQLite is a database that's just a single file on
  disk, with zero setup — perfect for local development. When this gets hosted publicly
  (Section 14), it should be swapped for a proper hosted database, because most free hosting
  platforms wipe their own disk on every restart, which would wipe a SQLite file living there too.

---

## 14. How to put this online so anyone can visit a link

Right now, everything only runs on your own computer (`localhost`) — nobody else can see it. To
get a real public link you can send someone, three separate pieces need a permanent home:

1. **The frontend (the website).** Easiest option: **[Vercel](https://vercel.com)** — it's built
   specifically for Next.js apps like this one, has a generous free tier, and deployment is close
   to "connect your GitHub repo and click a button."
2. **The backend (the scanning engine).** This is trickier, because it launches a real Chromium
   browser for every scan, which most cheap/serverless hosts (including Vercel) don't support well.
   Options that do support it: **Render**, **Railway**, or **Fly.io** — all have free tiers, and
   you'd deploy the backend there using Docker (a way of packaging an app with everything it needs
   to run, so it works the same on any server) — this project doesn't have a Dockerfile yet, so
   that's a task for whoever picks up hosting.
3. **The database.** A SQLite file living on the backend's own server disk will likely get wiped
   every time the free host restarts your app (which can happen often). For anything public, swap
   `DATABASE_URL` in `.env` for a real hosted database instead — free options include
   **Neon** or **Supabase** (both offer free Postgres, a more serious database than SQLite).
4. Once the backend has a public address (e.g. `https://accesslens-api.onrender.com`), update the
   frontend's `NEXT_PUBLIC_API_BASE_URL` (in Vercel's project settings, not a file, once deployed)
   to point at it, and update the backend's `FRONTEND_ORIGIN` to point at the frontend's real
   Vercel address, so the two are allowed to talk to each other.

This is genuinely the next big milestone after the API keys are working locally — budget real time
for it, and don't be surprised if it takes longer than expected the first time.

---

## 15. Troubleshooting

- **`'python' is not recognized...`** — Python isn't installed correctly, or wasn't added to PATH.
  Reinstall it and make sure to tick "Add to PATH" during setup.
- **Backend won't start / port 8000 already in use** — Something else is already using that port.
  Find and close it, or ask whoever's helping you for a different port number to use.
- **Frontend shows a network error when scanning** — Make sure the backend terminal is still
  running and shows no errors. Check `frontend/.env.local` has the right backend address.
- **"Please verify your email before logging in"** — You signed up but haven't clicked the
  verification link yet. See Section 12, step 4, including the no-email workaround.
- **A scan takes forever / times out** — Some websites are slow or block automated browsers.
  Try one of the built-in demo sites first to confirm the app itself works before testing others.
- **`NotImplementedError` in the backend terminal** — You (or someone) probably started the
  backend with `--reload`. Don't — see the note in Section 8.4.

---

## 16. Glossary — quick lookup

A shorter version of Section 2, for quick reference:

- **HTML/CSS/JS/TS** — the building blocks of any website (structure / style / behavior).
- **Frontend** — the part you see in a browser.
- **Backend** — the part that does the real work, out of sight.
- **API** — how the frontend asks the backend to do something.
- **Database** — permanent storage for data.
- **`.env` file** — holds secret keys/passwords; never shared publicly.
- **API key** — a secret code proving you're allowed to use a paid service like Claude.
- **`localhost`** — "this computer," used for testing before anything is public.
- **Deploy/host** — put the project on a server that's always on with a public address.
- **Git/GitHub** — tools for tracking and sharing code.
- **Clone** — download a copy of a GitHub project.

If you get through this whole guide and the app runs on your machine, you understand more about
how a real full-stack app works than most people do after their first month of learning to code.
Take your time, and don't hesitate to re-read a section if something doesn't click the first time.
