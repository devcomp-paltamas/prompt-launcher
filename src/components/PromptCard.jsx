import ToolTag from './ToolTag.jsx'
import { getPromptMcpIds } from '../lib/promptMcp.js'
import useAsyncAction from '../hooks/useAsyncAction.js'

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

export default function PromptCard({ prompt, onOpen, onDuplicate, onEdit, onDelete, onToggleFavorite, isCustom, mcpOptions = [] }) {
  const promptMcps = getPromptMcpIds(prompt, mcpOptions)
  const { pendingAction, isBusy, isPending, runAction } = useAsyncAction()

  const handleEdit = (e) => {
    e.stopPropagation()
    if (isBusy) return
    onEdit?.(prompt)
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (isBusy) return
    if (window.confirm(`Törlöd a "${prompt.title}" promptot?`)) {
      await runAction('delete-prompt', async () => onDelete?.(prompt.id))
    }
  }

  const handleFavorite = async (e) => {
    e.stopPropagation()
    if (isBusy) return
    await runAction('toggle-favorite', async () => onToggleFavorite?.(prompt.id))
  }

  return (
    <div
      onClick={() => {
        if (!isBusy) {
          onOpen(prompt)
        }
      }}
      className={`prompt-card${prompt.favorite ? ' is-favorite' : ''}${isBusy ? ' is-busy' : ''}`}
    >
      <div className="prompt-card-head">
        <div
          className="prompt-card-icon"
          style={{ background: getCatBg(prompt.cat) }}
        >
          {prompt.icon}
        </div>
        <div className="prompt-card-title-wrap">
          <div className="prompt-card-title">{prompt.title}</div>
          <div className="prompt-card-sub">{prompt.sub}</div>
        </div>
        <div className="card-actions">
          <button
            onClick={handleFavorite}
            title={prompt.favorite ? 'Eltávolítás a kedvencekből' : 'Hozzáadás a kedvencekhez'}
            className={`card-action-btn favorite-btn${prompt.favorite ? ' active' : ''}`}
            disabled={isBusy}
          >
            {isPending('toggle-favorite') ? '⏳' : prompt.favorite ? '⭐' : '☆'}
          </button>
          {isCustom && (
            <>
              <button onClick={handleEdit} title="Szerkesztés" className="card-action-btn" disabled={isBusy}>
                ✏️
              </button>
              <button onClick={handleDelete} title="Törlés" className="card-action-btn" disabled={isBusy}>
                {isPending('delete-prompt') ? '⏳' : '🗑️'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="prompt-card-desc">
        {prompt.desc}
      </div>

      {/* Collection badge (shown in "all collections" view) */}
      {prompt._collectionName && (
        <div className="card-collection-badge">
          <span>{prompt._collectionIcon}</span>
          <span>{prompt._collectionName}</span>
        </div>
      )}

      {/* Tags */}
      {prompt.tags && prompt.tags.length > 0 && (
        <div className="card-tags">
          {prompt.tags.slice(0, 3).map(tag => (
            <span key={tag} className="card-tag">{tag}</span>
          ))}
          {prompt.tags.length > 3 && (
            <span className="card-tag card-tag-more">+{prompt.tags.length - 3}</span>
          )}
        </div>
      )}

      <div className="prompt-card-footer">
        <div className="prompt-card-tools">
          {promptMcps.map(mcpId => <ToolTag key={mcpId} tool={mcpId} mcpOptions={mcpOptions} />)}
        </div>
        <button
          onClick={e => {
            e.stopPropagation()
            if (isBusy) return
            onDuplicate(prompt)
          }}
          className="copy-btn"
          title="Prompt duplikálása"
          disabled={isBusy}
        >
          {pendingAction === 'delete-prompt' ? 'Folyamatban...' : '📋 Duplikálás'}
        </button>
      </div>
    </div>
  )
}
