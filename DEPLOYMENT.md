# TradeBook — Vercel Deployment Guide

Deploy **frontend + Django API together** on Vercel (same pattern as [erp-bot](erp-bot/)).

```
Browser  →  your-app.vercel.app
              ├── /           → Next.js (frontend)
              └── /api/*      → app.py → Django REST API
```

> **Database:** Vercel serverless has no persistent disk. You **must** use **PostgreSQL** (Neon, Vercel Postgres, or Supabase). SQLite will not work in production on Vercel.

---

## Prerequisites

- GitHub repo pushed
- [Vercel](https://vercel.com) account
- [Neon](https://neon.tech) or [Vercel Postgres](https://vercel.com/storage/postgres) database (free tier OK)

---

## Step 1 — Create PostgreSQL database

### Option A: Neon (recommended, free)

1. Create project at [neon.tech](https://neon.tech)
2. Copy the **connection string** (pooled recommended for serverless)
3. Example: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

### Option B: Vercel Postgres

1. Vercel project → **Storage** → **Create Database** → Postgres
2. `DATABASE_URL` is auto-injected into your project

---

## Step 2 — Run migrations (once, before or after first deploy)

From your machine with the production `DATABASE_URL`:

```bash
pip install -r requirements.txt

# Windows PowerShell
$env:DATABASE_URL="postgresql://..."
python manage.py migrate
```

Or use Neon SQL console — migrations must be applied before the app can store users/trades.

---

## Step 3 — Deploy to Vercel

1. [vercel.com/new](https://vercel.com/new) → Import your GitHub repo
2. **Root Directory:** leave as `.` (repo root, not `frontend`)
3. Vercel reads `vercel.json` which builds:
   - `frontend/` → Next.js
   - `app.py` → Django via `@vercel/python`
4. Add environment variables (Step 4)
5. Deploy

---

## Step 4 — Environment variables (Vercel dashboard)

Set these on your Vercel project → **Settings** → **Environment Variables**:

| Variable | Required | Example / Notes |
|----------|----------|-----------------|
| `DATABASE_URL` | **Yes** | `postgresql://...` from Neon or Vercel Postgres |
| `DJANGO_SECRET_KEY` | **Yes** | Random string: `python -c "import secrets; print(secrets.token_urlsafe(50))"` |
| `DJANGO_DEBUG` | **Yes** | `False` |
| `DJANGO_ALLOWED_HOSTS` | No | Default includes `.vercel.app` — add custom domain if needed |
| `OPENAI_API_KEY` | No | `sk-...` for GPT AI coach |
| `TRADE_IMAGE_MAX_DIMENSION` | No | `1920` |
| `TRADE_IMAGE_QUALITY` | No | `75` |

**Do not set** `NEXT_PUBLIC_API_URL` on Vercel — the frontend calls `/api` on the same domain.

`VERCEL` is set automatically by Vercel.

---

## Step 5 — Verify deployment

| URL | Expected |
|-----|----------|
| `https://your-app.vercel.app` | Landing page |
| `https://your-app.vercel.app/api/health/` | `{"status":"ok","service":"tradebook-api"}` |
| `https://your-app.vercel.app/register` | Registration form |
| `https://your-app.vercel.app/login` | Login form |

1. Register an account
2. Log a test trade
3. Check analytics dashboard

---

## Project layout (Vercel-related files)

```
tradebook/
├── app.py              # Vercel WSGI entry (like erp-bot)
├── vercel.json         # Routes /api → Django, /* → Next.js
├── requirements.txt    # Python deps for @vercel/python
├── manage.py           # Migrations from repo root
├── .python-version     # Python 3.12
├── backend/            # Django project
└── frontend/           # Next.js app
```

---

## Local development

**Terminal 1 — Django API**
```bash
pip install -r requirements.txt
cd backend   # or use root manage.py
copy .env.example .env
python ../manage.py migrate
python ../manage.py runserver
```

**Terminal 2 — Next.js**
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` — Next.js rewrites `/api/*` to `http://localhost:8000`.

---

## Custom domain (optional)

1. Vercel → **Domains** → add `journal.yourdomain.com`
2. Add to `DJANGO_ALLOWED_HOSTS`: `journal.yourdomain.com`
3. Add to `CSRF_TRUSTED_ORIGINS`: `https://journal.yourdomain.com`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `500` on `/api/*` | Check Vercel **Functions** logs; usually missing `DATABASE_URL` or migrations not run |
| `Application error` on cold start | First request after idle can take 10–30s on free tier |
| CORS errors | Should not happen on Vercel (same origin). Locally, use Next.js rewrites (don't set `NEXT_PUBLIC_API_URL`) |
| `relation does not exist` | Run `python manage.py migrate` against production `DATABASE_URL` |
| Build fails (Python) | Ensure `requirements.txt` is at repo root; Python 3.12 via `.python-version` |
| Build fails (Node) | Node 18.17+ required; set in Vercel → Settings → Node.js Version → 20.x |
| Images upload fails | Check function size limits; images are compressed but large uploads may hit Vercel body limit (4.5 MB) |

---

## Alternative: Render for API only

If you prefer a traditional always-on Django server instead of serverless, see `backend/render.yaml` and deploy API to Render with `NEXT_PUBLIC_API_URL` pointing to Render. The Vercel + `app.py` setup is the recommended single-platform deploy (erp-bot pattern).

---

## Environment variables — complete checklist

### Vercel (production)

```
DATABASE_URL=postgresql://...
DJANGO_SECRET_KEY=<random-50+-chars>
DJANGO_DEBUG=False
OPENAI_API_KEY=sk-...          # optional
```

### Local — `backend/.env`

```
DJANGO_SECRET_KEY=dev-secret
DJANGO_DEBUG=True
DATABASE_URL=                  # leave empty for SQLite
```

### Local — `frontend/.env.local`

```
DJANGO_API_URL=http://localhost:8000
```
