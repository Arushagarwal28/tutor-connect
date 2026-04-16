/**
 * VerifiedBadge  –  Three display sizes: "sm" | "full" | "large"
 * Only renders when `verified` prop is truthy.
 * Badge logic: earned automatically when activeStudents >= 5
 * and 30-day enrollment criteria are met (checked server-side).
 */
const VerifiedSvg = ({ fill = '#2563eb', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
)

export default function VerifiedBadge({ verified, size = 'sm' }) {
  if (!verified) return null

  if (size === 'sm') {
    return (
      <div className="verified-badge-sm">
        <VerifiedSvg fill="#2563eb" size={12} />
        Platform Verified
      </div>
    )
  }

  if (size === 'full') {
    return (
      <div className="verified-badge-full">
        <VerifiedSvg fill="#2563eb" size={16} />
        Platform Verified Tutor
      </div>
    )
  }

  if (size === 'large') {
    return (
      <div className="verified-badge-full" style={{ fontSize: 14 }}>
        <VerifiedSvg fill="white" size={16} />
        Platform Verified Tutor
      </div>
    )
  }
}
