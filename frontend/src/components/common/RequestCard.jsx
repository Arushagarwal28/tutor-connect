/**
 * RequestCard  –  used in both student (enrolled tutors) and tutor (student requests).
 * Props:
 *   item         – enrollment/request data object
 *   variant      – "request" (accept/decline) | "enrollment" (status only)
 *   onAccept(id) – called when accept button clicked
 *   onDecline(id)– called when decline button clicked
 *   onMessage()  – called when message button clicked
 */
export default function RequestCard({ item, variant = 'enrollment', onAccept, onDecline, onMessage }) {
  const statusClass = {
    active:    'status-badge status-active',
    confirmed: 'status-badge status-confirmed',
    pending:   'status-badge status-pending',
    enrolled:  'status-badge status-confirmed',
  }

  const statusLabel = {
    active:    'Active',
    confirmed: 'Enrolled',
    pending:   'Pending',
    enrolled:  'Enrolled',
  }

  return (
    <div className="request-card">
      <div
        className="request-avatar"
        style={{ background: item.avatarBg, color: item.avatarColor }}
      >
        {item.initials}
      </div>

      <div className="request-info">
        <div className="request-name">{item.name}</div>
        <div className="request-detail">{item.detail || item.budget}</div>
        {item.enrolledDate && (
          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--gray-400)' }}>
            Enrolled: {item.enrolledDate} · {item.daysActive} days active
          </div>
        )}
        {item.status === 'pending' && (
          <div style={{ marginTop: 6, fontSize: 12, color: '#f59e0b' }}>
            ⏳ Pending confirmation from tutor
          </div>
        )}
        {variant === 'request' && item.budget && (
          <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>
            Budget: {item.budget}
          </div>
        )}
      </div>

      <div className="request-actions">
        {variant === 'request' ? (
          <>
            <button className="btn-accept" onClick={() => onAccept && onAccept(item.id)}>
              ✓ Accept
            </button>
            <button className="btn-decline" onClick={() => onDecline && onDecline(item.id)}>
              ✕ Decline
            </button>
          </>
        ) : (
          <>
            <span className={statusClass[item.status]}>
              {statusLabel[item.status]}
            </span>
            {item.status !== 'pending' && (
              <button className="btn-ghost" style={{ fontSize: 13, padding: '8px 12px' }} onClick={onMessage}>
                Message
              </button>
            )}
            {item.status === 'pending' && (
              <button style={{ padding: '8px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600 }}>
                Cancel Request
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
