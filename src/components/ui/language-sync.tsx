"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

export default function LanguageSync() {
  const pathname = usePathname()

  useEffect(() => {
    const lang = pathname.startsWith("/en") ? "en" : "ar"
    const dir = lang === "ar" ? "rtl" : "ltr"
    document.documentElement.lang = lang
    document.documentElement.dir = dir
  }, [pathname])

  return null
}
