/**
 * CustomersView.js — Customer List page
 *
 * This page shows:
 *   - A sortable table of top 20 customers by revenue
 *   - Columns: Name | City | State | Orders | Total Spent
 *   - A date range filter
 *
 * The data fetching is already wired up.
 * Your job: implement the UI and the sorting logic.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getCustomers, getCities } from '../utils/api';

function formatCurrency(value) {
  if (!value) return '$0';
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CustomersView() {
  const navigate = useNavigate();
  const [startDate,  setStartDate]  = useState('2022-01-01');
  const [endDate,    setEndDate]    = useState('2022-12-31');
  const [city,       setCity]       = useState('');
  const [cities,     setCities]     = useState([]);
  const [customers,  setCustomers]  = useState([]);
  const [sortBy,     setSortBy]     = useState('total_spent');
  const [sortDir,    setSortDir]    = useState('desc');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    getCities(startDate, endDate).then(setCities).catch(() => {});
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomers(startDate, endDate, city);
      setCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Sort handler — toggles direction if same column, resets to desc if new column
  function handleSort(column) {
    if (sortBy === column) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('desc');
    }
  }

  // Apply sort to customers array
  const sorted = [...customers].sort((a, b) => {
    const va = a[sortBy], vb = b[sortBy];
    if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va;
    return sortDir === 'asc'
      ? String(va).localeCompare(String(vb))
      : String(vb).localeCompare(String(va));
  });

  // Sort indicator helper
  const sortIcon = (col) => sortBy === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="page">

        <div className="filter-bar">
          <label htmlFor="customers-start-date">From</label>
          <input id="customers-start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <label htmlFor="customers-end-date">To</label>
          <input id="customers-end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <button className="btn-apply" onClick={loadData}>Apply</button>
          <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 8px' }} />
          <label htmlFor="customers-city">City</label>
          <select id="customers-city" value={city} onChange={e => setCity(e.target.value)} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 13 }}>
            <option value="">All Cities</option>
            {cities.map(c => (
              <option key={c.city} value={c.city}>{c.city}, {c.state}</option>
            ))}
          </select>
          <button className="btn-apply" onClick={loadData}>Apply</button>
          <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>
            {customers.length} customers
          </span>
        </div>

        {error && (
          <div role="alert" style={{ color: '#C62828', padding: 16, background: '#FFEBEE', borderRadius: 8, marginBottom: 16 }}>
            Error: {error}
          </div>
        )}

        {loading && <div role="status" className="loading">Loading customers…</div>}

        {!loading && !error && (
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>
              Top Customers by Revenue
            </div>

            {/*
              STEP 1 — Sortable table
              sorted is: [{ customer_id, name, city, state, total_orders, total_spent }]

              Build a table with these columns:
                Name | City | State | Orders | Total Spent

              Each column header should be clickable and call handleSort(columnName).
              Use sortIcon(columnName) to show ↑ or ↓ on the active sort column.

              Hint: use a standard HTML <table> with <thead> and <tbody>.
              Style alternating rows with different background colors.
              Format total_spent with formatCurrency().
            */}

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  {[
                    { label: 'Name',        key: 'name'         },
                    { label: 'City',        key: 'city'         },
                    { label: 'State',       key: 'state'        },
                    { label: 'Orders',      key: 'total_orders' },
                    { label: 'Total Spent', key: 'total_spent'  },
                  ].map(({ label, key }) => (
                    <th key={key} onClick={() => handleSort(key)} style={{ textAlign: 'left', padding: '8px 10px', color: sortBy === key ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)', cursor: 'pointer', userSelect: 'none' }}>
                      {label}{sortIcon(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((c, i) => (
                  <tr key={c.customer_id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-primary)' }}>
                    <td style={{ padding: '10px 10px' }}>
                      <span
                        tabIndex={0}
                        onClick={() => navigate(`/customers/${c.customer_id}`)}
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && navigate(`/customers/${c.customer_id}`)}
                        style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }}>
                        {c.name}
                      </span>
                    </td>
                    <td style={{ padding: '10px 10px', color: 'var(--text-secondary)' }}>{c.city}</td>
                    <td style={{ padding: '10px 10px', color: 'var(--text-secondary)' }}>{c.state}</td>
                    <td style={{ padding: '10px 10px', color: 'var(--text-secondary)' }}>{c.total_orders}</td>
                    <td style={{ padding: '10px 10px', color: 'var(--text-primary)', fontWeight: 600 }}>{formatCurrency(c.total_spent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        )}
      </div>
    </div>
  );
}
