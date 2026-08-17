"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("admin-theme") as Theme | null
    if (saved) {
      setThemeState(saved)
      document.documentElement.classList.toggle("dark", saved === "dark")
    }
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light"
    setThemeState(next)
    localStorage.setItem("admin-theme", next)
    document.documentElement.classList.toggle("dark", next === "dark")
  }

  const setTheme = (t: Theme) => {
    setThemeState(t)
    localStorage.setItem("admin-theme", t)
    document.documentElement.classList.toggle("dark", t === "dark")
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
