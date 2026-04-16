import { apiUrl } from '../api.js'
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

import DashboardSidebar      from '../components/layout/DashboardSidebar.jsx'
import DashboardTopbar       from '../components/layout/DashboardTopbar.jsx'
import TutorSearchSection    from '../components/dashboard/student/TutorSearchSection.jsx'
import EnrolledTutorsSection from '../components/dashboard/student/EnrolledTutorsSection.jsx'
import MessagesPanel         from '../components/dashboard/shared/MessagesPanel.jsx'
import ComingSoonCard        from '../components/common/ComingSoonCard.jsx'
import EditProfileModal      from '../components/common/EditProfileModal.jsx'

const COMING_SOON_STUDENT = []
const PLACEHOLDER_CONVOS  = []

const SECTION_TITLES = {
  search:   'Find Tutors',
  enrolled: 'My Tutors',
  messages: 'Messages',
  profile:  'My Profile',
  analytics:'Progress Tracker',
}


export default function StudentDashboardPage() {

  const navigate         = useNavigate()
  const { auth, logout } = useAuth()

  const [section,       setSection]       = useState('search')
  const [sidebarOpen,   setSidebarOpen]   = useState(false)
  const [profile,       setProfile]       = useState(null)
  const [enrollments,   setEnrollments]   = useState([])
  const [stats,         setStats]         = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [enrollLoading, setEnrollLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [messagePeer,   setMessagePeer]   = useState(null)  // { peerId, peerRole, peerName }

  const authHeader = useCallback(
    () => ({ Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' }),
    [auth.token]
  )

  const handleAuthError = useCallback(() => {
    logout()
    // FIX: redirect to '/' (home/landing) not '/login'
    // This prevents the "You're already signed in" flash on LoginPage
    navigate('/', { replace: true })
  }, [logout, navigate])


  // ── Fetch everything ─────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!auth.token) return
    try {
      const [profileRes, enrollRes, statsRes] = await Promise.all([
        fetch(apiUrl('/api/student/profile'),     { headers: authHeader() }),
        fetch(apiUrl('/api/student/enrollments'), { headers: authHeader() }),
        fetch(apiUrl('/api/student/stats'),       { headers: authHeader() }),
      ])
      if ([profileRes, enrollRes, statsRes].some(r => r.status === 401)) {
        handleAuthError(); return
      }
      const [profileData, enrollData, statsData] = await Promise.all([
        profileRes.json(), enrollRes.json(), statsRes.json(),
      ])
      setProfile(profileData)
      setEnrollments(Array.isArray(enrollData) ? enrollData : [])
      setStats(statsData)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [auth.token, authHeader, handleAuthError])

  useEffect(() => { fetchAll() }, [fetchAll])


  // ── Enroll ───────────────────────────────────────────
  const handleEnroll = async (tutor, { subject = '', message = '' } = {}) => {
    setEnrollLoading(true)
    try {
      const res  = await fetch(apiUrl(`/api/student/enroll/${tutor._id}`), {
        method: 'POST', headers: authHeader(), body: JSON.stringify({ subject, message }),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.message || 'Could not send enrollment request'); return }
      const [enrollRes, statsRes] = await Promise.all([
        fetch(apiUrl('/api/student/enrollments'), { headers: authHeader() }),
        fetch(apiUrl('/api/student/stats'),       { headers: authHeader() }),
      ])
      if (enrollRes.ok) setEnrollments(await enrollRes.json())
      if (statsRes.ok)  setStats(await statsRes.json())
      alert(`✅ Enrollment request sent to ${tutor.name}!`)
    } catch (err) {
      console.error(err); alert('Server error. Please try again.')
    } finally {
      setEnrollLoading(false)
    }
  }


  // ── Cancel enrollment ────────────────────────────────
  const handleCancelEnrollment = async (enrollmentId) => {
    try {
      const res  = await fetch(apiUrl(`/api/student/enrollments/${enrollmentId}`), {
        method: 'DELETE', headers: authHeader(),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.message || 'Could not cancel'); return }
      setEnrollments(prev => prev.filter(e => String(e.id) !== String(enrollmentId)))
      const statsRes = await fetch(apiUrl('/api/student/stats'), { headers: authHeader() })
      if (statsRes.ok) setStats(await statsRes.json())
    } catch (err) { console.error(err) }
  }


  // ── Logout ── FIX: goes to '/' not '/login' ──────────
  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }


  // ── Sidebar ──────────────────────────────────────────
  const displayName = profile?.name || auth.user?.name || '…'
  const CURRENT_USER = {
    initials:  displayName.charAt(0).toUpperCase(),
    name:      displayName,
    roleLabel: profile ? `Student · Class ${profile.class} · ${profile.board}` : 'Student',
  }

  const NAV_ITEMS = [
    {
      groupLabel: 'Main',
      items: [
        { id:'search',   icon:<SearchIcon />,  label:'Find Tutors', badge: 0 },
        { id:'enrolled', icon:<UsersIcon />,   label:'My Tutors',   badge: enrollments.length },
        { id:'messages', icon:<ChatIcon />,    label:'Messages',    badge: 0 },
      ],
    },
    {
      groupLabel: 'Account',
      items: [
        { id:'profile',   icon:<ProfileIcon />, label:'My Profile',       badge:0 },
        { id:'analytics', icon:<BarIcon />,     label:'Progress Tracker', badge:0 },
      ],
    },
  ]


  return (
    <div className="dashboard-layout">

      <button className="sidebar-toggle" onClick={() => setSidebarOpen(true)}>
        <HamburgerIcon />
      </button>

      <DashboardSidebar
        user={CURRENT_USER}
        navItems={NAV_ITEMS}
        activeSection={section}
        onNav={setSection}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="dashboard-main">

        <DashboardTopbar
          title={SECTION_TITLES[section]}
          userInitials={CURRENT_USER.initials}
          onMenuClick={() => setSidebarOpen(true)}
          hasNotification={enrollments.filter(e => e.status === 'pending').length > 0}
        />

        <div className="dashboard-content">

          {section === 'search' && (
            <div className="dashboard-section active">
              <TutorSearchSection
                enrollments={enrollments}
                onEnroll={handleEnroll}
                enrollLoading={enrollLoading}
              />
            </div>
          )}

          {section === 'enrolled' && (
            <div className="dashboard-section active">
              <EnrolledTutorsSection
                enrollments={enrollments}
                loading={loading}
                token={auth.token}
                onCancel={handleCancelEnrollment}
                onMessage={(item) => {
                  setMessagePeer({ peerId: String(item.tutorId), peerRole: 'tutor', peerName: item.name })
                  setSection('messages')
                }}
              />
            </div>
          )}

          {section === 'messages' && (
            <div className="dashboard-section active">
              <MessagesPanel conversations={PLACEHOLDER_CONVOS} title="Conversations" initialPeer={messagePeer} />
            </div>
          )}

          {section === 'profile' && (
            <div className="dashboard-section active">
              <div style={{ marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <h2 style={{ fontSize:22, fontWeight:700, color:'var(--gray-900)' }}>My Profile</h2>
                <button
                  onClick={handleLogout}
                  style={{ padding:'8px 18px', borderRadius:'var(--radius-md)', border:'1.5px solid #fecaca', color:'#dc2626', background:'#fef2f2', fontSize:13, fontWeight:600, cursor:'pointer' }}
                >
                  🚪 Log Out
                </button>
              </div>

              {loading ? (
                <p style={{ color:'var(--gray-400)', fontSize:14 }}>Loading profile…</p>
              ) : (
                <div className="profile-overview-card">
                  <div className="profile-header">
                    <div className="profile-avatar-large">{CURRENT_USER.initials}</div>
                    <div className="profile-info">
                      <div className="profile-name">{profile?.name || '—'}</div>
                      <div className="profile-qual">{CURRENT_USER.roleLabel}</div>
                      <div className="profile-tags">
                        {profile?.class && <span className="tag tag-blue">📚 Class {profile.class}</span>}
                        {profile?.board && <span className="tag tag-green">🏫 {profile.board}</span>}
                      </div>
                    </div>
                    <div className="profile-actions">
                      <button className="btn-outline" onClick={() => setShowEditModal(true)}>
                        ✏️ Edit Profile
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop:24, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
                    {[
                      { val: stats?.activeTutors  ?? 0, label:'Active Tutors',    color:'var(--blue-600)' },
                      { val: stats?.pendingTutors ?? 0, label:'Pending Requests', color:'var(--yellow-500)' },
                      { val: stats?.totalTutors   ?? 0, label:'Total Enrolled',   color:'var(--green-600)' },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign:'center', padding:20, background:'var(--gray-50)', borderRadius:'var(--radius-lg)' }}>
                        <div style={{ fontFamily:"'Sora',sans-serif", fontSize:28, fontWeight:700, color:s.color }}>{s.val}</div>
                        <div style={{ fontSize:13, color:'var(--gray-500)' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {section === 'analytics' && (
            <div className="dashboard-section active">
              <div style={{ marginBottom:24 }}>
                <h2 style={{ fontSize:22, fontWeight:700, color:'var(--gray-900)' }}>Student Progress Tracker</h2>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
                {COMING_SOON_STUDENT.map(c => <ComingSoonCard key={c.title} {...c} />)}
              </div>
            </div>
          )}

        </div>
      </div>

      {showEditModal && (
        <EditProfileModal
          role="student"
          current={profile}
          token={auth.token}
          onClose={() => setShowEditModal(false)}
          onSaved={(updated) => setProfile(prev => ({ ...prev, ...updated }))}
        />
      )}

    </div>
  )
}


function SearchIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> }
function UsersIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> }
function ChatIcon()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function ProfileIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function BarIcon()      { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> }
function HamburgerIcon(){ return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg> }