import { apiUrl } from '../../../api.js'
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { SUBJECTS, RATING_FILTER_OPTIONS, SORT_OPTIONS } from '../../../data/constants.js'
import TutorCard from '../../common/TutorCard.jsx'

// ── Haversine distance (metres) ───────────────────────────
// Matches the server-side implementation in tutorController.js
function haversineMetres(lat1, lng1, lat2, lng2) {
  const R  = 6_371_000
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180
  const a  =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(metres) {
  if (metres == null || isNaN(metres)) return null
  if (metres < 1000) return `${Math.round(metres)} m away`
  return `${(metres / 1000).toFixed(1)} km away`
}

// Radius options shown in the UI (km values)
const RADIUS_KM_OPTIONS = [1, 2, 3, 5, 7, 10, 20, 50]

export default function TutorSearchSection({ enrollments = [], onEnroll, enrollLoading = false }) {

  const navigate = useNavigate()

  const [tutors,  setTutors]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // ── Filter state ──────────────────────────────────────
  const [subject,  setSubject]  = useState('')
  const [radiusKm, setRadiusKm] = useState(5)      // selected radius in km
  const [rating,   setRating]   = useState('')
  const [mode,     setMode]     = useState('')
  const [sortBy,   setSortBy]   = useState(SORT_OPTIONS[0])

  // ── Student location state ────────────────────────────
  const [studentLat,    setStudentLat]    = useState(null)
  const [studentLng,    setStudentLng]    = useState(null)
  const [locLoading,    setLocLoading]    = useState(false)
  const [locStatus,     setLocStatus]     = useState('')
  const [locPermDenied, setLocPermDenied] = useState(false)

  // ── Enroll modal state ────────────────────────────────
  const [enrollModal, setEnrollModal] = useState(null)
  const [reqSubject,  setReqSubject]  = useState('')
  const [reqMessage,  setReqMessage]  = useState('')


  // ── Fetch tutors ──────────────────────────────────────
  const fetchTutors = useCallback(async ({
    subjectFilter = subject,
    modeFilter    = mode,
    ratingFilter  = rating,
    lat           = studentLat,
    lng           = studentLng,
    radius        = radiusKm,
  } = {}) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (subjectFilter) params.append('subject', subjectFilter)
      if (modeFilter)    params.append('mode',    modeFilter)
      if (ratingFilter)  params.append('rating',  ratingFilter)

      // Send GPS + radius to backend when available
      if (lat != null && lng != null) {
        params.append('lat',         lat)
        params.append('lng',         lng)
        params.append('maxDistance', radius * 1000)  // convert km → metres
      }

      const url = params.toString()
        ? apiUrl(`/api/tutors/search?${params.toString()}`)
        : apiUrl('/api/tutors/all')

      const res  = await fetch(url)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()

      // If no geo was sent from the server, compute distance client-side
      // using the student's stored location (if available)
      const withDist = (Array.isArray(data) ? data : []).map(t => {
        if (t.distance_m != null) return t   // server already attached it
        if (lat != null && lng != null) {
          const [tLng, tLat] = t.location?.coordinates || [0, 0]
          if (tLat !== 0 || tLng !== 0) {
            return { ...t, distance_m: haversineMetres(lat, lng, tLat, tLng) }
          }
        }
        return t
      })

      setTutors(withDist)
    } catch (err) {
      setError('Unable to load tutors. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [subject, mode, rating, studentLat, studentLng, radiusKm])

  // Initial load (no location yet)
  useEffect(() => { fetchTutors() }, [])  // eslint-disable-line react-hooks/exhaustive-deps


  // ── Detect student location ───────────────────────────
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus('❌ Geolocation not supported.')
      setLocPermDenied(true)
      return
    }
    setLocLoading(true)
    setLocStatus('Detecting your location…')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setStudentLat(lat)
        setStudentLng(lng)
        setLocStatus(`📍 Using your location (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)`)
        setLocLoading(false)
        // Re-fetch with new location
        fetchTutors({ lat, lng, radius: radiusKm })
      },
      (err) => {
        if (err.code === 1) {
          setLocPermDenied(true)
          setLocStatus('❌ Location access denied. Please enable it in your browser settings.')
        } else {
          setLocStatus('❌ Could not detect location. Try again.')
        }
        setLocLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const clearLocation = () => {
    setStudentLat(null)
    setStudentLng(null)
    setLocStatus('')
    fetchTutors({ lat: null, lng: null })
  }


  // ── Search button handler ─────────────────────────────
  const handleSearch = () => {
    fetchTutors({
      subjectFilter: subject,
      modeFilter:    mode,
      ratingFilter:  rating,
      lat:           studentLat,
      lng:           studentLng,
      radius:        radiusKm,
    })
  }

  // Re-fetch when radius changes (only if location is already set)
  const handleRadiusChange = (newKm) => {
    setRadiusKm(newKm)
    if (studentLat != null) {
      fetchTutors({ radius: newKm, lat: studentLat, lng: studentLng })
    }
  }


  // ── Enroll helpers ────────────────────────────────────
  const openEnrollModal  = (tutor) => { setReqSubject(''); setReqMessage(''); setEnrollModal(tutor) }
  const confirmEnroll    = async () => {
    if (!enrollModal) return
    await onEnroll?.(enrollModal, { subject: reqSubject, message: reqMessage })
    setEnrollModal(null)
  }
  const enrollmentStatus = (tutorId) => {
    const e = enrollments.find(e => String(e.tutorId) === String(tutorId))
    return e ? e.status : null
  }


  // ── Sort & filter (client-side secondary filter) ──────
  // When location IS available, home-tutors whose coverageRadius is 0
  // (they never set it) are excluded only if they set a radius > 0.
  // We do NOT silently exclude tutors just because their radius is missing.
  let displayed = [...tutors]

  if (studentLat != null && mode === 'home') {
    // Secondary coverage-radius filter: only keep tutors who cover the student
    displayed = displayed.filter(t => {
      if (!t.coverageRadius) return true  // tutor hasn't set radius → show them
      return (t.distance_m ?? Infinity) <= t.coverageRadius * 1000
    })
  }

  displayed.sort((a, b) => {
    if (sortBy.includes('Distance') && studentLat != null) {
      return (a.distance_m ?? Infinity) - (b.distance_m ?? Infinity)
    }
    if (sortBy.includes('Rating'))     return (b.rating || 0) - (a.rating || 0)
    if (sortBy.includes('Experience')) return (b.experience || 0) - (a.experience || 0)
    if (sortBy.includes('Price'))      return (a.fee || 0) - (b.fee || 0)
    return 0
  })


  // ── Render ────────────────────────────────────────────
  return (
    <>
      {/* ── Search bar ───────────────────────────────── */}
      <div className="map-search-container">
        <div className="map-search-header">
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:700, color:'var(--gray-800)', marginBottom:12 }}>
              Search Tutors Near You
            </div>

            {/* ── Location row ────────────────────────── */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, flexWrap:'wrap' }}>
              {studentLat == null ? (
                <button
                  onClick={handleDetectLocation}
                  disabled={locLoading || locPermDenied}
                  style={{
                    padding:'8px 14px',
                    border:'1.5px solid var(--blue-200)',
                    borderRadius:'var(--radius-md)',
                    background:'var(--blue-50)',
                    color: locPermDenied ? 'var(--gray-400)' : 'var(--blue-600)',
                    fontSize:13, fontWeight:600,
                    cursor: (locLoading || locPermDenied) ? 'not-allowed' : 'pointer',
                    opacity: (locLoading || locPermDenied) ? 0.7 : 1,
                    display:'flex', alignItems:'center', gap:6,
                  }}
                >
                  {locLoading ? '⏳ Detecting…' : '📍 Use My Location for Distance'}
                </button>
              ) : (
                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                  <span style={{ fontSize:13, color:'#15803d', fontWeight:600, background:'#dcfce7', padding:'5px 10px', borderRadius:'var(--radius-md)' }}>
                    📍 {locStatus || 'Location active'}
                  </span>
                  <button
                    onClick={clearLocation}
                    style={{ fontSize:12, color:'var(--gray-500)', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}
                  >
                    Clear
                  </button>
                </div>
              )}
              {locStatus.startsWith('❌') && (
                <span style={{ fontSize:12, color:'#dc2626' }}>{locStatus}</span>
              )}
            </div>

            {/* ── Filters ─────────────────────────────── */}
            <div className="search-filters">
              <select className="filter-select" value={subject} onChange={e => setSubject(e.target.value)}>
                <option value="">All Subjects</option>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>

              {/* Radius — only meaningful when location is active */}
              <select
                className="filter-select"
                value={radiusKm}
                onChange={e => handleRadiusChange(Number(e.target.value))}
                title={studentLat == null ? 'Enable location to filter by distance' : ''}
                style={{ opacity: studentLat == null ? 0.5 : 1 }}
              >
                {RADIUS_KM_OPTIONS.map(r => (
                  <option key={r} value={r}>{r} km</option>
                ))}
              </select>

              <select className="filter-select" value={rating} onChange={e => setRating(e.target.value)}>
                {RATING_FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              <select className="filter-select" value={mode} onChange={e => setMode(e.target.value)}>
                <option value="">All Modes</option>
                <option value="home">Home Tutor</option>
                <option value="center">Tuition Center</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>

              <button className="btn-primary" style={{ padding:'8px 16px', fontSize:13 }} onClick={handleSearch}>
                🔍 Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Loading / Error ───────────────────────────── */}
      {loading && (
        <div style={{ padding:32, textAlign:'center', color:'var(--gray-400)', fontSize:14 }}>
          Loading tutors…
        </div>
      )}

      {error && (
        <div style={{ padding:20, background:'#fef2f2', borderRadius:'var(--radius-md)', color:'#dc2626', fontSize:14 }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Results ───────────────────────────────────── */}
      {!loading && !error && (
        <>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:12 }}>
            <div>
              <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:16, color:'var(--gray-800)' }}>
                {displayed.length} Tutor{displayed.length !== 1 ? 's' : ''} Found
              </span>
              {studentLat != null && (
                <span style={{ fontSize:13, color:'var(--gray-500)', marginLeft:8 }}>
                  within {radiusKm} km
                </span>
              )}
            </div>
            <select
              style={{ padding:'8px 12px', border:'1.5px solid var(--gray-200)', borderRadius:'var(--radius-md)', fontSize:13, outline:'none' }}
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          {displayed.length === 0 ? (
            <div style={{ padding:48, textAlign:'center', color:'var(--gray-400)', fontSize:15, background:'var(--gray-50)', borderRadius:'var(--radius-xl)', border:'1px dashed var(--gray-200)' }}>
              <div style={{ fontSize:32, marginBottom:12 }}>🔍</div>
              {studentLat != null
                ? `No tutors found within ${radiusKm} km. Try increasing the radius.`
                : 'No tutors found. Try adjusting your filters.'}
            </div>
          ) : (
            <div className="tutors-grid">
              {displayed.map(tutor => (
                <TutorCard
                  key={tutor._id}
                  tutor={tutor}
                  distanceLabel={formatDistance(tutor.distance_m)}
                  enrollmentStatus={enrollmentStatus(tutor._id)}
                  onEnroll={() => openEnrollModal(tutor)}
                  enrollLoading={enrollLoading}
                  onViewProfile={() => navigate(`/tutor/${tutor._id}`)}
                />
              ))}
            </div>
          )}
        </>
      )}


      {/* ── Enroll modal ──────────────────────────────── */}
      {enrollModal && (
        <div className="modal-backdrop">
          <div className="modal-inner">
            <h2 style={{ fontSize:20, fontWeight:700, marginBottom:6, color:'var(--gray-900)' }}>Send Enrollment Request</h2>
            <p style={{ fontSize:14, color:'var(--gray-500)', marginBottom:24 }}>
              Requesting to enroll with <strong>{enrollModal.name}</strong>
            </p>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'var(--gray-700)', marginBottom:6 }}>
                Subject <span style={{ color:'#ef4444' }}>*</span>
              </label>
              <select value={reqSubject} onChange={e => setReqSubject(e.target.value)} style={{ width:'100%', padding:'10px 12px', border:'1.5px solid var(--gray-200)', borderRadius:'var(--radius-md)', fontSize:14, outline:'none' }}>
                <option value="">Select a subject…</option>
                {(enrollModal.subjects || SUBJECTS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'var(--gray-700)', marginBottom:6 }}>
                Message <span style={{ color:'var(--gray-400)', fontWeight:400 }}>(optional)</span>
              </label>
              <textarea value={reqMessage} onChange={e => setReqMessage(e.target.value)} placeholder="Introduce yourself, mention your goals or schedule…" rows={3} style={{ width:'100%', padding:'10px 12px', border:'1.5px solid var(--gray-200)', borderRadius:'var(--radius-md)', fontSize:14, outline:'none', resize:'vertical', fontFamily:'inherit', boxSizing:'border-box' }} />
            </div>
            <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
              <button onClick={() => setEnrollModal(null)} style={{ padding:'10px 20px', border:'1.5px solid var(--gray-200)', borderRadius:'var(--radius-md)', fontSize:14, fontWeight:600, color:'var(--gray-600)', background:'white', cursor:'pointer' }}>Cancel</button>
              <button onClick={confirmEnroll} disabled={!reqSubject || enrollLoading} className="btn-primary" style={{ padding:'10px 20px', fontSize:14, opacity:(!reqSubject || enrollLoading) ? 0.6 : 1 }}>
                {enrollLoading ? 'Sending…' : '✉️ Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}