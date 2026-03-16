import { useState, useEffect, useCallback } from 'react'

const TRANSLATE_PROMPT = `Translate the following prompt to English. Keep the same structure, formatting, and any [VARIABLE] placeholders exactly as they are. Only translate the text content:\n\n`

export default function PromptModal({ prompt, onClose, onSave }) {
  const [varValues, setVarValues] = useState({})
  const [editedPrompt, setEditedPrompt] = useState('')
  const [translateToEnglish, setTranslateToEnglish] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)

  useEffect(() => {
    if (!prompt) return
    const init = {}
    prompt.vars.forEach(v => (init[v] = ''))
    setVarValues(init)
    setEditedPrompt(prompt.prompt)
    setCopied(false)
  }, [prompt])

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Update edited prompt when variables change
  useEffect(() => {
    if (!prompt) return
    let text = prompt.prompt
    Object.entries(varValues).forEach(([k, v]) => {
      text = text.split(`[${k}]`).join(v.trim() || `[${k}]`)
    })
    setEditedPrompt(text)
  }, [prompt, varValues])

  const handleCopy = async () => {
    let textToCopy = editedPrompt

    if (translateToEnglish) {
      setIsTranslating(true)
      // Add translation instruction as prefix
      textToCopy = TRANSLATE_PROMPT + editedPrompt
      setIsTranslating(false)
    }

    await navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    if (!onSave) return
    // Extract variables from the edited prompt
    const varRegex = /\[([A-Z_]+)\]/g
    const foundVars = []
    let match
    while ((match = varRegex.exec(editedPrompt)) !== null) {
      if (!foundVars.includes(match[1])) {
        foundVars.push(match[1])
      }
    }

    const updatedPrompt = {
      ...prompt,
      prompt: editedPrompt,
      vars: foundVars
    }

    onSave(updatedPrompt)
    onClose()
  }

  const hasChanges = editedPrompt !== prompt?.prompt

  if (!prompt) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{prompt.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 3 }}>{prompt.sub}</div>
          </div>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>

          {/* Variables */}
          {prompt.vars.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 12, fontWeight: 700, color: 'var(--text-dim)',
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10,
              }}>
                Változók kitöltése
              </div>
              {prompt.vars.map(v => (
                <div key={v} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <span style={{
                    fontSize: 12, color: '#93c5fd', fontWeight: 600,
                    fontFamily: 'monospace', minWidth: 140, flexShrink: 0,
                  }}>
                    [{v}]
                  </span>
                  <input
                    className="var-input"
                    value={varValues[v] || ''}
                    onChange={e => setVarValues(prev => ({ ...prev, [v]: e.target.value }))}
                    placeholder={v}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Editable Preview */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 600 }}>
              ELŐNÉZET (SZERKESZTHETŐ)
            </div>
            <button
              className="btn-reset-preview"
              onClick={() => {
                let text = prompt.prompt
                Object.entries(varValues).forEach(([k, v]) => {
                  text = text.split(`[${k}]`).join(v.trim() || `[${k}]`)
                })
                setEditedPrompt(text)
              }}
              title="Eredeti visszaállítása"
            >
              ↺ Visszaállítás
            </button>
          </div>
          <textarea
            className="prompt-preview editable"
            value={editedPrompt}
            onChange={e => setEditedPrompt(e.target.value)}
            rows={12}
          />
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          {/* Translate checkbox */}
          <label className="translate-checkbox">
            <input
              type="checkbox"
              checked={translateToEnglish}
              onChange={e => setTranslateToEnglish(e.target.checked)}
            />
            <span className="checkbox-icon">🌐</span>
            <span>Fordítás angolra</span>
          </label>

          <div style={{ flex: 1 }} />

          <button onClick={onClose} className="btn-secondary">Mégse</button>
          {onSave && (
            <button
              onClick={handleSave}
              className="btn-primary"
              style={{ background: hasChanges ? 'var(--sap-gold)' : '#4b5563' }}
              disabled={!hasChanges}
              title={hasChanges ? 'Módosítások mentése' : 'Nincs változás'}
            >
              💾 Mentés
            </button>
          )}
          <button
            onClick={handleCopy}
            className="btn-primary"
            style={{ background: copied ? 'var(--sap-green)' : 'var(--sap-blue)' }}
            disabled={isTranslating}
          >
            {isTranslating ? '⏳ Fordítás...' : copied ? '✅ Másolva!' : '📋 Másolás vágólapra'}
          </button>
        </div>
      </div>
    </div>
  )
}
