import { apiUrl } from '../../../api.js'
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { SUBJECTS, RATING_FILTER_OPTIONS, SORT_OPTIONS } from '../../../data/constants.js'
import TutorCard from '../../common/TutorCard.jsx'
import TutorMap  from './TutorMap.jsx'

// ── Haversine (metres) — identical to server tutorController.js ─
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

const RADIUS_KM_OPTIONS = [1, 2, 3, 5, 7, 10, 20, 50]

// ─────────────────────────────────────────────────────────────
// Distance-filtering rules:
//
//  'center'  → physical location matters
//    Map: shown if has GPS coords
//    List: shown always; if both student & tutor have GPS → filter by radiusKm
//
//  'home'    → visits student, has coverageRadius
//    Map: shown as pin ONLY if they shared GPS
//    List: ALWAYS shown (no radius filter); distance badge if both have GPS
//
//  'online' / 'hybrid' → no physical location
//    Map: never shown
//    List: ALWAYS shown, no distance badge
// ─────────────────────────────────────────────────────────────

export default function TutorSearchSection({ enrollments = [], onEnroll, enrollLoading = false }) {

  const navigate = useNavigate()

  const [allTutors, setAllTutors] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  const [view, setView] = useState('list')

  const [subject,  setSubject]  = useState('')
  const [radiusKm, setRadiusKm] = useState(5)
  const [rating,   setRating]   = useState('')
  const [mode,     setMode]     = useState('')
  const [sortBy,   setSortBy]   = useState(SORT_OPTIONS[0])

  const [studentLat,    setStudentLat]    = useState(null)
  const [studentLng,    setStudentLng]    = useState(null)
  const [locLoading,    setLocLoading]    = useState(false)
  const [locStatus,     setLocStatus]     = useState('')
  const [locPermDenied, setLocPermDenied] = useState(false)

  const [enrollModal, setEnrollModal] = useState(null)
  const [reqSubject,  setReqSubject]  = useState('')
  const [reqMessage,  setReqMessage]  = useState('')


  // ── Fetch tutors (no geo filter — we filter client-side) ──
  const fetchTutors = useCallback(async ({
    subjectFilter = subject,
    modeFilter    = mode,
    ratingFilter  = rating,
  } = {}) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (subjectFilter) params.append('subject', subjectFilter)
      if (modeFilter)    params.append('mode',    modeFilter)
      if (ratingFilter)  params.append('rating',  ratingFilter)
      const url = params.toString()
        ? apiUrl(`/api/tutors/search?${params.toString()}`)
        : apiUrl('/api/tutors/all')
      const res  = await fetch(url)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setAllTutors(Array.isArray(data) ? data : [])
    } catch {
      setError('Unable to load tutors. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [subject, mode, rating])

  useEffect(() => { fetchTutors() }, []) // eslint-disable-line


  // ── Location detection ────────────────────────────────
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus('❌ Geolocation not supported.')
      setLocPermDenied(true)
      return
    }
    setLocLoading(true)
    setLocStatus('Detecting…')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStudentLat(pos.coords.latitude)
        setStudentLng(pos.coords.longitude)
        setLocStatus(`📍 ${pos.coords.latitude.toFixed(3)}°N, ${pos.coords.longitude.toFixed(3)}°E`)
        setLocLoading(false)
      },
      (err) => {
        if (err.code === 1) { setLocPermDenied(true); setLocStatus('❌ Location access denied.') }
        else setLocStatus('❌ Could not detect location. Try again.')
        setLocLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const clearLocation = () => { setStudentLat(null); setStudentLng(null); setLocStatus('') }


  // ── Attach distance_m ─────────────────────────────────
  const tutorsWithDist = allTutors.map(t => {
    if (studentLat == null || studentLng == null) return t
    const [tLng, tLat] = t.location?.coordinates || [0, 0]
    if (tLat === 0 && tLng === 0) return t
    return { ...t, distance_m: haversineMetres(studentLat, studentLng, tLat, tLng) }
  })


  // ── List view filtering ───────────────────────────────
  const listTutors = tutorsWithDist.filter(t => {
    const m = t.teachingMode
    if (m === 'online' || m === 'hybrid') return true
    if (m === 'home')                     return true
    if (m === 'center') {
      if (studentLat == null || t.distance_m == null) return true
      return t.distance_m <= radiusKm * 1000
    }
    return true
  })


  // ── Map view — only tutors with real GPS ──────────────
  const mapTutors = tutorsWithDist.filter(t => {
    const [lng, lat] = t.location?.coordinates || [0, 0]
    return lat !== 0 || lng !== 0
  })


  // ── Sort ──────────────────────────────────────────────
  const sorted = [...listTutors].sort((a, b) => {
    if (sortBy.includes('Distance') && studentLat != null) {
      return (a.distance_m ?? Infinity) - (b.distance_m ?? Infinity)
    }
    if (sortBy.includes('Rating'))     return (b.rating     || 0) - (a.rating     || 0)
    if (sortBy.includes('Experience')) return (b.experience || 0) - (a.experience || 0)
    if (sortBy.includes('Price'))      return (a.fee        || 0) - (b.fee        || 0)
    return 0
  })


  // ── Enroll helpers ────────────────────────────────────
  const enrollmentStatus = (tutorId) => {
    const e = enrollments.find(e => String(e.tutorId) === String(tutorId))
    return e ? e.status : null
  }
  const openEnrollModal = (tutor) => { setReqSubject(''); setReqMessage(''); setEnrollModal(tutor) }
  const confirmEnroll   = async () => {
    if (!enrollModal) return
    await onEnroll?.(enrollModal, { subject: reqSubject, message: reqMessage })
    setEnrollModal(null)
  }


  // ── Render ────────────────────────────────────────────
  return (
    <>
      {/* ══ Search / filter bar ═════════════════════════ */}
      <div className="map-search-container">
        <div className="map-search-header">
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:700, color:'var(--gray-800)', marginBottom:12 }}>
              Search Tutors
            </div>

            {/* Location row */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, flexWrap:'wrap' }}>
              {studentLat == null ? (
                <button
                  onClick={handleDetectLocation}
                  disabled={locLoading || locPermDenied}
                  style={{
                    padding:'7px 14px',
                    border:'1.5px solid var(--blue-200)',
                    borderRadius:'var(--radius-md)',
                    background:'var(--blue-50)',
                    color: locPermDenied ? 'var(--gray-400)' : 'var(--blue-600)',
                    fontSize:13, fontWeight:600,
                    cursor:(locLoading || locPermDenied) ? 'not-allowed' : 'pointer',
                    opacity:(locLoading || locPermDenied) ? 0.7 : 1,
                    display:'flex', alignItems:'center', gap:6,
                  }}
                >
                  {locLoading ? '⏳ Detecting…' : '📍 Use My Location'}
                </button>
              ) : (
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:13, color:'#15803d', fontWeight:600, background:'#dcfce7', padding:'5px 10px', borderRadius:'var(--radius-md)' }}>
                    {locStatus}
                  </span>
                  <button onClick={clearLocation} style={{ fontSize:12, color:'var(--gray-500)', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>
                    Clear
                  </button>
                </div>
              )}
              {locStatus.startsWith('❌') && (
                <span style={{ fontSize:12, color:'#dc2626' }}>{locStatus}</span>
              )}
            </div>

            {/* Filters */}
            <div className="search-filters">
              <select className="filter-select" value={subject} onChange={e => setSubject(e.target.value)}>
                <option value="">All Subjects</option>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>

              <select
                className="filter-select"
                value={radiusKm}
                onChange={e => setRadiusKm(Number(e.target.value))}
                style={{ opacity: studentLat == null ? 0.5 : 1 }}
                title="Radius filter applies to Tuition Centers only"
              >
                {RADIUS_KM_OPTIONS.map(r => <option key={r} value={r}>{r} km</option>)}
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

              <button
                className="btn-primary"
                style={{ padding:'8px 16px', fontSize:13 }}
                onClick={() => fetchTutors({ subjectFilter:subject, modeFilter:mode, ratingFilter:rating })}
              >
                🔍 Search
              </button>
            </div>

            {studentLat != null && (
              <p style={{ fontSize:11, color:'var(--gray-400)', marginTop:8 }}>
                📌 Radius filter applies to <strong>Tuition Centers</strong> only.
                Home / Online / Hybrid tutors always appear in List view regardless of distance.
              </p>
            )}
          </div>

          {/* View toggle */}
          <div className="view-toggle" style={{ alignSelf:'flex-start' }}>
            <div
              className={`view-btn${view === 'map' ? ' active' : ''}`}
              onClick={() => setView('map')}
              title="Map view — shows tuition centers with a saved location"
            >
              🗺 Map
            </div>
            <div
              className={`view-btn${view === 'list' ? ' active' : ''}`}
              onClick={() => setView('list')}
            >
              ☰ List
            </div>
          </div>
        </div>

        {/* ── Map panel (inside the search container) ── */}
        {view === 'map' && (
          <>
            <div className="map-container" style={{ height:'auto', background:'transparent' }}>
              <TutorMap
                tutors={mapTutors}
                studentLat={studentLat}
                studentLng={studentLng}
                radiusKm={radiusKm}
                enrollments={enrollments}
                onEnroll={openEnrollModal}
                onViewProfile={(tutor) => navigate(`/tutor/${tutor._id}`)}
              />
            </div>
            <div style={{
              padding:'10px 20px 14px',
              fontSize:12,
              color:'var(--gray-400)',
              borderTop:'1px solid var(--gray-100)',
              background:'var(--gray-50)',
              lineHeight:1.6,
            }}>
              💡 Only tutors who shared their GPS location appear as pins here.
              <strong> Tuition Centers</strong> with a saved location are always on the map.
              <strong> Home tutors</strong> appear on the map only if they saved their location.
              <strong> Online / Hybrid</strong> tutors don't have a physical location — find them in <strong>List view</strong>.
            </div>
          </>
        )}
      </div>


      {/* ══ List view ═══════════════════════════════════ */}
      {view === 'list' && (
        <>
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

          {!loading && !error && (
            <>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:12 }}>
                <div>
                  <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:16, color:'var(--gray-800)' }}>
                    {sorted.length} Tutor{sorted.length !== 1 ? 's' : ''} Found
                  </span>
                  {studentLat != null && (
                    <span style={{ fontSize:12, color:'var(--gray-400)', marginLeft:8 }}>
                      · centers within {radiusKm} km · home/online always shown
                    </span>
                  )}
                </div>
                <select
                  style={{ padding:'8px 12px', border:'1.5px solid var(--gray-200)', borderRadius:'var(--radius-md)', fontSize:13, outline:'none' }}
                  value={sortBy} onChange={e => setSortBy(e.target.value)}
                >
                  {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>

              {sorted.length === 0 ? (
                <div style={{ padding:48, textAlign:'center', color:'var(--gray-400)', fontSize:15, background:'var(--gray-50)', borderRadius:'var(--radius-xl)', border:'1px dashed var(--gray-200)' }}>
                  <div style={{ fontSize:32, marginBottom:12 }}>🔍</div>
                  {studentLat != null && (mode === 'center' || mode === '')
                    ? `No tuition centers found within ${radiusKm} km. Try increasing the radius.`
                    : 'No tutors found. Try adjusting your filters.'}
                </div>
              ) : (
                <div className="tutors-grid">
                  {sorted.map(tutor => {
                    const m = tutor.teachingMode
                    const showDist = (
                      studentLat != null &&
                      tutor.distance_m != null &&
                      m !== 'online' &&
                      m !== 'hybrid'
                    )
                    return (
                      <TutorCard
                        key={tutor._id}
                        tutor={tutor}
                        distanceLabel={showDist ? formatDistance(tutor.distance_m) : null}
                        enrollmentStatus={enrollmentStatus(tutor._id)}
                        onEnroll={() => openEnrollModal(tutor)}
                        enrollLoading={enrollLoading}
                        onViewProfile={() => navigate(`/tutor/${tutor._id}`)}
                      />
                    )
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}


      {/* ══ Enroll modal ════════════════════════════════ */}
      {enrollModal && (
        <div className="modal-backdrop">
          <div className="modal-inner">
            <h2 style={{ fontSize:20, fontWeight:700, marginBottom:6, color:'var(--gray-900)' }}>
              Send Enrollment Request
            </h2>
            <p style={{ fontSize:14, color:'var(--gray-500)', marginBottom:24 }}>
              Requesting to enroll with <strong>{enrollModal.name}</strong>
            </p>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'var(--gray-700)', marginBottom:6 }}>
                Subject <span style={{ color:'#ef4444' }}>*</span>
              </label>
              <select value={reqSubject} onChange={e => setReqSubject(e.target.value)}
                style={{ width:'100%', padding:'10px 12px', border:'1.5px solid var(--gray-200)', borderRadius:'var(--radius-md)', fontSize:14, outline:'none' }}>
                <option value="">Select a subject…</option>
                {(enrollModal.subjects || SUBJECTS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'var(--gray-700)', marginBottom:6 }}>
                Message <span style={{ color:'var(--gray-400)', fontWeight:400 }}>(optional)</span>
              </label>
              <textarea
                value={reqMessage} onChange={e => setReqMessage(e.target.value)}
                placeholder="Introduce yourself, mention your goals or schedule…"
                rows={3}
                style={{ width:'100%', padding:'10px 12px', border:'1.5px solid var(--gray-200)', borderRadius:'var(--radius-md)', fontSize:14, outline:'none', resize:'vertical', fontFamily:'inherit', boxSizing:'border-box' }}
              />
            </div>
            <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
              <button
                onClick={() => setEnrollModal(null)}
                style={{ padding:'10px 20px', border:'1.5px solid var(--gray-200)', borderRadius:'var(--radius-md)', fontSize:14, fontWeight:600, color:'var(--gray-600)', background:'white', cursor:'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmEnroll}
                disabled={!reqSubject || enrollLoading}
                className="btn-primary"
                style={{ padding:'10px 20px', fontSize:14, opacity:(!reqSubject || enrollLoading) ? 0.6 : 1 }}
              >
                {enrollLoading ? 'Sending…' : '✉️ Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}