import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { SUBJECTS, CLASSES, RADIUS_OPTIONS } from '../../data/constants.js'

// ── Stats shown below the search bar ────────────────────────
// These are static marketing numbers — not from the DB.
// Real counts will replace these in a future update.
const HERO_STATS = [
  { label: 'Verified Tutors',    value: '500+' },
  { label: 'Students Connected', value: '2,000+' },
  { label: 'Subjects Covered',   value: '50+' },
]

// ── Floating preview cards on desktop ───────────────────────
// These are illustrative — not real user data.
// They show what a tutor card looks like on the platform.
const HERO_FLOATING_CARDS = [
  { id:1, name:'Priya Sharma',  sub:'Mathematics · CBSE',  rating:'⭐ 4.9', bg:'#dbeafe', color:'#1d4ed8', verified:true,  className:'fc-1' },
  { id:2, name:'Rahul Gupta',   sub:'Physics · Home Tutor', rating:'⭐ 4.7', bg:'#dcfce7', color:'#15803d', verified:true,  className:'fc-2' },
  { id:3, name:'Sneha Reddy',   sub:'Chemistry · Online',   rating:'⭐ 4.8', bg:'#f5f3ff', color:'#6d28d9', verified:false, className:'fc-3' },
]

export default function HeroSection() {

  const navigate       = useNavigate()
  const { auth }       = useAuth()

  const [subject,  setSubject]  = useState('')
  const [grade,    setGrade]    = useState('')
  const [location, setLocation] = useState('')
  const [radius,   setRadius]   = useState('3')


  // ── GPS location ─────────────────────────────────────────
  const handleGPS = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      () => setLocation('Your Current Location'),
      () => alert('Unable to retrieve location. Please enter manually.')
    )
  }


  // ── Search / Find Tutors ─────────────────────────────────
  // FIX: Previously navigated directly to /student/dashboard
  // regardless of auth state — meaning unauthenticated users
  // hit ProtectedRoute and got bounced to /login anyway,
  // but lost their search params.
  //
  // Now: if logged in → go to dashboard with params.
  //      if not logged in → go to /login (they need to sign up first).
  const handleSearch = () => {
    const params = new URLSearchParams({ subject, grade, location, radius })

    if (auth.token) {
      // Student role → student dashboard, tutor role → redirect to student dashboard
      // (tutors don't have a "find tutors" flow)
      navigate(`/student/dashboard?${params}`)
    } else {
      // Not logged in — send to register with a hint they want to find tutors
      navigate(`/register?type=student`)
    }
  }


  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="grid-overlay" />
      </div>

      <div className="hero-container">

        <div className="hero-badge">
          <span className="badge-dot" />
          <span>Trusted by 12,000+ students across India</span>
        </div>

        <h1 className="hero-title">
          Find the Perfect Tutor<br />
          <span className="gradient-text">Right in Your Neighbourhood</span>
        </h1>

        <p className="hero-subtitle">
          Connect with verified, experienced tutors within your preferred distance.
          Search by subject, class, board, and teaching mode.
        </p>

        {/* ── Search card ──────────────────────────────── */}
        <div className="search-card">
          <div className="search-row">

            <div className="search-field">
              <label>Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)}>
                <option value="">Select Subject</option>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="search-field">
              <label>Class / Grade</label>
              <select value={grade} onChange={e => setGrade(e.target.value)}>
                <option value="">Select Class</option>
                {CLASSES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="search-field">
              <label>Location</label>
              <div className="location-input-wrap">
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Enter your area or city"
                />
                <button className="gps-btn" title="Use my location" onClick={handleGPS}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v4M12 19v4M1 12h4M19 12h4" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="search-field">
              <label>Radius</label>
              <select value={radius} onChange={e => setRadius(e.target.value)}>
                {RADIUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="search-actions">
            <button className="btn-primary btn-large search-btn" onClick={handleSearch}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              Find Tutors
            </button>
            <button className="btn-outline btn-large" onClick={() => navigate('/register?type=tutor')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Become a Tutor
            </button>
          </div>
        </div>

        {/* ── Stats ───────────────────────────────────── */}
        {/* FIX: original used s.num which was undefined — field is s.value */}
        <div className="hero-stats">
          {HERO_STATS.map((s, i) => (
            <div key={s.label} style={{ display:'contents' }}>
              <div className="stat">
                <span className="stat-num">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
              {i < HERO_STATS.length - 1 && <div className="stat-divider" />}
            </div>
          ))}
        </div>
      </div>

      {/* ── Floating preview cards (desktop only) ──────── */}
      {/* FIX: original used card.bg/card.emoji/card.sub which were
               undefined — correct field names are bg/color/sub/verified */}
      <div className="hero-visual">
        {HERO_FLOATING_CARDS.map(card => (
          <div key={card.id} className={`floating-card ${card.className}`}>
            <div
              className="fc-avatar"
              style={{ background: card.bg, color: card.color }}
            >
              {card.name.charAt(0)}
            </div>
            <div>
              <div className="fc-name">{card.name}</div>
              <div className="fc-sub">{card.sub}</div>
              {card.verified && (
                <div className="verified-badge-sm">
                  <span>✓</span> Verified
                </div>
              )}
              {card.rating && (
                <div style={{ fontSize:12, marginTop:2 }}>{card.rating}</div>
              )}
            </div>
          </div>
        ))}
      </div>

    </section>
  )
}