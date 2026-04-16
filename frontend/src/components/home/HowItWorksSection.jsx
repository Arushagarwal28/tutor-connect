import { useNavigate } from 'react-router-dom'
import SectionHeader from '../common/SectionHeader.jsx'

// FIX: added num and icon fields — original used step.num and step.icon
// which were undefined, rendering blank step cards.
// Also fixed key={step.num} → key={step.id} since step.num was undefined.
// Also wrapped each map item in a React.Fragment with a key to fix the
// "key must be on outermost element" React warning.
const HOW_STEPS = [
  {
    id:   1,
    num:  '01',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    ),
    title: 'Search Tutors',
    desc:  'Find verified tutors near your location by subject, class, and teaching mode.',
  },
  {
    id:   2,
    num:  '02',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    title: 'Compare Profiles',
    desc:  'Check qualifications, experience, demo lectures, and real student reviews.',
  },
  {
    id:   3,
    num:  '03',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12"/>
        <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
      </svg>
    ),
    title: 'Contact Tutor',
    desc:  'Send an enrollment request with your subject and preferred schedule.',
  },
]

export default function HowItWorksSection() {
  const navigate = useNavigate()
  return (
    <section className="how-section" id="how-it-works">
      <div className="container">
        <SectionHeader tag="Simple Process" title="Get Started in 3 Easy Steps" />

        <div className="steps-grid">
          {HOW_STEPS.map((step, i) => (
            // FIX: key moved to the outermost element (Fragment), not the inner div
            <div key={step.id} style={{ display:'contents' }}>
              <div className="step-card">
                <div className="step-num">{step.num}</div>
                <div className="step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
              {i < HOW_STEPS.length - 1 && (
                <div className="step-connector">→</div>
              )}
            </div>
          ))}
        </div>

        <div className="tutor-cta-box">
          <div className="tutor-cta-text">
            <h3>Are You a Tutor?</h3>
            <p>Join thousands of tutors already growing their student base through TutorConnect.</p>
          </div>
          <div className="tutor-cta-steps">
            <span className="cta-step">📝 Register</span>
            <span>→</span>
            <span className="cta-step">✅ Get Verified</span>
            <span>→</span>
            <span className="cta-step">📈 Grow</span>
          </div>
          <button className="btn-primary" onClick={() => navigate('/register?type=tutor')}>
            Register as Tutor
          </button>
        </div>
      </div>
    </section>
  )
}