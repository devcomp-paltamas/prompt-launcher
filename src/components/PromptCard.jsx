import ToolTag from './ToolTag.jsx'

export default function PromptCard({ prompt, catIconBg = {}, onOpen, onQuickCopy, onEdit, onDelete, copiedId }) {
  const isCopied = copiedId === prompt.id

  return (
    <div
      onClick={() => onOpen(prompt)}
      className="prompt-card"
    >
      <div style={{ padding: '16px 18px 12px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, background: catIconBg[prompt.cat] || 'rgba(99,102,241,0.25)',
        }}>
          {prompt.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{prompt.title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 3 }}>{prompt.sub}</div>
        </div>
        <div className="card-actions">
          <button
            onClick={e => { e.stopPropagation(); onEdit(prompt) }}
            className="card-action-btn"
            title="Szerkesztés"
          >
            ✏️
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(prompt.id) }}
            className="card-action-btn delete"
            title="Törlés"
          >
            🗑️
          </button>
        </div>
      </div>

      <div style={{ padding: '0 18px 14px', fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6, flex: 1 }}>
        {prompt.desc}
      </div>

      <div style={{
        padding: '10px 18px',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {prompt.tools.map(t => <ToolTag key={t} tool={t} />)}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onQuickCopy(prompt) }}
          className={`copy-btn${isCopied ? ' copied' : ''}`}
        >
          {isCopied ? '✅ Másolva' : 'Másolás'}
        </button>
      </div>
    </div>
  )
}
