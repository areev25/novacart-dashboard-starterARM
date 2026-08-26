"""
main.py — NovaCart Account Dashboard API

Built with FastAPI. Auto-generated docs at: http://localhost:8000/docs

Endpoints:
  GET /health                                  — service health check
  GET /authorize                               — SPCS OAuth flow
  GET /franchise/{id}/summary                  — overview stats
  GET /franchise/{id}/orders                   — monthly order volume and revenue
  GET /franchise/{id}/products                 — top products by revenue
  GET /franchise/{id}/customers                — top customers by revenue
  GET /franchise/{id}/countries                — revenue by country (city/state for US data)

Data schema (from the DE capstone Gold layer):
  fact_orders:   order_id, customer_id, product_id, order_date, amount, currency, status, quantity, date_key
  dim_customer:  customer_id, name, email, addr_city, addr_state, valid_from, valid_to, is_current
  dim_product:   product_id, name, category, price
  dim_date:      date_key, year, quarter, month, month_name, day_of_week

Your job: implement the TODO sections in each endpoint.
The connection and query helpers are already set up in connection.py.
"""

import os
import time
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from connection import get_connection, execute_query

load_dotenv()

# ── App setup ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="NovaCart Account Dashboard API",
    description=(
        "REST API for the NovaCart account manager dashboard. "
        "Built on top of the Gold data layer produced by the Data Engineering team."
    ),
    version="1.0.0",
)

PORT              = int(os.getenv("PORT", 8000))
CLIENT_VALIDATION = os.getenv("CLIENT_VALIDATION", "Dev")
START_TIME        = time.time()

# CORS — only needed for local development
# In SPCS, the NGINX router handles routing so CORS is not required
if CLIENT_VALIDATION == "Dev":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://localhost:3001"],
        allow_methods=["GET"],
        allow_headers=["*"],
    )


# ── Startup log ───────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    print("\nStarting NovaCart Dashboard API")
    print(f"Port:            {PORT}")
    print(f"Data backend:    {os.getenv('DATA_BACKEND', 'sqlite')}")
    print(f"Validation mode: {CLIENT_VALIDATION}")
    print(f"Docs:            http://localhost:{PORT}/docs\n")


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["System"])
def health():
    """
    Returns service health and confirms the database connection is working.
    Used by the frontend service status indicator.
    """
    uptime = round(time.time() - START_TIME)
    try:
        conn    = get_connection()
        results = execute_query(conn, "SELECT 1 AS ping")
        assert len(results) > 0
    except Exception as e:
        return JSONResponse(status_code=503, content={
            "status":   "degraded",
            "uptime_s": uptime,
            "database": {"status": "error", "message": str(e)},
        })
    return {
        "status":   "healthy",
        "uptime_s": uptime,
        "backend":  os.getenv("DATA_BACKEND", "sqlite"),
        "database": {"status": "connected"},
    }


# ── Auth ──────────────────────────────────────────────────────────────────────

@app.get("/authorize", tags=["Auth"])
def authorize(request: Request):
    """
    SPCS OAuth authorization endpoint.

    When running inside SPCS, the platform injects the authenticated Snowflake
    username in the Sf-Context-Current-User header. This endpoint reads that
    header and returns the user's identity so the frontend can store it.

    In Dev mode: returns a mock user for local development.
    """
    if CLIENT_VALIDATION == "Dev":
        return {"user": "dev_user", "status": "authorized"}

    username = request.headers.get("sf-context-current-user")
    if not username:
        raise HTTPException(status_code=422, detail="Missing Sf-Context-Current-User header")

    return {"user": username, "status": "authorized"}


# ── Franchise endpoints ───────────────────────────────────────────────────────

@app.get("/franchise/summary", tags=["Franchise"])
def get_summary(start: str = "2022-01-01", end: str = "2022-12-31"):
    """
    Returns an overview of all orders in the database for the given date range:
    - Total revenue (delivered + shipped orders only)
    - Total orders
    - Number of unique customers
    - Date range of available data

    Query parameters:
      start: start date (YYYY-MM-DD)
      end:   end date (YYYY-MM-DD)
    """
    conn = get_connection()

    results = execute_query(conn, """
        SELECT
            COUNT(DISTINCT order_id)    AS total_orders,
            SUM(amount)                 AS total_revenue,
            COUNT(DISTINCT customer_id) AS unique_customers,
            MIN(order_date)             AS start_date,
            MAX(order_date)             AS end_date
        FROM fact_orders
        WHERE status IN ('delivered', 'shipped')
          AND order_date BETWEEN ? AND ?
    """, (start, end))

    row = results[0]
    return {
        "total_revenue":    round(row["total_revenue"] or 0, 2),
        "total_orders":     row["total_orders"],
        "unique_customers": row["unique_customers"],
        "date_range": {"start": row["start_date"], "end": row["end_date"]},
    }


@app.get("/franchise/orders", tags=["Franchise"])
def get_orders(start: str = "2022-01-01", end: str = "2022-12-31"):
    """
    Returns monthly order volume and revenue for the given date range.
    Used to power the orders overview chart.

    Query parameters:
      start: start date (YYYY-MM-DD)
      end:   end date (YYYY-MM-DD)

    Expected response:
    [
        { "month": "2022-01", "month_name": "January", "order_count": 842, "revenue": 128450.00 },
        { "month": "2022-02", "month_name": "February", "order_count": 910, "revenue": 141230.00 }
    ]
    """
    conn = get_connection()

    results = execute_query(conn, """
        SELECT
            d.year,
            d.month,
            d.month_name,
            COUNT(DISTINCT o.order_id) AS order_count,
            SUM(o.amount)              AS revenue
        FROM fact_orders o
        JOIN dim_date d ON o.date_key = d.date_key
        WHERE o.status IN ('delivered', 'shipped')
          AND o.order_date BETWEEN ? AND ?
        GROUP BY d.year, d.month, d.month_name
        ORDER BY d.year, d.month
    """, (start, end))

    return [
        {
            "month":       f"{r['year']}-{str(r['month']).zfill(2)}",
            "month_name":  r["month_name"],
            "order_count": r["order_count"],
            "revenue":     round(r["revenue"] or 0, 2),
        }
        for r in results
    ]


@app.get("/franchise/products", tags=["Franchise"])
def get_products(start: str = "2022-01-01", end: str = "2022-12-31"):
    """
    Returns the top 10 products by revenue for the given date range.

    Expected response:
    [
        { "product_id": "P001", "name": "Wireless Headphones", "category": "Electronics",
          "units_sold": 342, "revenue": 30578.58 }
    ]

    TODO: implement this endpoint.
    Hints:
      - JOIN fact_orders with dim_product on product_id
      - GROUP BY product_id, name, category
      - ORDER BY revenue DESC, LIMIT 10
    """
    conn = get_connection()

    results = execute_query(conn, """
        SELECT
            dp.product_id,
            dp.name,
            dp.category,
            SUM(fo.quantity)          AS units_sold,
            ROUND(SUM(fo.amount), 2)  AS revenue
        FROM fact_orders fo
        JOIN dim_product dp ON fo.product_id = dp.product_id
        WHERE fo.status IN ('delivered', 'shipped')
          AND fo.order_date BETWEEN ? AND ?
        GROUP BY dp.product_id, dp.name, dp.category
        ORDER BY revenue DESC
        LIMIT 10
    """, (start, end))

    return results


@app.get("/franchise/customers", tags=["Franchise"])
def get_customers(start: str = "2022-01-01", end: str = "2022-12-31"):
    """
    Returns the top 20 customers by revenue for the given date range.

    Expected response:
    [
        { "customer_id": "C001", "name": "Alice Johnson", "city": "Austin",
          "state": "TX", "total_orders": 14, "total_spent": 1240.50 }
    ]

    TODO: implement this endpoint.
    Hints:
      - JOIN fact_orders with dim_customer on customer_id
      - Only use dim_customer WHERE is_current = 1
      - GROUP BY customer_id, name, addr_city, addr_state
      - ORDER BY total_spent DESC, LIMIT 20
    """
    conn = get_connection()

    results = execute_query(conn, """
        SELECT
            dc.customer_id,
            dc.name,
            dc.addr_city              AS city,
            dc.addr_state             AS state,
            COUNT(fo.order_id)        AS total_orders,
            ROUND(SUM(fo.amount), 2)  AS total_spent
        FROM fact_orders fo
        JOIN dim_customer dc ON fo.customer_id = dc.customer_id
        WHERE dc.is_current = 1
          AND fo.status IN ('delivered', 'shipped')
          AND fo.order_date BETWEEN ? AND ?
        GROUP BY dc.customer_id, dc.name, dc.addr_city, dc.addr_state
        ORDER BY total_spent DESC
        LIMIT 20
    """, (start, end))

    return results


@app.get("/franchise/cities", tags=["Franchise"])
def get_cities(start: str = "2022-01-01", end: str = "2022-12-31"):
    """
    Returns revenue grouped by city and state.
    Used to power the geographic breakdown chart.

    Expected response:
    [
        { "city": "Austin", "state": "TX", "order_count": 420, "revenue": 38430.00 }
    ]

    TODO: implement this endpoint.
    Hints:
      - JOIN fact_orders with dim_customer (is_current = 1) on customer_id
      - GROUP BY addr_city, addr_state
      - ORDER BY revenue DESC
    """
    conn = get_connection()

    results = execute_query(conn, """
        SELECT
            dc.addr_city              AS city,
            dc.addr_state             AS state,
            COUNT(fo.order_id)        AS order_count,
            ROUND(SUM(fo.amount), 2)  AS revenue
        FROM fact_orders fo
        JOIN dim_customer dc ON fo.customer_id = dc.customer_id
        WHERE dc.is_current = 1
          AND fo.status IN ('delivered', 'shipped')
          AND fo.order_date BETWEEN ? AND ?
        GROUP BY dc.addr_city, dc.addr_state
        ORDER BY revenue DESC
    """, (start, end))

    return results
