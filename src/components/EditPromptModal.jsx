import { useState, useEffect, useRef } from 'react'
import IconPicker from './IconPicker.jsx'
import { normalizePrompt } from '../lib/promptMcp.js'
import useAsyncAction from '../hooks/useAsyncAction.js'

const EMPTY_FORM = {
  title: '',
  sub: '',
  desc: '',
  icon: '📝',
  cat: 'code',
  mcps: [],
  defaultMcpId: '',
  vars: '',
  tags: [],
  prompt: '',
}

export default function EditPromptModal({ prompt, categories = [], allTags = [], mcpOptions = [], onSave, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [tagInput, setTagInput] = useState('')
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const tagInputRef = useRef(null)
  const { pendingAction, isBusy, runAction } = useAsyncAction()

  useEffect(() => {
    if (prompt) {
      const normalizedPrompt = normalizePrompt(prompt, mcpOptions)
      setForm({
        title: normalizedPrompt.title || '',
        sub: normalizedPrompt.sub || '',
        desc: normalizedPrompt.desc || '',
        icon: normalizedPrompt.icon || '📝',
        cat: normalizedPrompt.cat || 'code',
        mcps: normalizedPrompt.mcps || [],
        defaultMcpId: normalizedPrompt.defaultMcpId || '',
        vars: (normalizedPrompt.vars || []).join(', '),
        tags: normalizedPrompt.tags || [],
        prompt: normalizedPrompt.prompt || '',
      })
      return
    }

    setForm(EMPTY_FORM)
  }, [prompt, mcpOptions])

  useEffect(() => {
    const handler = e => {
      if (isBusy) return
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isBusy, onClose])

  const handleChange = (field, value) => {
    if (isBusy) return
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const toggleMcp = mcpId => {
    if (isBusy) return
    setForm(prev => ({
      ...prev,
      ...(() => {
        const mcps = prev.mcps.includes(mcpId)
          ? prev.mcps.filter(id => id !== mcpId)
          : [...prev.mcps, mcpId]

        const defaultMcpId = mcps.includes(prev.defaultMcpId)
          ? prev.defaultMcpId
          : mcps[0] || ''

        return { mcps, defaultMcpId }
      })()
    }))
  }

  // Tag handling
  const addTag = (tag) => {
    if (isBusy) return
    const trimmedTag = tag.trim().toLowerCase()
    if (trimmedTag && !form.tags.includes(trimmedTag)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, trimmedTag] }))
    }
    setTagInput('')
    setShowTagSuggestions(false)
  }

  const removeTag = (tagToRemove) => {
    if (isBusy) return
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }))
  }

  const handleTagInputKeyDown = (e) => {
    if (isBusy) return
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (tagInput.trim()) {
        addTag(tagInput)
      }
    } else if (e.key === 'Backspace' && !tagInput && form.tags.length > 0) {
      removeTag(form.tags[form.tags.length - 1])
    }
  }

  // Filter suggestions based on input
  const tagSuggestions = allTags
    .filter(tag =>
      tag.toLowerCase().includes(tagInput.toLowerCase()) &&
      !form.tags.includes(tag.toLowerCase())
    )
    .slice(0, 5)

  const handleSubmit = async e => {
    e.preventDefault()
    if (isBusy) return
    const varsArray = form.vars
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0)

    const newPrompt = {
      id: prompt?.id || `custom-${Date.now()}`,
      title: form.title,
      sub: form.sub,
      desc: form.desc,
      icon: form.icon,
      cat: form.cat,
      mcps: form.mcps,
      defaultMcpId: form.defaultMcpId || form.mcps[0] || '',
      vars: varsArray,
      tags: form.tags,
      prompt: form.prompt,
    }

    const result = await runAction(prompt ? 'save-prompt' : 'create-prompt', async () => onSave(newPrompt))
    if (result !== false) {
      onClose()
    }
  }

  const filteredCategories = categories.filter(c => c.id !== 'all')

  return (
    <div className="modal-backdrop" onClick={isBusy ? undefined : onClose}>
      <div className="modal-box edit-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="edit-modal-header">
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#131e29' }}>
            {prompt ? 'Prompt szerkesztése' : 'Új prompt létrehozása'}
          </div>
          <button onClick={onClose} className="modal-close" disabled={isBusy}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="edit-form-body">
            {/* Icon + Title */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label">Ikon</label>
                <IconPicker
                  value={form.icon}
                  onChange={icon => handleChange('icon', icon)}
                  disabled={isBusy}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label">Cím *</label>
                <input
                  className="form-input"
                  value={form.title}
                  onChange={e => handleChange('title', e.target.value)}
                  placeholder="Pl. Osztály áttekintése"
                  required
                  disabled={isBusy}
                />
              </div>
            </div>

            {/* Subtitle */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Alcím</label>
              <input
                className="form-input"
                value={form.sub}
                onChange={e => handleChange('sub', e.target.value)}
                placeholder="Rövid leírás"
                disabled={isBusy}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Leírás</label>
              <textarea
                className="form-input"
                value={form.desc}
                onChange={e => handleChange('desc', e.target.value)}
                placeholder="Mit csinál ez a prompt?"
                rows={2}
                disabled={isBusy}
              />
            </div>

            {/* Category */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Kategória</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {filteredCategories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleChange('cat', cat.id)}
                    className={`cat-btn${form.cat === cat.id ? ' active' : ''}`}
                    style={form.cat === cat.id ? { background: cat.color, borderColor: cat.color } : {}}
                    disabled={isBusy}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* MCPs */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Elérhető MCP-k</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {mcpOptions.map(mcp => (
                  <button
                    key={mcp.id}
                    type="button"
                    onClick={() => toggleMcp(mcp.id)}
                    className={`tool-btn${form.mcps.includes(mcp.id) ? ' active' : ''}`}
                    disabled={isBusy}
                  >
                    {mcp.label}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#556b82', marginTop: '0.4rem' }}>
                A modalban ezek közül lehet majd választani.
              </div>
            </div>

            {form.mcps.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Alapértelmezett MCP</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {form.mcps.map(mcpId => {
                    const mcp = mcpOptions.find(option => option.id === mcpId)
                    if (!mcp) return null

                    return (
                      <button
                        key={mcp.id}
                        type="button"
                        onClick={() => handleChange('defaultMcpId', mcp.id)}
                        className={`tool-btn${form.defaultMcpId === mcp.id ? ' active' : ''}`}
                        disabled={isBusy}
                      >
                        {mcp.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Variables */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Változók (vesszővel elválasztva)</label>
              <input
                className="form-input"
                value={form.vars}
                onChange={e => handleChange('vars', e.target.value)}
                placeholder="OSZTÁLYNÉV, METÓDUSNÉV"
                disabled={isBusy}
              />
              <div style={{ fontSize: '0.75rem', color: '#556b82', marginTop: '0.25rem' }}>
                Használd [VÁLTOZÓNÉV] formátumban a promptban
              </div>
            </div>

            {/* Tags */}
            <div style={{ marginBottom: '1rem', position: 'relative' }}>
              <label className="form-label">Címkék</label>
              <div className="tag-input-container">
                {form.tags.map(tag => (
                  <span key={tag} className="tag-chip editable">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="tag-chip-remove-btn"
                      disabled={isBusy}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  ref={tagInputRef}
                  type="text"
                  className="tag-input"
                  value={tagInput}
                  onChange={e => {
                    setTagInput(e.target.value)
                    setShowTagSuggestions(e.target.value.length > 0)
                  }}
                  onKeyDown={handleTagInputKeyDown}
                  onFocus={() => setShowTagSuggestions(tagInput.length > 0 || allTags.length > 0)}
                  onBlur={() => setTimeout(() => setShowTagSuggestions(false), 150)}
                  placeholder={form.tags.length === 0 ? 'Adj hozzá címkéket...' : ''}
                  disabled={isBusy}
                />
              </div>
              {showTagSuggestions && (tagSuggestions.length > 0 || tagInput) && (
                <div className="tag-suggestions">
                  {tagInput && !allTags.includes(tagInput.toLowerCase()) && (
                    <div
                      className="tag-suggestion-item new"
                      onMouseDown={() => addTag(tagInput)}
                    >
                      <span className="tag-suggestion-new">+</span>
                      Új címke: "{tagInput}"
                    </div>
                  )}
                  {tagSuggestions.map(tag => (
                    <div
                      key={tag}
                      className="tag-suggestion-item"
                      onMouseDown={() => addTag(tag)}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ fontSize: '0.75rem', color: '#556b82', marginTop: '0.25rem' }}>
                Enter vagy vessző a hozzáadáshoz
              </div>
            </div>

            {/* Prompt text */}
            <div>
              <label className="form-label">Prompt szöveg *</label>
              <textarea
                className="form-input prompt-textarea"
                value={form.prompt}
                onChange={e => handleChange('prompt', e.target.value)}
                placeholder="A teljes prompt szövege..."
                rows={8}
                required
                disabled={isBusy}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="edit-form-footer">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isBusy}>Mégse</button>
            <button type="submit" className="btn-primary" disabled={isBusy}>
              {pendingAction === 'save-prompt'
                ? 'Mentés...'
                : pendingAction === 'create-prompt'
                  ? 'Létrehozás...'
                  : prompt
                    ? 'Mentés'
                    : 'Létrehozás'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
