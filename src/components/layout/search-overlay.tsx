"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Search, X, Loader2, FileText, Calendar, Image, Newspaper, Users, ExternalLink } from "lucide-react"

interface SearchResult {
  title: string
  description: string
  url: string
  type: string
}

export default function SearchOverlay({ lang, onClose }: { lang: string; onClose: () => void }) {
  const isArabic = lang === "ar"
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&lang=${lang}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.results || [])
        }
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query, lang])

  const typeIcons: Record<string, JSX.Element> = {
    news: <Newspaper className="w-4 h-4" />,
    event: <Calendar className="w-4 h-4" />,
    project: <FileText className="w-4 h-4" />,
    page: <FileText className="w-4 h-4" />,
    gallery: <Image className="w-4 h-4" />,
    member: <Users className="w-4 h-4" />,
  }

  const typeLabels: Record<string, string> = {
    news: isArabic ? "خبر" : "News",
    event: isArabic ? "حدث" : "Event",
    project: isArabic ? "مشروع" : "Project",
    page: isArabic ? "صفحة" : "Page",
    gallery: isArabic ? "صورة" : "Image",
    member: isArabic ? "عضو" : "Member",
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="absolute top-0 left-0 right-0 bg-white dark:bg-[#0f172a] shadow-2xl border-b border-gray-200 dark:border-[#2a3d56]"
        onClick={(e) => e.stopPropagation()}
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isArabic ? "right-4" : "left-4"}`} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isArabic ? "ابحث في الموقع..." : "Search the site..."}
              className={`w-full px-12 py-3.5 bg-gray-100 dark:bg-[#1e2d42] border-0 rounded-xl text-gray-900 dark:text-[#f1f5f9] text-lg focus:ring-2 focus:ring-[#1A3A6B] focus:outline-none ${isArabic ? "text-right" : "text-left"}`}
            />
            <button
              onClick={onClose}
              className={`absolute top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-[#2a3d56] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ${isArabic ? "left-2" : "right-2"}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-2 text-xs text-gray-400 px-1">
            {isArabic ? "اكتب على الأقل حرفين للبحث" : "Type at least 2 characters to search"}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="mt-2 max-h-96 overflow-y-auto space-y-1">
              {results.map((r, i) => (
                <Link
                  key={i}
                  href={r.url}
                  onClick={onClose}
                  className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1e2d42] transition-colors group"
                >
                  <span className="mt-0.5 text-gray-400">{typeIcons[r.type] || <ExternalLink className="w-4 h-4" />}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-[#f1f5f9] group-hover:text-[#1A3A6B] dark:group-hover:text-blue-400 truncate">{r.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{r.description}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#2a3d56] text-gray-500 dark:text-gray-400 shrink-0">{typeLabels[r.type] || r.type}</span>
                </Link>
              ))}
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              {isArabic ? "لا توجد نتائج" : "No results found"}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
