import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import LogoIcon from '../components/common/LogoIcon.jsx'

/**
 * NotFoundPage
 *
 * Shown for any route that doesn't match (replaces the silent
 * Navigate to="/" fallback in App.jsx).
 */
export default function NotFoundPage() {
  const navigate    = useNavigate()
  const { auth }    = useAuth()

  const dashboardPath =
    auth.role === 'tutor'   ? '/tutor/dashboard' :
    auth.role === 'student' ? '/student/dashboard' : null

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--gray-50)',
    }}>

      {/* Minimal header */}
      <header style={{
        padding: '20px 32px',
        borderBottom: '1px solid var(--gray-100)',
        background: 'white',
      }}>
        <Link
          to="/"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            textDecoration: 'none',
          }}
        >
          <LogoIcon size={24} />
          <span style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 700,
            fontSize: 16,
            color: 'var(--gray-900)',
          }}>
            TutorConnect
          </span>
        </Link>
      </header>

      {/* Main content */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
      }}>

        {/* Large 404 */}
        <div style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 'clamp(80px, 15vw, 140px)',
          fontWeight: 800,
          lineHeight: 1,
          background: 'linear-gradient(135deg, var(--blue-600), #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 8,
          userSelect: 'none',
        }}>
          404
        </div>

        {/* Emoji */}
        <div style={{ fontSize: 48, marginBottom: 20 }}>🔍</div>

        {/* Heading */}
        <h1 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 'clamp(20px, 4vw, 28px)',
          fontWeight: 800,
          color: 'var(--gray-900)',
          marginBottom: 12,
        }}>
          Page not found
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 15,
          color: 'var(--gray-500)',
          maxWidth: 380,
          lineHeight: 1.7,
          marginBottom: 36,
        }}>
          The page you're looking for doesn't exist or may have been moved.
          Let's get you back on track.
        </p>

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <Link
            to="/"
            style={{
              padding: '12px 28px',
              background: 'var(--blue-600)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 15,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ← Home
          </Link>

          {dashboardPath ? (
            <Link
              to={dashboardPath}
              style={{
                padding: '12px 28px',
                background: 'white',
                color: 'var(--gray-700)',
                border: '1.5px solid var(--gray-200)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 15,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              My Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              style={{
                padding: '12px 28px',
                background: 'white',
                color: 'var(--gray-700)',
                border: '1.5px solid var(--gray-200)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 15,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Sign In
            </Link>
          )}

          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '12px 28px',
              background: 'transparent',
              color: 'var(--gray-500)',
              border: '1.5px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ← Go Back
          </button>
        </div>

      </main>

      {/* Footer note */}
      <footer style={{
        padding: '20px',
        textAlign: 'center',
        fontSize: 13,
        color: 'var(--gray-400)',
        borderTop: '1px solid var(--gray-100)',
        background: 'white',
      }}>
        © {new Date().getFullYear()} TutorConnect. All rights reserved.
      </footer>

    </div>
  )
}