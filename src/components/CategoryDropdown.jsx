import { useState, useRef, useEffect } from 'react'

export default function CategoryDropdown({ categories, activeCat, onSelect, onAddCategory, onEditCategory, onDeleteCategory }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [editingCat, setEditingCat] = useState(null)
  const [form, setForm] = useState({ label: '', icon: '📁', color: '#0a6ed1' })
  const dropdownRef = useRef(null)

  const activeCategory = categories.find(c => c.id === activeCat) || categories[0]

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
        setIsAdding(false)
        setEditingCat(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (catId) => {
    onSelect(catId)
    setIsOpen(false)
  }

  const startAdding = () => {
    setForm({ label: '', icon: '📁', color: '#0a6ed1' })
    setIsAdding(true)
    setEditingCat(null)
  }

  const startEditing = (cat, e) => {
    e.stopPropagation()
    if (cat.id === 'all') return
    setForm({ label: cat.label.replace(/^.+\s/, ''), icon: cat.label.split(' ')[0], color: cat.color })
    setEditingCat(cat)
    setIsAdding(false)
  }

  const handleSave = () => {
    if (!form.label.trim()) return

    const fullLabel = `${form.icon} ${form.label.trim()}`

    if (editingCat) {
      onEditCategory({ ...editingCat, label: fullLabel, color: form.color })
      setEditingCat(null)
    } else {
      const newCat = {
        id: `cat-${Date.now()}`,
        label: fullLabel,
        color: form.color
      }
      onAddCategory(newCat)
      setIsAdding(false)
    }
    setForm({ label: '', icon: '📁', color: '#0a6ed1' })
  }

  const handleDelete = (cat, e) => {
    e.stopPropagation()
    if (cat.id === 'all') return
    if (window.confirm(`Törlöd a "${cat.label}" kategóriát?`)) {
      onDeleteCategory(cat.id)
      if (activeCat === cat.id) {
        onSelect('all')
      }
    }
  }

  const PRESET_COLORS = [
    '#0a6ed1', '#107e3e', '#bb0000', '#e9730c', '#7c3aed', '#0891b2', '#be185d', '#6a6d70'
  ]

  return (
    <div className="category-dropdown" ref={dropdownRef}>
      <button
        className="dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{ borderColor: activeCategory.color }}
      >
        <span style={{
          width: 8,
          height: 8,
          borderRadius: 2,
          background: activeCategory.color,
          flexShrink: 0
        }} />
        <span style={{ flex: 1, textAlign: 'left' }}>{activeCategory.label}</span>
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          {categories.map(cat => (
            <div
              key={cat.id}
              className={`dropdown-item${activeCat === cat.id ? ' active' : ''}`}
              onClick={() => handleSelect(cat.id)}
            >
              <span className="dropdown-item-color" style={{ background: cat.color }} />
              <span className="dropdown-item-label">{cat.label}</span>
              {cat.id !== 'all' && cat.id !== 'favorites' && !cat.isSystem && (
                <div className="dropdown-item-actions">
                  <button onClick={(e) => startEditing(cat, e)} title="Szerkesztés">
                    ✏️
                  </button>
                  <button onClick={(e) => handleDelete(cat, e)} title="Törlés">
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))}

          <div className="dropdown-divider" />

          {(isAdding || editingCat) ? (
            <div className="dropdown-form">
              <div className="dropdown-form-row">
                <input
                  type="text"
                  className="dropdown-form-icon"
                  value={form.icon}
                  onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                  placeholder="📁"
                />
                <input
                  type="text"
                  className="dropdown-form-input"
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="Kategória neve"
                  autoFocus
                />
              </div>
              <div className="dropdown-form-colors">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`color-btn${form.color === c ? ' active' : ''}`}
                    style={{ background: c }}
                    onClick={() => setForm(f => ({ ...f, color: c }))}
                  />
                ))}
              </div>
              <div className="dropdown-form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => { setIsAdding(false); setEditingCat(null) }}
                >
                  Mégse
                </button>
                <button
                  type="button"
                  className="btn-save"
                  onClick={handleSave}
                >
                  {editingCat ? 'Mentés' : 'Hozzáadás'}
                </button>
              </div>
            </div>
          ) : (
            <button className="dropdown-add" onClick={startAdding}>
              + Új kategória
            </button>
          )}
        </div>
      )}
    </div>
  )
}
