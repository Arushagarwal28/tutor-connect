import { useEffect, useRef, useState } from 'react'

/**
 * TutorMap
 *
 * Renders a Google Map showing:
 *   • Blue pulsing dot  — student's current location (if available)
 *   • Custom markers    — tuition centers that shared their location
 *   • Info window       — opens on pin click, shows name / rating / fee
 *                         with an "Enroll" / "View Profile" CTA
 *
 * Props:
 *   tutors           – array of tutor docs (from /api/tutors/all or /search)
 *   studentLat       – student GPS latitude  | null
 *   studentLng       – student GPS longitude | null
 *   radiusKm         – draw a dashed radius circle around student (km)
 *   onEnroll(tutor)  – called when Enroll is clicked in info window
 *   onViewProfile(tutor)
 *   enrollments      – array of enrollment objects (to know status per tutor)
 */
export default function TutorMap({
  tutors        = [],
  studentLat    = null,
  studentLng    = null,
  radiusKm      = 5,
  onEnroll,
  onViewProfile,
  enrollments   = [],
}) {
  const mapDivRef    = useRef(null)
  const mapRef       = useRef(null)       // google.maps.Map instance
  const markersRef   = useRef([])         // google.maps.Marker[]
  const circleRef    = useRef(null)       // google.maps.Circle (radius)
  const studentRef   = useRef(null)       // student marker
  const infoWindowRef = useRef(null)      // single shared InfoWindow
  const [apiReady, setApiReady] = useState(false)
  const [loadError, setLoadError] = useState('')

  const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY

  // ── Load Google Maps script ──────────────────────────
  useEffect(() => {
    if (!MAPS_KEY) {
      setLoadError('no-key')
      return
    }
    // If already loaded by a previous mount (hot-reload, re-mount)
    if (window.google?.maps) {
      setApiReady(true)
      return
    }
    // Already in DOM (another component loaded it)
    if (document.querySelector('#gmap-script')) {
      const wait = setInterval(() => {
        if (window.google?.maps) { setApiReady(true); clearInterval(wait) }
      }, 100)
      return () => clearInterval(wait)
    }

    const script   = document.createElement('script')
    script.id      = 'gmap-script'
    script.src     = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=geometry`
    script.async   = true
    script.defer   = true
    script.onload  = () => setApiReady(true)
    script.onerror = () => setLoadError('load-fail')
    document.head.appendChild(script)
  }, [MAPS_KEY])


  // ── Initialise map once API is ready ─────────────────
  useEffect(() => {
    if (!apiReady || !mapDivRef.current) return
    if (mapRef.current) return   // already initialised

    const center = (studentLat != null && studentLng != null)
      ? { lat: studentLat, lng: studentLng }
      : { lat: 28.6139, lng: 77.2090 }   // default: New Delhi

    mapRef.current = new window.google.maps.Map(mapDivRef.current, {
      center,
      zoom:              12,
      mapTypeControl:    false,
      streetViewControl: false,
      fullscreenControl: true,
      styles: SUBTLE_STYLE,
    })

    infoWindowRef.current = new window.google.maps.InfoWindow()
  }, [apiReady])   // eslint-disable-line react-hooks/exhaustive-deps


  // ── Student location marker + radius circle ───────────
  useEffect(() => {
    if (!mapRef.current || !window.google) return

    // Remove old student marker
    if (studentRef.current) studentRef.current.setMap(null)
    if (circleRef.current)  circleRef.current.setMap(null)

    if (studentLat == null || studentLng == null) return

    const pos = { lat: studentLat, lng: studentLng }

    // Pulse dot for student
    studentRef.current = new window.google.maps.Marker({
      position: pos,
      map:      mapRef.current,
      title:    'You are here',
      icon: {
        path:         window.google.maps.SymbolPath.CIRCLE,
        fillColor:    '#2563eb',
        fillOpacity:  1,
        strokeColor:  'white',
        strokeWeight: 3,
        scale:        9,
      },
      zIndex: 999,
    })

    // Dashed radius circle
    circleRef.current = new window.google.maps.Circle({
      map,
      center:        pos,
      radius:        radiusKm * 1000,
      fillColor:     '#2563eb',
      fillOpacity:   0.05,
      strokeColor:   '#2563eb',
      strokeOpacity: 0.35,
      strokeWeight:  2,
    })
    circleRef.current.setMap(mapRef.current)

    mapRef.current.panTo(pos)
  }, [studentLat, studentLng, radiusKm])


  // ── Update radius circle when radiusKm changes ────────
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radiusKm * 1000)
    }
  }, [radiusKm])


  // ── Tutor center markers ──────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !window.google) return

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    // Only tuition centers with a valid location
    const centerTutors = tutors.filter(t => {
      if (t.teachingMode !== 'center') return false
      const [lng, lat] = t.location?.coordinates || [0, 0]
      return lat !== 0 || lng !== 0
    })

    centerTutors.forEach(tutor => {
      const [lng, lat] = tutor.location.coordinates
      const enrollment = enrollments.find(e => String(e.tutorId) === String(tutor._id))
      const status     = enrollment?.status || null

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map:      mapRef.current,
        title:    tutor.name,
        icon:     buildIcon(tutor.rating),
        animation: window.google.maps.Animation.DROP,
      })

      marker.addListener('click', () => {
        infoWindowRef.current.setContent(buildInfoHTML(tutor, status))
        infoWindowRef.current.open(mapRef.current, marker)
      })

      markersRef.current.push(marker)
    })

    // Attach global handlers for info-window buttons
    window.__tcEnroll      = (id) => {
      const t = tutors.find(t => String(t._id) === id)
      if (t) onEnroll?.(t)
      infoWindowRef.current.close()
    }
    window.__tcViewProfile = (id) => {
      const t = tutors.find(t => String(t._id) === id)
      if (t) onViewProfile?.(t)
      infoWindowRef.current.close()
    }
  }, [tutors, enrollments])   // eslint-disable-line react-hooks/exhaustive-deps


  // ── Render ────────────────────────────────────────────
  if (loadError === 'no-key') {
    return (
      <div style={PLACEHOLDER_STYLE}>
        <div style={GRID_STYLE} />
        <div style={NOTE_STYLE}>
          🔑 Add <code>VITE_GOOGLE_MAPS_KEY=your_key</code> to <code>.env.local</code> to enable the map.
        </div>
        <p style={{ fontSize: 13, color: '#64748b', zIndex: 2 }}>
          Tuition centers that share their location will appear as pins here.
        </p>
      </div>
    )
  }

  if (loadError === 'load-fail') {
    return (
      <div style={PLACEHOLDER_STYLE}>
        <div style={GRID_STYLE} />
        <div style={NOTE_STYLE}>⚠️ Failed to load Google Maps. Check your API key and network connection.</div>
      </div>
    )
  }

  if (!apiReady) {
    return (
      <div style={PLACEHOLDER_STYLE}>
        <div style={GRID_STYLE} />
        <div style={{ zIndex: 2, display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', fontSize: 14 }}>
          <span style={{ display: 'inline-block', width: 18, height: 18, border: '3px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          Loading map…
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const centerCount = tutors.filter(t => {
    if (t.teachingMode !== 'center') return false
    const [lng, lat] = t.location?.coordinates || [0, 0]
    return lat !== 0 || lng !== 0
  }).length

  return (
    <div style={{ position: 'relative' }}>
      <div ref={mapDivRef} style={{ width: '100%', height: 440, borderRadius: 'var(--radius-lg)' }} />
      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 12, left: 12, zIndex: 10,
        background: 'rgba(255,255,255,0.95)', borderRadius: 'var(--radius-md)',
        padding: '8px 14px', fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column', gap: 5,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#2563eb', border: '2px solid white', display: 'inline-block' }} />
          <span style={{ color: '#334155' }}>Your location</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>📍</span>
          <span style={{ color: '#334155' }}>Tuition center ({centerCount} on map)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 20, height: 3, background: '#2563eb', opacity: 0.4, display: 'inline-block', borderTop: '2px dashed #2563eb' }} />
          <span style={{ color: '#334155' }}>{radiusKm} km radius</span>
        </div>
      </div>
    </div>
  )
}


// ── Helpers ───────────────────────────────────────────────

function buildIcon(rating) {
  const color = rating >= 4.5 ? '#16a34a' : rating >= 4 ? '#2563eb' : '#6b7280'
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
        <filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/></filter>
        <path filter="url(#s)" d="M18 2C10.3 2 4 8.3 4 16c0 10.5 14 26 14 26S32 26.5 32 16c0-7.7-6.3-14-14-14z" fill="${color}"/>
        <circle cx="18" cy="16" r="8" fill="white"/>
        <text x="18" y="20" text-anchor="middle" font-size="9" font-weight="700" fill="${color}" font-family="sans-serif">🏫</text>
      </svg>`)}`,
    scaledSize: new window.google.maps.Size(36, 44),
    anchor:     new window.google.maps.Point(18, 44),
  }
}

function buildInfoHTML(tutor, enrollmentStatus) {
  const name     = tutor.name || 'Tutor'
  const qual     = tutor.qualification || ''
  const rating   = tutor.rating ? Number(tutor.rating).toFixed(1) : '—'
  const fee      = tutor.fee ? `₹${Number(tutor.fee).toLocaleString('en-IN')}/mo` : '—'
  const subjects = (tutor.subjects || []).slice(0, 3).join(', ') || '—'
  const isActive  = enrollmentStatus === 'active'
  const isPending = enrollmentStatus === 'pending'
  const id        = tutor._id

  const enrollBtn = isActive
    ? `<span style="background:#dcfce7;color:#15803d;padding:6px 14px;border-radius:8px;font-size:12px;font-weight:700;">✓ Enrolled</span>`
    : isPending
    ? `<span style="background:#fef9c3;color:#92400e;padding:6px 14px;border-radius:8px;font-size:12px;font-weight:700;">⏳ Pending</span>`
    : `<button onclick="window.__tcEnroll('${id}')" style="background:#2563eb;color:white;border:none;padding:6px 14px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;">+ Enroll</button>`

  return `
    <div style="font-family:'DM Sans',sans-serif;min-width:200px;max-width:240px;">
      <div style="font-family:'Sora',sans-serif;font-size:15px;font-weight:700;color:#0f172a;margin-bottom:2px;">${name}</div>
      ${qual ? `<div style="font-size:12px;color:#64748b;margin-bottom:6px;">${qual}</div>` : ''}
      <div style="font-size:12px;color:#475569;margin-bottom:4px;">⭐ ${rating} &nbsp;|&nbsp; 💰 ${fee}</div>
      <div style="font-size:12px;color:#475569;margin-bottom:10px;">📚 ${subjects}</div>
      <div style="display:flex;gap:8px;align-items:center;">
        <button onclick="window.__tcViewProfile('${id}')" style="background:white;color:#334155;border:1.5px solid #e2e8f0;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;">View</button>
        ${enrollBtn}
      </div>
    </div>`
}

// Subtle grey map style (less visual noise)
const SUBTLE_STYLE = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
]

const PLACEHOLDER_STYLE = {
  width: '100%', height: 440,
  background: 'linear-gradient(135deg,#e0f2fe,#f0f9ff,#ecfdf5)',
  borderRadius: 'var(--radius-lg)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexDirection: 'column', gap: 16,
  position: 'relative', overflow: 'hidden',
}
const GRID_STYLE = {
  position: 'absolute', inset: 0,
  backgroundImage: 'linear-gradient(rgba(37,99,235,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,0.08) 1px,transparent 1px)',
  backgroundSize: '40px 40px',
}
const NOTE_STYLE = {
  background: 'rgba(255,255,255,0.92)',
  borderRadius: '12px',
  padding: '10px 18px',
  fontSize: 13,
  color: '#1d4ed8',
  border: '1px solid #bfdbfe',
  zIndex: 2,
  textAlign: 'center',
  maxWidth: 420,
  lineHeight: 1.6,
}