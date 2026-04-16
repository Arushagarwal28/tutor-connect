/**
 * @param {string}  initials
 * @param {string}  bg         - background colour
 * @param {string}  textColor
 * @param {'sm'|'md'|'lg'|'xl'} size
 * @param {string}  className   - extra classes
 */
export default function Avatar({ initials, bg, textColor, size = 'md', className = '' }) {
  const sizes = {
    sm:  { width: 36,  height: 36,  fontSize: 13, borderRadius: '50%' },
    md:  { width: 44,  height: 44,  fontSize: 16, borderRadius: '50%' },
    lg:  { width: 56,  height: 56,  fontSize: 20, borderRadius: 12 },
    xl:  { width: 80,  height: 80,  fontSize: 28, borderRadius: 16 },
  }
  const s = sizes[size]
  return (
    <div
      className={className}
      style={{
        ...s,
        background: bg || `linear-gradient(135deg, #3b82f6, #1d4ed8)`,
        color: textColor || 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Sora', sans-serif",
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}
