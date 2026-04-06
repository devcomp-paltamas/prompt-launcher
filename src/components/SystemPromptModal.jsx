import { useEffect, useState } from 'react'
import useAsyncAction from '../hooks/useAsyncAction.js'

export default function SystemPromptModal({ value = '', onClose, onSave }) {
  const [draft, setDraft] = useState(value)
  const { pendingAction, isBusy, runAction } = useAsyncAction()

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    const handler = event => {
      if (isBusy) return
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isBusy, onClose])

  const handleSave = async () => {
    const result = await runAction('save-system-prompt', async () => onSave(draft))
    if (result !== false) {
      onClose()
    }
  }

  return (
    <div className="modal-backdrop" onClick={isBusy ? undefined : onClose}>
      <div className="modal-box system-prompt-modal" onClick={event => event.stopPropagation()}>
        <div className="edit-modal-header">
          <div>
            <div className="system-prompt-title">Saját system prompt</div>
            <div className="system-prompt-subtitle">
              Ez a szöveg a végleges prompt elejére kerül, még az angol fordítás előtt.
            </div>
          </div>
          <button onClick={onClose} className="modal-close" disabled={isBusy}>×</button>
        </div>

        <div className="edit-form-body">
          <label className="form-label">System prompt</label>
          <textarea
            className="form-input prompt-textarea system-prompt-textarea"
            value={draft}
            onChange={event => setDraft(event.target.value)}
            placeholder="Pl. Mindig rövid, strukturált, technikai választ adj..."
            disabled={isBusy}
          />
          <div className="system-prompt-help">
            Másoláskor sorrend:
            <strong> saját system prompt </strong>
            →
            <strong> MCP instrukció </strong>
            →
            <strong> prompt szöveg</strong>
          </div>
        </div>

        <div className="edit-form-footer">
          <button className="btn-secondary" onClick={onClose} disabled={isBusy}>Mégse</button>
          <button className="btn-secondary" onClick={() => setDraft('')} disabled={isBusy}>Törlés</button>
          <button className="btn-primary" onClick={handleSave} disabled={isBusy}>
            {pendingAction === 'save-system-prompt' ? 'Mentés...' : 'Mentés'}
          </button>
        </div>
      </div>
    </div>
  )
}
