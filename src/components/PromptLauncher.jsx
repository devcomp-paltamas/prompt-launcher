import { useState, useEffect, useRef } from 'react'
import { PROMPTS as DEFAULT_PROMPTS, CATEGORIES as DEFAULT_CATEGORIES, CAT_ICON_BG as DEFAULT_CAT_ICON_BG } from '../data/prompts.js'
import PromptCard from './PromptCard.jsx'
import PromptModal from './PromptModal.jsx'
import EditPromptModal from './EditPromptModal.jsx'
import CategoryDropdown from './CategoryDropdown.jsx'
import MainMenu from './MainMenu.jsx'

const STORAGE_KEY = 'prompt-launcher-data'

const DEFAULT_COLLECTIONS = [
  {
    id: 'sap-mcp',
    name: 'SAP ABAP MCP',
    icon: '🔧',
    color: '#0070f3',
    categories: DEFAULT_CATEGORIES,
    prompts: DEFAULT_PROMPTS,
  },
  {
    id: 'general',
    name: 'Általános',
    icon: '📝',
    color: '#00b894',
    categories: [
      { id: 'all', label: '🗂️ Mind', color: '#374151' },
      { id: 'writing', label: '✍️ Írás', color: '#8b5cf6' },
      { id: 'analysis', label: '🔍 Elemzés', color: '#0891b2' },
      { id: 'creative', label: '🎨 Kreatív', color: '#ec4899' },
    ],
    prompts: [
      {
        id: 'gen-summarize', cat: 'analysis', icon: '📋',
        title: 'Szöveg összefoglalás', sub: 'Rövid kivonat készítése',
        desc: 'Hosszú szöveg tömör összefoglalása a lényeges pontokkal.',
        tools: [], vars: ['SZÖVEG'],
        prompt: `Foglald össze az alábbi szöveget tömören, a lényeges pontokat kiemelve:

[SZÖVEG]

Az összefoglaló legyen:
- Maximum 3-5 mondat
- A fő gondolatokat tartalmazza
- Objektív és semleges hangvételű`,
      },
      {
        id: 'gen-email', cat: 'writing', icon: '📧',
        title: 'Email írás', sub: 'Professzionális levél',
        desc: 'Professzionális email megfogalmazása a megadott témában.',
        tools: [], vars: ['TÉMA', 'HANGNEM', 'CÍMZETT'],
        prompt: `Írj egy professzionális emailt:

Téma: [TÉMA]
Hangnem: [HANGNEM]
Címzett: [CÍMZETT]

Az email legyen:
- Udvarias és professzionális
- Tömör de informatív
- Egyértelmű cselekvésre ösztönzés (ha releváns)`,
      },
      {
        id: 'gen-brainstorm', cat: 'creative', icon: '💡',
        title: 'Ötletelés', sub: 'Brainstorming session',
        desc: 'Kreatív ötletek generálása adott témában.',
        tools: [], vars: ['TÉMA', 'DARABSZÁM'],
        prompt: `Generálj [DARABSZÁM] kreatív ötletet a következő témában:

[TÉMA]

Minden ötlethez adj:
- Rövid leírást (1-2 mondat)
- Előnyök
- Esetleges kihívások`,
      },
    ],
  },
]

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load data:', e)
  }
  return {
    collections: DEFAULT_COLLECTIONS,
    activeCollectionId: 'sap-mcp',
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save data:', e)
  }
}

function downloadJson(data, filename) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function generateCatIconBg(categories) {
  const bg = { ...DEFAULT_CAT_ICON_BG }
  categories.forEach(cat => {
    if (cat.id !== 'all' && cat.color) {
      const hex = cat.color.replace('#', '')
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      bg[cat.id] = `rgba(${r},${g},${b},0.25)`
    }
  })
  return bg
}

export default function PromptLauncher() {
  const [data, setData] = useState(loadData)
  const [activeCat, setActiveCat] = useState('all')
  const [selectedPrompt, setSelectedPrompt] = useState(null)
  const [editingPrompt, setEditingPrompt] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const fileInputRef = useRef(null)

  const { collections, activeCollectionId } = data
  const activeCollection = collections.find(c => c.id === activeCollectionId) || collections[0]
  const { categories, prompts } = activeCollection

  useEffect(() => {
    saveData(data)
  }, [data])

  useEffect(() => {
    setActiveCat('all')
  }, [activeCollectionId])

  const catIconBg = generateCatIconBg(categories)

  const updateCollection = (updates) => {
    setData(prev => ({
      ...prev,
      collections: prev.collections.map(c =>
        c.id === activeCollectionId ? { ...c, ...updates } : c
      ),
    }))
  }

  const handleExport = () => {
    const timestamp = new Date().toISOString().slice(0, 10)
    downloadJson(activeCollection, `${activeCollection.name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.json`)
  }

  const handleExportAll = () => {
    const timestamp = new Date().toISOString().slice(0, 10)
    downloadJson(data, `prompt-launcher-backup-${timestamp}.json`)
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result)

        // Full backup import
        if (imported.collections && Array.isArray(imported.collections)) {
          if (window.confirm('Teljes backup importálása? Minden adat felülíródik.')) {
            setData(imported)
          }
        }
        // Single collection import
        else if (imported.prompts && imported.categories) {
          if (window.confirm(`"${imported.name || 'Importált'}" gyűjtemény hozzáadása?`)) {
            const newCollection = {
              ...imported,
              id: `imported-${Date.now()}`,
              name: imported.name || 'Importált gyűjtemény',
              icon: imported.icon || '📁',
              color: imported.color || '#6366f1',
            }
            setData(prev => ({
              ...prev,
              collections: [...prev.collections, newCollection],
              activeCollectionId: newCollection.id,
            }))
          }
        }
        // Legacy format (just prompts array)
        else if (Array.isArray(imported)) {
          if (window.confirm(`${imported.length} prompt importálása a jelenlegi gyűjteménybe?`)) {
            updateCollection({ prompts: imported })
          }
        } else {
          alert('Érvénytelen fájlformátum!')
        }
      } catch (err) {
        alert('Hiba a fájl olvasásakor: ' + err.message)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const filtered = activeCat === 'all'
    ? prompts
    : prompts.filter(p => p.cat === activeCat)

  const handleQuickCopy = async prompt => {
    await navigator.clipboard.writeText(prompt.prompt)
    setCopiedId(prompt.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSave = (updatedPrompt) => {
    const exists = prompts.find(p => p.id === updatedPrompt.id)
    const newPrompts = exists
      ? prompts.map(p => p.id === updatedPrompt.id ? updatedPrompt : p)
      : [...prompts, updatedPrompt]
    updateCollection({ prompts: newPrompts })
    setEditingPrompt(null)
    setIsCreating(false)
  }

  const handleDelete = (promptId) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt a jegyzetet?')) {
      updateCollection({ prompts: prompts.filter(p => p.id !== promptId) })
    }
  }

  const handleEdit = (prompt) => {
    setEditingPrompt(prompt)
  }

  const handleCreate = () => {
    setIsCreating(true)
  }

  const handleResetToDefaults = () => {
    if (window.confirm('Biztosan visszaállítod az alapértelmezett adatokat? Minden egyéni adat elvész.')) {
      setData({
        collections: DEFAULT_COLLECTIONS,
        activeCollectionId: 'sap-mcp',
      })
      setActiveCat('all')
    }
  }

  // Category handlers
  const handleAddCategory = (newCat) => {
    updateCollection({ categories: [...categories, newCat] })
  }

  const handleEditCategory = (updatedCat) => {
    updateCollection({
      categories: categories.map(c => c.id === updatedCat.id ? updatedCat : c)
    })
  }

  const handleDeleteCategory = (catId) => {
    updateCollection({ categories: categories.filter(c => c.id !== catId) })
    if (activeCat === catId) setActiveCat('all')
  }

  // Collection handlers
  const handleSelectCollection = (id) => {
    setData(prev => ({ ...prev, activeCollectionId: id }))
  }

  const handleAddCollection = (newCol) => {
    const collection = {
      ...newCol,
      categories: [
        { id: 'all', label: '🗂️ Mind', color: '#374151' },
      ],
      prompts: [],
    }
    setData(prev => ({
      ...prev,
      collections: [...prev.collections, collection],
      activeCollectionId: collection.id,
    }))
  }

  const handleEditCollection = (updated) => {
    setData(prev => ({
      ...prev,
      collections: prev.collections.map(c =>
        c.id === updated.id ? { ...c, name: updated.name, icon: updated.icon, color: updated.color } : c
      ),
    }))
  }

  const handleDeleteCollection = (id) => {
    setData(prev => {
      const newCollections = prev.collections.filter(c => c.id !== id)
      return {
        ...prev,
        collections: newCollections,
        activeCollectionId: newCollections[0]?.id || 'sap-mcp',
      }
    })
  }

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Header */}
      <header>
        <MainMenu
          collections={collections}
          activeCollection={activeCollectionId}
          onSelect={handleSelectCollection}
          onAdd={handleAddCollection}
          onEdit={handleEditCollection}
          onDelete={handleDeleteCollection}
        />
        <div style={{ flex: 1 }}>
          <h1>Prompt Launcher</h1>
          <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 2 }}>
            {activeCollection.name} · {prompts.length} prompt
          </p>
        </div>
        <div className="badge">v3.0</div>
      </header>

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
          <div className="toolbar-actions">
            <button onClick={handleCreate} className="btn-add">
              ➕ Új jegyzet
            </button>
            <button onClick={handleExport} className="btn-file" title="Gyűjtemény exportálása">
              📥 Export
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="btn-file" title="Importálás">
              📤 Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
            <button onClick={handleResetToDefaults} className="btn-reset" title="Alapértelmezett visszaállítása">
              🔄
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-text">Nincs még prompt ebben a kategóriában</div>
              <button onClick={handleCreate} className="btn-add">
                ➕ Új jegyzet létrehozása
              </button>
            </div>
          ) : (
            filtered.map(p => (
              <PromptCard
                key={p.id}
                prompt={p}
                catIconBg={catIconBg}
                onOpen={setSelectedPrompt}
                onQuickCopy={handleQuickCopy}
                onEdit={handleEdit}
                onDelete={handleDelete}
                copiedId={copiedId}
              />
            ))
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="status-bar">
        <div className="status-item">
          <span style={{ color: activeCollection.color }}>{activeCollection.icon}</span>
          <span>{activeCollection.name}</span>
        </div>
        <div className="status-item">
          <span>{prompts.length} prompt</span>
        </div>
        <div className="status-item">
          <span>{categories.length - 1} kategória</span>
        </div>
        <div style={{ marginLeft: 'auto', color: '#60a5fa' }}>
          <button
            onClick={handleExportAll}
            className="btn-export-all"
            title="Összes gyűjtemény mentése"
          >
            💾 Teljes backup
          </button>
        </div>
      </div>

      {/* View Modal */}
      {selectedPrompt && (
        <PromptModal
          prompt={selectedPrompt}
          onClose={() => setSelectedPrompt(null)}
        />
      )}

      {/* Edit Modal */}
      {(editingPrompt || isCreating) && (
        <EditPromptModal
          prompt={editingPrompt}
          categories={categories}
          onSave={handleSave}
          onClose={() => { setEditingPrompt(null); setIsCreating(false) }}
        />
      )}
    </div>
  )
}
