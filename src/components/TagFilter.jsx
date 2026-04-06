import { useState, useEffect, useRef } from 'react'

export default function TagFilter({ prompts, selectedTags, onTagsChange, tagOperator, onTagOperatorChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef(null)

  // Extract all unique tags from prompts
  const allTags = [...new Set(prompts.flatMap(p => p.tags || []))].sort()

  // Filter tags based on search query
  const filteredTags = allTags.filter(tag =>
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Prevent body scroll when dropdown is open and scrolling inside it
  useEffect(() => {
    if (!isOpen) return

    const dropdown = dropdownRef.current?.querySelector('.tag-filter-dropdown')
    if (!dropdown) return

    const handleWheel = (e) => {
      const list = dropdown.querySelector('.tag-filter-list')
      if (!list) return

      const { scrollTop, scrollHeight, clientHeight } = list
      const isAtTop = scrollTop === 0
      const isAtBottom = scrollTop + clientHeight >= scrollHeight

      // Prevent scroll if at boundaries
      if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
        e.preventDefault()
      }
    }

    dropdown.addEventListener('wheel', handleWheel, { passive: false })
    return () => dropdown.removeEventListener('wheel', handleWheel)
  }, [isOpen])

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  const clearAllTags = () => {
    onTagsChange([])
  }

  if (allTags.length === 0) {
    return null
  }

  return (
    <div className="tag-filter" ref={dropdownRef}>
      <button
        className={`tag-filter-trigger${selectedTags.length > 0 ? ' has-selection' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="tag-filter-icon">🏷️</span>
        <span className="tag-filter-label">
          {selectedTags.length === 0
            ? 'Címkék'
            : `${selectedTags.length} címke`}
        </span>
        <span className="tag-filter-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="tag-filter-dropdown">
          {/* Search input */}
          <div className="tag-filter-search">
            <input
              type="text"
              placeholder="Keresés..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="tag-filter-search-input"
              autoFocus
            />
          </div>

          {/* Selected tags */}
          {selectedTags.length > 0 && (
            <div className="tag-filter-selected">
              <div className="tag-filter-selected-header">
                <span>Aktív szűrők</span>
                <button onClick={clearAllTags} className="tag-filter-clear">
                  Törlés
                </button>
              </div>
              {/* AND/OR toggle */}
              {selectedTags.length > 1 && (
                <div className="tag-operator-toggle">
                  <button
                    className={`tag-operator-btn ${tagOperator === 'AND' ? 'active' : ''}`}
                    onClick={() => onTagOperatorChange('AND')}
                    title="Minden címke szerepeljen"
                  >
                    ÉS
                  </button>
                  <button
                    className={`tag-operator-btn ${tagOperator === 'OR' ? 'active' : ''}`}
                    onClick={() => onTagOperatorChange('OR')}
                    title="Bármelyik címke szerepeljen"
                  >
                    VAGY
                  </button>
                </div>
              )}
              <div className="tag-filter-selected-tags">
                {selectedTags.map((tag, index) => (
                  <span key={tag} className="tag-chip-wrapper">
                    <span
                      className="tag-chip selected"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                      <span className="tag-chip-remove">×</span>
                    </span>
                    {index < selectedTags.length - 1 && (
                      <span className="tag-operator-label">
                        {tagOperator === 'AND' ? 'és' : 'vagy'}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* All tags */}
          <div className="tag-filter-list">
            {filteredTags.length === 0 ? (
              <div className="tag-filter-empty">
                {searchQuery ? 'Nincs találat' : 'Nincsenek címkék'}
              </div>
            ) : (
              filteredTags.map(tag => {
                const isSelected = selectedTags.includes(tag)
                const count = prompts.filter(p => (p.tags || []).includes(tag)).length
                return (
                  <div
                    key={tag}
                    className={`tag-filter-item${isSelected ? ' selected' : ''}`}
                    onClick={() => toggleTag(tag)}
                  >
                    <span className="tag-filter-item-checkbox">
                      {isSelected ? '☑' : '☐'}
                    </span>
                    <span className="tag-filter-item-label">{tag}</span>
                    <span className="tag-filter-item-count">{count}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
