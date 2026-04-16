import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

/**
 * ProtectedRoute
 *
 * Protects dashboard routes from unauthenticated access.
 *
 * If not logged in       → redirect to / (home, not /login)
 * If wrong role          → redirect to their own dashboard
 * If still loading       → render nothing (prevents flash-redirect on refresh)
 * If all good            → render the page
 *
 * Why redirect to / instead of /login?
 *   Consistency with logout behaviour. After logout the user lands on /
 *   (the landing page). If they then try to access a protected route
 *   they get sent back to / again. They can choose to click Sign In
 *   from there. This avoids the double-redirect pattern
 *   (/ → /login → /student/dashboard) when they do log in.
 */
export default function ProtectedRoute({ children, allowedRole }) {

  const { auth } = useAuth()

  // Still rehydrating localStorage — render nothing yet
  if (auth.isLoading) return null

  // Not logged in → home page
  if (!auth.token) {
    return <Navigate to="/" replace />
  }

  // Wrong role → their own dashboard
  if (allowedRole && auth.role !== allowedRole) {
    const redirect = auth.role === 'tutor' ? '/tutor/dashboard' : '/student/dashboard'
    return <Navigate to={redirect} replace />
  }

  return children
}