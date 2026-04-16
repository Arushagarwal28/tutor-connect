// ─────────────────────────────────────────────────────────────────────────────
// src/api.js
//
// In development  : VITE_API_URL is empty → fetch('/api/...') → Vite proxy → :5000
// In production   : set VITE_API_URL=https://api.yourserver.com in host env vars
//                   → fetch('https://api.yourserver.com/api/...')
//
// Usage:
//   import { apiUrl } from '../api.js'
//   fetch(apiUrl('/api/auth/login'), { ... })
// ─────────────────────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_URL || ''

/**
 * Prepend the API base URL to a path.
 * @param {string} path  Must start with /  e.g. '/api/auth/login'
 */
export function apiUrl(path) {
  return `${BASE}${path}`
}