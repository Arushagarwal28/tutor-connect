import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import LogoIcon from '../common/LogoIcon.jsx'

/**
 * DashboardSidebar
 * Props:
 *   role        – "student" | "tutor"
 *   user        – { initials, name, roleLabel }
 *   navItems    – [{ id, icon, label, badge }]
 *   activeSection – string id of active section
 *   onNav(id)   – called when nav item clicked
 *   isOpen      – boolean (mobile)
 *   onClose     – close handler (mobile)
 */
export default function DashboardSidebar({
  user, navItems, activeSection, onNav, isOpen, onClose,
}) {
  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      <div className={`sidebar-overlay${isOpen ? ' show' : ''}`} onClick={onClose} />
      <aside className={`sidebar${isOpen ? ' open' : ''}`} id="sidebar">
        <div className="sidebar-header">
          <Link to="/" className="logo" style={{ marginBottom: 20, display: 'flex' }}>
            <div className="logo-icon"><LogoIcon size={22} /></div>
            <span style={{ fontSize: 15 }}>TutorConnect</span>
          </Link>
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user.initials}</div>
            <div className="sidebar-user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.roleLabel}</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((group) => (
            <div className="nav-group" key={group.groupLabel}>
              <div className="nav-group-label">{group.groupLabel}</div>
              {group.items.map((item) => (
                <div
                  key={item.id}
                  className={`nav-item${activeSection === item.id ? ' active' : ''}`}
                  onClick={() => { onNav(item.id); onClose() }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                  {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
                </div>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/login" className="nav-item" style={{ textDecoration: 'none' }}>
            <span className="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            Sign Out
          </Link>
        </div>
      </aside>
    </>
  )
}
