import { useRef } from 'react'

/**
 * @param {string[]} values    - array of 6 single chars
 * @param {function} onChange  - (newValues: string[]) => void
 */
export default function OTPFields({ values, onChange }) {
  const refs = Array.from({ length: 6 }, () => useRef(null))

  const handleInput = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...values]
    next[i] = val
    onChange(next)
    if (val && i < 5) refs[i + 1].current?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !values[i] && i > 0) {
      refs[i - 1].current?.focus()
    }
  }

  return (
    <div className="otp-fields">
      {values.map((v, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          maxLength={1}
          value={v}
          className="otp-input"
          onChange={e => handleInput(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
        />
      ))}
    </div>
  )
}
