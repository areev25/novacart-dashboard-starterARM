# AGENTS.md — Ask mode

This file provides guidance to agents when working with code in this repository.

## Navigation & documentation (non-obvious only)

- There are no docs beyond `README.md` — the canonical reference for any pattern is the existing page components themselves (`OrdersView.js` is the most complete)
- `backend/main.py` contains ALL backend logic — no routers, no services, no models directory
- `frontend/src/utils/api.js` is the single source of truth for all API endpoint URLs
- The dataset only spans 2022 — any date range outside that returns empty results
- "SPCS" in comments refers to Snowflake Container Services (the production deployment target) — not relevant for local dev
- `dim_customer` uses SCD Type 2 (`is_current = 1` flag) — queries should always filter `WHERE is_current = 1` to avoid duplicate customers
