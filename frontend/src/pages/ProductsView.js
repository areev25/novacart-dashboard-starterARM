/**
 * ProductsView.js — Product Performance page
 *
 * This page shows:
 *   - A bar chart of top 10 products by revenue
 *   - A table with product name, category, units sold, and revenue
 *   - A date range filter
 *
 * The data fetching is already wired up.
 * Your job: implement the UI.
 */

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';
import { getProducts } from '../utils/api';

// Format currency helper
function formatCurrency(value) {
  if (!value) return '$0';
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000)    return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(2)}`;
}

export default function ProductsView() {
  const [startDate, setStartDate] = useState('2022-01-01');
  const [endDate,   setEndDate]   = useState('2022-12-31');
  const [products,  setProducts]  = useState([]);
  const [sortDir,   setSortDir]   = useState('desc');
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const sorted = [...products].sort((a, b) =>
    sortDir === 'desc' ? b.revenue - a.revenue : a.revenue - b.revenue
  );

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts(startDate, endDate);
      setProducts(data);
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

        <div className="filter-bar">
          <label>From</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <label>To</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <button className="btn-apply" onClick={loadData}>Apply</button>
        </div>

        {error && (
          <div style={{ color: '#C62828', padding: 16, background: '#FFEBEE', borderRadius: 8, marginBottom: 16 }}>
            Error: {error}
          </div>
        )}

        {loading && <div className="loading">Loading products data…</div>}

        {!loading && !error && (
          <div className="grid-2">

            {/*
              STEP 1 — Top products bar chart
              products is: [{ product_id, name, category, units_sold, revenue }]
              Use a horizontal BarChart (layout="vertical").
              XAxis type="number", YAxis type="category" dataKey="name"
              Hint: truncate long product names to 20 chars
            */}
            <div className="card">
              <div className="section-title" style={{ marginBottom: 16 }}>Top 10 Products by Revenue</div>
              <ResponsiveContainer width="100%" height={420}>
                <BarChart data={products} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#00897B" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/*
              STEP 2 — Products table
              Show all products in a table: Name | Category | Units Sold | Revenue
              Hint: use an HTML table or build with divs.
              Format revenue with the formatCurrency helper above.
            */}
            <div className="card">
              <div className="section-title" style={{ marginBottom: 16 }}>Product Details</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr>
                    {['Name', 'Category', 'Units Sold'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--text-muted)', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>
                        {h}
                      </th>
                    ))}
                    <th
                      onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                      style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--accent)', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)', cursor: 'pointer', userSelect: 'none' }}
                    >
                      Revenue {sortDir === 'desc' ? '↓' : '↑'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(p => (
                    <tr key={p.product_id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 10px', color: 'var(--text-primary)' }}>{p.name}</td>
                      <td style={{ padding: '10px 10px', color: 'var(--text-secondary)' }}>{p.category}</td>
                      <td style={{ padding: '10px 10px', color: 'var(--text-secondary)' }}>{p.units_sold.toLocaleString()}</td>
                      <td style={{ padding: '10px 10px', color: 'var(--text-primary)', fontWeight: 600 }}>{formatCurrency(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
