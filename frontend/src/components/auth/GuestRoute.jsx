import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

/**
 * GuestRoute — only for /login and /register
 *
 * Checks localStorage directly (not React auth state) to decide
 * whether the user is logged in. This avoids the race condition
 * where logout() clears localStorage synchronously but React's
 * setAuth() hasn't flushed yet, causing auth.token to appear
 * truthy for one extra render cycle.
 */
export default function GuestRoute({ children }) {

  const { auth } = useAuth()

  // Still doing the initial localStorage read — show nothing yet
  if (auth.isLoading) return null

  // Check localStorage directly — this is always up-to-date even
  // if React state hasn't caught up yet after a logout() call
  const liveToken = localStorage.getItem('token')
  const liveRole  = localStorage.getItem('role')

  if (liveToken && liveRole) {
    const dashboard = liveRole === 'tutor' ? '/tutor/dashboard' : '/student/dashboard'
    return <Navigate to={dashboard} replace />
  }

  // Not logged in — show login or register
  return children
}