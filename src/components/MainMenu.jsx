import { useState, useRef, useEffect } from 'react'

export default function MainMenu({ collections, activeCollection, onSelect, onAdd, onEdit, onDelete }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', icon: '📁', color: '#6366f1' })
  const menuRef = useRef(null)

  const active = collections.find(c => c.id === activeCollection) || collections[0]

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
        setIsAdding(false)
        setEditingId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (id) => {
    onSelect(id)
    setIsOpen(false)
  }

  const startAdding = () => {
    setForm({ name: '', icon: '📁', color: '#6366f1' })
    setIsAdding(true)
    setEditingId(null)
  }

  const startEditing = (col, e) => {
    e.stopPropagation()
    setForm({ name: col.name, icon: col.icon, color: col.color })
    setEditingId(col.id)
    setIsAdding(false)
  }

  const handleSave = () => {
    if (!form.name.trim()) return

    if (editingId) {
      onEdit({ id: editingId, ...form })
      setEditingId(null)
    } else {
      onAdd({
        id: `collection-${Date.now()}`,
        name: form.name.trim(),
        icon: form.icon,
        color: form.color,
      })
      setIsAdding(false)
    }
    setForm({ name: '', icon: '📁', color: '#6366f1' })
  }

  const handleDelete = (col, e) => {
    e.stopPropagation()
    if (collections.length <= 1) {
      alert('Legalább egy gyűjteménynek maradnia kell!')
      return
    }
    if (window.confirm(`Törlöd a "${col.name}" gyűjteményt és minden promptját?`)) {
      onDelete(col.id)
    }
  }

  const PRESET_COLORS = [
    '#0070f3', '#00b894', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'
  ]

  return (
    <div className="main-menu" ref={menuRef}>
      <button
        className="main-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{ borderColor: active.color, background: `${active.color}15` }}
      >
        <span className="main-menu-icon">{active.icon}</span>
        <span className="main-menu-name">{active.name}</span>
        <span className="main-menu-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="main-menu-dropdown">
          <div className="main-menu-header">Gyűjtemények</div>

          {collections.map(col => (
            <div
              key={col.id}
              className={`main-menu-item${activeCollection === col.id ? ' active' : ''}`}
              onClick={() => handleSelect(col.id)}
            >
              <span className="main-menu-item-icon" style={{ background: `${col.color}30` }}>
                {col.icon}
              </span>
              <span className="main-menu-item-name">{col.name}</span>
              <div className="main-menu-item-actions">
                <button onClick={(e) => startEditing(col, e)} title="Szerkesztés">✏️</button>
                <button onClick={(e) => handleDelete(col, e)} title="Törlés">🗑️</button>
              </div>
            </div>
          ))}

          <div className="main-menu-divider" />

          {(isAdding || editingId) ? (
            <div className="main-menu-form">
              <div className="main-menu-form-row">
                <input
                  type="text"
                  className="main-menu-form-icon"
                  value={form.icon}
                  onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                  placeholder="📁"
                />
                <input
                  type="text"
                  className="main-menu-form-input"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Gyűjtemény neve"
                  autoFocus
                />
              </div>
              <div className="main-menu-form-colors">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    className={`color-btn${form.color === c ? ' active' : ''}`}
                    style={{ background: c }}
                    onClick={() => setForm(f => ({ ...f, color: c }))}
                  />
                ))}
              </div>
              <div className="main-menu-form-actions">
                <button className="btn-cancel" onClick={() => { setIsAdding(false); setEditingId(null) }}>
                  Mégse
                </button>
                <button className="btn-save" onClick={handleSave}>
                  {editingId ? 'Mentés' : 'Létrehozás'}
                </button>
              </div>
            </div>
          ) : (
            <button className="main-menu-add" onClick={startAdding}>
              ➕ Új gyűjtemény
            </button>
          )}
        </div>
      )}
    </div>
  )
}
