import { useState, useEffect } from 'react'
import RequestCard from '../../common/RequestCard.jsx'

/**
 * StudentRequestsSection
 *
 * Props (all passed from TutorDashboardPage — real API data):
 *   requests      – shaped enrollment request objects from /api/tutors/requests
 *   onAccept(id)  – calls PATCH /api/tutors/requests/:id/accept
 *   onDecline(id) – calls PATCH /api/tutors/requests/:id/decline
 *   loading       – boolean
 */
export default function StudentRequestsSection({ requests = [], onAccept, onDecline, loading = false }) {

  const [items, setItems] = useState(requests)

  // Sync when parent passes new requests (after accept/decline re-fetch)
  useEffect(() => { setItems(requests) }, [requests])

  const handleAccept = (id) => {
    setItems(prev => prev.map(r => r.id === id ? { ...r, _accepted: true } : r))
    onAccept?.(id)
  }

  const handleDecline = (id) => {
    setItems(prev => prev.filter(r => r.id !== id))
    onDecline?.(id)
  }

  return (
    <>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontSize:22, fontWeight:700, marginBottom:4, color:'var(--gray-900)' }}>
          Student Requests
        </h2>
        <p style={{ fontSize:14, color:'var(--gray-500)' }}>
          Accept or decline enrollment requests from students
        </p>
      </div>

      {loading ? (
        <div style={{ padding:40, textAlign:'center', color:'var(--gray-400)', fontSize:14 }}>
          Loading requests…
        </div>
      ) : items.length === 0 ? (
        <div style={{
          padding:48, textAlign:'center', color:'var(--gray-400)', fontSize:15,
          background:'var(--gray-50)', borderRadius:'var(--radius-xl)',
          border:'1px dashed var(--gray-200)',
        }}>
          <div style={{ fontSize:32, marginBottom:12 }}>📭</div>
          No pending student requests
        </div>
      ) : (
        <div style={{ display:'grid', gap:16 }}>
          {items.map(item =>
            item._accepted ? (
              <div key={item.id} className="request-card">
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>✓</div>
                  <div>
                    <div style={{ fontWeight:700 }}>{item.name}</div>
                    <div style={{ fontSize:13, color:'var(--green-600)' }}>Enrollment request accepted</div>
                  </div>
                </div>
              </div>
            ) : (
              <RequestCard
                key={item.id}
                item={item}
                variant="request"
                onAccept={handleAccept}
                onDecline={handleDecline}
              />
            )
          )}
        </div>
      )}
    </>
  )
}