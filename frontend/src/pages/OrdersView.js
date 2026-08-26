/**
 * OrdersView.js — Orders Overview page
 *
 * This page shows:
 *   - Stat cards: total revenue, total orders, unique customers
 *   - A bar/line chart of monthly revenue over time
 *   - A bar chart of revenue by city/state
 *   - A date range filter
 *
 * The data fetching is already wired up.
 * Your job: implement the UI — charts, stat cards, and layout.
 *
 * Useful libraries already installed:
 *   - recharts: BarChart, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer
 */

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Navbar from '../components/Navbar';
import { getSummary, getOrders, getCities } from '../utils/api';
import { exportToExcel } from '../utils/exportToExcel';

export default function OrdersView() {
  const [startDate, setStartDate] = useState('2022-01-01');
  const [endDate,   setEndDate]   = useState('2022-12-31');
  const [summary,   setSummary]   = useState(null);
  const [orders,    setOrders]    = useState([]);
  const [cities,    setCities]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [s, o, c] = await Promise.all([
        getSummary(startDate, endDate),
        getOrders(startDate, endDate),
        getCities(startDate, endDate),
      ]);
      setSummary(s);
      setOrders(o);
      setCities(c);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="page">

        {/* ── Filter bar ─────────────────────────────────────────────────── */}
        <div className="filter-bar">
          <label htmlFor="orders-start-date">From</label>
          <input id="orders-start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <label htmlFor="orders-end-date">To</label>
          <input id="orders-end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <button className="btn-apply" onClick={loadData}>Apply</button>
          <button className="btn-apply"
            aria-label="Export orders data to Excel"
            style={{ marginLeft: 'auto', background: 'var(--blue)' }}
            onClick={() => exportToExcel(`orders_${startDate}_${endDate}`, [
              { sheetName: 'Monthly Revenue', rows: orders },
              { sheetName: 'Revenue by City', rows: cities },
            ])}>
            Export Excel
          </button>
        </div>

        {/* ── Error state ────────────────────────────────────────────────── */}
        {error && (
          <div role="alert" style={{ color: '#C62828', padding: 16, background: '#FFEBEE', borderRadius: 8, marginBottom: 16 }}>
            Error: {error}
          </div>
        )}

        {/* ── Loading state ──────────────────────────────────────────────── */}
        {loading && <div role="status" className="loading">Loading orders data…</div>}

        {/* ── TODO: Build the UI here ────────────────────────────────────── */}
        {!loading && !error && (
          <>
            {/*
              STEP 1 — Stat cards
              Show total_revenue, total_orders, unique_customers from summary.
              Hint: use the .stat-row and .stat-box CSS classes.
              Available data: summary.total_revenue, summary.total_orders, summary.unique_customers
            */}
            <div className="stat-row">
              <div className="stat-box">
                <div className="label">Total Revenue</div>
                <div className="value">
                  ${Number(summary.total_revenue).toLocaleString()}
                </div>
              </div>
              <div className="stat-box">
                <div className="label">Total Orders</div>
                <div className="value">{summary.total_orders}</div>
              </div>
              <div className="stat-box">
                <div className="label">Unique Customers</div>
                <div className="value">{summary.unique_customers}</div>
              </div>
            </div>

            {/*
              STEP 2 — Monthly revenue chart
              orders is an array of: { month, month_name, order_count, revenue }
              Use a BarChart or LineChart from recharts.
              Hint: XAxis dataKey="month_name", Bar dataKey="revenue"
            */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="section-title" style={{ marginBottom: 16 }}>Monthly Revenue</div>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={orders} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month_name" />
                  <YAxis />
                  <Tooltip labelStyle={{ color: '#1A2332' }} />
                  <Bar dataKey="revenue" fill="var(--chart-color)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/*
              STEP 3 — Revenue by city chart
              cities is an array of: { city, state, order_count, revenue }
              Use a horizontal BarChart (layout="vertical").
              Show top 10 cities only.
              Hint: .slice(0, 10) on cities array
            */}
            <div className="card">
              <div className="section-title" style={{ marginBottom: 16 }}>Revenue by City</div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={cities.slice(0, 10)} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="city" />
                  <Tooltip labelStyle={{ color: '#1A2332' }} />
                  <Bar dataKey="revenue" fill="var(--chart-color)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
