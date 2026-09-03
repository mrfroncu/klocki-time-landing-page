import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'kt-theme'
const ORDER: Theme[] = ['light', 'dark', 'system']

function readStored(): Theme {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'light' || value === 'dark' || value === 'system') return value
  } catch {
    /* prywatny tryb / brak dostępu */
  }
  return 'system'
}

function systemPrefersDark(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches
}

function apply(theme: Theme): void {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  root.style.colorScheme = theme === 'system' ? 'light dark' : theme
}

export interface ThemeController {
  theme: Theme
  resolved: ResolvedTheme
  setTheme: (theme: Theme) => void
  cycleTheme: () => void
}

export function useTheme(): ThemeController {
  const [theme, setThemeState] = useState<Theme>(readStored)
  const [resolved, setResolved] = useState<ResolvedTheme>(() =>
    readStored() === 'dark' || (readStored() === 'system' && systemPrefersDark()) ? 'dark' : 'light',
  )

  useEffect(() => {
    apply(theme)
    setResolved(theme === 'dark' || (theme === 'system' && systemPrefersDark()) ? 'dark' : 'light')

    if (theme !== 'system' || typeof matchMedia !== 'function') return
    const media = matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => setResolved(event.matches ? 'dark' : 'light')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* zapis niedostępny — zmiana obowiązuje do końca sesji */
    }
  }, [])

  const cycleTheme = useCallback(() => {
    setTheme(ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]!)
  }, [theme, setTheme])

  return { theme, resolved, setTheme, cycleTheme }
}
