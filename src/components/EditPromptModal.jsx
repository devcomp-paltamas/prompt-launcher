import { useState, useEffect } from 'react'

const TOOL_OPTIONS = [
  { id: 'adt', label: 'ADT' },
  { id: 'docs', label: 'Docs' },
]

export default function EditPromptModal({ prompt, categories = [], onSave, onClose }) {
  const [form, setForm] = useState({
    title: '',
    sub: '',
    desc: '',
    icon: '📝',
    cat: 'code',
    tools: [],
    vars: '',
    prompt: '',
  })

  useEffect(() => {
    if (prompt) {
      setForm({
        title: prompt.title || '',
        sub: prompt.sub || '',
        desc: prompt.desc || '',
        icon: prompt.icon || '📝',
        cat: prompt.cat || 'code',
        tools: prompt.tools || [],
        vars: (prompt.vars || []).join(', '),
        prompt: prompt.prompt || '',
      })
    }
  }, [prompt])

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const toggleTool = toolId => {
    setForm(prev => ({
      ...prev,
      tools: prev.tools.includes(toolId)
        ? prev.tools.filter(t => t !== toolId)
        : [...prev.tools, toolId]
    }))
  }

  const handleSubmit = e => {
    e.preventDefault()
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
      tools: form.tools,
      vars: varsArray,
      prompt: form.prompt,
    }
    onSave(newPrompt)
  }

  const filteredCategories = categories.filter(c => c.id !== 'all')

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box edit-modal" onClick={e => e.stopPropagation()}>

        <div className="edit-modal-header">
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {prompt ? 'Jegyzet szerkesztése' : 'Új jegyzet létrehozása'}
          </div>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="edit-form-body">

            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label className="form-label">Cím</label>
                <input
                  className="form-input"
                  value={form.title}
                  onChange={e => handleChange('title', e.target.value)}
                  placeholder="Pl. Osztály áttekintése"
                  required
                />
              </div>
              <div style={{ width: 80 }}>
                <label className="form-label">Ikon</label>
                <input
                  className="form-input"
                  value={form.icon}
                  onChange={e => handleChange('icon', e.target.value)}
                  placeholder="📝"
                  style={{ textAlign: 'center' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Alcím</label>
              <input
                className="form-input"
                value={form.sub}
                onChange={e => handleChange('sub', e.target.value)}
                placeholder="Rövid leírás"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Leírás</label>
              <textarea
                className="form-input"
                value={form.desc}
                onChange={e => handleChange('desc', e.target.value)}
                placeholder="Mit csinál ez a prompt?"
                rows={2}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Kategória</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {filteredCategories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleChange('cat', cat.id)}
                    className={`cat-btn${form.cat === cat.id ? ' active' : ''}`}
                    style={form.cat === cat.id ? { background: cat.color, borderColor: cat.color } : {}}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Eszközök</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {TOOL_OPTIONS.map(tool => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => toggleTool(tool.id)}
                    className={`tool-btn${form.tools.includes(tool.id) ? ' active' : ''}`}
                  >
                    {tool.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Változók (vesszővel elválasztva)</label>
              <input
                className="form-input"
                value={form.vars}
                onChange={e => handleChange('vars', e.target.value)}
                placeholder="OSZTÁLYNÉV, METÓDUSNÉV"
              />
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
                Használd [VÁLTOZÓNÉV] formátumban a promptban
              </div>
            </div>

            <div style={{ marginBottom: 8 }}>
              <label className="form-label">Prompt szöveg</label>
              <textarea
                className="form-input prompt-textarea"
                value={form.prompt}
                onChange={e => handleChange('prompt', e.target.value)}
                placeholder="A teljes prompt szövege..."
                rows={8}
                required
              />
            </div>
          </div>

          <div className="edit-form-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Mégse</button>
            <button type="submit" className="btn-primary" style={{ background: 'var(--sap-blue)' }}>
              {prompt ? '💾 Mentés' : '➕ Létrehozás'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}