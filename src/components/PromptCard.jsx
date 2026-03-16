import ToolTag from './ToolTag.jsx'

// Generate background color from category
const getCatBg = (cat) => {
  const colors = {
    review: 'rgba(29,78,216,0.25)',
    code: 'rgba(6,95,70,0.25)',
    test: 'rgba(124,58,237,0.25)',
    debug: 'rgba(185,28,28,0.25)',
    workflow: 'rgba(146,64,14,0.25)',
    transport: 'rgba(8,145,178,0.25)',
    general: 'rgba(107,114,128,0.25)',
  }
  return colors[cat] || 'rgba(100,100,100,0.25)'
}

export default function PromptCard({ prompt, onOpen, onQuickCopy, copiedId, onEdit, onDelete, onToggleFavorite, isCustom }) {
  const isCopied = copiedId === prompt.id

  const handleEdit = (e) => {
    e.stopPropagation()
    onEdit?.(prompt)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (window.confirm(`Törlöd a "${prompt.title}" promptot?`)) {
      onDelete?.(prompt.id)
    }
  }

  const handleFavorite = (e) => {
    e.stopPropagation()
    onToggleFavorite?.(prompt.id)
  }

  return (
    <div
      onClick={() => onOpen(prompt)}
      className={`prompt-card${prompt.favorite ? ' is-favorite' : ''}`}
    >
      <div style={{ padding: '16px 18px 12px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, background: getCatBg(prompt.cat),
        }}>
          {prompt.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{prompt.title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 3 }}>{prompt.sub}</div>
        </div>
        <div className="card-actions">
          <button
            onClick={handleFavorite}
            title={prompt.favorite ? 'Eltávolítás a kedvencekből' : 'Hozzáadás a kedvencekhez'}
            className={`card-action-btn favorite-btn${prompt.favorite ? ' active' : ''}`}
          >
            {prompt.favorite ? '⭐' : '☆'}
          </button>
          {isCustom && (
            <>
              <button onClick={handleEdit} title="Szerkesztés" className="card-action-btn">
                ✏️
              </button>
              <button onClick={handleDelete} title="Törlés" className="card-action-btn">
                🗑️
              </button>
            </>
          )}
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
