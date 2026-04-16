import { useEffect, useRef } from 'react'
import SectionHeader from '../common/SectionHeader.jsx'

// FIX: added iconBg and iconColor to each card.
// Original cards were missing these fields so icons rendered
// with transparent background and no colour.
const FEATURE_CARDS = [
  {
    id:       1,
    title:    'Find Nearby Tutors',
    desc:     'Search tutors within your preferred radius. Filter by subject, class, board, and teaching mode.',
    iconBg:   '#dbeafe',
    iconColor:'#2563eb',
  },
  {
    id:       2,
    title:    'Verified Profiles',
    desc:     'Every tutor profile shows qualification, achievements, and experience. Verified badge earned automatically.',
    iconBg:   '#dcfce7',
    iconColor:'#16a34a',
  },
  {
    id:       3,
    title:    'Demo Lectures',
    desc:     'Watch demo lecture videos before choosing a tutor — so you know exactly what to expect.',
    iconBg:   '#fef9c3',
    iconColor:'#ca8a04',
  },
  {
    id:       4,
    title:    'Real Student Reviews',
    desc:     'Reviews are only from students who are actively enrolled — no fake or anonymous ratings.',
    iconBg:   '#f5f3ff',
    iconColor:'#7c3aed',
  },
]

const ICONS = {
  1: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  2: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  3: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  4: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
}

export default function FeaturesSection() {
  const cardRefs = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity    = '1'
          e.target.style.transform  = 'translateY(0)'
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    cardRefs.current.forEach(el => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section className="features-section" id="features">
      <div className="container">
        <SectionHeader
          tag="Why TutorConnect"
          title="Everything You Need to Learn Better"
          subtitle="A complete platform designed for students, parents, and tutors across India."
        />
        <div className="features-grid">
          {FEATURE_CARDS.map((card, i) => (
            <div
              key={card.id}
              ref={el => (cardRefs.current[i] = el)}
              className="feature-card"
              style={{
                opacity: 0,
                transform: 'translateY(20px)',
                transition: `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`,
              }}
            >
              {/* FIX: iconBg and iconColor now defined on each card */}
              <div className="feature-icon" style={{ background: card.iconBg, color: card.iconColor }}>
                {ICONS[card.id]}
              </div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}