import { useState } from 'react'

/**
 * LoginForm
 * Props:
 *   onSubmit({ email, password }) – placeholder; wire to auth API
 *   onSwitchToOTP()               – switch to OTP tab
 *   isLoading                     – boolean
 */
export default function LoginForm({ onSubmit, isLoading }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [errors,   setErrors]   = useState({})

  const validate = () => {
    const e = {}
    if (!email || !email.includes('@'))      e.email    = 'Please enter a valid email address.'
    if (!password || password.length < 6)    e.password = 'Password must be at least 6 characters.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    if (!validate()) return
    onSubmit && onSubmit({ email, password })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className={`form-group${errors.email ? ' has-error' : ''}`}>
        <label>Email Address <span className="required-mark">*</span></label>
        <input
          type="email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <div className="error-msg">{errors.email}</div>
      </div>

      <div className={`form-group${errors.password ? ' has-error' : ''}`}>
        <label>Password <span className="required-mark">*</span></label>
        <div className="password-input">
          <input
            type={showPass ? 'text' : 'password'} value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
          <span className="toggle-password" onClick={() => setShowPass((v) => !v)}>
            {showPass ? '🙈' : '👁'}
          </span>
        </div>
        <div className="error-msg">{errors.password}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--gray-600)', cursor: 'pointer' }}>
          <input type="checkbox" style={{ width: 'auto', accentColor: 'var(--blue-600)' }} /> Remember me
        </label>
        <a href="#" style={{ fontSize: 14, color: 'var(--blue-600)', fontWeight: 600 }}>Forgot password?</a>
      </div>

      <button className="btn-primary btn-full" type="submit" disabled={isLoading}>
        {isLoading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}
