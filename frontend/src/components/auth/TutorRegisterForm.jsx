import { useState, useRef } from 'react'
import { SUBJECTS, BOARDS, CLASS_NUMBERS, TEACHING_MODES, COVERAGE_RADIUS_OPTIONS } from '../../data/constants.js'

export default function TutorRegisterForm({ formData, onChange }) {
  const photoRef = useRef(null)
  const certRef  = useRef(null)
  const [photoPreview,  setPhotoPreview]  = useState(null)
  const [locLoading,    setLocLoading]    = useState(false)
  const [locStatus,     setLocStatus]     = useState('')   // success / error message

  const isHomeMode = formData.teachingMode === 'home'

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    onChange('photo', file)
    const reader = new FileReader()
    reader.onload = ev => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const toggleChip = (field, value) => {
    const current = formData[field] || []
    onChange(field, current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    )
  }

  // ── Detect location ────────────────────────────────────
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus('❌ Geolocation is not supported by your browser.')
      return
    }
    setLocLoading(true)
    setLocStatus('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange('latitude',  pos.coords.latitude)
        onChange('longitude', pos.coords.longitude)
        setLocStatus(`✅ Location saved (${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E)`)
        setLocLoading(false)
      },
      (err) => {
        setLocStatus('❌ Could not get location. Please allow location access and try again.')
        setLocLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <>
      <div className="form-section-title" style={{ marginTop:0 }}>Tutor Profile</div>

      {/* Photo upload */}
      <div className="profile-upload">
        <div className="profile-preview" onClick={() => photoRef.current?.click()} style={{ cursor:'pointer' }}>
          {photoPreview
            ? <img src={photoPreview} alt="profile" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : '📷'}
          <input ref={photoRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhotoChange} />
        </div>
        <div className="profile-upload-btn">
          <button type="button" onClick={() => photoRef.current?.click()}>
            Upload Profile Photo <span className="optional-tag">(Optional)</span>
          </button>
          <p>JPG, PNG up to 5MB</p>
        </div>
      </div>

      <div className="form-row">
        <div className={`form-group${formData._errors?.name ? ' has-error' : ''}`}>
          <label>Full Name <span className="required-mark">*</span></label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={e => onChange('name', e.target.value)}
            placeholder="Your full name"
          />
          <div className="error-msg">Full name is required.</div>
        </div>

        <div className={`form-group${formData._errors?.experience ? ' has-error' : ''}`}>
          <label>Years of Experience <span className="required-mark">*</span></label>
          <select value={formData.experience || ''} onChange={e => onChange('experience', e.target.value)}>
            <option value="">Select experience</option>
            {[
              { label:'Fresher (0 years)', value:'0' },
              { label:'1 year',   value:'1' },
              { label:'2 years',  value:'2' },
              { label:'3 years',  value:'3' },
              { label:'4 years',  value:'4' },
              { label:'5+ years', value:'5' },
              { label:'10+ years',value:'10' },
            ].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div className="error-msg">Please select experience.</div>
        </div>
      </div>

      <div className="form-row">
        <div className={`form-group${formData._errors?.qualification ? ' has-error' : ''}`}>
          <label>Qualification <span className="required-mark">*</span></label>
          <input
            type="text"
            value={formData.qualification || ''}
            onChange={e => onChange('qualification', e.target.value)}
            placeholder="e.g., B.Sc Mathematics, B.Ed"
          />
          <div className="error-msg">Qualification is required.</div>
        </div>

        <div className={`form-group${formData._errors?.teachingMode ? ' has-error' : ''}`}>
          <label>Teaching Mode <span className="required-mark">*</span></label>
          <select value={formData.teachingMode || ''} onChange={e => onChange('teachingMode', e.target.value)}>
            <option value="">Select mode</option>
            {TEACHING_MODES.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <div className="error-msg">Please select teaching mode.</div>
        </div>
      </div>

      {isHomeMode && (
        <div className={`form-group${formData._errors?.coverageRadius ? ' has-error' : ''}`}>
          <label>Coverage Radius <span className="required-mark">*</span></label>
          <select value={formData.coverageRadius || ''} onChange={e => onChange('coverageRadius', e.target.value)}>
            <option value="">Select radius</option>
            {COVERAGE_RADIUS_OPTIONS.map(r => (
              <option key={r} value={r}>{r} km</option>
            ))}
          </select>
          <div className="mode-info">📍 You'll appear in search results for students within this distance.</div>
          <div className="error-msg">Coverage radius is required for home tutors.</div>
        </div>
      )}

      <div className="form-row">
        <div className={`form-group${formData._errors?.classFrom ? ' has-error' : ''}`}>
          <label>Class Range — From <span className="required-mark">*</span></label>
          <select value={formData.classFrom || ''} onChange={e => onChange('classFrom', e.target.value)}>
            <option value="">From Class</option>
            {CLASS_NUMBERS.map(c => <option key={c}>{c}</option>)}
          </select>
          <div className="error-msg">Please select class range.</div>
        </div>
        <div className="form-group">
          <label>Class Range — To</label>
          <select value={formData.classTo || ''} onChange={e => onChange('classTo', e.target.value)}>
            <option value="">To Class</option>
            {CLASS_NUMBERS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className={`form-group${formData._errors?.boards ? ' has-error' : ''}`}>
        <label>Board Expertise <span className="required-mark">*</span></label>
        <div className="chips-select">
          {BOARDS.map(b => (
            <div
              key={b}
              className={`chip${(formData.boards || []).includes(b) ? ' selected' : ''}`}
              onClick={() => toggleChip('boards', b)}
            >
              {b}
            </div>
          ))}
        </div>
        <div className="error-msg">Please select at least one board.</div>
      </div>

      <div className={`form-group${formData._errors?.subjects ? ' has-error' : ''}`}>
        <label>Subjects Taught <span className="required-mark">*</span></label>
        <div className="chips-select">
          {SUBJECTS.map(s => (
            <div
              key={s}
              className={`chip${(formData.subjects || []).includes(s) ? ' selected' : ''}`}
              onClick={() => toggleChip('subjects', s)}
            >
              {s}
            </div>
          ))}
        </div>
        <div className="error-msg">Please select at least one subject.</div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Monthly Fee (₹) <span className="optional-tag">(Optional)</span></label>
          <input
            type="number"
            min="0"
            value={formData.fee || ''}
            onChange={e => onChange('fee', e.target.value)}
            placeholder="e.g., 2000"
          />
        </div>
        <div className="form-group">
          <label>Achievements <span className="optional-tag">(Optional)</span></label>
          <input
            type="text"
            value={formData.achievements || ''}
            onChange={e => onChange('achievements', e.target.value)}
            placeholder="e.g., IIT Alumni, 95% board results"
          />
        </div>
      </div>

      {/* ── Location ─────────────────────────────────────── */}
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
            {locLoading ? '⏳ Detecting…' : '📍 Use My Current Location'}
          </button>
          {formData.latitude && formData.longitude && !locStatus.startsWith('❌') && (
            <span style={{ fontSize:12, color:'var(--gray-500)' }}>
              Lat: {Number(formData.latitude).toFixed(5)}, Lng: {Number(formData.longitude).toFixed(5)}
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
          Your exact coordinates are never shown publicly. They are used only to calculate
          distance from nearby students.
        </p>
      </div>

      <div className="form-group">
        <label>Upload Certificates <span className="optional-tag">(Optional)</span></label>
        <div className="file-upload-area" onClick={() => certRef.current?.click()}>
          <div className="upload-icon">📜</div>
          <p>Click to upload degree/qualification certificates</p>
          <span>PDF or Image — Max 10MB each</span>
          <input
            ref={certRef}
            type="file"
            accept=".pdf,image/*"
            multiple
            style={{ display:'none' }}
            onChange={e => onChange('certs', Array.from(e.target.files))}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Demo Lecture <span className="optional-tag">(Optional)</span></label>
        <input
          type="url"
          value={formData.demoVideo || ''}
          onChange={e => onChange('demoVideo', e.target.value)}
          placeholder="YouTube/Google Drive link to your demo video"
        />
      </div>
    </>
  )
}