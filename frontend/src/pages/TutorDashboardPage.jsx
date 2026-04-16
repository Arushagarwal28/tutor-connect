import { apiUrl } from '../api.js'
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

import DashboardSidebar       from '../components/layout/DashboardSidebar.jsx'
import DashboardTopbar        from '../components/layout/DashboardTopbar.jsx'
import OverviewSection        from '../components/dashboard/tutor/OverviewSection.jsx'
import StudentRequestsSection from '../components/dashboard/tutor/StudentRequestsSection.jsx'
import MyStudentsSection      from '../components/dashboard/tutor/MyStudentsSection.jsx'
import MessagesPanel          from '../components/dashboard/shared/MessagesPanel.jsx'
import VerifiedBadgeSection   from '../components/dashboard/tutor/VerifiedBadgeSection.jsx'
import ComingSoonCard         from '../components/common/ComingSoonCard.jsx'
import VerifiedBadge          from '../components/common/VerifiedBadge.jsx'
import EditProfileModal       from '../components/common/EditProfileModal.jsx'

const COMING_SOON_TUTOR         = []
const PLACEHOLDER_CONVERSATIONS = []

const SECTION_TITLES = {
  overview:'Overview', requests:'Student Requests', students:'My Students',
  messages:'Messages', profile:'My Profile', badge:'Verified Badge', analytics:'Analytics',
}

function buildStatCards(stats) {
  return [
    { label:'Active Students', value: String(stats.activeStudents ?? 0), change: stats.pendingRequests > 0 ? `+${stats.pendingRequests} pending` : 'No pending', up: stats.pendingRequests > 0, iconBg:'#dbeafe' },
    { label:'Total Students',  value: String(stats.totalStudents  ?? 0), change: 'All time', up: false, iconBg:'#dcfce7' },
    { label:'Rating', value: stats.rating ? `${Number(stats.rating).toFixed(1)} ★` : '—', change: stats.totalReviews ? `${stats.totalReviews} reviews` : 'No reviews yet', up: stats.rating >= 4, iconBg:'#fef9c3' },
    { label:'Verified', value: stats.verifiedStatus ? '✓ Yes' : 'Not yet', change: stats.verifiedStatus ? 'Badge active' : '5 students needed', up: stats.verifiedStatus, iconBg:'#f5f3ff' },
  ]
}

function buildBadgeProgress(stats) {
  const active = stats.activeStudents ?? 0
  return [
    { label:'Active Students', current: active, required: 5, met: active >= 5 },
    { label:'Verified Status', current: stats.verifiedStatus ? 1 : 0, required: 1, met: !!stats.verifiedStatus },
  ]
}


export default function TutorDashboardPage() {

  const navigate         = useNavigate()
  const { auth, logout } = useAuth()

  const [section,       setSection]       = useState('overview')
  const [sidebarOpen,   setSidebarOpen]   = useState(false)
  const [tutor,         setTutor]         = useState(null)
  const [stats,         setStats]         = useState(null)
  const [requests,      setRequests]      = useState([])
  const [students,      setStudents]      = useState([])
  const [loading,       setLoading]       = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [messagePeer,   setMessagePeer]   = useState(null)  // { peerId, peerRole, peerName }

  const authHeader = useCallback(
    () => ({ Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' }),
    [auth.token]
  )

  const handleAuthError = useCallback(() => {
    logout()
    // FIX: redirect to '/' not '/login'
    navigate('/', { replace: true })
  }, [logout, navigate])


  // ── Fetch all dashboard data ─────────────────────────
  useEffect(() => {
    if (!auth.token) return
    const fetchAll = async () => {
      try {
        const [profileRes, statsRes, requestsRes, studentsRes] = await Promise.all([
          fetch(apiUrl('/api/tutors/profile'),  { headers: authHeader() }),
          fetch(apiUrl('/api/tutors/stats'),    { headers: authHeader() }),
          fetch(apiUrl('/api/tutors/requests'), { headers: authHeader() }),
          fetch(apiUrl('/api/tutors/students'), { headers: authHeader() }),
        ])
        if ([profileRes, statsRes, requestsRes, studentsRes].some(r => r.status === 401)) {
          handleAuthError(); return
        }
        const [profileData, statsData, requestsData, studentsData] = await Promise.all([
          profileRes.json(), statsRes.json(), requestsRes.json(), studentsRes.json(),
        ])
        setTutor(profileData)
        setStats(statsData)
        setRequests(Array.isArray(requestsData) ? requestsData : [])
        setStudents(Array.isArray(studentsData) ? studentsData : [])
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [auth.token])


  // ── Accept / Decline requests ────────────────────────
  const handleAcceptRequest = async (id) => {
    try {
      const res = await fetch(apiUrl(`/api/tutors/requests/${id}/accept`), {
        method: 'PATCH', headers: authHeader(),
      })
      if (!res.ok) return
      setRequests(prev => prev.filter(r => r.id !== id))
      const [sRes, stRes] = await Promise.all([
        fetch(apiUrl('/api/tutors/stats'),    { headers: authHeader() }),
        fetch(apiUrl('/api/tutors/students'), { headers: authHeader() }),
      ])
      if (sRes.ok)  setStats(await sRes.json())
      if (stRes.ok) setStudents(await stRes.json())
    } catch (err) { console.error(err) }
  }

  const handleDeclineRequest = async (id) => {
    try {
      const res = await fetch(apiUrl(`/api/tutors/requests/${id}/decline`), {
        method: 'PATCH', headers: authHeader(),
      })
      if (!res.ok) return
      setRequests(prev => prev.filter(r => r.id !== id))
    } catch (err) { console.error(err) }
  }


  // ── Logout — FIX: goes to '/' not '/login' ───────────
  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }


  // ── Sidebar user ─────────────────────────────────────
  const displayName = tutor?.name || auth.user?.name || '…'
  const CURRENT_TUTOR = {
    initials:  displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
    name:      displayName,
    roleLabel: tutor?.subjects?.length ? `Tutor · ${tutor.subjects[0]}` : 'Tutor',
  }

  const statCards     = stats ? buildStatCards(stats)     : []
  const badgeProgress = stats ? buildBadgeProgress(stats) : []

  const NAV_ITEMS = [
    {
      groupLabel: 'Dashboard',
      items: [
        { id:'overview',  icon:<GridIcon />,    label:'Overview',         badge:0 },
        { id:'requests',  icon:<UsersIcon />,   label:'Student Requests', badge: requests.length },
        { id:'students',  icon:<PersonIcon />,  label:'My Students',      badge:0 },
        { id:'messages',  icon:<ChatIcon />,    label:'Messages',         badge:0 },
      ],
    },
    {
      groupLabel: 'Profile & Tools',
      items: [
        { id:'profile',   icon:<ProfileIcon />, label:'My Profile',     badge:0 },
        { id:'badge',     icon:<ShieldIcon />,  label:'Verified Badge', badge:0 },
        { id:'analytics', icon:<BarIcon />,     label:'Analytics',      badge:0 },
      ],
    },
  ]


  return (
    <div className="dashboard-layout">

      <button className="sidebar-toggle" onClick={() => setSidebarOpen(true)}>
        <HamburgerIcon />
      </button>

      <DashboardSidebar
        user={CURRENT_TUTOR}
        navItems={NAV_ITEMS}
        activeSection={section}
        onNav={setSection}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="dashboard-main">

        <DashboardTopbar
          title={SECTION_TITLES[section]}
          userInitials={CURRENT_TUTOR.initials}
          onMenuClick={() => setSidebarOpen(true)}
          hasNotification={requests.length > 0}
        />

        <div className="dashboard-content">

          {section === 'overview' && (
            <div className="dashboard-section active">
              {loading ? <LoadingState /> : (
                <OverviewSection
                  isVerified={stats?.verifiedStatus || false}
                  stats={statCards}
                  requests={requests}
                  onAccept={handleAcceptRequest}
                  onDecline={handleDeclineRequest}
                  onViewRequests={() => setSection('requests')}
                  onViewBadge={() => setSection('badge')}
                />
              )}
            </div>
          )}

          {section === 'requests' && (
            <div className="dashboard-section active">
              <StudentRequestsSection
                requests={requests}
                onAccept={handleAcceptRequest}
                onDecline={handleDeclineRequest}
                loading={loading}
              />
            </div>
          )}

          {section === 'students' && (
            <div className="dashboard-section active">
              <MyStudentsSection students={students} loading={loading} onMessage={(s) => {
                  setMessagePeer({ peerId: String(s.studentId), peerRole: 'student', peerName: s.name })
                  setSection('messages')
                }} />
            </div>
          )}

          {section === 'messages' && (
            <div className="dashboard-section active">
              <MessagesPanel conversations={PLACEHOLDER_CONVERSATIONS} title="Conversations" initialPeer={messagePeer} />
            </div>
          )}

          {section === 'profile' && (
            <div className="dashboard-section active">
              <div style={{ marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <h2 style={{ fontSize:22, fontWeight:700, color:'var(--gray-900)' }}>My Tutor Profile</h2>
                <button
                  onClick={handleLogout}
                  style={{ padding:'8px 18px', borderRadius:'var(--radius-md)', border:'1.5px solid #fecaca', color:'#dc2626', background:'#fef2f2', fontSize:13, fontWeight:600, cursor:'pointer' }}
                >
                  🚪 Log Out
                </button>
              </div>

              {loading ? <LoadingState /> : (
                <div className="profile-overview-card">
                  <div className="profile-header">
                    <div className="profile-avatar-large">{CURRENT_TUTOR.initials}</div>
                    <div className="profile-info">
                      <div className="profile-name">{tutor?.name || '—'}</div>
                      <div className="profile-qual">
                        {tutor?.qualification || '—'}
                        {tutor?.experience ? ` · ${tutor.experience} yr${tutor.experience > 1 ? 's' : ''} experience` : ''}
                      </div>
                      <div className="profile-tags" style={{ marginBottom:12 }}>
                        {(tutor?.subjects || []).map(s => <span key={s} className="tag tag-blue">📐 {s}</span>)}
                        {tutor?.teachingMode   && <span className="tag tag-green">🏠 {tutor.teachingMode}</span>}
                        {tutor?.coverageRadius && <span className="tag tag-yellow">📏 {tutor.coverageRadius}km</span>}
                        {tutor?.board          && <span className="tag tag-purple">🎓 {tutor.board}</span>}
                      </div>
                      <VerifiedBadge verified={tutor?.verifiedStatus} size="large" />
                    </div>
                    <div className="profile-actions">
                      <button className="btn-primary" onClick={() => setShowEditModal(true)}>
                        ✏️ Edit Profile
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid var(--gray-100)' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, textAlign:'center' }}>
                      {[
                        { val: stats?.activeStudents ?? 0, label:'Active Students', color:'var(--blue-600)' },
                        { val: stats?.totalStudents  ?? 0, label:'Total Students',  color:'var(--green-600)' },
                        { val: stats?.rating ? `${Number(stats.rating).toFixed(1)}★` : '—', label:'Rating', color:'var(--yellow-500)' },
                        { val: tutor?.fee ? `₹${Number(tutor.fee).toLocaleString('en-IN')}` : '—', label:'Monthly Fee', color:'#7c3aed' },
                      ].map(s => (
                        <div key={s.label} style={{ padding:16, background:'var(--gray-50)', borderRadius:'var(--radius-lg)' }}>
                          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:700, color:s.color }}>{s.val}</div>
                          <div style={{ fontSize:12, color:'var(--gray-500)' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {section === 'badge' && (
            <div className="dashboard-section active">
              {loading ? <LoadingState /> : (
                <VerifiedBadgeSection
                  isVerified={stats?.verifiedStatus || false}
                  progress={badgeProgress}
                  tutorName={tutor?.name || '—'}
                  tutorInitials={CURRENT_TUTOR.initials}
                  tutorQual={tutor?.qualification ? `${tutor.qualification}${tutor.experience ? ` · ${tutor.experience} yrs` : ''}` : '—'}
                  stats={{
                    rating:         stats?.rating ? Number(stats.rating).toFixed(1) : '—',
                    activeStudents: stats?.activeStudents ?? 0,
                    exp:            tutor?.experience ? `${tutor.experience} yrs` : '—',
                    fee:            tutor?.fee ? `₹${Number(tutor.fee).toLocaleString('en-IN')}/mo` : '—',
                  }}
                />
              )}
            </div>
          )}

          {section === 'analytics' && (
            <div className="dashboard-section active">
              <div style={{ marginBottom:24 }}>
                <h2 style={{ fontSize:22, fontWeight:700, color:'var(--gray-900)' }}>Performance Analytics</h2>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
                {COMING_SOON_TUTOR.map(c => <ComingSoonCard key={c.title} {...c} />)}
              </div>
            </div>
          )}

        </div>
      </div>

      {showEditModal && (
        <EditProfileModal
          role="tutor"
          current={tutor}
          token={auth.token}
          onClose={() => setShowEditModal(false)}
          onSaved={(updated) => setTutor(prev => ({ ...prev, ...updated }))}
        />
      )}

    </div>
  )
}


function LoadingState() {
  return <div style={{ padding:40, textAlign:'center', color:'var(--gray-400)', fontSize:14 }}>Loading…</div>
}

function GridIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> }
function UsersIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> }
function PersonIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg> }
function ChatIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function ProfileIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function ShieldIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> }
function BarIcon()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> }
function HamburgerIcon(){ return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg> }