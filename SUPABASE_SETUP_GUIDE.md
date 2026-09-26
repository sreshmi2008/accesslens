# Setting Up Supabase for AccessLens — Step by Step

Hi! You've been asked to create a **Supabase** account and project for the AccessLens app. This
guide assumes you've never used Supabase (or anything like it) before — just follow the steps in
order. At the end, you'll copy one piece of text and send it back privately to whoever asked you
to do this. That's the whole task.

## What is Supabase, and what am I actually doing?

Every app that remembers things (user accounts, saved data) needs a **database** — think of it
like a permanent digital filing cabinet. Supabase is a website that gives you a free, ready-made
database in the cloud (meaning it lives on the internet, not on your own computer), so an app can
store and retrieve information from anywhere, at any time.

You're going to create one of these databases for AccessLens. At the end, Supabase gives you a
special piece of text called a **connection string** — it's like an address plus a password
combined into one line, and it's the only way for the AccessLens program to find and unlock your
new database. That's the thing you'll send back at the end.

**Important: that connection string is a secret**, exactly like a password. Don't post it in a
public place (like a public GitHub page, a public Discord/WhatsApp group, or social media) —
only send it directly and privately to the person who asked you to do this.

## Step-by-step

### 1. Create your account

1. Open **[supabase.com](https://supabase.com)** in your browser.
2. Click **"Start your project"** or **"Sign up"** (top-right of the page).
3. Sign up with your email (or with a Google/GitHub account if you have one — either way works
   fine, pick whichever is easiest for you).
4. If you signed up with email, check your inbox for a confirmation email and click the link in it.

This is completely free — you won't be asked for a credit card.

### 2. Create a new project

1. Once you're logged in, you should land on a dashboard. Click the button that says
   **"New Project"** (it might also be a `+` icon).
2. If it asks you to create an "Organization" first, just give it any name (e.g. your own name or
   "AccessLens") and continue — this is just Supabase's way of grouping projects, it doesn't matter
   much for us.
3. Now fill in the **New Project** form:
   - **Name:** type `accesslens`
   - **Database Password:** click "Generate a password" if offered, or type your own strong
     password. **Whatever you do here, copy this password and paste it somewhere safe** (a notes
     app, a message to yourself) before continuing — you will need it again in a few minutes, and
     Supabase will NOT show it to you again after this screen.
   - **Region:** pick whichever one is closest to you geographically (e.g. if you're in India,
     look for something like "South Asia (Mumbai)" if it's listed; if not, any region is fine for
     our purposes — it won't break anything).
4. Click **"Create new project"**.
5. Now wait. Supabase takes about 1-2 minutes to set everything up. You'll see a loading screen —
   that's normal, just wait for it to finish.

### 3. Get the connection string

Once your project has finished loading:

1. Look at the left-hand sidebar. Near the bottom, click the **gear/settings icon** — it might be
   labeled "Project Settings."
2. In the settings menu, click **"Database."**
3. Scroll down until you see a section called **"Connection string."**
4. You'll see a few tabs/options (like "Session mode," "Transaction mode," etc.) — click the one
   labeled **"URI"**.
5. You'll see a line of text that looks something like this (yours will have different random
   letters/numbers):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijklmnop.supabase.co:5432/postgres
   ```
6. Click the copy icon next to it to copy the whole line.
7. Now paste it somewhere you can edit it (like a notes app), and **replace the text
   `[YOUR-PASSWORD]`** (including the square brackets) **with the actual database password** you
   saved back in Step 2. So if your password was `Sunshine123!`, the line would become:
   ```
   postgresql://postgres:Sunshine123!@db.abcdefghijklmnop.supabase.co:5432/postgres
   ```

### 4. Send it back

Send that final edited line (with your real password inside it, not `[YOUR-PASSWORD]`) **privately**
— a direct message, not a public post or public group chat — to whoever asked you to do this setup.

That's it — you're done! You've created a real cloud database and generated the key that lets the
AccessLens app connect to it.

## If something goes wrong

- **I can't find "Project Settings."** Look for a gear/cog icon, usually near the bottom of the
  left sidebar, sometimes just labeled with an icon and no text.
- **I don't see a "Connection string" section.** Make sure you clicked into "Database" specifically
  under Settings — it's a different page from the main project dashboard.
- **I lost the password before pasting it into the connection string.** Go back to Project Settings
  → Database, and look for a "Reset Database Password" option — you can generate a new one and use
  that instead. Just make sure to update the connection string with the new password too.
- **Nothing seems to be loading / the page looks broken.** Try refreshing the page, or waiting a
  minute — Supabase's free tier can occasionally be a little slow right after a project is created.
