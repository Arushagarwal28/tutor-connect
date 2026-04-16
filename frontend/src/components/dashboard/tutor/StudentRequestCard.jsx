import { useState } from 'react'

/**
 * @param {object}   request  - shape from SAMPLE_REQUESTS
 * @param {function} onAccept - (id) => void
 * @param {function} onDecline - (id) => void
 */
export default function StudentRequestCard({ request, onAccept, onDecline }) {
  const [status, setStatus] = useState('pending') // 'pending' | 'accepted' | 'declined'

  const handleAccept = () => {
    setStatus('accepted')
    onAccept?.(request.id)
  }
  const handleDecline = () => {
    setStatus('declined')
    onDecline?.(request.id)
  }

  if (status === 'accepted') {
    return (
      <div className="request-card">
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: '#dcfce7', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 18, flexShrink: 0,
        }}>✓</div>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{request.name}</div>
          <div style={{ fontSize: 13, color: 'var(--green-600)' }}>Enrollment request accepted</div>
        </div>
      </div>
    )
  }

  if (status === 'declined') {
    return (
      <div className="request-card" style={{ opacity: 0.4 }}>
        <div className="request-avatar" style={{ background: request.color, color: request.textColor }}>
          {request.initials}
        </div>
        <div className="request-info">
          <div className="request-name">{request.name}</div>
          <div className="request-detail">Request declined</div>
        </div>
      </div>
    )
  }

  return (
    <div className="request-card">
      <div
        className="request-avatar"
        style={{ background: request.color, color: request.textColor }}
      >
        {request.initials}
      </div>
      <div className="request-info">
        <div className="request-name">{request.name}</div>
        <div className="request-detail">
          {request.classBoard} · {request.subject} · {request.mode}
        </div>
        <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>
          Budget: {request.budget}
        </div>
        <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
          Sent {request.sentAgo} · {request.distance} away
        </div>
      </div>
      <div className="request-actions">
        <button className="btn-accept" onClick={handleAccept}>✓ Accept</button>
        <button className="btn-decline" onClick={handleDecline}>✕ Decline</button>
      </div>
    </div>
  )
}
