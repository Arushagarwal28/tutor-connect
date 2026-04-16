/**
 * @param {string} value
 * @param {string} label
 * @param {string} change      - e.g. "+2 this month"
 * @param {boolean} up         - green (up) vs neutral
 * @param {string} iconBg
 * @param {string} iconColor
 * @param {React.ReactNode} icon
 */
export default function StatCard({ value, label, change, up, iconBg, iconColor, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className="stat-card-icon" style={{ background: iconBg }}>
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
        {change && (
          <span className={`stat-card-change ${up ? 'up' : 'neutral'}`}>
            {change}
          </span>
        )}
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  )
}
