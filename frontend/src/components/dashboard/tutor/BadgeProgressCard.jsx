import VerifiedBadge from '../../common/VerifiedBadge'

/**
 * @param {object[]} progressItems  - from BADGE_PROGRESS
 * @param {boolean}  isEligible
 */
export default function BadgeProgressCard({ progressItems = [], isEligible = false }) {
  return (
    <div className="badge-progress-card">
      <div className="badge-progress-header">
        <div className="badge-progress-title">Badge Eligibility Status</div>
        {isEligible
          ? <VerifiedBadge size="white" />
          : <span className="status-badge status-pending">In Progress</span>
        }
      </div>

      {progressItems.map(item => (
        <div className="progress-item" key={item.label}>
          <div className="progress-label">
            <span>{item.label}</span>
            <span style={{ color: item.met ? 'var(--green-600)' : 'var(--gray-500)', fontWeight: 700 }}>
              {item.value}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${item.pct}%`,
                background: item.met
                  ? 'linear-gradient(90deg, var(--green-500), var(--green-400))'
                  : 'linear-gradient(90deg, var(--blue-500), var(--blue-300))',
              }}
            />
          </div>
        </div>
      ))}

      {isEligible && (
        <div className="info-note" style={{ marginTop: 16, marginBottom: 0 }}>
          🎉 Congratulations! All criteria are met. Your verified badge is active and visible to students.
        </div>
      )}
    </div>
  )
}
