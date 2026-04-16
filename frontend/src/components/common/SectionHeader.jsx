export default function SectionHeader({ tag, title, subtitle }) {
  return (
    <div className="section-header">
      {tag && <div className="section-tag">{tag}</div>}
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  )
}
