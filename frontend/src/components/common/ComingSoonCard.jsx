export default function ComingSoonCard({ icon, title, desc }) {
  return (
    <div className="coming-soon-card">
      <div className="cs-icon">{icon}</div>
      <div className="cs-badge">COMING SOON</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  )
}
