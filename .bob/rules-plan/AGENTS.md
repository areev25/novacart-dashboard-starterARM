# AGENTS.md — Plan mode

This file provides guidance to agents when working with code in this repository.

## Architectural constraints (non-obvious only)

- Single-file backend: all FastAPI routes live in `backend/main.py` — no separation of concerns intended; do not introduce routers or service layers unless explicitly asked
- All endpoints are read-only GET; the app has no write operations — no POST/PUT/DELETE pattern exists to follow
- The frontend has no global state manager (no Redux, no Zustand) — each page owns its own state via `useState`; cross-page shared state is only `ThemeContext`
- `connection.py` abstracts SQLite ↔ Snowflake transparently — backend code should never import sqlite3 or snowflake-connector directly; always use `get_connection()` + `execute_query()`
- Frontend build output is served by NGINX in production alongside the backend — the reverse proxy path prefix `/api` must not be changed
- No migrations system exists — schema changes require manual SQLite edits in dev and Snowflake DDL in prod
- `dim_customer` is SCD Type 2 — any new customer query must include `WHERE c.is_current = 1` or results will be multiplied
