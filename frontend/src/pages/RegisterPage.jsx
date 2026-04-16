import { apiUrl } from '../api.js'
import { useState, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import LogoIcon            from '../components/common/LogoIcon.jsx'
import StudentRegisterForm from '../components/auth/StudentRegisterForm.jsx'
import TutorRegisterForm   from '../components/auth/TutorRegisterForm.jsx'
import { INDIAN_STATES }   from '../data/constants.js'

const STEP_LABELS = ['Choose Role', 'Profile Details', 'Account & Location']

// ── Helpers ──────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateEmail(email) {
  if (!email || !email.trim()) return 'Email address is required.'
  if (!EMAIL_RE.test(email.trim())) return 'Please enter a valid email address (e.g. you@example.com).'
  return ''
}

function validatePassword(password) {
  if (!password) return 'Password is required.'
  if (password.length < 8) return 'Password must be at least 8 characters.'
  return ''
}

function validateName(name) {
  if (!name || !name.trim()) return 'Full name is required.'
  if (name.trim().length < 2) return 'Name must be at least 2 characters.'
  return ''
}

export default function RegisterPage() {

  const navigate  = useNavigate()
  const { login } = useAuth()
  const [params]  = useSearchParams()

  const [step,           setStep]           = useState(1)
  const [selectedType,   setSelectedType]   = useState(params.get('type') === 'tutor' ? 'tutor' : null)
  const [isLoading,      setIsLoading]      = useState(false)
  const [error,          setError]          = useState('')
  const [fieldErrors,    setFieldErrors]    = useState({})
  const [mobileVerified, setMobileVerified] = useState(false)
  const [otpVisible,     setOtpVisible]     = useState(false)
  const [otp,            setOtp]            = useState(Array(6).fill(''))
  const otpRefs = useRef([])

  const [formData, setFormData] = useState({ subjects: [], boards: [] })
  const onChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field-level error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
  }
  const goToStep = (n) => { setError(''); setFieldErrors({}); setStep(n) }

  const handleOtpChange = (val, i) => {
    const next = [...otp]; next[i] = val.slice(-1); setOtp(next)
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
  }


  // ════════════════════════════════════════════════════════
  // STEP 3 FIELD-LEVEL VALIDATION
  // ════════════════════════════════════════════════════════
  const validateStep3 = () => {
    const errs = {}

    const nameErr = validateName(formData.name)
    if (nameErr) errs.name = nameErr

    const emailErr = validateEmail(formData.email)
    if (emailErr) errs.email = emailErr

    const passErr = validatePassword(formData.password)
    if (passErr) errs.password = passErr

    if (!formData.address || !formData.address.trim())
      errs.address = 'Address is required.'

    if (!formData.city || !formData.city.trim())
      errs.city = 'City is required.'

    if (!formData.state)
      errs.state = 'Please select your state.'

    if (selectedType === 'tutor' && !formData.qualification)
      errs.qualification = 'Please enter your qualification.'

    if (selectedType === 'student' && !formData.class)
      errs.class = 'Please select your class.'

    if (!formData.termsAccepted)
      errs.terms = 'You must accept the Terms of Service to continue.'

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }


  // ════════════════════════════════════════════════════════
  // SUBMIT
  // ════════════════════════════════════════════════════════
  const handleSubmit = async () => {
    if (!validateStep3()) {
      setError('Please fix the errors below before continuing.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      let endpoint = ''
      let payload  = {}

      if (selectedType === 'student') {
        endpoint = apiUrl('/api/auth/register-student')
        payload  = {
          name:     formData.name.trim(),
          email:    formData.email.trim().toLowerCase(),
          password: formData.password,
          class:    formData.class,
          board:    formData.board,
          // GPS from browser (optional — set by location button in TutorRegisterForm / step 3)
          ...(formData.latitude  != null ? { latitude:  formData.latitude  } : {}),
          ...(formData.longitude != null ? { longitude: formData.longitude } : {}),
        }
      } else {
        endpoint = apiUrl('/api/auth/register-tutor')
        payload = {
          name:           formData.name.trim(),
          email:          formData.email.trim().toLowerCase(),
          password:       formData.password,
          qualification:  formData.qualification,
          subjects:       formData.subjects      || [],
          teachingMode:   formData.teachingMode  || '',
          coverageRadius: formData.coverageRadius || 0,
          experience:     formData.experience    || 0,
          fee:            formData.fee           || 0,
          boards:         formData.boards        || [],
          achievements:   formData.achievements  || '',
          demoVideo:      formData.demoVideo     || '',
          // GPS captured in TutorRegisterForm step 2 (optional)
          ...(formData.latitude  != null ? { latitude:  formData.latitude  } : {}),
          ...(formData.longitude != null ? { longitude: formData.longitude } : {}),
        }
      }

      // ── Call register API ─────────────────────────────
      const regRes  = await fetch(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const regData = await regRes.json()

      if (!regRes.ok) {
        setError(regData.message || 'Registration failed. Please try again.')
        setIsLoading(false)
        return
      }

      // ── Auto-login after registration ─────────────────
      const loginRes  = await fetch(apiUrl('/api/auth/login'), {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: payload.email, password: payload.password }),
      })
      const loginData = await loginRes.json()

      if (loginRes.ok) {
        login(loginData)
        navigate(
          selectedType === 'tutor' ? '/tutor/dashboard' : '/student/dashboard',
          { replace: true }
        )
      } else {
        navigate('/login', { replace: true })
      }

    } catch (err) {
      console.error(err)
      setError('Could not connect to the server. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }


  // ── Reusable inline error helper ─────────────────────
  const FieldError = ({ field }) =>
    fieldErrors[field]
      ? <div className="error-msg" style={{ color:'#dc2626', fontSize:12, marginTop:4 }}>⚠ {fieldErrors[field]}</div>
      : null


  return (
    <div className="register-page">

      <div className="register-header">
        <Link to="/" className="logo">
          <div className="logo-icon"><LogoIcon size={26} /></div>
          <span>TutorConnect</span>
        </Link>
        <p style={{ fontSize:14, color:'var(--gray-500)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'var(--blue-600)', fontWeight:600 }}>Sign In</Link>
        </p>
      </div>

      <div className="register-content">
        <div className="register-card">
          <div className="register-card-header">
            <h1>Create Your Account</h1>
            <p>Join TutorConnect to start your learning or teaching journey</p>
          </div>

          <div className="register-card-body">

            {/* Step indicator */}
            <div className="step-indicator">
              {STEP_LABELS.map((_, i) => {
                const n = i + 1
                return (
                  <div key={n} style={{ display:'contents' }}>
                    <div className={`step-dot${step===n?' active':step>n?' done':''}`}>
                      {step > n ? '✓' : n}
                    </div>
                    {i < STEP_LABELS.length - 1 && (
                      <div className={`step-line${step > n ? ' done' : ''}`} />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Error banner */}
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

            {/* STEP 1: Choose role */}
            {step === 1 && (
              <>
                <div className="form-section-title" style={{ marginTop:0 }}>Choose Your Role</div>
                <div className="type-selector">
                  {[
                    { type:'student', icon:'🎓', label:"I'm a Student", desc:'Find tutors near me' },
                    { type:'tutor',   icon:'👨‍🏫', label:"I'm a Tutor",   desc:'Teach students near me' },
                  ].map(opt => (
                    <div
                      key={opt.type}
                      className={`type-card${selectedType===opt.type?' selected':''}`}
                      onClick={() => setSelectedType(opt.type)}
                    >
                      <div className="type-icon">{opt.icon}</div>
                      <div className="type-label">{opt.label}</div>
                      <div className="type-desc">{opt.desc}</div>
                    </div>
                  ))}
                </div>
                {selectedType && (
                  <div className="info-note">
                    {selectedType === 'student'
                      ? '🎓 As a student, you can search and connect with tutors near you.'
                      : '👨‍🏫 As a tutor, you can list yourself and connect with students.'}
                  </div>
                )}
                <div className="form-nav">
                  <Link to="/login" style={{ fontSize:14, color:'var(--gray-500)' }}>← Back to Login</Link>
                  <button className="btn-primary" onClick={() => goToStep(2)} disabled={!selectedType}>
                    Next: Basic Info →
                  </button>
                </div>
              </>
            )}

            {/* STEP 2: Profile details */}
            {step === 2 && (
              <>
                {selectedType === 'student'
                  ? <StudentRegisterForm formData={formData} onChange={onChange} />
                  : <TutorRegisterForm   formData={formData} onChange={onChange} />
                }
                <div className="form-nav">
                  <button
                    style={{ padding:'10px 20px', border:'1.5px solid var(--gray-200)', borderRadius:'var(--radius-md)', color:'var(--gray-600)', fontSize:14, fontWeight:600, background:'white', cursor:'pointer' }}
                    onClick={() => goToStep(1)}
                  >
                    ← Back
                  </button>
                  <button className="btn-primary" onClick={() => goToStep(3)}>
                    Next: Account Details →
                  </button>
                </div>
              </>
            )}

            {/* STEP 3: Account + location */}
            {step === 3 && (
              <>
                <div className="form-section-title" style={{ marginTop:0 }}>Account &amp; Location Details</div>

                {/* Name — only shown here if not collected in step 2 */}
                <div className={`form-group${fieldErrors.name ? ' has-error' : ''}`}>
                  <label>Full Name <span className="required-mark">*</span></label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={e => onChange('name', e.target.value)}
                    placeholder="Your full name"
                  />
                  <FieldError field="name" />
                </div>

                <div className="form-row">
                  <div className={`form-group${fieldErrors.email ? ' has-error' : ''}`}>
                    <label>Email Address <span className="required-mark">*</span></label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={e => onChange('email', e.target.value)}
                      placeholder="you@example.com"
                    />
                    <FieldError field="email" />
                  </div>
                  <div className={`form-group${fieldErrors.password ? ' has-error' : ''}`}>
                    <label>Password <span className="required-mark">*</span></label>
                    <div className="password-input">
                      <input
                        type="password"
                        value={formData.password || ''}
                        onChange={e => onChange('password', e.target.value)}
                        placeholder="Min. 8 characters"
                      />
                    </div>
                    <FieldError field="password" />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Mobile Number <span className="required-mark">*</span>
                    {mobileVerified && <span className="verified-indicator" style={{ marginLeft:8 }}>✓ Verified</span>}
                  </label>
                  <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
                    <input
                      type="tel"
                      value={formData.mobile || ''}
                      onChange={e => onChange('mobile', e.target.value)}
                      placeholder="+91 9876543210"
                      style={{ flex:1, padding:'12px 16px', border:'1.5px solid var(--gray-200)', borderRadius:'var(--radius-md)', fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:'none', background:'var(--gray-50)' }}
                    />
                    <button
                      onClick={() => setOtpVisible(true)}
                      style={{ padding:'12px 16px', borderRadius:'var(--radius-md)', border:'1.5px solid var(--blue-200)', color:'var(--blue-600)', fontSize:13, fontWeight:600, background:'var(--blue-50)', cursor:'pointer', whiteSpace:'nowrap' }}
                    >
                      Send OTP
                    </button>
                  </div>
                  {otpVisible && !mobileVerified && (
                    <div style={{ marginTop:10 }}>
                      <div className="otp-fields">
                        {otp.map((d, i) => (
                          <input key={i} ref={el => (otpRefs.current[i]=el)} type="text" maxLength={1} value={d} onChange={e => handleOtpChange(e.target.value, i)} className="otp-input" />
                        ))}
                      </div>
                      <button onClick={() => setMobileVerified(true)} style={{ marginTop:8, padding:'8px 16px', background:'var(--blue-600)', color:'white', borderRadius:'var(--radius-md)', fontSize:13, fontWeight:600, cursor:'pointer', border:'none' }}>
                        Verify OTP
                      </button>
                    </div>
                  )}
                </div>

                <div className={`form-group${fieldErrors.address ? ' has-error' : ''}`}>
                  <label>Address <span className="required-mark">*</span></label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={e => onChange('address', e.target.value)}
                    placeholder="House no., Street, Area"
                  />
                  <FieldError field="address" />
                </div>

                <div className="form-row">
                  <div className={`form-group${fieldErrors.city ? ' has-error' : ''}`}>
                    <label>City <span className="required-mark">*</span></label>
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={e => onChange('city', e.target.value)}
                      placeholder="Your city"
                    />
                    <FieldError field="city" />
                  </div>
                  <div className={`form-group${fieldErrors.state ? ' has-error' : ''}`}>
                    <label>State <span className="required-mark">*</span></label>
                    <select value={formData.state || ''} onChange={e => onChange('state', e.target.value)}>
                      <option value="">Select state</option>
                      {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <FieldError field="state" />
                  </div>
                </div>

                <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom: fieldErrors.terms ? 8 : 24, padding:16, background:'var(--gray-50)', borderRadius:'var(--radius-md)', border:`1px solid ${fieldErrors.terms ? '#fecaca' : 'var(--gray-200)'}` }}>
                  <input
                    type="checkbox"
                    checked={!!formData.termsAccepted}
                    onChange={e => onChange('termsAccepted', e.target.checked)}
                    style={{ width:'auto', accentColor:'var(--blue-600)', marginTop:2, flexShrink:0 }}
                  />
                  <label style={{ fontSize:13, color:'var(--gray-600)', cursor:'pointer', margin:0 }}>
                    I agree to TutorConnect&apos;s{' '}
                    <a href="#" style={{ color:'var(--blue-600)' }}>Terms of Service</a> and{' '}
                    <a href="#" style={{ color:'var(--blue-600)' }}>Privacy Policy</a>.
                    I confirm that all provided information is accurate.
                  </label>
                </div>
                {fieldErrors.terms && (
                  <div style={{ color:'#dc2626', fontSize:12, marginBottom:16 }}>⚠ {fieldErrors.terms}</div>
                )}

                <div className="form-nav">
                  <button
                    style={{ padding:'10px 20px', border:'1.5px solid var(--gray-200)', borderRadius:'var(--radius-md)', color:'var(--gray-600)', fontSize:14, fontWeight:600, background:'white', cursor:'pointer' }}
                    onClick={() => goToStep(2)}
                  >
                    ← Back
                  </button>
                  <button className="btn-primary btn-large" onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? 'Creating Account…' : '🎉 Create My Account'}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>

        <p className="auth-link" style={{ textAlign:'center', marginTop:20 }}>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>

    </div>
  )
}