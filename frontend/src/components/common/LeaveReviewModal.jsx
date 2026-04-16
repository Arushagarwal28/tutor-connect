import { apiUrl } from '../../api.js'
import { useState } from "react"

/**
 * LeaveReviewModal
 *
 * Props:
 *   tutor     – { tutorId, name } object of the tutor being reviewed
 *   token     – JWT auth token (from useAuth)
 *   onClose() – called when modal should close (cancel or after submit)
 *   onSuccess()– called after review is successfully submitted
 */
export default function LeaveReviewModal({ tutor, token, onClose, onSuccess }) {

  const [rating,    setRating]    = useState(0)
  const [hovered,   setHovered]   = useState(0)
  const [text,      setText]      = useState("")
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState("")


  const handleSubmit = async () => {
    setError("")

    // ── Client-side validation ──────────────────────────
    if (rating === 0) {
      setError("Please select a star rating.")
      return
    }
    if (text.trim().length < 10) {
      setError("Review must be at least 10 characters.")
      return
    }

    setLoading(true)
    try {
      const res  = await fetch(apiUrl("/api/reviews"), {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          tutorId: tutor.tutorId,
          rating,
          text:    text.trim(),
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Could not submit review. Please try again.")
        return
      }

      onSuccess?.()
      onClose?.()

    } catch (err) {
      console.error(err)
      setError("Server error. Please try again.")
    } finally {
      setLoading(false)
    }
  }


  // ── Star labels ─────────────────────────────────────────
  const STAR_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"]
  const displayRating = hovered || rating


  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 16,
    }}>
      <div style={{
        background: "white",
        borderRadius: "var(--radius-xl)",
        padding: 32,
        width: "100%",
        maxWidth: 480,
        boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
      }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--gray-900)", marginBottom: 4 }}>
            Leave a Review
          </h2>
          <p style={{ fontSize: 14, color: "var(--gray-500)" }}>
            Share your experience with <strong>{tutor.name}</strong>
          </p>
        </div>

        {/* Star picker */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--gray-700)", marginBottom: 10 }}>
            Your Rating <span style={{ color: "#ef4444" }}>*</span>
          </label>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(n)}
                style={{
                  fontSize: 32,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: n <= displayRating ? "#f59e0b" : "var(--gray-200)",
                  transition: "color 0.1s, transform 0.1s",
                  transform: n <= displayRating ? "scale(1.15)" : "scale(1)",
                  padding: "0 2px",
                  lineHeight: 1,
                }}
              >
                ★
              </button>
            ))}
            {displayRating > 0 && (
              <span style={{ fontSize: 13, fontWeight: 600, color: "#f59e0b", marginLeft: 8 }}>
                {STAR_LABELS[displayRating]}
              </span>
            )}
          </div>
        </div>

        {/* Review text */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--gray-700)", marginBottom: 6 }}>
            Your Review <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Describe your experience — teaching style, punctuality, helpfulness…"
            rows={4}
            maxLength={1000}
            style={{
              width: "100%", padding: "10px 12px",
              border: "1.5px solid var(--gray-200)",
              borderRadius: "var(--radius-md)",
              fontSize: 14, outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
              boxSizing: "border-box",
              lineHeight: 1.6,
            }}
          />
          <div style={{ textAlign: "right", fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>
            {text.length} / 1000
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: "var(--radius-md)", padding: "10px 14px",
            fontSize: 13, color: "#dc2626", marginBottom: 20,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "10px 20px", border: "1.5px solid var(--gray-200)",
              borderRadius: "var(--radius-md)", fontSize: 14, fontWeight: 600,
              color: "var(--gray-600)", background: "white", cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || rating === 0}
            className="btn-primary"
            style={{
              padding: "10px 20px", fontSize: 14,
              opacity: (loading || rating === 0) ? 0.6 : 1,
              cursor: (loading || rating === 0) ? "default" : "pointer",
            }}
          >
            {loading ? "Submitting…" : "⭐ Submit Review"}
          </button>
        </div>

      </div>
    </div>
  )
}