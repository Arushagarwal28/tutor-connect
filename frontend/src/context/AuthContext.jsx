import { createContext, useContext, useState, useEffect, useCallback } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// AuthContext
//
// Provides the entire app with:
//   auth.user       – { id, name, email } | null
//   auth.token      – JWT string | null
//   auth.role       – "student" | "tutor" | null
//   auth.isLoading  – true while we check localStorage on first mount
//   auth.login()    – call after a successful API login/register response
//   auth.logout()   – clears everything and redirects to /login
//
// Usage anywhere in the app:
//   import { useAuth } from '../context/AuthContext'
//   const { auth, login, logout } = useAuth()
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext(null)

// Keys we write to localStorage — defined once so there's no typo risk
const LS_TOKEN = 'token'
const LS_ROLE  = 'role'
const LS_NAME  = 'userName'
const LS_ID    = 'userId'
const LS_EMAIL = 'userEmail'


export function AuthProvider({ children }) {

  const [auth, setAuth] = useState({
    user:      null,   // { id, name, email }
    token:     null,
    role:      null,
    isLoading: true,   // true until we've read localStorage on mount
  })


  // ── On first mount: rehydrate from localStorage ──────────────────────────
  // This runs once. It reads whatever was saved from a previous session
  // and puts it back into React state so the rest of the app is consistent.
  useEffect(() => {
    const token = localStorage.getItem(LS_TOKEN)
    const role  = localStorage.getItem(LS_ROLE)
    const name  = localStorage.getItem(LS_NAME)
    const id    = localStorage.getItem(LS_ID)
    const email = localStorage.getItem(LS_EMAIL)

    if (token && role) {
      setAuth({
        token,
        role,
        user: { id, name, email },
        isLoading: false,
      })
    } else {
      setAuth((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])


  // ── login(data) ──────────────────────────────────────────────────────────
  // Call this after a successful POST /api/auth/login or register response.
  //
  // data shape expected:
  //   { token: string, role: string, user?: { id, name, email } }
  //
  // This is the ONLY place in the app that writes to localStorage.
  const login = useCallback((data) => {
    const { token, role, user } = data

    // Write to localStorage for persistence across page refreshes
    localStorage.setItem(LS_TOKEN, token)
    localStorage.setItem(LS_ROLE,  role)
    if (user) {
      localStorage.setItem(LS_NAME,  user.name  || '')
      localStorage.setItem(LS_ID,    user.id    || '')
      localStorage.setItem(LS_EMAIL, user.email || '')
    }

    // Update React state — everything in the app will re-render accordingly
    setAuth({
      token,
      role,
      user: user || null,
      isLoading: false,
    })
  }, [])


  // ── logout() ─────────────────────────────────────────────────────────────
  // Clears localStorage and resets auth state.
  // Navigation to /login is handled by the caller (usually a dashboard page)
  // so that this function stays navigation-library-agnostic.
  const logout = useCallback(() => {
    localStorage.removeItem(LS_TOKEN)
    localStorage.removeItem(LS_ROLE)
    localStorage.removeItem(LS_NAME)
    localStorage.removeItem(LS_ID)
    localStorage.removeItem(LS_EMAIL)

    setAuth({
      user:      null,
      token:     null,
      role:      null,
      isLoading: false,
    })
  }, [])


  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}


// ── useAuth() ────────────────────────────────────────────────────────────────
// Custom hook — throws a helpful error if used outside <AuthProvider>
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth() must be used inside <AuthProvider>. Wrap your app in <AuthProvider> in main.jsx.')
  }
  return ctx
}