import { apiUrl } from '../../api.js'
import { useState } from 'react'
import { BOARDS, CLASS_NUMBERS, SUBJECTS, TEACHING_MODES, COVERAGE_RADIUS_OPTIONS } from '../../data/constants.js'

/**
 * EditProfileModal
 *
 * Props:
 *   role     – 'student' | 'tutor'
 *   current  – current profile object from API
 *   token    – JWT from useAuth
 *   onClose()
 *   onSaved(updatedProfile)
 */
export default function EditProfileModal({ role, current, token, onClose, onSaved }) {

  const isStudent = role === 'student'

  const [form, setForm] = useState(() => ({
    // shared
    name:           current?.name           || '',
    phone:          current?.phone          || '',
    // student only
    class:          current?.class          || '',
    board:          current?.board          || '',
    // tutor only
    qualification:  current?.qualification  || '',
    experience:     current?.experience     || '',
    teachingMode:   current?.teachingMode   || '',
    coverageRadius: current?.coverageRadius || '',
    subjects:       current?.subjects       || [],
    fee:            current?.fee            || '',
    achievements:   current?.achievements   || '',
    demoVideo:      current?.demoVideo      || '',
    // location (pre-fill if already saved)
    latitude:  current?.location?.coordinates?.[1] ?? '',
    longitude: current?.location?.coordinates?.[0] ?? '',
  }))

  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [locLoading, setLocLoading] = useState(false)
  const [locStatus,  setLocStatus]  = useState('')

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const toggleSubject = (s) => {
    const cur = form.subjects || []
    set('subjects', cur.includes(s) ? cur.filter(x => x !== s) : [...cur, s])
  }

  // ── Detect location ──────────────────────────────────
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus('❌ Geolocation not supported by your browser.')
      return
    }
    setLocLoading(true)
    setLocStatus('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set('latitude',  pos.coords.latitude)
        set('longitude', pos.coords.longitude)
        setLocStatus(`✅ Location updated (${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E)`)
        setLocLoading(false)
      },
      () => {
        setLocStatus('❌ Could not get location. Please allow access and try again.')
        setLocLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // ── Submit ───────────────────────────────────────────
  const handleSave = async () => {
    setError('')

    if (!form.name.trim()) { setError('Name is required.'); return }

    const endpoint = isStudent
      ? apiUrl('/api/student/profile')
      : apiUrl('/api/tutors/profile')

    const base = isStudent
      ? {
          name:  form.name.trim(),
          phone: form.phone.trim(),
          class: form.class,
          board: form.board,
        }
      : {
          name:           form.name.trim(),
          phone:          form.phone.trim(),
          qualification:  form.qualification.trim(),
          experience:     form.experience   ? Number(form.experience)   : 0,
          teachingMode:   form.teachingMode,
          coverageRadius: form.coverageRadius ? Number(form.coverageRadius) : 0,
          subjects:       form.subjects,
          fee:            form.fee ? Number(form.fee) : 0,
          achievements:   form.achievements.trim(),
          demoVideo:      form.demoVideo.trim(),
        }

    // Attach location if captured
    if (form.latitude !== '' && form.longitude !== '') {
      base.latitude  = Number(form.latitude)
      base.longitude = Number(form.longitude)
    }

    setLoading(true)
    try {
      const res  = await fetch(endpoint, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(base),
      })
      const data = await res.json()

      if (!res.ok) { setError(data.message || 'Could not save. Please try again.'); return }

      onSaved?.(isStudent ? data.student : data.tutor)
      onClose?.()

    } catch (err) {
      console.error(err)
      setError('Server error. Please try again.')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="modal-backdrop">
      <div className="modal-inner modal-inner-wide">

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <h2 style={{ fontSize:20, fontWeight:700, color:'var(--gray-900)', margin:0 }}>
            Edit Profile
          </h2>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'var(--gray-400)', lineHeight:1 }}>
            ✕
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'var(--radius-md)', padding:'10px 14px', fontSize:13, color:'#dc2626', marginBottom:20, display:'flex', gap:8 }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Shared fields ──────────────────────────── */}
        <div className="form-row">
          <div className="form-group">
            <label>Full Name <span className="required-mark">*</span></label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" />
          </div>
          <div className="form-group">
            <label>Phone <span className="optional-tag">(Optional)</span></label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 9876543210" />
          </div>
        </div>


        {/* ── Student-only fields ────────────────────── */}
        {isStudent && (
          <div className="form-row">
            <div className="form-group">
              <label>Class <span className="required-mark">*</span></label>
              <select value={form.class} onChange={e => set('class', e.target.value)}>
                <option value="">Select class</option>
                {CLASS_NUMBERS.map(c => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Board <span className="required-mark">*</span></label>
              <select value={form.board} onChange={e => set('board', e.target.value)}>
                <option value="">Select board</option>
                {BOARDS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
        )}


        {/* ── Tutor-only fields ──────────────────────── */}
        {!isStudent && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Qualification <span className="required-mark">*</span></label>
                <input type="text" value={form.qualification} onChange={e => set('qualification', e.target.value)} placeholder="e.g., B.Sc Mathematics, B.Ed" />
              </div>
              <div className="form-group">
                <label>Experience (years)</label>
                <select value={form.experience} onChange={e => set('experience', e.target.value)}>
                  <option value="">Select</option>
                  {[{v:'0',l:'Fresher'},{v:'1',l:'1 yr'},{v:'2',l:'2 yrs'},{v:'3',l:'3 yrs'},{v:'4',l:'4 yrs'},{v:'5',l:'5+ yrs'},{v:'10',l:'10+ yrs'}]
                    .map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Teaching Mode</label>
                <select value={form.teachingMode} onChange={e => set('teachingMode', e.target.value)}>
                  <option value="">Select mode</option>
                  {TEACHING_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              {form.teachingMode === 'home' && (
                <div className="form-group">
                  <label>Coverage Radius (km)</label>
                  <select value={form.coverageRadius} onChange={e => set('coverageRadius', e.target.value)}>
                    <option value="">Select</option>
                    {COVERAGE_RADIUS_OPTIONS.map(r => <option key={r} value={r}>{r} km</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Subjects Taught</label>
              <div className="chips-select">
                {SUBJECTS.map(s => (
                  <div
                    key={s}
                    className={`chip${form.subjects.includes(s) ? ' selected' : ''}`}
                    onClick={() => toggleSubject(s)}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Monthly Fee (₹)</label>
                <input type="number" min="0" value={form.fee} onChange={e => set('fee', e.target.value)} placeholder="e.g., 2000" />
              </div>
              <div className="form-group">
                <label>Achievements</label>
                <input type="text" value={form.achievements} onChange={e => set('achievements', e.target.value)} placeholder="e.g., IIT Alumni" />
              </div>
            </div>

            <div className="form-group">
              <label>Demo Video URL</label>
              <input type="url" value={form.demoVideo} onChange={e => set('demoVideo', e.target.value)} placeholder="YouTube / Google Drive link" />
            </div>
          </>
        )}


        {/* ── Location (both roles) ─────────────────── */}
        <div className="form-group">
          <label>
            Your Location <span className="optional-tag">(Recommended)</span>
          </label>
          <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={locLoading}
              style={{
                padding:'10px 18px',
                border:'1.5px solid var(--blue-200)',
                borderRadius:'var(--radius-md)',
                background:'var(--blue-50)',
                color:'var(--blue-600)',
                fontSize:13,
                fontWeight:600,
                cursor: locLoading ? 'not-allowed' : 'pointer',
                opacity: locLoading ? 0.7 : 1,
                display:'flex', alignItems:'center', gap:6,
              }}
            >
              {locLoading ? '⏳ Detecting…' : '📍 Update My Location'}
            </button>
            {form.latitude !== '' && form.longitude !== '' && (
              <span style={{ fontSize:12, color:'var(--gray-500)' }}>
                {Number(form.latitude).toFixed(5)}°N, {Number(form.longitude).toFixed(5)}°E
              </span>
            )}
          </div>
          {locStatus && (
            <div style={{
              marginTop: 8, fontSize: 13,
              color: locStatus.startsWith('✅') ? '#15803d' : '#dc2626',
            }}>
              {locStatus}
            </div>
          )}
          <p style={{ fontSize:12, color:'var(--gray-400)', marginTop:6 }}>
            {isStudent
              ? 'Used to calculate distance from tutors in search results.'
              : 'Used so students can see how far you are. Never shown as exact coordinates.'}
          </p>
        </div>


        {/* Actions */}
        <div style={{ display:'flex', gap:12, justifyContent:'flex-end', marginTop:8 }}>
          <button
            onClick={onClose}
            style={{ padding:'10px 20px', border:'1.5px solid var(--gray-200)', borderRadius:'var(--radius-md)', fontSize:14, fontWeight:600, color:'var(--gray-600)', background:'white', cursor:'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary"
            style={{ padding:'10px 24px', fontSize:14, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Saving…' : '💾 Save Changes'}
          </button>
        </div>

      </div>
    </div>
  )
}