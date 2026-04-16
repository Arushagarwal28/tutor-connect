import { useState } from 'react'

import { SUBJECTS, RADIUS_OPTIONS } from "../../../data/constants.js"

const MODES = [
  { value: '',       label: 'All Modes' },
  { value: 'home',   label: 'Home Tutor' },
  { value: 'center', label: 'Tuition Center' },
  { value: 'online', label: 'Online' },
]
const RATINGS = [
  { value: '',    label: 'Any Rating' },
  { value: '4',   label: '4+ Stars' },
  { value: '4.5', label: '4.5+ Stars' },
]

/**
 * @param {function} onSearch  - (filters) => void — called when user clicks Search
 */
export default function MapSearchPanel({ onSearch }) {
  const [location, setLocation] = useState('')
  const [subject,  setSubject]  = useState('')
  const [radius,   setRadius]   = useState('3')
  const [rating,   setRating]   = useState('')
  const [mode,     setMode]     = useState('')
  const [view,     setView]     = useState('map') // 'map' | 'list'

  const handleSearch = () => {
    onSearch?.({ location, subject, radius, rating, mode })
  }

  return (
    <div className="map-search-container">
      <div className="map-search-header">
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700, color: 'var(--gray-800)', marginBottom: 12 }}>
            Search Tutors Near You
          </div>
          <div className="search-filters">
            <input
              type="text"
              className="filter-select"
              placeholder="📍 Enter location..."
              style={{ minWidth: 180 }}
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
            <select className="filter-select" value={subject} onChange={e => setSubject(e.target.value)}>
              <option value="">All Subjects</option>
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="filter-select" value={radius} onChange={e => setRadius(e.target.value)}>
              {RADIUS_OPTIONS.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <select className="filter-select" value={rating} onChange={e => setRating(e.target.value)}>
              {RATINGS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <select className="filter-select" value={mode} onChange={e => setMode(e.target.value)}>
              {MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <button className="btn-primary" onClick={handleSearch} style={{ padding: '8px 16px', fontSize: 13 }}>
              🔍 Search
            </button>
          </div>
        </div>

        <div className="view-toggle">
          <div className={`view-btn${view === 'map' ? ' active' : ''}`} onClick={() => setView('map')}>
            🗺 Map
          </div>
          <div className={`view-btn${view === 'list' ? ' active' : ''}`} onClick={() => setView('list')}>
            ☰ List
          </div>
        </div>
      </div>

      {/* Map placeholder */}
      {view === 'map' && (
        <div className="map-container" id="mapView">
          <div className="map-placeholder">
            <div className="map-grid" />
            {/* Simulated pins — replace with Google Maps markers */}
            {[
              { top: '38%', left: '48%', label: 'Priya S. ⭐4.9' },
              { top: '55%', left: '35%', label: 'Rahul G. ⭐4.7' },
              { top: '28%', left: '62%', label: 'Deepa M. ⭐4.8' },
              { top: '65%', left: '58%', label: 'Vikram T. ⭐4.6' },
              { top: '45%', left: '70%', label: 'Sneha R. ⭐5.0' },
            ].map(pin => (
              <div
                key={pin.label}
                className="map-tutor-pin"
                style={{ top: pin.top, left: pin.left }}
              >
                {pin.label}
              </div>
            ))}
            <div className="map-center-dot" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
            <div className="radius-circle" style={{ width: 160, height: 160, top: '50%', left: '50%' }} />
            <div className="map-api-note">
              🗺️ Google Maps Integration Ready — Replace with Google Maps API key
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
