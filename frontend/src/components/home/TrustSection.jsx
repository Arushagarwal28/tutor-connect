import SectionHeader from "../common/SectionHeader.jsx"
import VerifiedBadge from "../common/VerifiedBadge.jsx"

const TRUST_CRITERIA = [
  {
    id: 1,
    title: "Verified Tutors",
    description: "Tutors receive a verified badge only after multiple students enroll through the platform."
  },
  {
    id: 2,
    title: "Real Student Reviews",
    description: "Students can leave genuine reviews to help others choose the best tutor."
  },
  {
    id: 3,
    title: "Transparent Profiles",
    description: "Profiles include qualifications, experience, demo lectures, and achievements."
  },
  {
    id: 4,
    title: "Nearby Tutors",
    description: "Find tutors within your preferred radius for convenient learning."
  }
]

export default function TrustSection() {
  return (
    <section className="trust-section">

      <SectionHeader
        title="Why Students Trust Our Platform"
        subtitle="A reliable way to find the best tutors"
      />

      <div className="trust-grid">

        {TRUST_CRITERIA.map((item) => (
          <div key={item.id} className="trust-card">

            <VerifiedBadge />

            <h3 className="trust-title">
              {item.title}
            </h3>

            <p className="trust-description">
              {item.description}
            </p>

          </div>
        ))}

      </div>

    </section>
  )
}