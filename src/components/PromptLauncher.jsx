import { useState } from 'react'
import { PROMPTS, CATEGORIES } from '../data/prompts.js'
import PromptCard  from './PromptCard.jsx'
import PromptModal from './PromptModal.jsx'

export default function PromptLauncher() {
  const [activeCat,      setActiveCat]      = useState('all')
  const [selectedPrompt, setSelectedPrompt] = useState(null)
  const [copiedId,       setCopiedId]       = useState(null)

  const filtered = activeCat === 'all'
    ? PROMPTS
    : PROMPTS.filter(p => p.cat === activeCat)

  const handleQuickCopy = async prompt => {
    await navigator.clipboard.writeText(prompt.prompt)
    setCopiedId(prompt.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Header */}
      <header>
        <div className="logo">🔧</div>
        <div>
          <h1>SAP ABAP MCP – Prompt Launcher</h1>
          <p>Claude AI + mcp-abap-adt + mcp-sap-docs integrációhoz</p>
        </div>
        <div className="badge">v2.0 · React + Vite</div>
      </header>

      {/* Main */}
      <div className="container">

        {/* Category tabs */}
        <div className="tabs">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`tab${activeCat === cat.id ? ' active' : ''}`}
              style={activeCat === cat.id ? { background: cat.color } : {}}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid">
          {filtered.map(p => (
            <PromptCard
              key={p.id}
              prompt={p}
              onOpen={setSelectedPrompt}
              onQuickCopy={handleQuickCopy}
              copiedId={copiedId}
            />
          ))}
        </div>
      </div>

      {/* Status bar */}
      <div className="status-bar">
        {[['abap-adt MCP', true], ['sap-docs MCP', true]].map(([label, active]) => (
          <div key={label} className="status-item">
            <div className={`status-dot ${active ? 'dot-green' : 'dot-gray'}`} />
            <span>{label}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', color: '#60a5fa' }}>
          Tipp: Kattints egy kártyára, töltsd ki a változókat, másold Claude-ba!
        </div>
      </div>

      {/* Modal */}
      {selectedPrompt && (
        <PromptModal
          prompt={selectedPrompt}
          onClose={() => setSelectedPrompt(null)}
        />
      )}
    </div>
  )
}
