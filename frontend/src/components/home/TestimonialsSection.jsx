import { apiUrl } from '../../api.js'
import { useState, useEffect } from "react"
import SectionHeader from "../common/SectionHeader.jsx"

// Render N filled/empty stars for a rating
function Stars({ rating }) {
  return (
    <div className="t-stars">
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} style={{ opacity: n <= rating ? 1 : 0.25 }}>★</span>
      ))}
    </div>
  )
}

// Colour palette for avatars — cycles through 6 colours
const AVATAR_COLORS = [
  { bg: "#dbeafe", color: "#1d4ed8" },
  { bg: "#dcfce7", color: "#15803d" },
  { bg: "#f5f3ff", color: "#6d28d9" },
  { bg: "#fef9c3", color: "#92400e" },
  { bg: "#fee2e2", color: "#b91c1c" },
  { bg: "#e0f2fe", color: "#0369a1" },
]

export default function TestimonialsSection() {

  const [reviews, setReviews]   = useState([])
  const [loading, setLoading]   = useState(true)

  // ── Fetch real reviews from the backend ─────────────────
  // GET /api/reviews/homepage returns the 6 most recent reviews
  // with rating >= 4 across all tutors.
  // If the database has no reviews yet, an empty array is returned
  // and we show an honest empty state rather than fake data.
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res  = await fetch(apiUrl("/api/reviews/homepage"))
        if (!res.ok) throw new Error("Failed to fetch reviews")
        const data = await res.json()
        setReviews(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Reviews fetch error:", err)
        setReviews([])
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [])


  return (
    <section className="testimonials-section">
      <SectionHeader
        title="What Our Users Say"
        subtitle="Real reviews from verified students — only shown after genuine enrollment"
      />

      {/* ── Loading skeleton ──────────────────────────── */}
      {loading && (
        <div className="testimonials-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="testimonial-card" style={{ opacity: 0.4 }}>
              <div style={{ height: 18, background: "var(--gray-200)", borderRadius: 6, marginBottom: 16, width: "60%" }} />
              <div style={{ height: 14, background: "var(--gray-100)", borderRadius: 4, marginBottom: 8 }} />
              <div style={{ height: 14, background: "var(--gray-100)", borderRadius: 4, marginBottom: 8, width: "80%" }} />
              <div style={{ height: 14, background: "var(--gray-100)", borderRadius: 4, width: "60%" }} />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state — shown when no reviews exist yet ─ */}
      {!loading && reviews.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "48px 24px",
          color: "var(--gray-400)",
          fontSize: 15,
          background: "var(--gray-50)",
          borderRadius: "var(--radius-xl)",
          border: "1px dashed var(--gray-200)",
          maxWidth: 560,
          margin: "0 auto",
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⭐</div>
          <div style={{ fontWeight: 600, color: "var(--gray-600)", marginBottom: 8 }}>
            No reviews yet
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.6 }}>
            Reviews will appear here once students who have enrolled with tutors
            leave their feedback. Be the first!
          </div>
        </div>
      )}

      {/* ── Real review cards ──────────────────────────── */}
      {!loading && reviews.length > 0 && (
        <div className="testimonials-grid">
          {reviews.map((review, idx) => {
            const palette = AVATAR_COLORS[idx % AVATAR_COLORS.length]
            return (
              <div key={review.id} className="testimonial-card">

                {/* Star rating */}
                <Stars rating={review.rating} />

                {/* Review text */}
                <p>"{review.text}"</p>

                {/* Author row */}
                <div className="t-author">
                  <div
                    className="t-avatar"
                    style={{ background: palette.bg, color: palette.color }}
                  >
                    {review.initials}
                  </div>
                  <div>
                    <strong>{review.studentName}</strong>
                    <span>
                      {review.studentRole}
                      {review.tutorName && (
                        <> · for <em>{review.tutorName}</em></>
                      )}
                    </span>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}