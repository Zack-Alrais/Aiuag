"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, FileText, Calendar, FolderOpen, User, Loader2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string
  type: "news" | "event" | "project" | "page" | "member"
  title: string
  description?: string
  slug?: string
  href: string
  icon: React.ReactNode
}

interface SearchOverlayProps {
  lang: string
  onClose: () => void
}

const SEARCH_TYPES = ["news", "events", "projects", "pages"] as const

export default function SearchOverlay({ lang, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const isArabic = lang === "ar"

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&lang=${lang}`)
      const data = await res.json()
      const items: SearchResult[] = (data.results || []).map((r: { id: string; type: string; title: string; description?: string; slug?: string }) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        description: r.description,
        slug: r.slug,
        href: r.type === "news" ? `/${lang}/news/${r.slug || r.id}`
          : r.type === "event" ? `/${lang}/events#${r.id}`
          : r.type === "project" ? `/${lang}/projects#${r.id}`
          : r.type === "member" ? `/${lang}/membership/manage`
          : `/${lang}/about`,
        icon: r.type === "news" ? <FileText className="w-4 h-4" />
          : r.type === "event" ? <Calendar className="w-4 h-4" />
          : r.type === "project" ? <FolderOpen className="w-4 h-4" />
          : <User className="w-4 h-4" />,
      }))
      setResults(items)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [lang])

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(query), 300)
    return () => clearTimeout(timer)
  }, [query, handleSearch])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
        return
      }
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, -1))
      }
      if (e.key === "Enter" && selectedIndex >= 0 && results[selectedIndex]) {
        window.location.href = results[selectedIndex].href
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [results, selectedIndex, onClose])

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      news: isArabic ? "خبر" : "News",
      event: isArabic ? "حدث" : "Event",
      project: isArabic ? "مشروع" : "Project",
      page: isArabic ? "صفحة" : "Page",
      member: isArabic ? "عضو" : "Member",
    }
    return labels[type] || type
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[100] bg-black/60 dark:bg-black/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={isArabic ? "بحث" : "Search"}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: -20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="container mx-auto max-w-2xl px-4 pt-[15vh]"
      >
        <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl border border-border dark:border-dark-border overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border dark:border-dark-border">
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIndex(-1) }}
              placeholder={isArabic ? "ابحث عن أخبار، أحداث، مشاريع..." : "Search news, events, projects..."}
              className="flex-1 bg-transparent border-none outline-none text-base text-text dark:text-white placeholder:text-gray-400"
              dir={isArabic ? "rtl" : "ltr"}
            />
            {loading && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card transition-colors" aria-label="Close">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {results.length > 0 && (
            <div className="max-h-80 overflow-y-auto p-2" role="listbox">
              {results.map((result, index) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  href={result.href}
                  onClick={onClose}
                  role="option"
                  aria-selected={index === selectedIndex}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl transition-colors",
                    index === selectedIndex
                      ? "bg-primary/5 dark:bg-primary/10"
                      : "hover:bg-gray-50 dark:hover:bg-dark-card"
                  )}
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-dark-card flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0">
                    {result.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-primary dark:text-primary-light">
                        {getTypeLabel(result.type)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-text dark:text-white truncate">
                      {result.title}
                    </p>
                    {result.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                        {result.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {query && !loading && results.length === 0 && (
            <div className="p-8 text-center text-gray-400 dark:text-gray-500">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">{isArabic ? "لا توجد نتائج" : "No results found"}</p>
            </div>
          )}

          <div className="px-4 py-2 border-t border-border dark:border-dark-border bg-gray-50/50 dark:bg-dark-card/50">
            <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500" dir="ltr">
              <span><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-dark-border rounded text-[10px] font-mono">↑↓</kbd> Navigate</span>
              <span><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-dark-border rounded text-[10px] font-mono">Enter</kbd> Open</span>
              <span><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-dark-border rounded text-[10px] font-mono">Esc</kbd> Close</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
