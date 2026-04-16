import { useState } from 'react'

/**
 * MyStudentsSection
 *
 * Props (all from TutorDashboardPage — real API data):
 *   students  – shaped enrollment objects from /api/tutors/students
 *   loading   – boolean
 *   onMessage – navigate to messages section
 */
export default function MyStudentsSection({ students = [], loading = false, onMessage }) {

  const [filter, setFilter] = useState('active')

  const shown = filter === 'active'
    ? students.filter(s => s.status === 'active')
    : students

  if (loading) {
    return (
      <div style={{ padding:40, textAlign:'center', color:'var(--gray-400)', fontSize:14 }}>
        Loading students…
      </div>
    )
  }

  return (
    <>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontSize:22, fontWeight:700, marginBottom:4, color:'var(--gray-900)' }}>My Students</h2>
        <p style={{ fontSize:14, color:'var(--gray-500)' }}>Manage your active and past student enrollments</p>
      </div>

      <div style={{ background:'white', borderRadius:'var(--radius-xl)', border:'1px solid var(--gray-100)', overflow:'hidden' }}>

        {/* Filter tabs */}
        <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--gray-100)', display:'flex', gap:8 }}>
          {[
            { key:'active', label:`Active (${students.filter(s => s.status==='active').length})` },
            { key:'all',    label:`All (${students.length})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding:'6px 14px', borderRadius:100, fontSize:13, fontWeight:600, cursor:'pointer',
                background: filter === tab.key ? 'var(--blue-600)' : 'transparent',
                color:      filter === tab.key ? 'white' : 'var(--gray-500)',
                border:     filter === tab.key ? 'none' : '1.5px solid var(--gray-200)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <div style={{ padding:48, textAlign:'center', color:'var(--gray-400)', fontSize:15 }}>
            <div style={{ fontSize:32, marginBottom:12 }}>👥</div>
            {filter === 'active'
              ? 'No active students yet. Accept a request to get started.'
              : 'No enrolled students yet.'}
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'var(--gray-50)' }}>
                  {['Student','Class & Board','Enrolled Since','Days Active','Status','Action'].map(h => (
                    <th key={h} style={{ padding:'12px 20px', textAlign:'left', fontSize:12, fontWeight:700, color:'var(--gray-500)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map(s => (
                  <tr key={s.id} style={{ borderBottom:'1px solid var(--gray-100)' }}>
                    <td style={{ padding:'14px 20px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:36, height:36, borderRadius:'50%', background: s.avatarBg || '#dbeafe', color: s.avatarColor || '#1d4ed8', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, flexShrink:0 }}>
                          {s.initials}
                        </div>
                        <span style={{ fontWeight:600, fontSize:14, color:'var(--gray-800)' }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:'14px 20px', fontSize:13, color:'var(--gray-600)' }}>{s.classBoard}</td>
                    <td style={{ padding:'14px 20px', fontSize:13, color:'var(--gray-600)' }}>{s.since}</td>
                    <td style={{ padding:'14px 20px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:14, color: s.days >= 30 ? 'var(--green-600)' : 'var(--yellow-500)' }}>
                          {s.days}
                        </span>
                        <span style={{ fontSize:11, color:'var(--gray-400)' }}>days</span>
                        {s.days >= 30 && (
                          <span style={{ fontSize:11, background:'#dcfce7', color:'var(--green-600)', padding:'2px 8px', borderRadius:100, fontWeight:600 }}>
                            ✓ Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding:'14px 20px' }}>
                      <span className={`status-badge ${s.status === 'active' ? 'status-active' : 'status-confirmed'}`}>
                        {s.status === 'active' ? 'Active' : 'Enrolled'}
                      </span>
                    </td>
                    <td style={{ padding:'14px 20px' }}>
                      <button
                        onClick={() => onMessage?.(s)}
                        style={{ padding:'6px 12px', border:'1.5px solid var(--blue-200)', borderRadius:'var(--radius-md)', color:'var(--blue-600)', fontSize:12, fontWeight:600, background:'var(--blue-50)', cursor:'pointer' }}
                      >
                        Message
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}