import { useState, useEffect } from 'react'
import { buildFinalPrompt, getDefaultPromptMcpId, getMcpDefinition, getPromptMcpIds, normalizePrompt } from '../lib/promptMcp.js'
import useAsyncAction from '../hooks/useAsyncAction.js'

const TRANSLATION_TARGET_LANGUAGE = 'en'
const FALLBACK_SOURCE_LANGUAGE = 'hu'

async function detectSourceLanguage(text) {
  if (!('LanguageDetector' in window)) {
    return FALLBACK_SOURCE_LANGUAGE
  }

  let detector

  try {
    const availability = await window.LanguageDetector.availability({
      expectedInputLanguages: [FALLBACK_SOURCE_LANGUAGE, TRANSLATION_TARGET_LANGUAGE],
    })

    if (availability === 'unavailable') {
      return FALLBACK_SOURCE_LANGUAGE
    }

    detector = await window.LanguageDetector.create({
      expectedInputLanguages: [FALLBACK_SOURCE_LANGUAGE, TRANSLATION_TARGET_LANGUAGE],
    })

    const results = await detector.detect(text)
    return results?.[0]?.detectedLanguage || FALLBACK_SOURCE_LANGUAGE
  } catch {
    return FALLBACK_SOURCE_LANGUAGE
  } finally {
    detector?.destroy?.()
  }
}

async function translatePromptToEnglish(text) {
  if (!('Translator' in window)) {
    throw new Error('Az angol fordítás ebben a böngészőben nem támogatott.')
  }

  let sourceLanguage = await detectSourceLanguage(text)
  if (sourceLanguage === 'und') {
    sourceLanguage = FALLBACK_SOURCE_LANGUAGE
  }

  if (sourceLanguage.startsWith(TRANSLATION_TARGET_LANGUAGE)) {
    return text
  }

  const availability = await window.Translator.availability({
    sourceLanguage,
    targetLanguage: TRANSLATION_TARGET_LANGUAGE,
  })

  if (availability === 'unavailable') {
    throw new Error('A böngésző nem tud angol fordítást készíteni ehhez a szöveghez.')
  }

  let translator

  try {
    translator = await window.Translator.create({
      sourceLanguage,
      targetLanguage: TRANSLATION_TARGET_LANGUAGE,
    })

    return await translator.translate(text)
  } catch {
    if (sourceLanguage !== FALLBACK_SOURCE_LANGUAGE) {
      translator?.destroy?.()
      translator = await window.Translator.create({
        sourceLanguage: FALLBACK_SOURCE_LANGUAGE,
        targetLanguage: TRANSLATION_TARGET_LANGUAGE,
      })
      return await translator.translate(text)
    }

    throw new Error('Az angol fordítás nem sikerült.')
  } finally {
    translator?.destroy?.()
  }
}

export default function PromptModal({ prompt, systemPrompt = '', mcpOptions = [], onClose, onSave, onIncrementUseCount }) {
  const [varValues, setVarValues] = useState({})
  const [editedPrompt, setEditedPrompt] = useState('')
  const [selectedMcpId, setSelectedMcpId] = useState('')
  const [translateToEnglish, setTranslateToEnglish] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')
  const { pendingAction, isBusy, runAction } = useAsyncAction()
  const effectivePrompt = prompt ? normalizePrompt(prompt, mcpOptions) : null
  const promptIdentity = effectivePrompt?.id || prompt?.id || ''
  const availableMcps = getPromptMcpIds(effectivePrompt, mcpOptions)
  const finalPrompt = buildFinalPrompt({
    promptBody: editedPrompt,
    mcpId: selectedMcpId,
    registry: mcpOptions,
    systemPrompt,
  })

  useEffect(() => {
    if (!effectivePrompt) return
    const init = {}
    effectivePrompt.vars.forEach(v => (init[v] = ''))
    setVarValues(init)
    setEditedPrompt(effectivePrompt.prompt)
    setSelectedMcpId(getDefaultPromptMcpId(effectivePrompt, mcpOptions))
    setCopied(false)
    setCopyError('')
  }, [promptIdentity])

  useEffect(() => {
    const handler = e => {
      if (isBusy) return
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isBusy, onClose])

  // Update edited prompt when variables change
  useEffect(() => {
    if (!effectivePrompt) return
    let text = effectivePrompt.prompt
    Object.entries(varValues).forEach(([k, v]) => {
      text = text.split(`[${k}]`).join(v.trim() || `[${k}]`)
    })
    setEditedPrompt(text)
  }, [prompt, varValues])

  const handleCopy = async () => {
    if (isBusy) return
    setCopyError('')

    await runAction('copy-prompt', async () => {
      try {
        const textToCopy = translateToEnglish
          ? await translatePromptToEnglish(finalPrompt)
          : finalPrompt

        await navigator.clipboard.writeText(textToCopy)

        if (onIncrementUseCount && prompt?.id) {
          await onIncrementUseCount(prompt.id)
        }

        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Translation failed:', error)
        setCopyError(error.message || 'Az angol fordítás nem sikerült.')
      }
    })
  }

  const handleSave = async () => {
    if (!onSave) return
    if (isBusy) return
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
      vars: foundVars,
      mcps: availableMcps,
      defaultMcpId: selectedMcpId || getDefaultPromptMcpId(effectivePrompt, mcpOptions),
    }

    const result = await runAction('save-prompt', async () => onSave(updatedPrompt))
    if (result !== false) {
      onClose()
    }
  }

  const hasChanges = editedPrompt !== effectivePrompt?.prompt
    || selectedMcpId !== getDefaultPromptMcpId(effectivePrompt, mcpOptions)

  if (!effectivePrompt) return null

  return (
    <div className="modal-backdrop" onClick={isBusy ? undefined : onClose}>
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
          <button onClick={onClose} className="modal-close" disabled={isBusy}>×</button>
        </div>

        {/* Body */}
        <div className="modal-body">

          {/* Variables */}
          {effectivePrompt.vars.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 12, fontWeight: 700, color: 'var(--text-dim)',
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10,
              }}>
                Változók kitöltése
              </div>
              {effectivePrompt.vars.map(v => (
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
                    disabled={isBusy}
                  />
                </div>
              ))}
            </div>
          )}

          {availableMcps.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 12, fontWeight: 700, color: 'var(--text-dim)',
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10,
              }}>
                MCP kiválasztása
              </div>
              <div className="mcp-select-list">
                {availableMcps.map(mcpId => {
                  const mcp = getMcpDefinition(mcpId, mcpOptions)
                  if (!mcp) return null

                  return (
                    <div
                      key={mcp.id}
                      className="mcp-select-item"
                      style={{
                        '--mcp-bg': mcp.background,
                        '--mcp-color': mcp.color,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedMcpId(mcp.id)}
                        className={`mcp-select-pill${selectedMcpId === mcp.id ? ' active' : ''}`}
                        aria-label={`${mcp.label}${mcp.description ? ` - ${mcp.description}` : ''}`}
                        disabled={isBusy}
                      >
                        <span className="mcp-select-pill-label">
                          {mcp.shortLabel}
                        </span>
                      </button>
                      <div className="mcp-select-hint" role="tooltip">
                        <div className="mcp-select-hint-title">{mcp.label}</div>
                        {mcp.description && (
                          <div className="mcp-select-hint-text">{mcp.description}</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {systemPrompt.trim() && (
            <div className="system-prompt-notice">
              Saját system prompt aktív. Másoláskor a prompt elejére kerül, még a fordítás előtt.
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
                if (isBusy) return
                let text = effectivePrompt.prompt
                Object.entries(varValues).forEach(([k, v]) => {
                  text = text.split(`[${k}]`).join(v.trim() || `[${k}]`)
                })
                setEditedPrompt(text)
              }}
              title="Eredeti visszaállítása"
              disabled={isBusy}
            >
              ↺ Visszaállítás
            </button>
          </div>
          <textarea
            className="prompt-preview editable"
            value={editedPrompt}
            onChange={e => setEditedPrompt(e.target.value)}
            disabled={isBusy}
          />
          {copyError && (
            <div className="modal-inline-error">{copyError}</div>
          )}

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
              disabled={isBusy}
            />
            <span className="checkbox-icon">🌐</span>
            <span>Fordítás angolra</span>
          </label>

          <div style={{ flex: 1 }} />

          <button onClick={onClose} className="btn-secondary" disabled={isBusy}>Mégse</button>
          {onSave && (
            <button
              onClick={handleSave}
              className="btn-primary"
              style={{ background: hasChanges ? 'var(--sap-gold)' : '#4b5563' }}
              disabled={!hasChanges || isBusy}
              title={hasChanges ? 'Módosítások mentése' : 'Nincs változás'}
            >
              {pendingAction === 'save-prompt' ? '⏳ Mentés...' : '💾 Mentés'}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="btn-primary"
            style={{ background: copied ? 'var(--sap-green)' : 'var(--sap-blue)' }}
            disabled={isBusy}
          >
            {pendingAction === 'copy-prompt'
              ? (translateToEnglish ? '⏳ Fordítás...' : '⏳ Másolás...')
              : copied
                ? '✅ Másolva!'
                : '📋 Másolás vágólapra'}
          </button>
        </div>
      </div>
    </div>
  )
}
