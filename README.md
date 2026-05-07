# Brand OS — Personal Brand Platform

A Next.js 14 app implementing a proven personal-brand framework: story discovery, content production, conversion, and AI-search optimization. Per-user data, AI-assisted everywhere.

**Stack:** Next.js (App Router) · Supabase (Auth + Postgres) · Anthropic Claude · Tailwind CSS · Vercel

---

## Quick start

### 1. Install

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard) (free tier is fine).
2. Open the SQL Editor → New query → paste the contents of `supabase/schema.sql` → Run.
3. Settings → API → copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Get an Anthropic API key

1. Sign up at [console.anthropic.com](https://console.anthropic.com).
2. Settings → API Keys → Create Key.
3. Copy it — you'll only see it once.

### 4. Configure environment

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up with email + password, confirm via the link Supabase sends, and you're in.

---

## Optional: Google OAuth

In your Supabase dashboard:

1. Authentication → Providers → Google → Enable.
2. Follow the Supabase guide to register a Google Cloud OAuth client (one-time, takes ~10 min).
3. Paste the Client ID and Client Secret into Supabase.
4. Add `https://your-project.supabase.co/auth/v1/callback` to your Google OAuth client's authorized redirect URIs.

The "Continue with Google" button will work without further code changes.

---

## Deploy to Vercel

### One-time setup

1. Push this folder to a GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create personal-brand-platform --public --source=. --push
   ```
   (Or use the GitHub web UI.)

2. Go to [vercel.com/new](https://vercel.com/new), import the repo.

3. In **Environment Variables**, paste the same four vars from `.env.local` (Vercel will set them for all environments).
   - For `NEXT_PUBLIC_SITE_URL`, use your Vercel domain, e.g. `https://your-app.vercel.app`.

4. Click **Deploy**.

### After deploy

1. Copy the Vercel URL.
2. In Supabase: Authentication → URL Configuration:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: add `https://your-app.vercel.app/auth/callback`
3. Re-deploy if needed.

That's it. Sign-up emails will be sent by Supabase, confirmation links will redirect into your app.

---

## Project structure

```
.
├── app/
│   ├── (app)/
│   │   ├── layout.jsx          # Auth-gated routes
│   │   └── platform/page.jsx   # The main platform
│   ├── api/
│   │   ├── ai/route.js         # Anthropic API proxy (server-side key)
│   │   └── data/[key]/route.js # Per-user KV store
│   ├── auth/callback/route.js  # Supabase OAuth callback
│   ├── login/page.jsx          # Sign in / sign up
│   ├── globals.css
│   ├── layout.jsx
│   └── page.jsx                # Routes signed-in users to /platform
├── components/
│   ├── PersonalBrandPlatform.jsx   # The 6,380-line platform (untouched logic)
│   └── PlatformWrapper.jsx         # Installs window.storage + fetch shims
├── lib/supabase/
│   ├── client.js               # Browser Supabase client
│   ├── server.js               # Server Supabase client
│   └── middleware.js           # Session refresh on every request
├── supabase/schema.sql         # Database schema + RLS policies
├── middleware.js               # Auth gating
├── tailwind.config.js
├── next.config.js
└── package.json
```

---

## How data flows

```
Browser                 Next.js API                  Supabase Postgres
  │                          │                              │
  ├── platform calls         │                              │
  │   window.storage.set ───>│                              │
  │                          ├── verify session ─────────── │
  │                          ├── upsert user_data ─────────>│
  │                          │   (RLS enforces user_id)     │
  │                          │                              │
  ├── platform calls         │                              │
  │   fetch(anthropic) ─────>│                              │
  │   (intercepted by shim)  │                              │
  │                          ├── verify session              │
  │                          ├── inject ANTHROPIC_API_KEY    │
  │                          ├── forward to Anthropic ──────────────> Claude
  │                          │<───────────────────────── stream/json
  │<──────────────────────── │
```

The Anthropic API key never leaves the server. Each row in `user_data` is isolated by Row Level Security — users can only read/write their own rows.

---

## Adding monetization later (Stripe)

When you're ready, the cleanest path:

1. Create a Stripe account, add Products (e.g. "Pro — $29/mo").
2. `npm install stripe @stripe/stripe-js`.
3. Add `STRIPE_SECRET_KEY` and `STRIPE_PRO_PRICE_ID` to env vars.
4. Add a `subscriptions` table tied to `user_id` with `status` and `current_period_end`.
5. Add `/api/stripe/checkout` (creates session) and `/api/stripe/webhook` (handles `checkout.session.completed` and `customer.subscription.updated`).
6. Gate AI generation in `app/api/ai/route.js` by checking the user's subscription status — if not Pro and over free limit, return 402.

Want help wiring this when you're ready? Just ask.

---

## Troubleshooting

**"Email not confirmed" on sign in.** Check the Supabase email — confirmation link must match `NEXT_PUBLIC_SITE_URL`.

**"Unauthorized" calling `/api/ai`.** Cookies aren't being sent — make sure you're on the same domain you logged in with.

**AI returns errors.** Check `ANTHROPIC_API_KEY` in Vercel env vars (case-sensitive). Also verify your Anthropic account has credits.

**Data not persisting.** Open Supabase → Table Editor → `user_data`. If empty, RLS may be blocking — check the policies in `schema.sql` were applied.

---

## License

This is yours. Build, deploy, charge for it. Good luck.
