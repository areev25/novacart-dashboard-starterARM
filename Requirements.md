# Requirements Document
## Project Name: NovaCart Account Dashboard

## 1 Introduction

### 1.1 Overview

This requirements document defines the acceptance criteria for the NovaCart Account Dashboard MVP. It serves as the concrete acceptance checklist for both the App Consultant and App Developer. The document translates business requirements into technical specifications for API endpoints and frontend views, ensuring alignment before any code is written.

### 1.2 Scope

This document covers:

- All API endpoints required for the MVP
- All frontend views and components
- Acceptance criteria for each deliverable

### 1.3 Reference

| ID | Document Title | Reference |
|----|----------------|-----------|
| 1 | Problem Statement | https://ibm.ent.box.com/file/2424527696597 |
| 2 | Lab Guide | https://ibm.ent.box.com/file/2424527368666 |
| 3 | Execution Guide | https://ibm.ent.box.com/file/2424541986952 |

---

## 2 Description

### 2.1 Software Description

**Application Name:** NovaCart Account Dashboard

**Technology Stack:**

- **Backend:** FastAPI (Python)
- **Frontend:** React 18 (JavaScript)
- **Database:** Snowflake (Gold tables)
- **Deployment:** Docker + NGINX + SPCS
- **Authentication:** Snowflake OAuth (SPCS mode)

**Purpose:** Enable account managers to view order summaries, product performance, and customer information through a centralized dashboard.

### 2.2 Functional Description

The application provides three main frontend views and supporting API endpoints:

1. Orders Overview — High-level summary of order activity
2. Product Performance — Product metrics and performance data
3. Customer List — Customer records in list/table format

All frontend data requests must go through `/api/*` endpoints; no direct Snowflake connections are allowed from the frontend.

### 2.3 Application Environment

| Environment | Configuration |
|-------------|---------------|
| Local Development | http://localhost:8000 (backend) + http://localhost:3000 (frontend) |
| SPCS Deployment | OAuth via `/authorize` + `franchise_id` stored |
| Testing | Manual validation in Swagger |

### 2.4 Actors and Use Cases

| Actor | Use Case |
|-------|----------|
| Account Manager | View orders overview dashboard |
| Account Manager | View product performance metrics |
| Account Manager | View and search customer list |
| Account Manager | Toggle between light and dark mode |
| System | Authenticate user via Snowflake OAuth in SPCS |

---

## 3 API Requirements

### 3.1 General API Requirements

| ID | Requirement | Owner |
|----|-------------|-------|
| **API-01** | The API is built with Python 3.11+ and FastAPI | App Developer |
| **API-02** | The API connects to Snowflake using the snowflake-connector-python package. Connection parameters are loaded from environment variables – never hardcoded. | App Developer |
| **API-03** | When running inside SPCS, the API authenticates to Snowflake using the OAuth token at /snowflake/session/token. No username or password required. | App Developer |
| **API-04** | The Swagger documentation is accessible at /docs and describes every endpoint – parameters, response format, and example values. | App Developer |
| **API-05** | The API has a /health endpoint that returns the service status and confirms the Snowflake connection is working. | App Developer |
| **API-06** | All endpoints return JSON. Error responses include a descriptive message and an appropriate HTTP status code. | App Developer |

### 3.2 Endpoint Requirements

#### API-07 – Endpoint 1

| | |
|---|---|
| **Method and Path** | `GET /franchise/{franchise_id}/summary` |
| **Input Parameters** | `franchise_id` |
| **Expected Response Format** | `{ "franchise_id": 1, "total_revenue": 1284750.00, "total_orders": 8432, "active_customers": 1204, "date_range": {"start": "2022-01-01", "end": "2022-10-31"} }` |
| **Acceptance Criteria** | Returns a summary of the franchise: total revenue, total orders, number of active customers, and the date range of available data. |

#### API-08 – Endpoint 2

| | |
|---|---|
| **Method and Path** | `GET /franchise/{franchise_id}/orders?start=YYYY-MM-DD&end=YYYY-MM-DD` |
| **Input Parameters** | `start_date`, `end_date` |
| **Expected Response Format** | `[ {"month": "2022-01", "order_count": 842, "revenue": 128450.00}, {"month": "2022-02", "order_count": 910, "revenue": 141230.00} ]` |
| **Acceptance Criteria** | Returns order volume and revenue grouped by month for the specified date range. |

#### API-09 – Endpoint 3

| | |
|---|---|
| **Method and Path** | `GET /franchise/{franchise_id}/products?start=YYYY-MM-DD&end=YYYY-MM-DD` |
| **Input Parameters** | `start_date`, `end_date` |
| **Expected Response Format** | `[ {"product_name": "Widget A", "category": "Electronics", "units_sold": 342, "revenue": 24300.00}, {"product_name": "Gadget B", "category": "Electronics", "units_sold": 290, "revenue": 19850.00} ]` |
| **Acceptance Criteria** | Returns the top 10 products by revenue for the franchise in the specified date range. |

#### API-10 – Endpoint 4

| | |
|---|---|
| **Method and Path** | `GET /franchise/{franchise_id}/customers?start=YYYY-MM-DD&end=YYYY-MM-DD` |
| **Input Parameters** | `start_date`, `end_date` |
| **Expected Response Format** | `[ {"customer_id": 1001, "first_name": "Ana", "last_name": "García", "country": "Mexico", "total_orders": 14, "total_spent": 4320.00}, {"customer_id": 1042, "first_name": "John", "last_name": "Smith", "country": "USA", "total_orders": 11, "total_spent": 3890.00} ]` |
| **Acceptance Criteria** | Returns the top 20 customers by revenue for the franchise in the specified date range. |

#### API-11 – Endpoint 5

| | |
|---|---|
| **Method and Path** | `GET /franchise/{franchise_id}/countries?start=YYYY-MM-DD&end=YYYY-MM-DD` |
| **Input Parameters** | `start_date`, `end_date` |
| **Expected Response Format** | `[ {"country": "Mexico", "order_count": 842, "revenue": 128450.00}, {"country": "USA", "order_count": 910, "revenue": 141230.00} ]` |
| **Acceptance Criteria** | Returns revenue grouped by country for the franchise in the specified date range. |

---

## 4 Frontend Requirements

### 4.1 General Frontend Requirements

| ID | Requirement | Owner |
|----|-------------|-------|
| **FE-01** | The frontend is built with React 18. | App Developer |
| **FE-02** | The frontend calls the backend API via `/api/*` — never directly to the Snowflake endpoint. | App Developer |
| **FE-03** | When running inside SPCS, the frontend uses the Snowflake OAuth flow (/authorize endpoint) to authenticate the user and store the `franchise_id`. | App Developer |
| **FE-04** | All data fetching shows a loading state. If the API returns an error, the user sees a friendly message – not a blank screen or a JSON error. | App Developer |
| **FE-05** | The app has a navigation bar with links to all three views and a service status indicator (using the /health endpoint). | App Developer |
| **FE-06** | The app has a dark mode toggle that persists the user's preference. | App Developer |

### 4.2 View Requirements

#### FE-07 – View 1

| | |
|---|---|
| **Name** | Orders Overview |
| **Purpose** | Overview of revenue and orders by date |
| **Components Required** | Stat cards, bar/line charts |
| **Acceptance Criteria** | Shows total revenue and total orders for the selected date range as stat cards at the top.<br><br>Shows a bar or line chart of monthly revenue over time.<br><br>Shows a bar chart of revenue by country.<br><br>Has a date range filter (start date, end date) with an Apply button. |

#### FE-08 – View 2

| | |
|---|---|
| **Name** | Product Performance |
| **Purpose** | Focus on expanding product data |
| **Components Required** | Bar chart, table |
| **Acceptance Criteria** | Shows a bar chart of the top 10 products by revenue.<br><br>Shows a table with product name, category, units sold, and revenue.<br><br>Has the same date range filter as View 1. |

#### FE-09 – View 3

| | |
|---|---|
| **Name** | Customer List |
| **Purpose** | Focus on expanding customer data |
| **Components Required** | Table |
| **Acceptance Criteria** | Shows a table of the top 20 customers by revenue with name, country, order count, and total spent.<br><br>Rows are sortable by any column.<br><br>Has the same date range filter as View 1. |

---

## 5 Sign-Off

| Role | Signature | Date |
|------|-----------|------|
| App Consultant | Kylie Fuerbacher | 8/24/26 |
| App Developer | Gillian Shields | 8/24/26 |

