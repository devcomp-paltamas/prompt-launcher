import { useState, useEffect } from 'react'

const THEME_KEY = 'prompt-launcher-theme'

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem(THEME_KEY)
    if (saved) return saved

    // Then check system preference
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light'
    }
    return 'dark'
  })

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
    const handleChange = (e) => {
      const saved = localStorage.getItem(THEME_KEY)
      // Only auto-switch if user hasn't manually set a preference
      if (!saved) {
        setTheme(e.matches ? 'light' : 'dark')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const setAutoTheme = () => {
    localStorage.removeItem(THEME_KEY)
    const isLight = window.matchMedia('(prefers-color-scheme: light)').matches
    setTheme(isLight ? 'light' : 'dark')
  }

  return { theme, toggleTheme, setAutoTheme }
}

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      title={theme === 'dark' ? 'Világos téma' : 'Sötét téma'}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
