import { useState, useEffect, useCallback } from 'react'

export default function PromptModal({ prompt, onClose }) {
  const [varValues, setVarValues] = useState({})
  const [copied, setCopied]       = useState(false)

  useEffect(() => {
    if (!prompt) return
    const init = {}
    prompt.vars.forEach(v => (init[v] = ''))
    setVarValues(init)
    setCopied(false)
  }, [prompt])

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const getFilledPrompt = useCallback(() => {
    if (!prompt) return ''
    let text = prompt.prompt
    Object.entries(varValues).forEach(([k, v]) => {
      text = text.split(`[${k}]`).join(v.trim() || `[${k}]`)
    })
    return text
  }, [prompt, varValues])

  const renderPreview = () => {
    if (!prompt) return ''
    let text = prompt.prompt
    Object.entries(varValues).forEach(([k, v]) => {
      if (v.trim()) {
        text = text.split(`[${k}]`).join(
          `<span style="color:#fbbf24;font-weight:700">${v.trim()}</span>`
        )
      }
    })
    return text
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getFilledPrompt())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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

          {/* Preview */}
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8, fontWeight: 600 }}>
            ELŐNÉZET
          </div>
          <div
            className="prompt-preview"
            dangerouslySetInnerHTML={{ __html: renderPreview() }}
          />
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border)',
          display: 'flex', gap: 10, justifyContent: 'flex-end',
        }}>
          <button onClick={onClose} className="btn-secondary">Mégse</button>
          <button
            onClick={handleCopy}
            className="btn-primary"
            style={{ background: copied ? 'var(--sap-green)' : 'var(--sap-blue)' }}
          >
            {copied ? '✅ Másolva!' : '📋 Másolás vágólapra'}
          </button>
        </div>
      </div>
    </div>
  )
}
