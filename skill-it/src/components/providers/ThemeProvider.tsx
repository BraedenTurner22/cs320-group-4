'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'dark',
  toggle: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    // const stored = localStorage.getItem('theme') as Theme | null
    // const resolved = stored === 'light' ? 'light' : 'dark'
    // // setTheme(resolved)
    // document.documentElement.setAttribute('data-theme', resolved)
    setTimeout(() => {
      const stored = localStorage.getItem('theme') as Theme | null
      const resolved = stored === 'light' ? 'light' : 'dark'
      setTheme(resolved)
      document.documentElement.setAttribute('data-theme', resolved)
    }, 0)
  }, [])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.classList.add('theme-transitioning')
    // Force the browser to flush styles and record "before" colors as transition start points.
    // Without this, the class addition and data-theme change are batched together and
    // no "before" state is captured, so elements without a pre-existing transition snap.
    document.documentElement.getBoundingClientRect()
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning')
    }, 200)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
