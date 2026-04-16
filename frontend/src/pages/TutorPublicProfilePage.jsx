import { apiUrl } from '../api.js'
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import VerifiedBadge from '../components/common/VerifiedBadge.jsx'
import Navbar        from '../components/layout/Navbar.jsx'
import Footer        from '../components/layout/Footer.jsx'

// Star rating display
function Stars({ rating, size = 16 }) {
  return (
    <span style={{ color:'#f59e0b', fontSize:size, letterSpacing:2 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} style={{ opacity: n <= Math.round(rating) ? 1 : 0.25 }}>★</span>
      ))}
    </span>
  )
}

// Avatar colour palette
const PALETTE = [
  { bg:'#dbeafe', color:'#1d4ed8' },
  { bg:'#dcfce7', color:'#15803d' },
  { bg:'#f5f3ff', color:'#6d28d9' },
  { bg:'#fef9c3', color:'#92400e' },
  { bg:'#fee2e2', color:'#b91c1c' },
]

export default function TutorPublicProfilePage() {

  const { id }    = useParams()
  const navigate  = useNavigate()
  const { auth }  = useAuth()

  const [tutor,    setTutor]    = useState(null)
  const [reviews,  setReviews]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  // Enrollment state
  const [enrollModal,  setEnrollModal]  = useState(false)
  const [reqSubject,   setReqSubject]   = useState('')
  const [reqMessage,   setReqMessage]   = useState('')
  const [enrolling,    setEnrolling]    = useState(false)
  const [enrollStatus, setEnrollStatus] = useState(null) // 'active'|'pending'|null
  const [enrollMsg,    setEnrollMsg]    = useState('')


  // Fetch tutor + reviews in parallel
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tutorRes, reviewsRes] = await Promise.all([
          fetch(apiUrl(`/api/tutors/${id}`)),
          fetch(apiUrl(`/api/reviews/tutor/${id}`)),
        ])

        if (!tutorRes.ok) { setError('Tutor not found.'); return }

        const [tutorData, reviewsData] = await Promise.all([
          tutorRes.json(),
          reviewsRes.ok ? reviewsRes.json() : [],
        ])

        setTutor(tutorData)
        setReviews(Array.isArray(reviewsData) ? reviewsData : [])

        // If student is logged in, check enrollment status
        if (auth.token && auth.role === 'student') {
          const enrollRes = await fetch(apiUrl('/api/student/enrollments'), {
            headers: { Authorization: `Bearer ${auth.token}` },
          })
          if (enrollRes.ok) {
            const enrollData = await enrollRes.json()
            const match = enrollData.find(e => String(e.tutorId) === String(id))
            if (match) setEnrollStatus(match.status)
          }
        }

      } catch (err) {
        console.error(err)
        setError('Failed to load tutor profile.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, auth.token, auth.role])


  // Send enrollment request
  const handleEnroll = async () => {
    if (!auth.token) { navigate('/login'); return }
    if (!reqSubject) { setEnrollMsg('Please select a subject.'); return }

    setEnrolling(true)
    setEnrollMsg('')
    try {
      const res  = await fetch(apiUrl(`/api/student/enroll/${id}`), {
        method:  'POST',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${auth.token}` },
        body:    JSON.stringify({ subject: reqSubject, message: reqMessage }),
      })
      const data = await res.json()

      if (!res.ok) { setEnrollMsg(data.message || 'Could not send request'); return }

      setEnrollStatus('pending')
      setEnrollModal(false)
      setEnrollMsg('✅ Request sent! Waiting for the tutor to accept.')
    } catch (err) {
      setEnrollMsg('Server error. Please try again.')
    } finally {
      setEnrolling(false)
    }
  }


  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--gray-400)', fontSize:15 }}>
          Loading profile…
        </div>
        <Footer />
      </>
    )
  }

  if (error || !tutor) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight:'60vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
          <div style={{ fontSize:48 }}>🔍</div>
          <p style={{ fontSize:16, color:'var(--gray-500)' }}>{error || 'Tutor not found.'}</p>
          <Link to="/" className="btn-primary" style={{ textDecoration:'none', padding:'10px 24px' }}>← Back to Home</Link>
        </div>
        <Footer />
      </>
    )
  }

  const initials = tutor.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)
  const avgRating = tutor.rating ? Number(tutor.rating).toFixed(1) : null

  return (
    <>
      <Navbar />

      <div className="tutor-public-page" style={{ maxWidth:900, margin:'0 auto', padding:'40px 24px 80px' }}>

        {/* ── Enroll success message ────────────────── */}
        {enrollMsg && !enrollModal && (
          <div style={{
            background: enrollMsg.startsWith('✅') ? '#dcfce7' : '#fef2f2',
            border: `1px solid ${enrollMsg.startsWith('✅') ? '#86efac' : '#fecaca'}`,
            borderRadius:'var(--radius-md)', padding:'12px 16px',
            fontSize:14, color: enrollMsg.startsWith('✅') ? '#15803d' : '#dc2626',
            marginBottom:24,
          }}>
            {enrollMsg}
          </div>
        )}

        {/* ── Profile card ──────────────────────────── */}
        <div style={{ background:'white', borderRadius:'var(--radius-xl)', border:'1px solid var(--gray-100)', padding:'32px', marginBottom:32 }}>

          <div className="tutor-public-header">

            {/* Avatar */}
            <div style={{
              width:88, height:88, borderRadius:'50%',
              background:'#dbeafe', color:'#1d4ed8',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:28, flexShrink:0,
            }}>
              {initials}
            </div>

            {/* Info */}
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', marginBottom:6 }}>
                <h1 style={{ fontSize:24, fontWeight:700, color:'var(--gray-900)', margin:0 }}>
                  {tutor.name}
                </h1>
                <VerifiedBadge verified={tutor.verifiedStatus} size="full" />
              </div>

              <p style={{ fontSize:14, color:'var(--gray-500)', margin:'0 0 10px' }}>
                {tutor.qualification || '—'}
                {tutor.experience ? ` · ${tutor.experience} year${tutor.experience > 1 ? 's' : ''} experience` : ''}
              </p>

              {/* Rating */}
              {avgRating && (
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <Stars rating={tutor.rating} />
                  <span style={{ fontSize:14, fontWeight:600, color:'var(--gray-800)' }}>{avgRating}</span>
                  <span style={{ fontSize:13, color:'var(--gray-400)' }}>({tutor.totalReviews || 0} reviews)</span>
                </div>
              )}

              {/* Tags */}
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {(tutor.subjects || []).map(s => (
                  <span key={s} className="tag tag-blue" style={{ fontSize:12 }}>{s}</span>
                ))}
                {tutor.teachingMode && <span className="tag tag-green" style={{ fontSize:12 }}>🏠 {tutor.teachingMode}</span>}
                {tutor.coverageRadius && <span className="tag tag-yellow" style={{ fontSize:12 }}>📍 {tutor.coverageRadius}km radius</span>}
                {tutor.board && <span className="tag tag-purple" style={{ fontSize:12 }}>🎓 {tutor.board}</span>}
              </div>
            </div>

            {/* Enroll CTA */}
            <div className="tutor-public-cta" style={{ display:'flex', flexDirection:'column', gap:12, alignItems:'flex-end', flexShrink:0 }}>
              {tutor.fee > 0 && (
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:'var(--gray-900)' }}>
                    ₹{Number(tutor.fee).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize:12, color:'var(--gray-400)' }}>per month</div>
                </div>
              )}

              {auth.role === 'tutor' ? null : enrollStatus === 'active' ? (
                <span style={{ padding:'10px 20px', background:'#dcfce7', color:'#15803d', borderRadius:'var(--radius-md)', fontSize:14, fontWeight:600 }}>
                  ✓ Enrolled
                </span>
              ) : enrollStatus === 'pending' ? (
                <span style={{ padding:'10px 20px', background:'#fef9c3', color:'#92400e', borderRadius:'var(--radius-md)', fontSize:14, fontWeight:600 }}>
                  ⏳ Request Pending
                </span>
              ) : (
                <button
                  className="btn-primary"
                  style={{ padding:'10px 24px', fontSize:14 }}
                  onClick={() => auth.token ? setEnrollModal(true) : navigate('/login')}
                >
                  + Enroll with this Tutor
                </button>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="tutor-public-stats">
            {[
              { label:'Active Students', val: tutor.activeStudents ?? 0 },
              { label:'Total Reviews',   val: tutor.totalReviews  ?? 0 },
              { label:'Avg Rating',      val: avgRating ? `${avgRating} ★` : 'No reviews yet' },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center', padding:16, background:'var(--gray-50)', borderRadius:'var(--radius-lg)' }}>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:700, color:'var(--blue-600)' }}>{s.val}</div>
                <div style={{ fontSize:12, color:'var(--gray-500)', marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Demo video */}
          {tutor.demoVideo && (
            <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid var(--gray-100)' }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:'var(--gray-800)', marginBottom:10 }}>Demo Lecture</h3>
              <a
                href={tutor.demoVideo}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color:'var(--blue-600)', fontSize:14, fontWeight:600 }}
              >
                ▶ Watch Demo Video
              </a>
            </div>
          )}

          {/* Achievements */}
          {tutor.achievements && (
            <div style={{ marginTop:20, paddingTop:20, borderTop:'1px solid var(--gray-100)' }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:'var(--gray-800)', marginBottom:8 }}>Achievements</h3>
              <p style={{ fontSize:14, color:'var(--gray-600)', lineHeight:1.6 }}>{tutor.achievements}</p>
            </div>
          )}
        </div>


        {/* ── Reviews section ───────────────────────── */}
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:'var(--gray-900)', marginBottom:20 }}>
            Student Reviews
            {reviews.length > 0 && (
              <span style={{ marginLeft:8, fontSize:14, color:'var(--gray-400)', fontWeight:400 }}>
                ({reviews.length})
              </span>
            )}
          </h2>

          {reviews.length === 0 ? (
            <div style={{ padding:40, textAlign:'center', color:'var(--gray-400)', fontSize:14, background:'var(--gray-50)', borderRadius:'var(--radius-xl)', border:'1px dashed var(--gray-200)' }}>
              <div style={{ fontSize:32, marginBottom:8 }}>⭐</div>
              No reviews yet for this tutor.
            </div>
          ) : (
            <div style={{ display:'grid', gap:16 }}>
              {reviews.map((r, i) => {
                const p = PALETTE[i % PALETTE.length]
                return (
                  <div key={r.id} style={{ background:'white', borderRadius:'var(--radius-xl)', border:'1px solid var(--gray-100)', padding:24 }}>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:14 }}>
                      <div style={{ width:40, height:40, borderRadius:'50%', background:p.bg, color:p.color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14, flexShrink:0 }}>
                        {r.initials}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600, fontSize:14, color:'var(--gray-900)' }}>{r.studentName}</div>
                        <div style={{ fontSize:12, color:'var(--gray-400)', marginTop:2 }}>
                          {r.studentClass && `Class ${r.studentClass}`}
                          {r.studentClass && r.studentBoard && ' · '}
                          {r.studentBoard}
                          {' · '}{r.dateLabel}
                        </div>
                      </div>
                      <Stars rating={r.rating} size={14} />
                    </div>
                    <p style={{ fontSize:14, color:'var(--gray-600)', lineHeight:1.7, margin:0, fontStyle:'italic' }}>
                      &ldquo;{r.text}&rdquo;
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />


      {/* ── Enroll modal ──────────────────────────────── */}
      {enrollModal && (
        <div className="modal-backdrop">
          <div className="modal-inner">
            <h2 style={{ fontSize:20, fontWeight:700, marginBottom:6, color:'var(--gray-900)' }}>Send Enrollment Request</h2>
            <p style={{ fontSize:14, color:'var(--gray-500)', marginBottom:24 }}>
              Requesting to enroll with <strong>{tutor.name}</strong>
            </p>

            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'var(--gray-700)', marginBottom:6 }}>
                Subject <span style={{ color:'#ef4444' }}>*</span>
              </label>
              <select
                value={reqSubject}
                onChange={e => setReqSubject(e.target.value)}
                style={{ width:'100%', padding:'10px 12px', border:'1.5px solid var(--gray-200)', borderRadius:'var(--radius-md)', fontSize:14, outline:'none' }}
              >
                <option value="">Select a subject…</option>
                {(tutor.subjects || []).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'var(--gray-700)', marginBottom:6 }}>
                Message to tutor <span style={{ color:'var(--gray-400)', fontWeight:400 }}>(optional)</span>
              </label>
              <textarea
                value={reqMessage}
                onChange={e => setReqMessage(e.target.value)}
                placeholder="Introduce yourself, mention your goals or schedule…"
                rows={3}
                style={{ width:'100%', padding:'10px 12px', border:'1.5px solid var(--gray-200)', borderRadius:'var(--radius-md)', fontSize:14, outline:'none', resize:'vertical', fontFamily:'inherit', boxSizing:'border-box' }}
              />
            </div>

            {enrollMsg && (
              <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'var(--radius-md)', padding:'10px 14px', fontSize:13, color:'#dc2626', marginBottom:16 }}>
                ⚠️ {enrollMsg}
              </div>
            )}

            <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
              <button onClick={() => { setEnrollModal(false); setEnrollMsg('') }} style={{ padding:'10px 20px', border:'1.5px solid var(--gray-200)', borderRadius:'var(--radius-md)', fontSize:14, fontWeight:600, color:'var(--gray-600)', background:'white', cursor:'pointer' }}>
                Cancel
              </button>
              <button
                onClick={handleEnroll}
                disabled={!reqSubject || enrolling}
                className="btn-primary"
                style={{ padding:'10px 20px', fontSize:14, opacity:(!reqSubject || enrolling) ? 0.6 : 1 }}
              >
                {enrolling ? 'Sending…' : '✉️ Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}