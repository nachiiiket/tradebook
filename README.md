# TradeBook — Trading Journal

A full-stack trading journal with email/password auth, compressed chart screenshots, strategy tracking, analytics, and an AI trade coach.

**Deploy everything on Vercel** (Next.js + Django REST API) — same architecture as [erp-bot](erp-bot/).

## Architecture

```
your-app.vercel.app
├── /              → Next.js frontend
└── /api/*         → Django REST API (app.py + @vercel/python)
```

| Layer | Stack | Deploy |
|-------|-------|--------|
| Frontend | Next.js 14, Tailwind, Recharts | Vercel |
| API | Django 5, DRF, JWT | Vercel (`app.py`) |
| Database | PostgreSQL (Neon / Vercel Postgres) | External |

## Quick start (local)

```bash
# API
pip install -r requirements.txt
copy backend\.env.example backend\.env
python manage.py migrate
python manage.py runserver

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

Open **http://localhost:3000**

## Deploy to Vercel

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full checklist.

1. Create a **PostgreSQL** database (Neon or Vercel Postgres)
2. Run `DATABASE_URL=postgresql://... python manage.py migrate`
3. Import repo on Vercel (root directory = `.`)
4. Set env vars: `DATABASE_URL`, `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=False`
5. Deploy

Health check: `https://your-app.vercel.app/api/health/`

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/` | Health check |
| POST | `/api/auth/register/` | Create account |
| POST | `/api/auth/login/` | Login → JWT |
| GET | `/api/auth/me/` | Current user |
| CRUD | `/api/strategies/` | Strategies |
| CRUD | `/api/trades/` | Trade journal |
| POST | `/api/trades/{id}/upload_image/` | Chart image |
| GET | `/api/analytics/dashboard/` | Analytics |
| POST | `/api/ai/analyze-trade/` | AI analysis |
| POST | `/api/ai/portfolio-coach/` | Portfolio coach |

## License

MIT
