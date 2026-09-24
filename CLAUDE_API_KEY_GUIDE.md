# How to Get a Claude (Anthropic) API Key

This is a focused, step-by-step guide for one specific task: getting the API key that lets
AccessLens's backend talk to Claude (the AI). If you haven't set up the rest of the project yet,
do that first using `GETTING_STARTED.md` — come back to this file when you reach Section 10 there,
or whenever you're ready to turn on the AI part of the app.

## Why do we even need this?

AccessLens can already scan real websites and find real accessibility problems without any AI —
that part is plain code. But turning those raw technical findings into plain-language explanations
(*"a screen-reader user will hear an unlabeled button seven times"*) is Claude's job. To let our
backend send requests to Claude, Anthropic (the company that makes Claude) requires an **API key**
— think of it like an account-specific password that (a) proves the request is coming from you,
and (b) lets them bill you for what you use.

## Important: this costs real money

Unlike Resend (our email service, which is free), the Claude API is **pay-as-you-go** — you pay
for what you actually use, there's no permanent free tier. The good news: for a project like this
(testing a handful of website scans while developing), the cost is genuinely small — usually cents
to a few dollars, not a large bill — because you're only charged for the amount of text sent to
and received from Claude per request, and each scan only makes one request. Still, you'll need to
add a payment method before it'll work at all, even if you only put a small amount of credit on
the account.

If cost is a concern for your team, agree beforehand on a spending limit and who's responsible for
the card on file — Anthropic's console lets you set a monthly spending cap (see Step 5 below).

## Step-by-step

### Step 1: Create an Anthropic account

1. Go to **[console.anthropic.com](https://console.anthropic.com)** in your browser.
2. Click **Sign Up** (or **Log In** if someone on your team already has an account you're meant
   to use — check with them first rather than creating a duplicate).
3. Sign up with an email address and verify it (check your inbox for a confirmation email/code).

### Step 2: Add billing

1. Once logged in, look for **"Billing"** or **"Plans & Billing"** in the left-hand menu.
2. Add a payment method (a credit or debit card).
3. Add a small amount of credit to start — even $5-10 is plenty to test this project thoroughly.
   You are not charged this amount upfront as a subscription; it's added as usable credit that
   gets spent down as you make API requests.

### Step 3: Set a spending limit (recommended, optional but smart)

1. Still in the Billing section, look for **"Usage limits"** or **"Spend limit."**
2. Set a monthly cap (e.g. $10 or $20) so a coding mistake (like an accidental infinite loop
   calling the API repeatedly) can't run up a surprise bill. This is a safety net, not something
   you're expected to actually hit during normal testing.

### Step 4: Create the API key

1. In the left-hand menu, find **"API Keys."**
2. Click **"Create Key"** (sometimes labeled "+ Create Key" or similar).
3. Give it a name you'll recognize later, e.g. `accesslens-dev` or `accesslens-local`.
4. Click create. A long string starting with `sk-ant-...` will appear.
5. **Copy it immediately and save it somewhere safe** (like a password manager, or a private note).
   Anthropic will only show you the full key **once** — if you navigate away and lose it, you
   can't retrieve it again. You'd have to delete that key and create a new one.

### Step 5: Put the key into the project

1. On your computer, open the file `backend/.env` in any text editor.
   - If you don't have this file yet, first copy `backend/.env.example` to `backend/.env` — see
     `GETTING_STARTED.md` Section 8.3 if you're not sure how.
   - **Never** put your real key into `.env.example` — that file is committed to GitHub and public.
     Only put real keys into `.env`, which is deliberately excluded from GitHub (see
     `GETTING_STARTED.md` Section 2's explanation of `.env` files if this is new to you).
2. Find the line that says:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```
3. Replace `sk-ant-your-key-here` with the real key you copied in Step 4, so it looks like:
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. Save the file.

### Step 6: Restart the backend and test it

The backend only reads `.env` when it starts up, so if it was already running, it won't notice the
new key until you restart it.

1. In the terminal where the backend is running, press `Ctrl+C` to stop it.
2. Start it again:
   ```
   .\.venv\Scripts\uvicorn.exe app.main:app --port 8000
   ```
3. Open the frontend, log in, and run a scan (use a demo site card for a quick test).
4. Open the **Findings** tab on the results page. If the key is working, the explanations will
   read like real, specific sentences (e.g. *"A screen-reader user will hear 'Edit' with no
   context because this button has no accessible label"*) instead of the generic placeholder text
   (*"Review this element against the linked WCAG criterion and apply the standard fix pattern"*).

## Troubleshooting

- **Findings still show generic placeholder text after adding the key.** Double check you saved
  `backend/.env` (not `.env.example`), that you actually restarted the backend, and that you
  copied the whole key with no extra spaces or missing characters. Check the backend's terminal
  window for a red error message right after a scan — it will say exactly what went wrong (e.g.
  "invalid API key" or a billing-related error).
- **"Your credit balance is too low" / billing error** — go back to the Billing section in
  console.anthropic.com and add more credit.
- **You lost the key and never saved it** — go to API Keys in the console, delete the old one, and
  create a new one following Step 4 again. Update `backend/.env` with the new value.
- **Someone accidentally shared or committed a real key to GitHub** — treat it as compromised
  immediately: go to API Keys in the console and delete/revoke that key, then create a fresh one.
  Anyone who has the old key could use it and run up charges on your account until it's revoked.

## A reminder on safety

Never paste a real API key into a chat message, a GitHub issue, a public document, or commit it
into any file that gets pushed to GitHub. If you're ever unsure whether a file is safe to share,
check whether it's `.env` (never share) or `.env.example` (fine to share — it only has placeholder
text, never a real key).
