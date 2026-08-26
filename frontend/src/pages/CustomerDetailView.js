import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getCustomerOrders, getCustomerAddresses } from '../utils/api';

function formatCurrency(value) {
  if (!value) return '$0';
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function statusBadge(status) {
  const colours = {
    delivered: { bg: '#E8F5E9', color: '#2E7D32' },
    shipped:   { bg: '#E3F2FD', color: '#1565C0' },
    pending:   { bg: '#FFF8E1', color: '#F57F17' },
    cancelled: { bg: '#FFEBEE', color: '#C62828' },
  };
  const s = colours[status] || { bg: 'var(--bg-primary)', color: 'var(--text-muted)' };
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>
      {status}
    </span>
  );
}

export default function CustomerDetailView() {
  const { customer_id } = useParams();
  const navigate = useNavigate();

  const [startDate,  setStartDate]  = useState('2022-01-01');
  const [endDate,    setEndDate]    = useState('2022-12-31');
  const [orders,     setOrders]     = useState([]);
  const [addresses,  setAddresses]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [o, a] = await Promise.all([
        getCustomerOrders(customer_id, startDate, endDate),
        getCustomerAddresses(customer_id),
      ]);
      setOrders(o);
      setAddresses(a);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const currentAddress = addresses.find(a => a.is_current);
  const totalSpent = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="page">

        {/* ── Back + header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => navigate('/customers')} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13 }}>
            ← Back
          </button>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Customer Detail</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>ID: {customer_id}</div>
          </div>
        </div>

        {/* ── Date filter ── */}
        <div className="filter-bar">
          <label htmlFor="detail-start-date">From</label>
          <input id="detail-start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <label htmlFor="detail-end-date">To</label>
          <input id="detail-end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <button className="btn-apply" onClick={loadData}>Apply</button>
        </div>

        {error && (
          <div role="alert" style={{ color: '#C62828', padding: 16, background: '#FFEBEE', borderRadius: 8, marginBottom: 16 }}>
            Error: {error}
          </div>
        )}

        {loading && <div role="status" className="loading">Loading customer data…</div>}

        {!loading && !error && (
          <>
            {/* ── Stat row ── */}
            <div className="stat-row">
              <div className="stat-box">
                <div className="label">Total Orders</div>
                <div className="value">{orders.length}</div>
              </div>
              <div className="stat-box">
                <div className="label">Total Spent</div>
                <div className="value">{formatCurrency(totalSpent)}</div>
              </div>
              {currentAddress && (
                <div className="stat-box">
                  <div className="label">Current Location</div>
                  <div className="value" style={{ fontSize: 16 }}>{currentAddress.addr_city}, {currentAddress.addr_state}</div>
                </div>
              )}
            </div>

            <div className="grid-2">

              {/* ── Order history ── */}
              <div className="card">
                <div className="section-title" style={{ marginBottom: 16 }}>Order History</div>
                {orders.length === 0 ? (
                  <div className="loading" style={{ height: 100 }}>No orders in this date range</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr>
                        {['Date', 'Product', 'Category', 'Qty', 'Amount', 'Status'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--text-muted)', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o, i) => (
                        <tr key={o.order_id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-primary)' }}>
                          <td style={{ padding: '10px 10px', color: 'var(--text-secondary)' }}>{o.order_date}</td>
                          <td style={{ padding: '10px 10px', color: 'var(--text-primary)' }}>{o.product_name}</td>
                          <td style={{ padding: '10px 10px', color: 'var(--text-secondary)' }}>{o.category}</td>
                          <td style={{ padding: '10px 10px', color: 'var(--text-secondary)' }}>{o.quantity}</td>
                          <td style={{ padding: '10px 10px', color: 'var(--text-primary)', fontWeight: 600 }}>{formatCurrency(o.amount)}</td>
                          <td style={{ padding: '10px 10px' }}>{statusBadge(o.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* ── Address history ── */}
              <div className="card">
                <div className="section-title" style={{ marginBottom: 16 }}>Address History</div>
                {addresses.length === 0 ? (
                  <div className="loading" style={{ height: 100 }}>No address records found</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr>
                        {['Street', 'City', 'State', 'Zip', 'From', 'To', 'Current'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--text-muted)', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border)' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {addresses.map((a, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: a.is_current ? 'rgba(0,137,123,0.06)' : 'transparent' }}>
                          <td style={{ padding: '10px 10px', color: 'var(--text-primary)' }}>{a.addr_street}</td>
                          <td style={{ padding: '10px 10px', color: 'var(--text-secondary)' }}>{a.addr_city}</td>
                          <td style={{ padding: '10px 10px', color: 'var(--text-secondary)' }}>{a.addr_state}</td>
                          <td style={{ padding: '10px 10px', color: 'var(--text-secondary)' }}>{a.addr_zip}</td>
                          <td style={{ padding: '10px 10px', color: 'var(--text-secondary)' }}>{a.valid_from}</td>
                          <td style={{ padding: '10px 10px', color: 'var(--text-secondary)' }}>{a.valid_to || '—'}</td>
                          <td style={{ padding: '10px 10px' }}>
                            {a.is_current ? <span style={{ color: '#00897B', fontWeight: 600 }}>✓</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
