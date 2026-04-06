import { useState, useRef, useEffect } from 'react'

const ICON_CATEGORIES = [
  { name: 'Általános', icons: ['📁', '📂', '📄', '📝', '📋', '📌', '📎', '🔖', '🏷️', '💼', '🗂️', '🗃️', '📚', '📖', '📑', '🗒️'] },
  { name: 'Tech', icons: ['💻', '🖥️', '⌨️', '🖱️', '💾', '📀', '🔧', '🔨', '⚙️', '🛠️', '🔩', '⚡', '🔌', '📡', '🌐', '☁️'] },
  { name: 'Fejlesztés', icons: ['🐛', '🔍', '🔎', '✅', '❌', '⚠️', '🚀', '🎯', '💡', '🧪', '🧬', '📊', '📈', '📉', '🔬', '🧮'] },
  { name: 'Státusz', icons: ['✨', '⭐', '🌟', '💫', '🔥', '❤️', '💚', '💙', '💜', '🧡', '💛', '🖤', '🤍', '💯', '🎉', '🎊'] },
  { name: 'Egyéb', icons: ['🏠', '🔑', '🔒', '🔓', '📦', '🎁', '💰', '👤', '👥', '🧑‍💻', '🤖', '👾', '🧠', '💬', '📧', '🔔'] },
]

export default function IconPicker({ value, onChange, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const pickerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (icon) => {
    if (disabled) return
    onChange(icon)
    setIsOpen(false)
  }

  return (
    <div className="icon-picker" ref={pickerRef}>
      <button
        type="button"
        className="icon-picker-trigger"
        onClick={() => {
          if (disabled) return
          setIsOpen(!isOpen)
        }}
        title="Ikon választása"
        disabled={disabled}
      >
        <span className="icon-picker-value">{value || '📁'}</span>
        <span className="icon-picker-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="icon-picker-dropdown">
          {/* Tabs */}
          <div className="icon-picker-tabs">
            {ICON_CATEGORIES.map((cat, idx) => (
              <button
                key={cat.name}
                type="button"
                className={`icon-picker-tab ${activeTab === idx ? 'active' : ''}`}
                onClick={() => setActiveTab(idx)}
                disabled={disabled}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Icons grid */}
          <div className="icon-picker-grid">
            {ICON_CATEGORIES[activeTab].icons.map(icon => (
              <button
                key={icon}
                type="button"
                className={`icon-picker-icon ${value === icon ? 'selected' : ''}`}
                onClick={() => handleSelect(icon)}
                disabled={disabled}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
