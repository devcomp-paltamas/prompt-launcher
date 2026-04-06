import { useState, useRef, useEffect } from 'react'
import IconPicker from './IconPicker.jsx'
import useAsyncAction from '../hooks/useAsyncAction.js'

export default function MainMenu({ collections, activeCollection, onSelect, onAdd, onEdit, onDelete }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', icon: '📁', color: '#0a6ed1' })
  const menuRef = useRef(null)
  const { pendingAction, isBusy, isPending, runAction } = useAsyncAction()

  // Virtual "all collections" option
  const allCollectionsOption = {
    id: 'all-collections',
    name: 'Összes gyűjtemény',
    icon: '📚',
    color: '#8b5cf6',
    isVirtual: true,
  }

  const active = activeCollection === 'all-collections'
    ? allCollectionsOption
    : collections.find(c => c.id === activeCollection) || collections[0]

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isBusy) return
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
        setIsAdding(false)
        setEditingId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isBusy])

  // Prevent body scroll when dropdown is open
  useEffect(() => {
    if (!isOpen) return

    const dropdown = menuRef.current?.querySelector('.main-menu-dropdown')
    if (!dropdown) return

    const handleWheel = (e) => {
      const list = dropdown.querySelector('.main-menu-list')
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

  const handleSelect = (id) => {
    if (isBusy) return
    onSelect(id)
    setIsOpen(false)
  }

  const startAdding = () => {
    if (isBusy) return
    setForm({ name: '', icon: '📁', color: '#0a6ed1' })
    setIsAdding(true)
    setEditingId(null)
  }

  const startEditing = (col, e) => {
    e.stopPropagation()
    if (isBusy) return
    setForm({ name: col.name, icon: col.icon, color: col.color })
    setEditingId(col.id)
    setIsAdding(false)
  }

  const handleSave = async () => {
    if (!form.name.trim() || isBusy) return

    const result = await runAction(editingId ? 'save-collection' : 'create-collection', async () => {
      if (editingId) {
        return onEdit({ id: editingId, ...form })
      }

      return onAdd({
        id: `collection-${Date.now()}`,
        name: form.name.trim(),
        icon: form.icon,
        color: form.color,
      })
    })

    if (result === false) return

    setEditingId(null)
    setIsAdding(false)
    setForm({ name: '', icon: '📁', color: '#0a6ed1' })
  }

  const handleDelete = async (col, e) => {
    e.stopPropagation()
    if (isBusy) return
    if (collections.length <= 1) {
      alert('Legalább egy gyűjteménynek maradnia kell!')
      return
    }
    if (window.confirm(`Törlöd a "${col.name}" gyűjteményt és minden promptját?`)) {
      await runAction(`delete-${col.id}`, async () => onDelete(col.id))
    }
  }

  const PRESET_COLORS = [
    '#0a6ed1', '#107e3e', '#bb0000', '#e9730c', '#7c3aed', '#0891b2', '#be185d', '#6a6d70'
  ]

  return (
    <div className="main-menu" ref={menuRef}>
      <button
        className="main-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{ borderColor: active.color }}
        disabled={isBusy}
        aria-busy={isBusy}
      >
        <span className="main-menu-icon">{active.icon}</span>
        <span className="main-menu-name">{active.name}</span>
        <span className="main-menu-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="main-menu-dropdown">
          {/* "All collections" virtual option */}
          <div
            className={`main-menu-item main-menu-item-all${activeCollection === 'all-collections' ? ' active' : ''}`}
            onClick={() => handleSelect('all-collections')}
          >
            <span
              className="main-menu-item-icon"
              style={{ background: `${allCollectionsOption.color}20` }}
            >
              {allCollectionsOption.icon}
            </span>
            <span className="main-menu-item-name">{allCollectionsOption.name}</span>
            <span className="main-menu-item-badge">
              {collections.reduce((sum, c) => sum + (c.prompts?.length || 0), 0)}
            </span>
          </div>

          <div className="main-menu-divider" />
          <div className="main-menu-header">Gyűjtemények</div>

          <div className="main-menu-list">
            {collections.map(col => (
              <div
                key={col.id}
                className={`main-menu-item${activeCollection === col.id ? ' active' : ''}`}
                onClick={() => handleSelect(col.id)}
              >
                <span
                  className="main-menu-item-icon"
                  style={{ background: `${col.color}20` }}
                >
                  {col.icon}
                </span>
                <span className="main-menu-item-name">{col.name}</span>
                <div className="main-menu-item-actions">
                  <button onClick={(e) => startEditing(col, e)} title="Szerkesztés" disabled={isBusy}>
                    ✏️
                  </button>
                  <button onClick={(e) => handleDelete(col, e)} title="Törlés" disabled={isBusy}>
                    {isPending(`delete-${col.id}`) ? '⏳' : '🗑️'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="main-menu-divider" />

          {(isAdding || editingId) ? (
            <div className="main-menu-form">
              <div className="main-menu-form-row">
                <IconPicker
                  value={form.icon}
                  onChange={icon => setForm(f => ({ ...f, icon }))}
                  disabled={isBusy}
                />
                <input
                  type="text"
                  className="main-menu-form-input"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Gyűjtemény neve"
                  autoFocus
                  disabled={isBusy}
                />
              </div>
              <div className="main-menu-form-colors">
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
              <div className="main-menu-form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: 13 }}
                  onClick={() => { setIsAdding(false); setEditingId(null) }}
                  disabled={isBusy}
                >
                  Mégse
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ padding: '6px 12px', fontSize: 13 }}
                  onClick={handleSave}
                  disabled={!form.name.trim() || isBusy}
                >
                  {pendingAction === 'save-collection'
                    ? 'Mentés...'
                    : pendingAction === 'create-collection'
                      ? 'Létrehozás...'
                      : editingId
                        ? 'Mentés'
                        : 'Létrehozás'}
                </button>
              </div>
            </div>
          ) : (
            <button className="main-menu-add" onClick={startAdding} disabled={isBusy}>
              {isBusy ? 'Folyamatban...' : '+ Új gyűjtemény'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
