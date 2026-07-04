"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

export default function LanguageSync({ fontAr, fontEn }: { fontAr?: string; fontEn?: string }) {
  const pathname = usePathname()

  useEffect(() => {
    const lang = pathname.startsWith("/en") ? "en" : "ar"
    const dir = lang === "ar" ? "rtl" : "ltr"
    const html = document.documentElement
    html.lang = lang
    html.dir = dir
    // Switch font class between Arabic (Cairo) and English (Inter)
    if (fontAr && fontEn) {
      html.classList.remove(fontAr, fontEn)
      html.classList.add(lang === "ar" ? fontAr : fontEn)
    }
  }, [pathname, fontAr, fontEn])

  return null
}
