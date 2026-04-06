import { useState, useRef, useEffect } from 'react'
import IconPicker from './IconPicker.jsx'
import useAsyncAction from '../hooks/useAsyncAction.js'

export default function CategoryDropdown({ categories, activeCat, onSelect, onAddCategory, onEditCategory, onDeleteCategory }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [editingCat, setEditingCat] = useState(null)
  const [form, setForm] = useState({ label: '', icon: '📁', color: '#0a6ed1' })
  const dropdownRef = useRef(null)
  const { pendingAction, isBusy, isPending, runAction } = useAsyncAction()

  const activeCategory = categories.find(c => c.id === activeCat) || categories[0]

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isBusy) return
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
        setIsAdding(false)
        setEditingCat(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isBusy])

  // Prevent body scroll when dropdown is open
  useEffect(() => {
    if (!isOpen) return

    const dropdown = dropdownRef.current?.querySelector('.dropdown-menu')
    if (!dropdown) return

    const handleWheel = (e) => {
      const list = dropdown.querySelector('.dropdown-list')
      if (!list) return

      const { scrollTop, scrollHeight, clientHeight } = list
      const isAtTop = scrollTop === 0
      const isAtBottom = scrollTop + clientHeight >= scrollHeight

      if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
        e.preventDefault()
      }
    }

    dropdown.addEventListener('wheel', handleWheel, { passive: false })
    return () => dropdown.removeEventListener('wheel', handleWheel)
  }, [isOpen])

  const handleSelect = (catId) => {
    if (isBusy) return
    onSelect(catId)
    setIsOpen(false)
  }

  const startAdding = () => {
    if (isBusy) return
    setForm({ label: '', icon: '📁', color: '#0a6ed1' })
    setIsAdding(true)
    setEditingCat(null)
  }

  const startEditing = (cat, e) => {
    e.stopPropagation()
    if (isBusy) return
    if (cat.id === 'all') return
    setForm({ label: cat.label.replace(/^.+\s/, ''), icon: cat.label.split(' ')[0], color: cat.color })
    setEditingCat(cat)
    setIsAdding(false)
  }

  const handleSave = async () => {
    if (!form.label.trim() || isBusy) return

    const fullLabel = `${form.icon} ${form.label.trim()}`

    const result = await runAction(editingCat ? 'save-category' : 'create-category', async () => {
      if (editingCat) {
        return onEditCategory({ ...editingCat, label: fullLabel, color: form.color })
      }

      const newCat = {
        id: `cat-${Date.now()}`,
        label: fullLabel,
        color: form.color
      }

      return onAddCategory(newCat)
    })

    if (result === false) return

    setEditingCat(null)
    setIsAdding(false)
    setForm({ label: '', icon: '📁', color: '#0a6ed1' })
  }

  const handleDelete = async (cat, e) => {
    e.stopPropagation()
    if (isBusy) return
    if (cat.id === 'all') return
    if (window.confirm(`Törlöd a "${cat.label}" kategóriát?`)) {
      const result = await runAction(`delete-${cat.id}`, async () => onDeleteCategory(cat.id))
      if (result !== false && activeCat === cat.id) {
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
        disabled={isBusy}
        aria-busy={isBusy}
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
          <div className="dropdown-list">
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
                    <button onClick={(e) => startEditing(cat, e)} title="Szerkesztés" disabled={isBusy}>
                      ✏️
                    </button>
                    <button onClick={(e) => handleDelete(cat, e)} title="Törlés" disabled={isBusy}>
                      {isPending(`delete-${cat.id}`) ? '⏳' : '🗑️'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="dropdown-divider" />

          {(isAdding || editingCat) ? (
            <div className="dropdown-form">
              <div className="dropdown-form-row">
                <IconPicker
                  value={form.icon}
                  onChange={icon => setForm(f => ({ ...f, icon }))}
                  disabled={isBusy}
                />
                <input
                  type="text"
                  className="dropdown-form-input"
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="Kategória neve"
                  autoFocus
                  disabled={isBusy}
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
                    disabled={isBusy}
                  />
                ))}
              </div>
              <div className="dropdown-form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => { setIsAdding(false); setEditingCat(null) }}
                  disabled={isBusy}
                >
                  Mégse
                </button>
                <button
                  type="button"
                  className="btn-save"
                  onClick={handleSave}
                  disabled={!form.label.trim() || isBusy}
                >
                  {pendingAction === 'save-category'
                    ? 'Mentés...'
                    : pendingAction === 'create-category'
                      ? 'Hozzáadás...'
                      : editingCat
                        ? 'Mentés'
                        : 'Hozzáadás'}
                </button>
              </div>
            </div>
          ) : (
            <button className="dropdown-add" onClick={startAdding} disabled={isBusy}>
              {isBusy ? 'Folyamatban...' : '+ Új kategória'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
