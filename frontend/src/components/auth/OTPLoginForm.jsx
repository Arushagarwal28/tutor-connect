import { useState, useEffect, useRef } from 'react'

/**
 * OTPLoginForm
 * Props:
 *   onSendOTP(mobile)  – placeholder; wire to OTP API
 *   onVerifyOTP(mobile, otp) – placeholder; wire to verify API
 *   isLoading
 */
export default function OTPLoginForm({ onSendOTP, onVerifyOTP, isLoading }) {
  const [mobile,  setMobile]  = useState('')
  const [step,    setStep]    = useState(1)   // 1 = enter mobile, 2 = enter OTP
  const [otp,     setOtp]     = useState(Array(6).fill(''))
  const [timer,   setTimer]   = useState(59)
  const inputRefs = useRef([])
  const intervalRef = useRef(null)

  useEffect(() => {
    if (step === 2) startTimer()
    return () => clearInterval(intervalRef.current)
  }, [step])

  const startTimer = () => {
    setTimer(59)
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setTimer((t) => { if (t <= 1) { clearInterval(intervalRef.current); return 0 } return t - 1 })
    }, 1000)
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!mobile || mobile.length < 10) { alert('Please enter a valid mobile number'); return }
    onSendOTP && onSendOTP(mobile)
    setStep(2)
  }

  const handleOtpChange = (val, idx) => {
    const next = [...otp]
    next[idx] = val.slice(-1)
    setOtp(next)
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus()
  }

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus()
  }

  const handleVerify = (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) { alert('Please enter the complete OTP'); return }
    onVerifyOTP && onVerifyOTP(mobile, code)
  }

  if (step === 1) {
    return (
      <form onSubmit={handleSend} noValidate>
        <div className="form-group">
          <label>Mobile Number <span className="required-mark">*</span></label>
          <div style={{ display: 'flex', gap: 10 }}>
            <select style={{ width: 80, padding: '12px 8px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', background: 'var(--gray-50)', fontSize: 13, outline: 'none', flexShrink: 0 }}>
              <option>+91</option><option>+1</option><option>+44</option>
            </select>
            <input
              type="tel" value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter mobile number"
              style={{ flex: 1, padding: '12px 16px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none', background: 'var(--gray-50)' }}
            />
          </div>
        </div>
        <button className="btn-primary btn-full" type="submit" disabled={isLoading}>Send OTP</button>
      </form>
    )
  }

  return (
    <form onSubmit={handleVerify} noValidate>
      <div className="info-note">📱 OTP sent to your mobile number. Valid for 10 minutes.</div>
      <div className="form-group">
        <label>Enter 6-digit OTP <span className="required-mark">*</span></label>
        <div className="otp-fields">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text" maxLength={1} value={digit}
              onChange={(e) => handleOtpChange(e.target.value, i)}
              onKeyDown={(e) => handleOtpKeyDown(e, i)}
              className="otp-input"
            />
          ))}
        </div>
        <div className="otp-timer">
          {timer > 0
            ? <>Resend OTP in <span>00:{String(timer).padStart(2, '0')}</span></>
            : <><span onClick={() => { setOtp(Array(6).fill('')); startTimer(); onSendOTP && onSendOTP(mobile) }} style={{ cursor: 'pointer' }}>Resend OTP</span></>
          }
        </div>
      </div>
      <button className="btn-primary btn-full" type="submit" disabled={isLoading}>
        {isLoading ? 'Verifying…' : 'Verify & Sign In'}
      </button>
      <button
        type="button"
        style={{ width: '100%', marginTop: 10, padding: 12, borderRadius: 'var(--radius-md)', border: '1.5px solid var(--gray-200)', color: 'var(--gray-600)', fontSize: 14, fontWeight: 600, background: 'white', cursor: 'pointer' }}
        onClick={() => { setStep(1); setOtp(Array(6).fill('')) }}
      >
        ← Back
      </button>
    </form>
  )
}
