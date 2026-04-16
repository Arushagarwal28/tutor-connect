/**
 * DashboardTopbar
 * Props:
 *   title     – current section title
 *   userInitials – e.g. "AK"
 *   onMenuClick  – opens sidebar on mobile
 *   hasNotification – boolean
 */
export default function DashboardTopbar({ title, userInitials, onMenuClick, hasNotification = true }) {
  return (
    <div className="dashboard-topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-actions">
        <div className="icon-btn" title="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {hasNotification && <div className="notification-dot" />}
        </div>
        <div
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
            color: 'white', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontFamily: "'Sora', sans-serif",
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}
        >
          {userInitials}
        </div>
      </div>
    </div>
  )
}
