import { useState, useEffect } from 'react'
import VerifiedBadge from '../../common/VerifiedBadge.jsx'
import RequestCard   from '../../common/RequestCard.jsx'

// Stat icon map by index
const STAT_ICONS = {
  0: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
  1: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  2: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  3: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
}

/**
 * OverviewSection
 * Props (all from TutorDashboardPage — real API data):
 *   isVerified    – boolean
 *   stats         – array of { label, value, change, up, iconBg }
 *   requests      – array of shaped enrollment request objects
 *   onAccept(id)  – call API to accept
 *   onDecline(id) – call API to decline
 *   onViewRequests()
 *   onViewBadge()
 */
export default function OverviewSection({
  isVerified = false,
  stats      = [],
  requests   = [],
  onAccept,
  onDecline,
  onViewRequests,
  onViewBadge,
}) {

  const [reqList, setReqList] = useState(requests)

  // Sync when parent re-fetches (e.g. after accept/decline)
  useEffect(() => { setReqList(requests) }, [requests])

  const handleAccept = (id) => {
    setReqList(prev => prev.map(r => r.id === id ? { ...r, _accepted: true } : r))
    onAccept?.(id)
  }

  const handleDecline = (id) => {
    setReqList(prev => prev.filter(r => r.id !== id))
    onDecline?.(id)
  }

  return (
    <>
      {/* ── Verified banner ───────────────────────────── */}
      {isVerified && (
        <div style={{
          background:'linear-gradient(135deg,#2563eb,#1e3a8a)',
          borderRadius:'var(--radius-xl)', padding:'24px 28px',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          marginBottom:28, flexWrap:'wrap', gap:16,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:52, height:52, background:'rgba(255,255,255,0.15)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>🏅</div>
            <div>
              <VerifiedBadge verified size="large" />
              <div style={{ color:'rgba(255,255,255,0.75)', fontSize:13, marginTop:4 }}>
                You&apos;ve earned the verified badge! All criteria met.
              </div>
            </div>
          </div>
          <button onClick={onViewBadge} style={{ padding:'10px 20px', background:'rgba(255,255,255,0.15)', color:'white', borderRadius:'var(--radius-md)', fontSize:13, fontWeight:600, border:'1px solid rgba(255,255,255,0.3)', cursor:'pointer' }}>
            View Badge Details
          </button>
        </div>
      )}

      {/* ── Stat cards ─────────────────────────────────── */}
      {stats.length > 0 ? (
        <div className="stats-grid">
          {stats.map((s, i) => (
            <div key={s.label} className="stat-card">
              <div className="stat-card-header">
                <div className="stat-card-icon" style={{ background: s.iconBg }}>
                  {STAT_ICONS[i]}
                </div>
                <span className={`stat-card-change${s.up ? ' up' : ' neutral'}`}>
                  {s.change}
                </span>
              </div>
              <div className="stat-card-value">{s.value}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          ))}
        </div>
      ) : (
        // Empty state when stats not yet loaded
        <div className="stats-grid">
          {[0,1,2,3].map(i => (
            <div key={i} className="stat-card" style={{ opacity:0.4 }}>
              <div className="stat-card-value">—</div>
              <div className="stat-card-label">Loading…</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Requests + Activity grid ───────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:24, marginTop:0 }} className="overview-grid">

        {/* Requests column */}
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:700, color:'var(--gray-800)' }}>
              New Enrollment Requests
              {reqList.filter(r => !r._accepted).length > 0 && (
                <span style={{ marginLeft:8, background:'#ef4444', color:'white', borderRadius:100, fontSize:11, fontWeight:700, padding:'2px 8px' }}>
                  {reqList.filter(r => !r._accepted).length}
                </span>
              )}
            </h3>
            <button onClick={onViewRequests} style={{ fontSize:13, color:'var(--blue-600)', fontWeight:600, background:'none', cursor:'pointer', border:'none' }}>
              View All →
            </button>
          </div>

          <div style={{ display:'grid', gap:12 }}>
            {reqList.length === 0 ? (
              <div style={{ padding:24, textAlign:'center', color:'var(--gray-400)', fontSize:14, background:'var(--gray-50)', borderRadius:'var(--radius-lg)', border:'1px dashed var(--gray-200)' }}>
                No pending requests
              </div>
            ) : (
              reqList.slice(0, 2).map(req =>
                req._accepted ? (
                  <div key={req.id} className="request-card">
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:36, height:36, borderRadius:'50%', background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>✓</div>
                      <div>
                        <div style={{ fontWeight:700 }}>{req.name}</div>
                        <div style={{ fontSize:13, color:'var(--green-600)' }}>Enrollment request accepted</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <RequestCard key={req.id} item={req} variant="request" onAccept={handleAccept} onDecline={handleDecline} />
                )
              )
            )}
          </div>
        </div>

        {/* Activity column */}
        <div>
          <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:700, color:'var(--gray-800)', marginBottom:16 }}>Recent Activity</h3>
          <div style={{ background:'white', borderRadius:'var(--radius-xl)', padding:20, border:'1px solid var(--gray-100)' }}>
            {reqList.length > 0 ? (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {reqList.slice(0, 3).map(r => (
                  <div key={r.id} style={{ fontSize:13, color:'var(--gray-600)', paddingBottom:12, borderBottom:'1px solid var(--gray-100)' }}>
                    <div style={{ fontWeight:600, color:'var(--gray-800)' }}>{r.name}</div>
                    <div style={{ color:'var(--gray-500)', marginTop:2 }}>sent a request · {r.sentAgo}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color:'var(--gray-400)', fontSize:13, textAlign:'center', padding:'16px 0' }}>
                No recent activity
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  )
}