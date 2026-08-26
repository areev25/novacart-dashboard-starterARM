# AGENTS.md — Agent (coding) mode

This file provides guidance to agents when working with code in this repository.

## Coding rules (non-obvious only)

- New pages go in `frontend/src/pages/`, must be imported and routed in `frontend/src/App.js`
- New API endpoints go in `backend/main.py` (single file) and must be wired into `frontend/src/utils/api.js`
- All styling uses inline styles with CSS variables (`var(--text-primary)`, `var(--border)`, etc.) — no external CSS files per component, no CSS modules
- Chart bar fill colour is always `#00897B` (teal) — not the CSS variable, literal hex (recharts doesn't read CSS vars)
- For horizontal bar charts: `layout="vertical"` on `<BarChart>`, `XAxis type="number"`, `YAxis type="category" dataKey="name"` — see `OrdersView.js` cities chart as the canonical reference
- `formatCurrency()` helper is duplicated in each page file (not shared) — copy the pattern if adding a new page
- `loadData()` is the async data-fetch function name used consistently in all pages; follow this convention
- Backend queries only count `status IN ('delivered','shipped')` — do not change this filter
- `execute_query()` in `backend/connection.py` returns a list of dicts automatically; no cursor handling needed
