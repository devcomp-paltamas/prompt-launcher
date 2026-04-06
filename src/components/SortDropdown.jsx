import { useState, useRef, useEffect } from 'react'

const SORT_OPTIONS = [
  { id: 'alpha-asc', label: '🔤 A → Z', icon: '🔤' },
  { id: 'alpha-desc', label: '🔤 Z → A', icon: '🔤' },
  { id: 'date-desc', label: '📅 Legújabb elöl', icon: '📅' },
  { id: 'date-asc', label: '📅 Legrégebbi elöl', icon: '📅' },
  { id: 'usage-desc', label: '📊 Legtöbbet használt', icon: '📊' },
  { id: 'usage-asc', label: '📊 Legkevesebbet használt', icon: '📊' },
]

export default function SortDropdown({ sortOption, onSortChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentOption = SORT_OPTIONS.find(o => o.id === sortOption) || SORT_OPTIONS[0]

  return (
    <div className="sort-dropdown" ref={dropdownRef}>
      <button
        className="sort-dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Rendezés"
      >
        <span className="sort-icon">⇅</span>
        <span className="sort-label">{currentOption.label}</span>
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="sort-dropdown-menu">
          {SORT_OPTIONS.map(option => (
            <button
              key={option.id}
              className={`sort-option ${sortOption === option.id ? 'active' : ''}`}
              onClick={() => {
                onSortChange(option.id)
                setIsOpen(false)
              }}
            >
              {option.label}
              {sortOption === option.id && <span className="check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
