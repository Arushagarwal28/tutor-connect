import { CLASS_NUMBERS, BOARDS, SUBJECTS, BUDGET_RANGES } from '../../data/constants.js'

export default function StudentRegisterForm({ formData, onChange }) {

  const toggleSubject = (sub) => {
    const current = formData.subjects || []
    onChange('subjects', current.includes(sub)
      ? current.filter(s => s !== sub)
      : [...current, sub]
    )
  }

  return (
    <>
      <div className="form-section-title" style={{ marginTop:0 }}>Student Information</div>

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

        <div className={`form-group${formData._errors?.class ? ' has-error' : ''}`}>
          <label>Class / Grade <span className="required-mark">*</span></label>
          {/*
            FIX: Previously rendered <option>Class {c}</option> which stored
            "Class 9" as the value. Now the value AND label are just the number
            so formData.class = "9", matching what the Student model expects.
            Dashboard then displays "Class 9 · CBSE" correctly.
          */}
          <select value={formData.class || ''} onChange={e => onChange('class', e.target.value)}>
            <option value="">Select class</option>
            {CLASS_NUMBERS.map(c => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
          <div className="error-msg">Please select your class.</div>
        </div>
      </div>

      <div className="form-row">
        <div className={`form-group${formData._errors?.board ? ' has-error' : ''}`}>
          <label>Board <span className="required-mark">*</span></label>
          <select value={formData.board || ''} onChange={e => onChange('board', e.target.value)}>
            <option value="">Select board</option>
            {BOARDS.map(b => <option key={b}>{b}</option>)}
          </select>
          <div className="error-msg">Please select your board.</div>
        </div>

        <div className="form-group">
          <label>Budget Range <span className="optional-tag">(Optional)</span></label>
          <select value={formData.budget || ''} onChange={e => onChange('budget', e.target.value)}>
            <option value="">Any budget</option>
            {BUDGET_RANGES.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Subjects Interested In <span className="optional-tag">(Optional)</span></label>
        <div className="chips-select">
          {SUBJECTS.map(s => (
            <div
              key={s}
              className={`chip${(formData.subjects || []).includes(s) ? ' selected' : ''}`}
              onClick={() => toggleSubject(s)}
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}