import VerifiedBadge from '../common/VerifiedBadge'

/**
 * @param {object}   tutor    - shape from SAMPLE_TUTORS
 * @param {function} onView   - (tutor) => void
 */
export default function TutorCard({ tutor, onView }) {
  return (
    <div className="tutor-card">
      <div className="tutor-card-header">
        <div
          className="tutor-avatar"
          style={{
            background: `linear-gradient(135deg, ${tutor.color}, ${tutor.textColor}10)`,
            color: tutor.textColor,
            border: `2px solid ${tutor.color}`,
          }}
        >
          {tutor.initials}
        </div>
        <div className="tutor-card-info">
          <div className="tutor-card-name">{tutor.name}</div>
          <div className="tutor-card-qual">{tutor.qual}</div>
          <div className="tutor-card-rating">
            ⭐ {tutor.rating}{' '}
            <span style={{ color: 'var(--gray-400)' }}>({tutor.reviews} reviews)</span>
          </div>
        </div>
      </div>

      <div className="tutor-card-body">
        {tutor.verified && (
          <div style={{ marginBottom: 10 }}>
            <VerifiedBadge size="sm" />
          </div>
        )}
        <div className="tutor-card-subjects">
          {tutor.subjects.map(s => (
            <span key={s} className="tag tag-blue" style={{ fontSize: 11, padding: '3px 10px' }}>
              {s}
            </span>
          ))}
        </div>
        <div className="tutor-card-stats">
          <span className="tutor-card-stat">📚 {tutor.exp} exp</span>
          <span className="tutor-card-stat">👥 {tutor.activeStudents} students</span>
          <span className="tutor-card-stat">🏠 {tutor.mode}</span>
        </div>
        <div className="tutor-card-distance">📍 {tutor.distance} km away</div>
      </div>

      <div className="tutor-card-footer">
        <div className="tutor-card-fee">
          {tutor.fee} <span>/month</span>
        </div>
        <button
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: 13 }}
          onClick={() => onView?.(tutor)}
        >
          View Profile
        </button>
      </div>
    </div>
  )
}
