# TinyLink

TinyLink is a small URL shortener similar to bit.ly. It uses a **Node.js + Express + Postgres** backend and a separate **Next.js** frontend.

- Backend (Express API + redirects): `backend/`
- Frontend (Next.js UI): `frontend/`

---

## Features

- Create short links with optional custom codes.
- 302 redirect from `/:code` to the original URL.
- Click tracking: total clicks + last clicked time.
- Delete links (stops redirect and returns 404).
- Dashboard page `/` (Next.js) to list/add/delete links.
- Stats page `/code/:code` (Next.js) to view a single link.
- Healthcheck endpoint `/healthz` (backend JSON) and `/health` (frontend UI).

---

## Project Structure

```text
ag-task/
  backend/      # Express API + Postgres
  frontend/     # Next.js React UI
  README.md
```

### Backend (`backend/`)

- `src/index.js` – Express app bootstrap, middleware, route mounting, error handler.
- `src/db.js` – Postgres pool using `DATABASE_URL`.
- `src/services/linkService.js` – business logic & SQL for links.
- `src/controllers/` – controllers for links, redirects, health.
- `src/routes/` – route definitions (`/healthz`, `/api/links`, `/:code`, etc.).
- `sql/schema.sql` – migration to create the `links` table.

### Frontend (`frontend/`)

- `pages/index.js` – Dashboard page.
- `pages/code/[code].js` – Stats page.
- `pages/health.js` – Health UI.
- `pages/_app.js` – Global App wrapper.
- `styles/globals.css` – global styles.

---

## Environment Variables

### Backend (`backend/.env`)

Copy `backend/.env.example` (if present) or create `.env` with:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require

PORT=5000
BASE_URL=http://localhost:3000   # public base of frontend or backend host
FRONTEND_BASE_URL=http://localhost:3000
NODE_ENV=development
```

- `DATABASE_URL` – Neon / Postgres connection string.
- `PORT` – backend listen port.
- `BASE_URL` – public base URL (used when building full short URLs).
- `FRONTEND_BASE_URL` – public URL of the Next.js app (used for redirects of `/` and `/code/:code`).

### Frontend (`frontend/.env.local`)

Create `frontend/.env.local` with:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

This is the base URL the Next.js app uses to call the backend API.

---

## Running Locally

1. **Backend**

```bash
cd backend
npm install
npm start     # runs on http://localhost:5000
```

Before first run, ensure the `links` table exists by running `sql/schema.sql` in your Postgres/Neon database.

2. **Frontend**

```bash
cd frontend
npm install
npm run dev   # runs on http://localhost:3000
```

---

## Routes & APIs (for testing / autograding)

### Frontend pages

- `GET /` (Next.js on port 3000) – Dashboard.
- `GET /code/:code` – Stats page.
- `GET /health` – Health UI.

### Backend routes (Express on port 5000)

- `GET /healthz` – JSON healthcheck: `{ ok, version, uptime, startedAt, db: { ok } }`.
- `GET /:code` – 302 redirect to original URL (or 404 if missing).
- `GET /code/:code` – 302 redirect to frontend stats page.

#### REST API

- `POST /api/links` – Create link. Body: `{ url, code? }`. 201 on success, 409 if code exists, 400 on validation errors.
- `GET /api/links` – List all links.
- `GET /api/links/:code` – Stats for one link.
- `DELETE /api/links/:code` – Delete a link (204 on success, 404 if missing).

---

## Deployment Notes (example)

- **Backend**: deploy `backend/` to Render / Railway.
  - Set env vars: `DATABASE_URL`, `PORT`, `BASE_URL`, `FRONTEND_BASE_URL`.
- **Frontend**: deploy `frontend/` to Vercel.
  - Set `NEXT_PUBLIC_BACKEND_URL` to the backend public URL.

This keeps a clean separation: backend is a pure API + redirect layer, and frontend handles all UI.
