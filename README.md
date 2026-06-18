# SupplyPortal

A full-stack supplier registration and management platform.  
The agency manages everything from a secure admin portal. Suppliers fill forms via unique shareable links.

---

## What's included

```
supplyportal/
├── app/
│   ├── admin/               ← Secure admin portal (your team only)
│   │   ├── page.tsx         ← Dashboard with stats
│   │   ├── forms/           ← Manage & create forms
│   │   ├── suppliers/       ← View, search, approve/reject suppliers
│   │   └── categories/      ← Browse by supply category
│   ├── f/[slug]/            ← Public supplier form page (shareable link)
│   └── layout.tsx
├── lib/
│   └── supabase.ts          ← All database functions + TypeScript types
└── supabase/
    └── migrations/
        └── 001_schema.sql   ← Run this once to set up your database
```

---

## Setup (takes about 10 minutes)

### Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click **New project** → choose a name (e.g. "supplyportal") → set a database password → **Create project**
3. Wait ~2 minutes for it to spin up

### Step 2 — Set up the database

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Open the file `supabase/migrations/001_schema.sql` from this project
4. Paste the entire contents into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)

This creates:
- `forms` table — stores your form definitions
- `submissions` table — stores all supplier responses
- Row Level Security policies — submissions are public-insert only; admin reads require auth
- Sample data — 3 forms and 4 sample submissions to start with

### Step 3 — Get your API keys

1. In Supabase, go to **Settings → API**
2. Copy your **Project URL** and **anon public** key

### Step 4 — Configure environment

```bash
# In the project folder:
cp .env.example .env.local
```

Open `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 5 — Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to the admin dashboard.

---

## How it works

### Creating a form (Admin)
1. Go to **Admin → New form**
2. Name it, pick a category, add fields (any mix of text, email, phone, dropdown, etc.)
3. Click **Publish form** → you get a unique URL like `/f/tent-suppliers-ab3f1`
4. Copy that link and share it with the right suppliers

### What suppliers see
- They open the link in any browser — no login needed
- They fill the form and submit
- You see it instantly in the admin portal

### Managing suppliers (Admin)
- **All suppliers** — searchable table, click any row to see all their details
- Approve, reject, or delete from the detail panel
- Filter by category, status, or which form they came from
- Export everything to CSV at any time

### By category
- Dashboard shows counts by supply type (Tents, Electronics, Food, etc.)
- Click any category to jump straight to those suppliers

---

## Deploying to production

### Option A — Vercel (recommended, free tier)

```bash
npm install -g vercel
vercel
```

Follow the prompts. When asked for environment variables, add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Your app is live at a `.vercel.app` URL. You can add a custom domain in Vercel settings.

### Option B — Any Node.js host

```bash
npm run build
npm start
```

Set the two env variables on your host.

---

## Adding admin authentication

Currently the admin portal has no login (suitable for testing). To lock it down:

1. In Supabase → **Authentication → Users**, create a user with email + password
2. Install the auth helper: `npm install @supabase/ssr`
3. Add a login page at `/admin/login` using `supabase.auth.signInWithPassword()`
4. Add middleware to protect `/admin/*` routes

The Row Level Security is already set up — only authenticated Supabase users can read submissions.

---

## Database schema reference

### `forms`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Form display name |
| description | text | Shown to suppliers |
| category | text | Supply category |
| fields | jsonb | Array of field definitions |
| is_active | boolean | Whether the link works |
| slug | text | URL slug (`/f/{slug}`) |
| created_at | timestamptz | |

### `submissions`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| form_id | uuid | References forms.id |
| data | jsonb | All field responses as key/value |
| status | text | `pending`, `approved`, or `rejected` |
| notes | text | Internal agency notes |
| created_at | timestamptz | |

---

## Questions?

The key file is `lib/supabase.ts` — all database queries are there with TypeScript types.
