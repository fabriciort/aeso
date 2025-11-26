'use client'

import { useEffect } from 'react'

function applyThemePreference(isDark: boolean) {
  const root = document.documentElement
  root.classList.toggle('dark', isDark)
  root.classList.toggle('light', !isDark)
}

export default function ThemeManager() {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handlePreferenceChange = (event: MediaQueryListEvent | MediaQueryList) => {
      applyThemePreference(event.matches)
    }

    handlePreferenceChange(mediaQuery)
    mediaQuery.addEventListener('change', handlePreferenceChange)

    return () => mediaQuery.removeEventListener('change', handlePreferenceChange)
  }, [])

  return null
}
