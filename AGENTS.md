# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Commands

```bash
# Backend
cd backend && uvicorn main:app --reload --port 8000

# Frontend
cd frontend && npm start       # dev server on :3000
cd frontend && npm run build   # production build
```

No test runner is configured. No lint tool is configured.

## Architecture

- **Backend:** FastAPI in `backend/main.py` — all endpoints in one file, no routers
- **Frontend:** React 18 SPA in `frontend/src/` — React Router v6, no TypeScript, no UI component library
- **Database:** SQLite at `data/novacart_gold.db` in dev; Snowflake in production (controlled by `DATA_BACKEND` env var in `backend/.env`)
- **API client:** All fetch calls go through `frontend/src/utils/api.js` — add new endpoints there
- **Theme:** CSS variables only (`var(--bg-card)`, `var(--accent)`, etc. defined in `frontend/src/App.css`) — always use variables, never hardcode colours except chart fills (`#00897B` teal accent)

## Non-obvious project facts

- All backend endpoints accept `start` and `end` query params (default: `2022-01-01` / `2022-12-31`) — the dataset only covers 2022
- Backend only counts `delivered` or `shipped` orders in revenue queries — `pending`/`cancelled` are excluded
- NGINX reverse proxy (`router/`) must not be modified — it routes `/api/*` → backend in SPCS deployment
- `frontend/.env.example` shows `REACT_APP_BACKEND_URL=/api` for SPCS vs `http://localhost:8000` for local dev
- Dark mode is toggled via `ThemeContext` (`frontend/src/utils/ThemeContext.js`) and stored in `localStorage` under key `nc-theme`; it sets `data-theme` on `<html>` — CSS variables handle everything else automatically
- Charts use recharts; import `CartesianGrid` separately alongside `BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer`
- Horizontal bar charts need `layout="vertical"` on `<BarChart>`, `XAxis type="number"`, `YAxis type="category"`
