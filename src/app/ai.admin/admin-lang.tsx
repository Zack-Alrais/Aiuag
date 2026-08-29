"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { adminDict } from "./admin-i18n"

export type AdminLang = "ar" | "en"

interface AdminLangContextType {
  lang: AdminLang
  setLang: (l: AdminLang) => void
  toggleLang: () => void
  t: (key: string) => string
}

const AdminLangContext = createContext<AdminLangContextType>({
  lang: "ar",
  setLang: () => {},
  toggleLang: () => {},
  t: (key: string) => key,
})

export function AdminLangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<AdminLang>("ar")

  useEffect(() => {
    let saved: AdminLang = "ar"
    try {
      const v = localStorage.getItem("admin_lang")
      if (v === "ar" || v === "en") saved = v
    } catch {}
    setLangState(saved)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
  }, [lang])

  const setLang = useCallback((l: AdminLang) => {
    setLangState(l)
    try {
      localStorage.setItem("admin_lang", l)
    } catch {}
  }, [])

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next: AdminLang = prev === "ar" ? "en" : "ar"
      try {
        localStorage.setItem("admin_lang", next)
      } catch {}
      return next
    })
  }, [])

  const t = useCallback(
    (key: string) => {
      const entry = adminDict[key]
      if (!entry) return key
      return entry[lang] ?? entry.ar
    },
    [lang]
  )

  return (
    <AdminLangContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </AdminLangContext.Provider>
  )
}

export function useAdminLang() {
  return useContext(AdminLangContext)
}