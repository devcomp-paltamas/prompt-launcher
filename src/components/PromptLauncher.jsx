import { useState, useEffect, useRef } from 'react'
import initialData from '../data/prompts.json'
import PromptCard from './PromptCard.jsx'
import PromptModal from './PromptModal.jsx'
import MainMenu from './MainMenu.jsx'
import CategoryDropdown from './CategoryDropdown.jsx'
import TagFilter from './TagFilter.jsx'
import SortDropdown from './SortDropdown.jsx'
import EditPromptModal from './EditPromptModal.jsx'
import HelpModal from './HelpModal.jsx'
import ManageMcpModal from './ManageMcpModal.jsx'
import SystemPromptModal from './SystemPromptModal.jsx'
import ThemeToggle, { useTheme } from './ThemeToggle.jsx'
import { normalizeCollections, normalizeMcpOptions, normalizePrompt } from '../lib/promptMcp.js'
import { normalizeAppSettings } from '../lib/appSettings.js'
import useAsyncAction from '../hooks/useAsyncAction.js'

const STORAGE_KEY = 'prompt-launcher-data-v3'
const LEGACY_STORAGE_KEYS = ['prompt-launcher-data-v2']
const EXPORT_VERSION = '3.0'
const DEFAULT_ACTIVE_COLLECTION_ID = 'all-collections'

function getDefaultState() {
  const mcps = normalizeMcpOptions(initialData.mcps)
  const settings = normalizeAppSettings(initialData.settings)

  return {
    hasSavedLocalState: false,
    hasMeaningfulLocalState: false,
    settings,
    mcps,
    collections: normalizeCollections(initialData.collections, mcps),
    activeCollectionId: DEFAULT_ACTIVE_COLLECTION_ID,
  }
}

function loadLocalState() {
  try {
    const keysToTry = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS]

    for (const key of keysToTry) {
      const saved = localStorage.getItem(key)
      if (!saved) continue

      const data = JSON.parse(saved)
      const rawSettings = typeof data.settings === 'object' && data.settings !== null ? data.settings : {}
      const rawMcps = Array.isArray(data.mcps) ? data.mcps : []
      const rawCollections = Array.isArray(data.collections) ? data.collections : []
      const settings = normalizeAppSettings(data.settings || initialData.settings)
      const mcps = normalizeMcpOptions(data.mcps || initialData.mcps)
      const collections = normalizeCollections(data.collections || initialData.collections, mcps)
      const hasMeaningfulLocalState = rawCollections.length > 0
        || rawMcps.length > 0
        || Boolean(typeof rawSettings.systemPrompt === 'string' && rawSettings.systemPrompt.trim())

      return {
        hasSavedLocalState: true,
        hasMeaningfulLocalState,
        storageKeyUsed: key,
        settings,
        mcps,
        collections,
        activeCollectionId: data.activeCollectionId || DEFAULT_ACTIVE_COLLECTION_ID,
      }
    }
  } catch (e) {
    console.error('Failed to load data:', e)
  }
  return getDefaultState()
}

function saveLocalState(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save data:', e)
  }
}

export default function PromptLauncher() {
  const initialLocalState = loadLocalState()
  const [settings, setSettings] = useState(() => initialLocalState.settings)
  const [mcps, setMcps] = useState(() => initialLocalState.mcps)
  const [collections, setCollections] = useState(() => initialLocalState.collections)
  const [activeCollectionId, setActiveCollectionId] = useState(() => initialLocalState.activeCollectionId)
  const [activeCat, setActiveCat] = useState(() => {
    const collection = initialLocalState.collections.find(c => c.id === initialLocalState.activeCollectionId) || initialLocalState.collections[0]
    const hasFavorites = collection?.prompts?.some(p => p.favorite)
    return hasFavorites ? 'favorites' : 'all'
  })
  const [selectedPrompt, setSelectedPrompt] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [tagOperator, setTagOperator] = useState('AND') // 'AND' or 'OR'
  const [searchQuery, setSearchQuery] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [showMcpModal, setShowMcpModal] = useState(false)
  const [showSystemPromptModal, setShowSystemPromptModal] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [importStatus, setImportStatus] = useState(null)
  const [sortOption, setSortOption] = useState('alpha-asc')
  const [remoteEtag, setRemoteEtag] = useState(null)
  const [storageMode, setStorageMode] = useState('local')
  const [blobConfigured, setBlobConfigured] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const fileInputRef = useRef(null)
  const { isBusy: isHeaderBusy, isPending: isHeaderPending, runAction: runHeaderAction } = useAsyncAction()

  // Check if "All collections" virtual view is active
  const isAllCollectionsView = activeCollectionId === 'all-collections'

  // Get active collection (or create virtual "all" collection)
  const activeCollection = isAllCollectionsView
    ? {
        id: 'all-collections',
        name: 'Összes gyűjtemény',
        icon: '📚',
        color: '#8b5cf6',
      }
    : collections.find(c => c.id === activeCollectionId) || collections[0]

  // Get prompts - either from active collection or all collections combined
  const prompts = isAllCollectionsView
    ? collections.flatMap(c => (c.prompts || []).map(p => ({
        ...p,
        _collectionId: c.id,
        _collectionName: c.name,
        _collectionIcon: c.icon,
      })))
    : activeCollection?.prompts || []

  // Get categories for active collection (with favorites)
  const favoriteCount = prompts.filter(p => p.favorite).length

  // Merge categories from all collections when in "all" view
  const baseCategories = isAllCollectionsView
    ? [
        { id: 'all', label: '🗂️ Mind', color: '#374151' },
        ...Array.from(
          new Map(
            collections
              .flatMap(c => c.categories || [])
              .filter(cat => cat.id !== 'all')
              .map(cat => [cat.id, cat])
          ).values()
        )
      ]
    : activeCollection?.categories || []

  const categories = [
    ...baseCategories.slice(0, 1), // "Mind" first
    { id: 'favorites', label: `⭐ Kedvencek (${favoriteCount})`, color: '#f59e0b', isSystem: true },
    ...baseCategories.slice(1), // Rest of categories
  ]

  useEffect(() => {
    let isCancelled = false

    async function hydrateFromServer() {
      try {
        const response = await fetch('/api/prompts', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error(`Betöltési hiba: ${response.status}`)
        }

        const data = await response.json()
        const nextSettings = normalizeAppSettings(data.settings || initialData.settings)
        const nextMcps = normalizeMcpOptions(data.mcps || initialData.mcps)
        const nextCollections = normalizeCollections(
          Array.isArray(data.collections) ? data.collections : initialData.collections,
          nextMcps
        )

        if (isCancelled) return

        const shouldSkipSeedHydration = !data.blobConfigured
          && data.storage === 'seed'
          && initialLocalState.hasMeaningfulLocalState

        if (shouldSkipSeedHydration) {
          setStorageMode('local')
          setBlobConfigured(false)
          return
        }

        setSettings(nextSettings)
        setMcps(nextMcps)
        setCollections(nextCollections)
        setRemoteEtag(data.etag || null)
        setStorageMode(data.storage || 'local')
        setBlobConfigured(Boolean(data.blobConfigured))
        setActiveCollectionId(prevActiveCollectionId => (
          prevActiveCollectionId === DEFAULT_ACTIVE_COLLECTION_ID || nextCollections.some(c => c.id === prevActiveCollectionId)
            ? prevActiveCollectionId
            : nextCollections[0]?.id || DEFAULT_ACTIVE_COLLECTION_ID
        ))

        if (data.migrated) {
          setImportStatus({
            type: 'success',
            message: 'A kezdő prompts.json adatok automatikusan átkerültek a Vercel Blob storage-be.',
          })
          setTimeout(() => setImportStatus(null), 4000)
        }
      } catch (error) {
        console.error('Failed to hydrate prompts from API:', error)
      }
    }

    hydrateFromServer()

    return () => {
      isCancelled = true
    }
  }, [])

  // Save data when state changes
  useEffect(() => {
    saveLocalState({ settings, mcps, collections, activeCollectionId })
  }, [settings, mcps, collections, activeCollectionId])

  // Auto-switch to favorites or all based on collection content
  useEffect(() => {
    const hasFavorites = prompts.some(p => p.favorite)
    if (activeCat === 'favorites' && !hasFavorites) {
      setActiveCat('all')
    } else if (activeCat === 'all' && hasFavorites) {
      setActiveCat('favorites')
    }
  }, [activeCollectionId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Get all unique tags from all prompts
  const allTags = [...new Set(prompts.flatMap(p => p.tags || []))].sort()
  const storageLabel = storageMode === 'blob'
    ? '☁️ Vercel Blob'
    : storageMode === 'file'
      ? '💾 Lokális JSON'
      : blobConfigured
        ? '☁️ Vercel storage'
        : '📦 Beépített JSON'

  // Filter prompts by category, tags, and search query
  const filtered = prompts.filter(p => {
    // Category filter
    const matchesCategory = activeCat === 'all'
      ? true
      : activeCat === 'favorites'
        ? p.favorite
        : p.cat === activeCat

    // Tags filter (AND = all must match, OR = any must match)
    const matchesTags = selectedTags.length === 0
      ? true
      : tagOperator === 'AND'
        ? selectedTags.every(tag => (p.tags || []).includes(tag))
        : selectedTags.some(tag => (p.tags || []).includes(tag))

    // Search filter (matches title, subtitle, description, or prompt text)
    const matchesSearch = searchQuery.trim() === ''
      ? true
      : [p.title, p.sub, p.desc, p.prompt]
          .filter(Boolean)
          .some(text => text.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesCategory && matchesTags && matchesSearch
  })

  // Sort filtered prompts
  const sortedPrompts = [...filtered].sort((a, b) => {
    switch (sortOption) {
      case 'alpha-asc':
        return (a.title || '').localeCompare(b.title || '', 'hu')
      case 'alpha-desc':
        return (b.title || '').localeCompare(a.title || '', 'hu')
      case 'date-desc':
        return (b.createdAt || 0) - (a.createdAt || 0)
      case 'date-asc':
        return (a.createdAt || 0) - (b.createdAt || 0)
      case 'usage-desc':
        return (b.useCount || 0) - (a.useCount || 0)
      case 'usage-asc':
        return (a.useCount || 0) - (b.useCount || 0)
      default:
        return 0
    }
  })

  const showToast = (type, message, duration = 3000) => {
    setImportStatus({ type, message })
    setTimeout(() => setImportStatus(null), duration)
  }

  const persistData = async (nextState = {}, options = {}) => {
    const {
      successMessage = null,
      successDuration = 2500,
      silentError = false,
    } = options

    const normalizedSettings = normalizeAppSettings(nextState.settings || settings)
    const normalizedMcps = normalizeMcpOptions(nextState.mcps || mcps)
    const normalizedCollections = normalizeCollections(nextState.collections || collections, normalizedMcps)

    setSettings(normalizedSettings)
    setMcps(normalizedMcps)
    setCollections(normalizedCollections)

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: normalizedSettings,
          mcps: normalizedMcps,
          collections: normalizedCollections,
          etag: remoteEtag,
        }),
      })

      const result = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(result?.error || 'Nem sikerült menteni a promptokat.')
      }

      setRemoteEtag(result?.etag || null)
      setStorageMode(result?.storage || storageMode)

      if (successMessage) {
        showToast('success', successMessage, successDuration)
      }

      return true
    } catch (error) {
      console.error('Failed to persist prompts:', error)

      if (!silentError) {
        showToast('error', error.message || 'Nem sikerült menteni a promptokat.', 4000)
      }

      return false
    }
  }

  const getTargetCollectionId = (promptId = null) => {
    if (isAllCollectionsView) {
      return prompts.find(p => p.id === promptId)?._collectionId
    }

    return activeCollectionId
  }

  const handleDuplicatePrompt = (prompt) => {
    // Create a copy with new ID and modified title
    const duplicatedPrompt = {
      ...prompt,
      id: null, // Will be generated on save
      title: `${prompt.title} (másolat)`,
      favorite: false,
      // Remove internal fields from "all collections" view
      _collectionId: undefined,
      _collectionName: undefined,
      _collectionIcon: undefined,
    }
    setEditingPrompt(duplicatedPrompt)
    setShowEditModal(true)
  }

  // Collection handlers
  const handleAddCollection = async (col) => {
    const newCollection = {
      ...col,
      categories: [
        { id: 'all', label: '🗂️ Mind', color: '#374151' },
        { id: 'general', label: '📝 Általános', color: '#6b7280' },
      ],
      prompts: []
    }
    const updatedCollections = [...collections, newCollection]

    setActiveCollectionId(col.id)
    return persistData({ collections: updatedCollections }, { successMessage: 'Gyűjtemény létrehozva.' })
  }

  const handleEditCollection = async (col) => {
    const updatedCollections = collections.map(c =>
      c.id === col.id
        ? { ...c, name: col.name, icon: col.icon, color: col.color }
        : c
    )

    return persistData({ collections: updatedCollections }, { successMessage: 'Gyűjtemény frissítve.' })
  }

  const handleDeleteCollection = async (colId) => {
    if (collections.length <= 1) {
      showToast('error', 'Legalább egy gyűjteménynek maradnia kell!')
      return false
    }

    const updatedCollections = collections.filter(c => c.id !== colId)

    if (activeCollectionId === colId) {
      setActiveCollectionId(updatedCollections[0]?.id || DEFAULT_ACTIVE_COLLECTION_ID)
    }

    return persistData({ collections: updatedCollections }, { successMessage: 'Gyűjtemény törölve.' })
  }

  // Category handlers
  const handleAddCategory = async (cat) => {
    const updatedCollections = collections.map(c =>
      c.id === activeCollectionId
        ? { ...c, categories: [...c.categories, cat] }
        : c
    )

    return persistData({ collections: updatedCollections }, { successMessage: 'Kategória hozzáadva.' })
  }

  const handleEditCategory = async (cat) => {
    // Can't edit "all" category
    if (cat.id === 'all') return false

    const updatedCollections = collections.map(c =>
      c.id === activeCollectionId
        ? { ...c, categories: c.categories.map(ct => ct.id === cat.id ? cat : ct) }
        : c
    )

    return persistData({ collections: updatedCollections }, { successMessage: 'Kategória frissítve.' })
  }

  const handleDeleteCategory = async (catId) => {
    // Can't delete "all" category
    if (catId === 'all') return false

    const updatedCollections = collections.map(c =>
      c.id === activeCollectionId
        ? { ...c, categories: c.categories.filter(ct => ct.id !== catId) }
        : c
    )

    if (activeCat === catId) {
      setActiveCat('favorites')
    }

    return persistData({ collections: updatedCollections }, { successMessage: 'Kategória törölve.' })
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
    // Add createdAt for new prompts
    const normalizedPrompt = normalizePrompt(prompt, mcps)
    const promptToSave = normalizedPrompt.createdAt
      ? normalizedPrompt
      : { ...normalizedPrompt, createdAt: Date.now(), useCount: 0 }

    // Determine target collection:
    // - If prompt has _collectionId (from "all collections" view), use that
    // - Otherwise use activeCollectionId (but not if it's 'all-collections')
    // - Fallback to first collection
    let targetCollectionId = promptToSave._collectionId
    if (!targetCollectionId && activeCollectionId !== 'all-collections') {
      targetCollectionId = activeCollectionId
    }
    if (!targetCollectionId) {
      targetCollectionId = collections[0]?.id
    }

    // Remove internal fields before saving
    const cleanPrompt = { ...promptToSave }
    delete cleanPrompt._collectionId
    delete cleanPrompt._collectionName
    delete cleanPrompt._collectionIcon

    // Calculate updated collections
    const updatedCollections = collections.map(c => {
      if (c.id !== targetCollectionId) return c

      const existingIndex = c.prompts.findIndex(p => p.id === cleanPrompt.id)
      if (existingIndex >= 0) {
        const updatedPrompts = [...c.prompts]
        updatedPrompts[existingIndex] = cleanPrompt
        return { ...c, prompts: updatedPrompts }
      }
      return { ...c, prompts: [...c.prompts, cleanPrompt] }
    })

    return persistData({ collections: updatedCollections }, { successMessage: 'Prompt mentve.' })
  }

  const handleDeletePrompt = async (promptId) => {
    // Find which collection contains this prompt
    const targetCollectionId = getTargetCollectionId(promptId)

    if (!targetCollectionId) return false

    const updatedCollections = collections.map(c =>
      c.id === targetCollectionId
        ? { ...c, prompts: c.prompts.filter(p => p.id !== promptId) }
        : c
    )

    return persistData({ collections: updatedCollections }, { successMessage: 'Prompt törölve.' })
  }

  const handleIncrementUseCount = async (promptId) => {
    // Find which collection contains this prompt
    const targetCollectionId = getTargetCollectionId(promptId)

    if (!targetCollectionId) return false

    const updatedCollections = collections.map(c =>
      c.id === targetCollectionId
        ? {
            ...c,
            prompts: c.prompts.map(p =>
              p.id === promptId ? { ...p, useCount: (p.useCount || 0) + 1 } : p
            )
          }
        : c
    )

    return persistData({ collections: updatedCollections }, { silentError: true })
  }

  const handleToggleFavorite = async (promptId) => {
    // Find which collection contains this prompt
    const targetCollectionId = getTargetCollectionId(promptId)

    if (!targetCollectionId) return false

    const updatedCollections = collections.map(c =>
      c.id === targetCollectionId
        ? {
            ...c,
            prompts: c.prompts.map(p =>
              p.id === promptId ? { ...p, favorite: !p.favorite } : p
            )
          }
        : c
    )

    return persistData({ collections: updatedCollections }, { silentError: true })
  }

  const handleSaveMcps = async (updatedMcps) => {
    return persistData(
      {
        settings,
        mcps: updatedMcps,
        collections,
      },
      { successMessage: 'MCP lista frissítve.' }
    )
  }

  const handleSaveSystemPrompt = async (systemPrompt) => {
    return persistData(
      {
        settings: {
          ...settings,
          systemPrompt,
        },
        mcps,
        collections,
      },
      {
        successMessage: systemPrompt.trim()
          ? 'System prompt mentve.'
          : 'System prompt törölve.',
      }
    )
  }

  // Export data - exports the full prompts.json structure
  const handleExport = () => {
    if (isHeaderBusy) return
    const exportData = {
      version: EXPORT_VERSION,
      exportDate: new Date().toISOString(),
      settings,
      mcps,
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

    showToast('success', `Exportálás sikeres! (${totalPrompts} prompt)`)
  }

  // Import data
  const handleImport = (e) => {
    if (isHeaderBusy) {
      e.target.value = ''
      return
    }

    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      await runHeaderAction('import', async () => {
        try {
          const data = JSON.parse(event.target.result)

          if (!data.collections || !Array.isArray(data.collections)) {
            throw new Error('Érvénytelen fájlformátum: hiányzó collections tömb')
          }

          const importedSettings = normalizeAppSettings(data.settings || initialData.settings)
          const importedMcps = normalizeMcpOptions(data.mcps || initialData.mcps)
          const collectionCount = data.collections.length
          const promptCount = data.collections.reduce((sum, c) => sum + (c.prompts?.length || 0), 0)
          const categoryCount = data.collections.reduce((sum, c) => sum + (c.categories?.length || 0), 0)
          const confirmMsg = `Importálás:\n• ${importedSettings.systemPrompt.trim() ? 'van' : 'nincs'} system prompt\n• ${importedMcps.length} MCP\n• ${collectionCount} gyűjtemény\n• ${promptCount} prompt\n• ${categoryCount} kategória\n\nA meglévő adatok FELÜLÍRÓDNAK. Folytatod?`

          if (!window.confirm(confirmMsg)) {
            return false
          }

          const nextActiveCollectionId = data.collections.some(c => c.id === activeCollectionId)
            ? activeCollectionId
            : data.collections[0]?.id || DEFAULT_ACTIVE_COLLECTION_ID

          setActiveCollectionId(nextActiveCollectionId)
          setActiveCat('favorites')

          return persistData({
            settings: importedSettings,
            mcps: importedMcps,
            collections: data.collections,
          }, {
            successMessage: `Importálás sikeres! (${promptCount} prompt)`,
          })
        } catch (err) {
          console.error('Import error:', err)
          showToast('error', `Hiba: ${err.message}`, 4000)
          return false
        } finally {
          e.target.value = ''
        }
      })
    }

    reader.readAsText(file)
  }

  // Reset to initial data
  const handleReset = async () => {
    if (isHeaderBusy) return
    if (window.confirm('Visszaállítod az eredeti adatokat?\n\nMinden módosítás elvész!')) {
      await runHeaderAction('reset', async () => {
        setActiveCollectionId(DEFAULT_ACTIVE_COLLECTION_ID)
        setActiveCat('all')
        setSelectedTags([])
        setSearchQuery('')
        return persistData({
          settings: initialData.settings,
          mcps: initialData.mcps,
          collections: initialData.collections,
        }, { successMessage: 'Visszaállítás sikeres!' })
      })
    }
  }

  return (
    <div className="app-shell">

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
        <div className="header-copy">
          <h1>{activeCollection?.name || 'Prompt Launcher'}</h1>
          <p>Claude AI prompt gyűjtemény</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-icon"
            onClick={handleExport}
            title="Exportálás JSON fájlba"
            disabled={isHeaderBusy}
          >
            {isHeaderBusy ? '⏳ Várj...' : '📤 Export'}
          </button>
          <button
            className="btn-icon"
            onClick={() => {
              if (isHeaderBusy) return
              fileInputRef.current?.click()
            }}
            title="Importálás JSON fájlból"
            disabled={isHeaderBusy}
          >
            {isHeaderPending('import') ? '⏳ Importálás...' : '📥 Import'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
            disabled={isHeaderBusy}
          />
          <button
            className="btn-icon"
            onClick={handleReset}
            title="Visszaállítás alapértelmezettre"
            disabled={isHeaderBusy}
          >
            {isHeaderPending('reset') ? '⏳ Visszaállítás...' : '🔄 Reset'}
          </button>
          <button
            className="btn-icon"
            onClick={() => setShowMcpModal(true)}
            title="MCP-k kezelése"
          >
            🔌 MCP-k
          </button>
          <button
            className="btn-icon"
            onClick={() => setShowSystemPromptModal(true)}
            title="Saját system prompt"
          >
            🧠 System
          </button>
          <button
            className="btn-icon"
            onClick={() => setShowHelp(true)}
            title="Súgó"
          >
            ❓ Súgó
          </button>
        </div>
        <div className="header-meta">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <div className="badge">v2.0</div>
        </div>
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
          <TagFilter
            prompts={prompts}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            tagOperator={tagOperator}
            onTagOperatorChange={setTagOperator}
          />
          <SortDropdown
            sortOption={sortOption}
            onSortChange={setSortOption}
          />
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Keresés..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="search-clear"
                onClick={() => setSearchQuery('')}
                title="Törlés"
              >
                ×
              </button>
            )}
          </div>
          <button className="btn-primary add-prompt-btn" onClick={handleNewPrompt}>
            + Új prompt
          </button>
        </div>

        {/* Cards */}
        <div className="grid">
          {sortedPrompts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{searchQuery ? '🔍' : '📝'}</div>
              <div className="empty-title">
                {searchQuery
                  ? `Nincs találat: "${searchQuery}"`
                  : 'Nincs prompt ebben a nézetben'}
              </div>
              <div className="empty-desc">
                {searchQuery
                  ? 'Próbálj más kulcsszavakat vagy töröld a keresést.'
                  : activeCat !== 'all'
                    ? 'Válassz másik kategóriát vagy adj hozzá új promptot.'
                    : 'Kattints az "Új prompt" gombra a létrehozáshoz.'}
              </div>
            </div>
          ) : (
            sortedPrompts.map(p => (
              <PromptCard
                key={p.id}
                prompt={p}
                onOpen={setSelectedPrompt}
                onDuplicate={handleDuplicatePrompt}
                onEdit={handleEditPrompt}
                onDelete={handleDeletePrompt}
                onToggleFavorite={handleToggleFavorite}
                isCustom={true}
                mcpOptions={mcps}
              />
            ))
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="status-bar">
        <div className="status-item">
          <span>🧠 {settings.systemPrompt.trim() ? 'System prompt aktív' : 'Nincs system prompt'}</span>
        </div>
        <div className="status-item">
          <span>🔌 {mcps.length} MCP</span>
        </div>
        <div className="status-item">
          <span>📚 {collections.length} gyűjtemény</span>
        </div>
        <div className="status-item">
          <span>📝 {prompts.length} prompt</span>
        </div>
        <div className="status-item">
          <span>{storageLabel}</span>
        </div>
        {(searchQuery || selectedTags.length > 0) && (
          <div className="status-item status-filter-info">
            <span>🔍 {sortedPrompts.length} találat</span>
          </div>
        )}
        <div className="status-tip">
          Tipp: Kattints egy kártyára, töltsd ki a változókat, másold Claude-ba!
        </div>
      </div>

      {/* Prompt Modal */}
      {selectedPrompt && (
        <PromptModal
          prompt={selectedPrompt}
          systemPrompt={settings.systemPrompt}
          mcpOptions={mcps}
          onClose={() => setSelectedPrompt(null)}
          onSave={handleSavePrompt}
          onIncrementUseCount={handleIncrementUseCount}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditPromptModal
          prompt={editingPrompt}
          categories={categories.filter(c => c.id !== 'all')}
          allTags={allTags}
          mcpOptions={mcps}
          onSave={handleSavePrompt}
          onClose={() => {
            setShowEditModal(false)
            setEditingPrompt(null)
          }}
        />
      )}

      {showMcpModal && (
        <ManageMcpModal
          mcps={mcps}
          onSave={handleSaveMcps}
          onClose={() => setShowMcpModal(false)}
        />
      )}

      {showSystemPromptModal && (
        <SystemPromptModal
          value={settings.systemPrompt}
          onSave={handleSaveSystemPrompt}
          onClose={() => setShowSystemPromptModal(false)}
        />
      )}

      {/* Help Modal */}
      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)} />
      )}
    </div>
  )
}
