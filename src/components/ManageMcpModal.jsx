import { useEffect, useMemo, useState } from 'react'
import { createMcpId, normalizeMcpOptions } from '../lib/promptMcp.js'
import useAsyncAction from '../hooks/useAsyncAction.js'

const EMPTY_FORM = {
  id: '',
  label: '',
  shortLabel: '',
  description: '',
  instruction: '',
  color: '#60a5fa',
}

export default function ManageMcpModal({ mcps = [], onClose, onSave }) {
  const [items, setItems] = useState(() => normalizeMcpOptions(mcps))
  const [editingId, setEditingId] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const { pendingAction, isBusy, runAction } = useAsyncAction()

  useEffect(() => {
    setItems(normalizeMcpOptions(mcps))
    setEditingId('')
    setForm(EMPTY_FORM)
    setError('')
  }, [mcps])

  useEffect(() => {
    const handler = event => {
      if (isBusy) return
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isBusy, onClose])

  const hasChanges = useMemo(() => {
    return JSON.stringify(normalizeMcpOptions(mcps)) !== JSON.stringify(items)
  }, [items, mcps])

  const resetForm = () => {
    setEditingId('')
    setForm(EMPTY_FORM)
    setError('')
  }

  const handleFormChange = (field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value }

      if (field === 'label' && !editingId && !prev.id) {
        next.id = createMcpId(value)
      }

      if (field === 'label' && !prev.shortLabel) {
        next.shortLabel = createMcpId(value)
      }

      return next
    })
  }

  const handleStartEdit = mcp => {
    if (isBusy) return
    setEditingId(mcp.id)
    setForm({
      id: mcp.id,
      label: mcp.label,
      shortLabel: mcp.shortLabel,
      description: mcp.description || '',
      instruction: mcp.instruction || '',
      color: mcp.color,
    })
    setError('')
  }

  const handleDelete = mcpId => {
    if (isBusy) return
    setItems(prev => prev.filter(item => item.id !== mcpId))

    if (editingId === mcpId) {
      resetForm()
    }
  }

  const handleUpsert = () => {
    if (isBusy) return
    const nextId = createMcpId(form.id || form.label)
    const nextShortLabel = (form.shortLabel || nextId).trim()

    if (!nextId) {
      setError('Adj meg egy érvényes MCP azonosítót.')
      return
    }

    if (!form.label.trim()) {
      setError('Adj meg egy nevet az MCP-hez.')
      return
    }

    if (!form.instruction.trim()) {
      setError('Adj meg beszúrandó instrukciót is.')
      return
    }

    const duplicate = items.find(item => item.id === nextId && item.id !== editingId)
    if (duplicate) {
      setError(`Már létezik ilyen azonosító: ${nextId}`)
      return
    }

    const normalizedItem = normalizeMcpOptions([{
      ...form,
      id: nextId,
      shortLabel: nextShortLabel,
    }])[0]

    setItems(prev => (
      editingId
        ? prev.map(item => (item.id === editingId ? normalizedItem : item))
        : [...prev, normalizedItem]
    ))

    resetForm()
  }

  const handleSaveAll = async () => {
    const result = await runAction('save-all', async () => onSave(items))
    if (result !== false) {
      onClose()
    }
  }

  return (
    <div className="modal-backdrop" onClick={isBusy ? undefined : onClose}>
      <div className="modal-box mcp-modal" onClick={event => event.stopPropagation()}>
        <div className="edit-modal-header">
          <div>
            <div className="mcp-modal-title">MCP-k kezelése</div>
            <div className="mcp-modal-subtitle">Itt tudod karbantartani a választható MCP-ket.</div>
          </div>
          <button onClick={onClose} className="modal-close" disabled={isBusy}>×</button>
        </div>

        <div className="mcp-modal-body">
          <div className="mcp-modal-list">
            <div className="form-label">Jelenlegi MCP-k</div>
            {items.length === 0 ? (
              <div className="mcp-empty-state">Még nincs felvett MCP.</div>
            ) : (
              items.map(mcp => (
                <div key={mcp.id} className="mcp-admin-card">
                  <div className="mcp-admin-card-main">
                    <div className="mcp-admin-card-head">
                      <span
                        className="mcp-admin-color"
                        style={{ background: mcp.color }}
                      />
                      <span className="mcp-admin-label">{mcp.label}</span>
                      <span className="mcp-admin-short">{mcp.shortLabel}</span>
                    </div>
                    <div className="mcp-admin-id">{mcp.id}</div>
                    {mcp.description && (
                      <div className="mcp-admin-desc">{mcp.description}</div>
                    )}
                  </div>
                  <div className="mcp-admin-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handleStartEdit(mcp)}
                      disabled={isBusy}
                    >
                      Szerkesztés
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handleDelete(mcp.id)}
                      disabled={isBusy}
                    >
                      Törlés
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mcp-modal-form">
            <div className="form-label">{editingId ? 'MCP szerkesztése' : 'Új MCP'}</div>

            <div className="mcp-form-grid">
              <div>
                <label className="form-label">Név</label>
                <input
                  className="form-input"
                  value={form.label}
                  onChange={event => handleFormChange('label', event.target.value)}
                  placeholder="Pl. SAP Docs"
                  disabled={isBusy}
                />
              </div>

              <div>
                <label className="form-label">Azonosító</label>
                <input
                  className="form-input"
                  value={form.id}
                  onChange={event => handleFormChange('id', event.target.value)}
                  placeholder="pl. sap-docs"
                  disabled={isBusy}
                />
              </div>

              <div>
                <label className="form-label">Rövid címke</label>
                <input
                  className="form-input"
                  value={form.shortLabel}
                  onChange={event => handleFormChange('shortLabel', event.target.value)}
                  placeholder="pl. sap-docs"
                  disabled={isBusy}
                />
              </div>

              <div>
                <label className="form-label">Szín</label>
                <input
                  className="form-input"
                  type="color"
                  value={form.color}
                  onChange={event => handleFormChange('color', event.target.value)}
                  disabled={isBusy}
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label className="form-label">Rövid leírás</label>
              <textarea
                className="form-input"
                rows={2}
                value={form.description}
                onChange={event => handleFormChange('description', event.target.value)}
                placeholder="Mihez való ez az MCP?"
                disabled={isBusy}
              />
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label className="form-label">Prompt elé beszúrt instrukció</label>
              <textarea
                className="form-input prompt-textarea"
                rows={5}
                value={form.instruction}
                onChange={event => handleFormChange('instruction', event.target.value)}
                placeholder="Pl. Használd a ... MCP szervert ..."
                disabled={isBusy}
              />
            </div>

            {error && <div className="modal-inline-error">{error}</div>}

            <div className="mcp-form-preview">
              <div className="form-label">Előnézet</div>
              <div className="mcp-picker-card active">
                <div className="mcp-picker-card-head">
                  <span className="mcp-picker-label">{form.label || 'Új MCP'}</span>
                  <span
                    className="mcp-picker-chip"
                    style={{
                      background: form.color ? `${form.color}22` : 'rgba(255,255,255,0.08)',
                      color: form.color || 'var(--text-dim)',
                    }}
                  >
                    {form.shortLabel || createMcpId(form.label) || 'azonosító'}
                  </span>
                </div>
                <div className="mcp-picker-description">
                  {form.description || 'Itt fog megjelenni a rövid leírás a kiválasztásnál.'}
                </div>
              </div>
            </div>

            <div className="mcp-form-actions">
              {(editingId || form.label || form.id || form.description || form.instruction) && (
                <button type="button" className="btn-secondary" onClick={resetForm} disabled={isBusy}>
                  Űrlap törlése
                </button>
              )}
              <button type="button" className="btn-primary" onClick={handleUpsert} disabled={isBusy}>
                {editingId ? 'MCP frissítése' : 'MCP hozzáadása'}
              </button>
            </div>
          </div>
        </div>

        <div className="edit-form-footer">
          <button onClick={onClose} className="btn-secondary" disabled={isBusy}>Mégse</button>
          <button onClick={handleSaveAll} className="btn-primary" disabled={!hasChanges || isBusy}>
            {pendingAction === 'save-all' ? 'Mentés...' : 'Mentés'}
          </button>
        </div>
      </div>
    </div>
  )
}
