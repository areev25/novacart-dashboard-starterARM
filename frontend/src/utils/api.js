/**
 * api.js — NovaCart Dashboard API client
 *
 * All API calls go through this file.
 * In SPCS, REACT_APP_BACKEND_URL is set to /api and calls are
 * routed through the NGINX router to the backend container.
 * Locally, calls go directly to http://localhost:8000.
 */

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

function extractFriendlyErrorMessage(err, status) {
  if (!err) return `An unexpected network or server error occurred (Status ${status || 'unknown'}).`;
  
  // If detail is an array (FastAPI validation error format)
  if (Array.isArray(err.detail)) {
    try {
      const messages = err.detail.map(d => {
        const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : '';
        const msg = d.msg || 'invalid value';
        return field ? `"${field}" ${msg}` : msg;
      });
      return `Validation Error: ${messages.join('. ')}`;
    } catch (e) {
      return 'The request contains invalid parameters. Please check your inputs.';
    }
  }

  // If detail is a string
  if (typeof err.detail === 'string') {
    // If it contains database syntax errors, do not dump raw SQL to users
    const lowerDetail = err.detail.toLowerCase();
    if (lowerDetail.includes('syntax') || lowerDetail.includes('database') || lowerDetail.includes('sql') || lowerDetail.includes('sqlite') || lowerDetail.includes('snowflake')) {
      return 'A database query error occurred. Please contact the administrator.';
    }
    return err.detail;
  }

  // If there's a general error message
  if (err.message && typeof err.message === 'string') {
    return err.message;
  }

  return `An unexpected server error occurred (Status ${status || 'unknown'}).`;
}

async function apiFetch(path) {
  try {
    const res = await fetch(`${BACKEND_URL}${path}`);
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      const friendlyMsg = extractFriendlyErrorMessage(err, res.status);
      throw new Error(friendlyMsg);
    }
    return await res.json();
  } catch (err) {
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error('Could not connect to the server. Please verify that the backend API is running.');
    }
    throw err;
  }
}

export async function authorize()       { return apiFetch('/authorize'); }
export async function getHealth()       { return apiFetch('/health'); }
export async function getSummary(s, e)  { return apiFetch(`/franchise/summary?start=${s}&end=${e}`); }
export async function getOrders(s, e)   { return apiFetch(`/franchise/orders?start=${s}&end=${e}`); }
export async function getProducts(s, e, city = '') { return apiFetch(`/franchise/products?start=${s}&end=${e}${city ? `&city=${encodeURIComponent(city)}` : ''}`); }
export async function getCustomers(s, e, city = '') { return apiFetch(`/franchise/customers?start=${s}&end=${e}${city ? `&city=${encodeURIComponent(city)}` : ''}`); }
export async function getCustomerOrders(id, s, e)   { return apiFetch(`/franchise/customers/${id}/orders?start=${s}&end=${e}`); }
export async function getCustomerAddresses(id)      { return apiFetch(`/franchise/customers/${id}/addresses`); }
export async function getCities(s, e)               { return apiFetch(`/franchise/cities?start=${s}&end=${e}`); }
