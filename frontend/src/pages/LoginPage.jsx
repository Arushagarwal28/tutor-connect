import { apiUrl } from '../api.js'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import LogoIcon     from '../components/common/LogoIcon.jsx'
import LoginForm    from '../components/auth/LoginForm.jsx'
import OTPLoginForm from '../components/auth/OTPLoginForm.jsx'

// NOTE: No need for the "already signed in" check here anymore.
// GuestRoute in App.jsx redirects logged-in users BEFORE this page
// even mounts — so if this component is rendering, the user is
// definitively NOT logged in.

export default function LoginPage() {

  const navigate        = useNavigate()
  const { login }       = useAuth()

  const [method,    setMethod]    = useState('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error,     setError]     = useState('')


  // ════════════════════════════════════════════════════
  // EMAIL LOGIN
  // ════════════════════════════════════════════════════
  const handleEmailLogin = async ({ email, password }) => {
    try {
      setIsLoading(true)
      setError('')

      const response = await fetch(apiUrl('/api/auth/login'), {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Login failed. Please try again.')
        setIsLoading(false)
        return
      }

      // Save to context + localStorage
      login(data)

      // Navigate to correct dashboard
      navigate(
        data.role === 'tutor' ? '/tutor/dashboard' : '/student/dashboard',
        { replace: true }
      )

    } catch (err) {
      console.error(err)
      setError('Could not connect to the server. Please try again.')
      setIsLoading(false)
    }
  }


  // ════════════════════════════════════════════════════
  // OTP LOGIN (stub — Step 9)
  // ════════════════════════════════════════════════════
  const handleSendOTP   = (mobile) => { console.log('Send OTP to', mobile) }
  const handleVerifyOTP = (mobile, otp) => { console.log('Verify OTP', mobile, otp) }


  return (
    <div className="auth-split">

      {/* ── Left visual panel ───────────────────────── */}
      <div className="auth-visual">
        <div className="auth-visual-decoration" />
        <div className="auth-visual-content">

          <Link to="/" className="logo" style={{
            color:'white', justifyContent:'center', marginBottom:40,
            display:'flex', gap:10, alignItems:'center', textDecoration:'none',
          }}>
            <LogoIcon size={32} />
            <span style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700 }}>
              TutorConnect
            </span>
          </Link>

          <h2>Welcome back to<br />your learning journey</h2>

          <p>
            Sign in to connect with expert tutors,
            track your progress, and achieve your academic goals.
          </p>

          <div className="auth-visual-cards">
            {[
              { dot:'#4ade80', text:'🎓 Trusted by 12,000+ students across India' },
              { dot:'#facc15', text:'✅ 3,500+ Verified Tutors ready to teach' },
              { dot:'#a78bfa', text:'📍 Find tutors within your radius instantly' },
            ].map(c => (
              <div key={c.text} className="avc">
                <div className="avc-dot" style={{ background:c.dot }} />
                <p>{c.text}</p>
              </div>
            ))}
          </div>

        </div>
      </div>


      {/* ── Right auth panel ────────────────────────── */}
      <div className="auth-side">
        <div className="auth-side-inner">

          <Link to="/" className="logo" style={{ marginBottom:32, display:'flex', alignItems:'center', gap:8 }}>
            <LogoIcon size={24} />
            <span style={{ fontSize:16, fontFamily:"'Sora',sans-serif", fontWeight:700, color:'var(--gray-900)' }}>
              TutorConnect
            </span>
          </Link>

          <h1 style={{ fontSize:28, fontWeight:700, marginBottom:6, color:'var(--gray-900)' }}>
            Sign In
          </h1>
          <p style={{ color:'var(--gray-500)', fontSize:14, marginBottom:28 }}>
            Access your student or tutor dashboard
          </p>

          {/* Method tabs */}
          <div className="login-method-tabs">
            <div
              className={`method-tab${method === 'email' ? ' active' : ''}`}
              onClick={() => { setMethod('email'); setError('') }}
            >
              Email & Password
            </div>
            <div
              className={`method-tab${method === 'otp' ? ' active' : ''}`}
              onClick={() => { setMethod('otp'); setError('') }}
            >
              Mobile OTP
            </div>
          </div>

          {/* Inline error */}
          {error && (
            <div style={{
              background:'#fef2f2', border:'1px solid #fecaca',
              borderRadius:'var(--radius-md)', padding:'12px 16px',
              marginBottom:16, fontSize:14, color:'#dc2626',
              display:'flex', alignItems:'center', gap:8,
            }}>
              ⚠️ {error}
            </div>
          )}

          {method === 'email'
            ? <LoginForm onSubmit={handleEmailLogin} isLoading={isLoading} />
            : <OTPLoginForm onSendOTP={handleSendOTP} onVerifyOTP={handleVerifyOTP} isLoading={isLoading} />
          }

          <div className="auth-divider"><span>or continue with</span></div>

          <button style={{
            width:'100%', padding:12, border:'1.5px solid var(--gray-200)',
            borderRadius:'var(--radius-md)', display:'flex', alignItems:'center',
            justifyContent:'center', gap:10, fontSize:14, fontWeight:600,
            color:'var(--gray-700)', cursor:'pointer', background:'white',
          }}>
            Continue with Google
          </button>

          <p className="auth-link">
            Don&apos;t have an account? <Link to="/register">Create Account</Link>
          </p>

        </div>
      </div>

    </div>
  )
}