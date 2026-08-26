import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../utils/ThemeContext';
import ServiceStatus from './ServiceStatus';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dark, toggle } = useTheme();

  const links = [
    { label: '📊 Orders',    path: '/orders'    },
    { label: '📦 Products',  path: '/products'  },
    { label: '👤 Customers', path: '/customers' },
  ];

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', height: 56,
      background: dark ? '#0D1B2A' : '#0D2B4E',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
           onClick={() => navigate('/')}>
        <span style={{ fontSize: 20 }}>🛒</span>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>NovaCart</span>
        <span style={{ color: '#4DB6AC', fontSize: 12, marginLeft: 4 }}>Dashboard</span>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {links.map(({ label, path }) => {
          const active = location.pathname === path;
          return (
            <button key={path} onClick={() => navigate(path)}
              aria-current={active ? 'page' : undefined}
              style={{
                background: active ? 'rgba(77,182,172,0.2)' : 'transparent',
                border: active ? '1px solid #4DB6AC' : '1px solid transparent',
                color: active ? '#4DB6AC' : '#CFD8DC',
                borderRadius: 6, padding: '4px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              }}>
              {label}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <ServiceStatus />
        <button onClick={toggle} title={dark ? 'Light mode' : 'Dark mode'}
          style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 16,
          }}>
          {dark ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  );
}
