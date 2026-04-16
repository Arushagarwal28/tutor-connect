import VerifiedBadge from '../../common/VerifiedBadge.jsx'

const BADGE_PROGRESS = {
  requiredStudents: 5,
  currentStudents: 0
}

/**
 * VerifiedBadgeSection
 * Props:
 *   isVerified    – boolean
 *   progress      – array of { label, current, required, met }
 *   tutorName     – string
 *   tutorInitials – string
 *   tutorQual     – string
 *   stats         – { rating, activeStudents, exp, fee }
 */
export default function VerifiedBadgeSection({
  isVerified = true,
  progress = BADGE_PROGRESS,
  tutorName = 'Priya Sharma',
  tutorInitials = 'PS',
  tutorQual = 'M.Sc Mathematics, B.Ed · 5 years',
  stats = { rating: '4.9', activeStudents: 8, exp: '5 years', fee: '₹2,500/mo' },
}) {
  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)' }}>Platform Verified Badge</h2>
        <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>Your badge status and eligibility breakdown</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Progress card */}
        <div className="badge-progress-card">
          <div className="badge-progress-header">
            <div className="badge-progress-title">Badge Eligibility Status</div>
            {isVerified && <VerifiedBadge verified size="full" />}
          </div>

          {progress.map((p) => (
            <div key={p.label} className="progress-item">
              <div className="progress-label">
                <span>{p.label}</span>
                <span style={{ color: p.met ? 'var(--green-600)' : 'var(--yellow-500)', fontWeight: 700 }}>
                  {p.current} / {p.required} {p.met ? '✓' : ''}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min((p.current / p.required) * 100, 100)}%`,
                    background: p.met
                      ? 'linear-gradient(90deg,var(--green-500),var(--green-400))'
                      : 'linear-gradient(90deg,var(--yellow-500),var(--yellow-400))',
                  }}
                />
              </div>
            </div>
          ))}

          {isVerified && (
            <div className="info-note" style={{ marginTop: 16, marginBottom: 0 }}>
              🎉 Congratulations! All criteria are met. Your verified badge is active and visible to students.
            </div>
          )}
        </div>

        {/* Badge demo + how it works */}
        <div>
          <div className="badge-card-demo" style={{ marginBottom: 16 }}>
            <div className="bcd-avatar">{tutorInitials}</div>
            <div className="bcd-info">
              <div className="bcd-name">{tutorName}</div>
              <div className="bcd-qual">{tutorQual}</div>
              <VerifiedBadge verified size="full" />
              <div className="bcd-stats" style={{ marginTop: 8 }}>
                <span>⭐ {stats.rating}</span>
                <span>👥 {stats.activeStudents} students</span>
                <span>📚 {stats.exp}</span>
                <span>{stats.fee}</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', padding: 20, border: '1px solid var(--gray-200)' }}>
            <h4 style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--gray-800)', marginBottom: 12 }}>How the Badge Works</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--gray-600)' }}>
              {[
                '📌 Badge is 100% automatic — no manual assignment',
                '✅ Requires 5+ active students simultaneously',
                '📅 Students must be enrolled for 30+ consecutive days',
                '🤝 Both parties must confirm the enrollment',
                '🔄 Badge is revoked automatically if active students drop below 5',
                '💙 Badge appears as a blue verified tick on your profile',
              ].map((line) => <div key={line}>{line}</div>)}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
