import { apiUrl } from '../../../api.js'
import { useState, useEffect } from "react"
import RequestCard      from "../../common/RequestCard.jsx"
import LeaveReviewModal from "../../common/LeaveReviewModal.jsx"

/**
 * EnrolledTutorsSection
 *
 * Props:
 *   enrollments – shaped enrollment objects from /api/student/enrollments
 *   loading     – boolean
 *   token       – JWT (from useAuth) needed by LeaveReviewModal
 *   onCancel(id)– calls DELETE /api/student/enrollments/:id
 *   onMessage() – navigate to messages section
 */
export default function EnrolledTutorsSection({
  enrollments = [],
  loading     = false,
  token,
  onCancel,
  onMessage,
}) {

  const active  = enrollments.filter(e => e.status === "active")
  const pending = enrollments.filter(e => e.status === "pending")

  // ── Track which tutors the student has already reviewed ──
  const [reviewedTutorIds, setReviewedTutorIds] = useState(new Set())
  const [reviewModal,      setReviewModal]       = useState(null) // { tutorId, name }
  const [successMsg,       setSuccessMsg]        = useState("")


  // Fetch the student's existing reviews so we know which "Leave Review"
  // buttons to disable (can't review the same tutor twice)
  useEffect(() => {
    if (!token) return
    const fetchMyReviews = async () => {
      try {
        const res  = await fetch(apiUrl("/api/reviews/mine"), {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = await res.json()
        setReviewedTutorIds(new Set(data.map(r => String(r.tutorId))))
      } catch (err) {
        console.error("Error fetching reviews:", err)
      }
    }
    fetchMyReviews()
  }, [token])


  const handleReviewSuccess = (tutorId) => {
    setReviewedTutorIds(prev => new Set([...prev, String(tutorId)]))
    setSuccessMsg("✅ Your review has been submitted and will appear on the homepage soon!")
    setTimeout(() => setSuccessMsg(""), 5000)
  }


  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--gray-400)", fontSize: 14 }}>
        Loading your tutors…
      </div>
    )
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: "var(--gray-900)" }}>
          My Enrolled Tutors
        </h2>
        <p style={{ fontSize: 14, color: "var(--gray-500)" }}>
          Track your enrollments and leave reviews for active tutors
        </p>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div style={{
          background: "#dcfce7", border: "1px solid #86efac",
          borderRadius: "var(--radius-md)", padding: "12px 16px",
          fontSize: 14, color: "#15803d", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          {successMsg}
        </div>
      )}

      {enrollments.length === 0 ? (
        <div style={{
          padding: 48, textAlign: "center", color: "var(--gray-400)", fontSize: 15,
          background: "var(--gray-50)", borderRadius: "var(--radius-xl)",
          border: "1px dashed var(--gray-200)",
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📚</div>
          No enrollments yet.{" "}
          <span style={{ color: "var(--blue-600)", fontWeight: 600, cursor: "pointer" }}>
            Search for a tutor
          </span>{" "}
          to get started.
        </div>
      ) : (
        <>
          {/* ── Active enrollments ─────────────────────── */}
          {active.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--gray-800)" }}>Active</h3>
                <span style={{ background: "#dcfce7", color: "#15803d", borderRadius: 100, fontSize: 12, fontWeight: 700, padding: "2px 10px" }}>
                  {active.length}
                </span>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                {active.map(item => {
                  const alreadyReviewed = reviewedTutorIds.has(String(item.tutorId))
                  return (
                    <div key={item.id} className="request-card" style={{ flexWrap: "wrap", gap: 12 }}>

                      {/* Avatar */}
                      <div
                        className="request-avatar"
                        style={{ background: item.avatarBg || "#dbeafe", color: item.avatarColor || "#1d4ed8" }}
                      >
                        {item.initials}
                      </div>

                      {/* Info */}
                      <div className="request-info" style={{ flex: 1, minWidth: 160 }}>
                        <div className="request-name">{item.name}</div>
                        <div className="request-detail">{item.detail}</div>
                        {item.subject && (
                          <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 4 }}>
                            Subject: {item.subject}
                          </div>
                        )}
                        <div style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 4 }}>
                          Since {item.enrolledDate} · {item.daysActive} days active
                        </div>
                        {/* Rating/fee if available */}
                        {(item.rating > 0 || item.fee) && (
                          <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 12, color: "var(--gray-500)" }}>
                            {item.rating > 0 && <span>⭐ {Number(item.rating).toFixed(1)}</span>}
                            {item.fee      && <span>{item.fee}/month</span>}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="request-actions" style={{ flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                        <span className="status-badge status-active">Active</span>

                        <button
                          onClick={() => onMessage?.(item)}
                          className="btn-ghost"
                          style={{ fontSize: 13, padding: "6px 12px" }}
                        >
                          Message
                        </button>

                        {/* Leave Review — disabled if already reviewed */}
                        {alreadyReviewed ? (
                          <span style={{ fontSize: 12, color: "var(--green-600)", fontWeight: 600 }}>
                            ✓ Reviewed
                          </span>
                        ) : (
                          <button
                            onClick={() => setReviewModal({ tutorId: item.tutorId, name: item.name })}
                            style={{
                              padding: "6px 12px",
                              border: "1.5px solid var(--yellow-400)",
                              borderRadius: "var(--radius-md)",
                              color: "#92400e",
                              background: "#fef9c3",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            ⭐ Leave Review
                          </button>
                        )}
                      </div>

                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Pending requests ────────────────────────── */}
          {pending.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--gray-800)" }}>Pending Approval</h3>
                <span style={{ background: "#fef9c3", color: "#92400e", borderRadius: 100, fontSize: 12, fontWeight: 700, padding: "2px 10px" }}>
                  {pending.length}
                </span>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {pending.map(item => (
                  <div key={item.id} className="request-card">
                    <div
                      className="request-avatar"
                      style={{ background: item.avatarBg || "#dbeafe", color: item.avatarColor || "#1d4ed8" }}
                    >
                      {item.initials}
                    </div>
                    <div className="request-info">
                      <div className="request-name">{item.name}</div>
                      <div className="request-detail">{item.detail}</div>
                      {item.subject && (
                        <div style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 4 }}>
                          Subject: {item.subject}
                        </div>
                      )}
                      <div style={{ marginTop: 6, fontSize: 12, color: "#f59e0b", fontWeight: 600 }}>
                        ⏳ Waiting for tutor to accept your request
                      </div>
                      <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 2 }}>
                        Requested on {item.enrolledDate}
                      </div>
                    </div>
                    <div className="request-actions">
                      <button
                        onClick={() => onCancel?.(item.id)}
                        style={{
                          padding: "8px 14px", background: "#fee2e2", color: "#b91c1c",
                          borderRadius: "var(--radius-md)", fontSize: 13, fontWeight: 600,
                          border: "none", cursor: "pointer",
                        }}
                      >
                        Cancel Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Review modal ─────────────────────────────────── */}
      {reviewModal && (
        <LeaveReviewModal
          tutor={reviewModal}
          token={token}
          onClose={() => setReviewModal(null)}
          onSuccess={() => handleReviewSuccess(reviewModal.tutorId)}
        />
      )}
    </>
  )
}