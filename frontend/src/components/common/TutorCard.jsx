import VerifiedBadge from './VerifiedBadge.jsx'

/**
 * TutorCard — student-facing tutor search result card.
 *
 * Props:
 *   tutor            – real MongoDB Tutor document
 *   distanceLabel    – formatted distance string e.g. "2.4 km away" | null
 *   enrollmentStatus – 'active' | 'pending' | null
 *   onEnroll()       – called when student clicks Enroll
 *   enrollLoading    – disables button while API call in flight
 *   onViewProfile()  – called when View Profile is clicked
 */
export default function TutorCard({ tutor, distanceLabel, enrollmentStatus, onEnroll, enrollLoading, onViewProfile }) {

  if (!tutor) return null

  const name           = tutor.name                || 'Unknown Tutor'
  const initials       = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const qual           = tutor.qualification       || 'Qualification not listed'
  const exp            = tutor.experience          ? `${tutor.experience} yr${tutor.experience !== 1 ? 's' : ''}` : '—'
  const subjects       = Array.isArray(tutor.subjects) ? tutor.subjects : []
  const mode           = tutor.teachingMode        || '—'
  const rating         = tutor.rating              ? Number(tutor.rating).toFixed(1) : '—'
  const reviews        = tutor.totalReviews        || 0
  const activeStudents = tutor.activeStudents      || 0
  const verified       = tutor.verifiedStatus      || false
  const fee            = tutor.fee                 ? `₹${Number(tutor.fee).toLocaleString('en-IN')}` : 'Fee not listed'

  // ── Enroll button state ──────────────────────────────
  const isActive  = enrollmentStatus === 'active'
  const isPending = enrollmentStatus === 'pending'
  const canEnroll = !isActive && !isPending

  const enrollLabel = isActive  ? '✓ Enrolled'
                    : isPending ? '⏳ Pending…'
                    : '+ Enroll'

  const enrollStyle = {
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    cursor: canEnroll && !enrollLoading ? 'pointer' : 'default',
    border: 'none',
    background: isActive  ? '#dcfce7'
              : isPending ? '#fef9c3'
              : 'var(--blue-600)',
    color: isActive  ? '#15803d'
         : isPending ? '#92400e'
         : 'white',
    opacity: (isPending || (canEnroll && enrollLoading)) ? 0.7 : 1,
  }


  return (
    <div className="tutor-card">

      <div className="tutor-card-header">
        <div className="tutor-avatar" style={{ background:'#dbeafe', color:'#1d4ed8', border:'2px solid #bfdbfe' }}>
          {initials}
        </div>
        <div className="tutor-card-info">
          <div className="tutor-card-name">{name}</div>
          <div className="tutor-card-qual">{qual}</div>
          <div className="tutor-card-rating">
            ⭐ {rating}{' '}
            <span style={{ color:'var(--gray-400)' }}>
              {reviews > 0 ? `(${reviews} reviews)` : '(no reviews yet)'}
            </span>
          </div>
        </div>
      </div>

      <div className="tutor-card-body">
        {verified && (
          <div style={{ marginBottom:10 }}>
            <VerifiedBadge verified size="sm" />
          </div>
        )}

        <div className="tutor-card-subjects">
          {subjects.length > 0
            ? subjects.map(s => (
                <span key={s} className="tag tag-blue" style={{ fontSize:11, padding:'3px 10px' }}>{s}</span>
              ))
            : <span style={{ fontSize:12, color:'var(--gray-400)' }}>No subjects listed</span>
          }
        </div>

        <div className="tutor-card-stats">
          <span className="tutor-card-stat">📚 {exp} exp</span>
          <span className="tutor-card-stat">👥 {activeStudents} students</span>
          <span className="tutor-card-stat">🏠 {mode}</span>
          {/* ── Distance badge ─ shown only when location is available ── */}
          {distanceLabel && (
            <span
              className="tutor-card-stat"
              style={{
                background: '#f0fdf4',
                color:      '#15803d',
                borderRadius: 'var(--radius-sm, 4px)',
                fontWeight: 600,
                fontSize: 12,
                padding: '2px 8px',
              }}
            >
              📍 {distanceLabel}
            </span>
          )}
        </div>
      </div>

      <div className="tutor-card-footer">
        <div className="tutor-card-fee">{fee} <span>/month</span></div>

        <div style={{ display:'flex', gap:8 }}>
          {/* View Profile */}
          <button
            style={{ padding:'8px 12px', fontSize:13, fontWeight:600, borderRadius:'var(--radius-md)', border:'1.5px solid var(--gray-200)', background:'white', color:'var(--gray-700)', cursor:'pointer' }}
            onClick={() => onViewProfile?.(tutor)}
          >
            View
          </button>

          {/* Enroll button */}
          <button
            style={enrollStyle}
            disabled={!canEnroll || enrollLoading}
            onClick={() => canEnroll && !enrollLoading && onEnroll?.()}
          >
            {enrollLabel}
          </button>
        </div>
      </div>

    </div>
  )
}