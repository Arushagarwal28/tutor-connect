/**
 * @param {string[]} options    - all available chips
 * @param {string[]} selected   - currently selected values
 * @param {function} onChange   - (newSelected: string[]) => void
 */
export default function ChipSelector({ options, selected, onChange }) {
  const toggle = (opt) => {
    const next = selected.includes(opt)
      ? selected.filter(s => s !== opt)
      : [...selected, opt]
    onChange(next)
  }

  return (
    <div className="chips-select">
      {options.map(opt => (
        <div
          key={opt}
          className={`chip${selected.includes(opt) ? ' selected' : ''}`}
          onClick={() => toggle(opt)}
        >
          {opt}
        </div>
      ))}
    </div>
  )
}
