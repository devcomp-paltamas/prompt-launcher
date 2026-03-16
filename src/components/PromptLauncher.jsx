import { useState, useEffect, useRef } from 'react'
import initialData from '../data/prompts.json'
import PromptCard from './PromptCard.jsx'
import PromptModal from './PromptModal.jsx'
import MainMenu from './MainMenu.jsx'
import CategoryDropdown from './CategoryDropdown.jsx'
import EditPromptModal from './EditPromptModal.jsx'
import HelpModal from './HelpModal.jsx'

const STORAGE_KEY = 'prompt-launcher-data-v2'
const EXPORT_VERSION = '2.0'

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      return {
        collections: data.collections || initialData.collections,
        activeCollectionId: data.activeCollectionId || initialData.collections[0]?.id,
      }
    }
  } catch (e) {
    console.error('Failed to load data:', e)
  }
  return {
    collections: initialData.collections,
    activeCollectionId: initialData.collections[0]?.id,
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save data:', e)
  }
}

export default function PromptLauncher() {
  const [collections, setCollections] = useState(() => loadData().collections)
  const [activeCollectionId, setActiveCollectionId] = useState(() => loadData().activeCollectionId)
  const [activeCat, setActiveCat] = useState(() => {
    // Default to favorites if there are any, otherwise show all
    const data = loadData()
    const collection = data.collections.find(c => c.id === data.activeCollectionId) || data.collections[0]
    const hasFavorites = collection?.prompts?.some(p => p.favorite)
    return hasFavorites ? 'favorites' : 'all'
  })
  const [selectedPrompt, setSelectedPrompt] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [importStatus, setImportStatus] = useState(null)
  const fileInputRef = useRef(null)

  // Get active collection
  const activeCollection = collections.find(c => c.id === activeCollectionId) || collections[0]

  // Get categories for active collection (with favorites)
  const favoriteCount = (activeCollection?.prompts || []).filter(p => p.favorite).length
  const categories = [
    ...(activeCollection?.categories || []).slice(0, 1), // "Mind" first
    { id: 'favorites', label: `⭐ Kedvencek (${favoriteCount})`, color: '#f59e0b', isSystem: true },
    ...(activeCollection?.categories || []).slice(1), // Rest of categories
  ]

  // Get prompts for active collection
  const prompts = activeCollection?.prompts || []

  // Save data when state changes
  useEffect(() => {
    saveData({ collections, activeCollectionId })
  }, [collections, activeCollectionId])

  // Auto-switch to favorites or all based on collection content
  useEffect(() => {
    const hasFavorites = prompts.some(p => p.favorite)
    if (activeCat === 'favorites' && !hasFavorites) {
      setActiveCat('all')
    } else if (activeCat === 'all' && hasFavorites) {
      setActiveCat('favorites')
    }
  }, [activeCollectionId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Filter prompts by category
  const filtered = activeCat === 'all'
    ? prompts
    : activeCat === 'favorites'
      ? prompts.filter(p => p.favorite)
      : prompts.filter(p => p.cat === activeCat)

  const handleQuickCopy = async prompt => {
    await navigator.clipboard.writeText(prompt.prompt)
    setCopiedId(prompt.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Collection handlers
  const handleAddCollection = (col) => {
    const newCollection = {
      ...col,
      categories: [
        { id: 'all', label: '🗂️ Mind', color: '#374151' },
        { id: 'general', label: '📝 Általános', color: '#6b7280' },
      ],
      prompts: []
    }
    setCollections(prev => [...prev, newCollection])
    setActiveCollectionId(col.id)
  }

  const handleEditCollection = (col) => {
    setCollections(prev => prev.map(c =>
      c.id === col.id
        ? { ...c, name: col.name, icon: col.icon, color: col.color }
        : c
    ))
  }

  const handleDeleteCollection = (colId) => {
    if (collections.length <= 1) {
      setImportStatus({ type: 'error', message: 'Legalább egy gyűjteménynek maradnia kell!' })
      setTimeout(() => setImportStatus(null), 3000)
      return
    }
    setCollections(prev => prev.filter(c => c.id !== colId))
    if (activeCollectionId === colId) {
      setActiveCollectionId(collections[0]?.id)
    }
  }

  // Category handlers
  const handleAddCategory = (cat) => {
    setCollections(prev => prev.map(c =>
      c.id === activeCollectionId
        ? { ...c, categories: [...c.categories, cat] }
        : c
    ))
  }

  const handleEditCategory = (cat) => {
    // Can't edit "all" category
    if (cat.id === 'all') return

    setCollections(prev => prev.map(c =>
      c.id === activeCollectionId
        ? { ...c, categories: c.categories.map(ct => ct.id === cat.id ? cat : ct) }
        : c
    ))
  }

  const handleDeleteCategory = (catId) => {
    // Can't delete "all" category
    if (catId === 'all') return

    setCollections(prev => prev.map(c =>
      c.id === activeCollectionId
        ? { ...c, categories: c.categories.filter(ct => ct.id !== catId) }
        : c
    ))
    if (activeCat === catId) {
      setActiveCat('favorites')
    }
  }

  // Prompt handlers
  const handleNewPrompt = () => {
    setEditingPrompt(null)
    setShowEditModal(true)
  }

  const handleEditPrompt = (prompt) => {
    setEditingPrompt(prompt)
    setShowEditModal(true)
  }

  const handleSavePrompt = async (prompt) => {
    // Calculate updated collections
    const updatedCollections = collections.map(c => {
      if (c.id !== activeCollectionId) return c

      const existingIndex = c.prompts.findIndex(p => p.id === prompt.id)
      if (existingIndex >= 0) {
        const updatedPrompts = [...c.prompts]
        updatedPrompts[existingIndex] = prompt
        return { ...c, prompts: updatedPrompts }
      }
      return { ...c, prompts: [...c.prompts, prompt] }
    })

    setCollections(updatedCollections)
    setShowEditModal(false)
    setEditingPrompt(null)

    // Save to prompts.json via API (dev server only)
    try {
      const response = await fetch('/api/save-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collections: updatedCollections })
      })
      if (response.ok) {
        setImportStatus({ type: 'success', message: 'Mentve a prompts.json fájlba!' })
      } else {
        setImportStatus({ type: 'error', message: 'Mentés sikertelen (csak dev módban működik)' })
      }
    } catch {
      // Production mode - no API available, just use localStorage
      setImportStatus({ type: 'success', message: 'Mentve (localStorage)' })
    }
    setTimeout(() => setImportStatus(null), 2000)
  }

  const handleDeletePrompt = (promptId) => {
    setCollections(prev => prev.map(c =>
      c.id === activeCollectionId
        ? { ...c, prompts: c.prompts.filter(p => p.id !== promptId) }
        : c
    ))
  }

  const handleToggleFavorite = async (promptId) => {
    const updatedCollections = collections.map(c =>
      c.id === activeCollectionId
        ? {
            ...c,
            prompts: c.prompts.map(p =>
              p.id === promptId ? { ...p, favorite: !p.favorite } : p
            )
          }
        : c
    )

    setCollections(updatedCollections)

    // Save to prompts.json via API
    try {
      await fetch('/api/save-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collections: updatedCollections })
      })
    } catch {
      // Silent fail in production
    }
  }

  // Export data - exports the full prompts.json structure
  const handleExport = () => {
    const exportData = {
      version: EXPORT_VERSION,
      exportDate: new Date().toISOString(),
      collections,
    }

    const totalPrompts = collections.reduce((sum, c) => sum + (c.prompts?.length || 0), 0)

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prompt-launcher-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setImportStatus({ type: 'success', message: `Exportálás sikeres! (${totalPrompts} prompt)` })
    setTimeout(() => setImportStatus(null), 3000)
  }

  // Import data
  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)

        // Validate structure
        if (!data.collections || !Array.isArray(data.collections)) {
          throw new Error('Érvénytelen fájlformátum: hiányzó collections tömb')
        }

        // Show confirmation dialog
        const collectionCount = data.collections.length
        const promptCount = data.collections.reduce((sum, c) => sum + (c.prompts?.length || 0), 0)
        const categoryCount = data.collections.reduce((sum, c) => sum + (c.categories?.length || 0), 0)

        const confirmMsg = `Importálás:\n• ${collectionCount} gyűjtemény\n• ${promptCount} prompt\n• ${categoryCount} kategória\n\nA meglévő adatok FELÜLÍRÓDNAK. Folytatod?`

        if (window.confirm(confirmMsg)) {
          setCollections(data.collections)

          // Reset to first collection if active one doesn't exist
          if (!data.collections.some(c => c.id === activeCollectionId)) {
            setActiveCollectionId(data.collections[0]?.id)
          }
          setActiveCat('favorites')

          setImportStatus({ type: 'success', message: `Importálás sikeres! (${promptCount} prompt)` })
        }
      } catch (err) {
        console.error('Import error:', err)
        setImportStatus({ type: 'error', message: `Hiba: ${err.message}` })
      }

      // Reset file input
      e.target.value = ''
      setTimeout(() => setImportStatus(null), 4000)
    }

    reader.readAsText(file)
  }

  // Reset to initial data
  const handleReset = () => {
    if (window.confirm('Visszaállítod az eredeti adatokat?\n\nMinden módosítás elvész!')) {
      setCollections(initialData.collections)
      setActiveCollectionId(initialData.collections[0]?.id)
      setActiveCat('favorites')
      localStorage.removeItem(STORAGE_KEY)
      setImportStatus({ type: 'success', message: 'Visszaállítás sikeres!' })
      setTimeout(() => setImportStatus(null), 3000)
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Header */}
      <header>
        <MainMenu
          collections={collections}
          activeCollection={activeCollectionId}
          onSelect={setActiveCollectionId}
          onAdd={handleAddCollection}
          onEdit={handleEditCollection}
          onDelete={handleDeleteCollection}
        />
        <div style={{ flex: 1 }}>
          <h1>{activeCollection?.name || 'Prompt Launcher'}</h1>
          <p>Claude AI prompt gyűjtemény</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-icon"
            onClick={handleExport}
            title="Exportálás JSON fájlba"
          >
            📤 Export
          </button>
          <button
            className="btn-icon"
            onClick={() => fileInputRef.current?.click()}
            title="Importálás JSON fájlból"
          >
            📥 Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
          <button
            className="btn-icon"
            onClick={handleReset}
            title="Visszaállítás alapértelmezettre"
          >
            🔄 Reset
          </button>
          <button
            className="btn-icon"
            onClick={() => setShowHelp(true)}
            title="Súgó"
          >
            ❓ Súgó
          </button>
        </div>
        <div className="badge">v2.0</div>
      </header>

      {/* Import status toast */}
      {importStatus && (
        <div className={`toast toast-${importStatus.type}`}>
          {importStatus.type === 'success' ? '✅' : '❌'} {importStatus.message}
        </div>
      )}

      {/* Main */}
      <div className="container">

        {/* Toolbar */}
        <div className="toolbar">
          <CategoryDropdown
            categories={categories}
            activeCat={activeCat}
            onSelect={setActiveCat}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
          />
          <button className="btn-primary add-prompt-btn" onClick={handleNewPrompt}>
            + Új prompt
          </button>
        </div>

        {/* Cards */}
        <div className="grid">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <div className="empty-title">Nincs prompt ebben a nézetben</div>
              <div className="empty-desc">
                {activeCat !== 'all'
                  ? 'Válassz másik kategóriát vagy adj hozzá új promptot.'
                  : 'Kattints az "Új prompt" gombra a létrehozáshoz.'}
              </div>
            </div>
          ) : (
            filtered.map(p => (
              <PromptCard
                key={p.id}
                prompt={p}
                onOpen={setSelectedPrompt}
                onQuickCopy={handleQuickCopy}
                copiedId={copiedId}
                onEdit={handleEditPrompt}
                onDelete={handleDeletePrompt}
                onToggleFavorite={handleToggleFavorite}
                isCustom={true}
              />
            ))
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="status-bar">
        <div className="status-item">
          <span>📚 {collections.length} gyűjtemény</span>
        </div>
        <div className="status-item">
          <span>📝 {prompts.length} prompt</span>
        </div>
        <div style={{ marginLeft: 'auto', color: '#60a5fa' }}>
          Tipp: Kattints egy kártyára, töltsd ki a változókat, másold Claude-ba!
        </div>
      </div>

      {/* Prompt Modal */}
      {selectedPrompt && (
        <PromptModal
          prompt={selectedPrompt}
          onClose={() => setSelectedPrompt(null)}
          onSave={handleSavePrompt}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditPromptModal
          prompt={editingPrompt}
          categories={categories.filter(c => c.id !== 'all')}
          onSave={handleSavePrompt}
          onClose={() => {
            setShowEditModal(false)
            setEditingPrompt(null)
          }}
        />
      )}

      {/* Help Modal */}
      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)} />
      )}
    </div>
  )
}
