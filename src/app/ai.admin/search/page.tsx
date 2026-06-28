"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Search,
  Users,
  Newspaper,
  CalendarDays,
  FolderOpen,
  ArrowRight,
  Loader2,
} from "lucide-react"

interface SearchResult {
  type: string
  title: string
  description: string
  href: string
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get("q") || ""
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!query) {
      setLoading(false)
      return
    }

    const searchAll = async () => {
      setLoading(true)
      const allResults: SearchResult[] = []

      try {
        const membersRes = await fetch(`/api/admin/members?search=${encodeURIComponent(query)}`)
        if (membersRes.ok) {
          const membersData = await membersRes.json()
          const members = membersData.data || membersData || []
          members.slice(0, 5).forEach((m: any) => {
            allResults.push({
              type: "عضو",
              title: m.user?.name || m.name || "عضو",
              description: m.user?.email || m.email || "",
              href: "/ai.admin/members",
            })
          })
        }

        const newsRes = await fetch(`/api/admin/news?search=${encodeURIComponent(query)}`)
        if (newsRes.ok) {
          const newsData = await newsRes.json()
          const news = newsData.data || newsData || []
          news.slice(0, 5).forEach((n: any) => {
            allResults.push({
              type: "خبر",
              title: n.titleAr || n.titleEn || "خبر",
              description: n.status === "published" ? "منشور" : "مسودة",
              href: "/ai.admin/news",
            })
          })
        }

        const eventsRes = await fetch(`/api/admin/events?search=${encodeURIComponent(query)}`)
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json()
          const events = eventsData.data || eventsData || []
          events.slice(0, 5).forEach((e: any) => {
            allResults.push({
              type: "حدث",
              title: e.titleAr || e.titleEn || "حدث",
              description: e.location || "",
              href: "/ai.admin/events",
            })
          })
        }

        const projectsRes = await fetch(`/api/admin/projects?search=${encodeURIComponent(query)}`)
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json()
          const projects = projectsData.data || projectsData || []
          projects.slice(0, 5).forEach((p: any) => {
            allResults.push({
              type: "مشروع",
              title: p.titleAr || p.titleEn || "مشروع",
              description: p.status || "",
              href: "/ai.admin/projects",
            })
          })
        }
      } catch {
        // silent
      }

      setResults(allResults)
      setLoading(false)
    }

    searchAll()
  }, [query])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "عضو": return Users
      case "خبر": return Newspaper
      case "حدث": return CalendarDays
      case "مشروع": return FolderOpen
      default: return Search
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "عضو": return "bg-blue-100 text-blue-600"
      case "خبر": return "bg-green-100 text-green-600"
      case "حدث": return "bg-purple-100 text-purple-600"
      case "مشروع": return "bg-orange-100 text-orange-600"
      default: return "bg-gray-100 text-gray-600"
    }
  }

  return (
    <div className="space-y-6 dark:bg-[#0b1120] min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f1f5f9]">نتائج البحث</h1>
          {query && (
            <p className="text-gray-500 dark:text-[#94a3b8] text-sm mt-1">
              نتائج البحث عن &quot;<span className="font-medium text-[#1A3A6B] dark:text-[#60a5fa]">{query}</span>&quot;
            </p>
          )}
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-[#cbd5e1] hover:text-gray-800 dark:hover:text-[#f1f5f9] hover:bg-gray-100 dark:hover:bg-[#1e2d42] rounded-xl transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          العودة
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-[#1A3A6B] dark:text-[#60a5fa] animate-spin" />
            <p className="text-sm text-gray-500 dark:text-[#94a3b8]">جاري البحث...</p>
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white dark:bg-[#1a2332] rounded-2xl shadow-sm dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-[#2a3d56] p-12 text-center">
          <Search className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-[#3b4f6b]" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-[#cbd5e1] mb-2">
            {query ? "لا توجد نتائج" : "أدخل كلمة للبحث"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-[#94a3b8]">
            {query
              ? `لم يتم العثور على نتائج لـ "${query}"`
              : "اكتب كلمة في خانة البحث العلوية"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((result, index) => {
            const Icon = getTypeIcon(result.type)
            return (
              <Link
                key={index}
                href={result.href}
                className="flex items-center gap-4 p-4 bg-white dark:bg-[#1a2332] rounded-2xl shadow-sm dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-[#2a3d56] hover:shadow-md dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:border-[#1A3A6B]/20 dark:hover:border-[#60a5fa]/30 transition-all group"
              >
                <div className={`p-3 rounded-xl ${getTypeColor(result.type)}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#7a8ba3] bg-gray-100 dark:bg-[#111927] px-2 py-0.5 rounded">
                      {result.type}
                    </span>
                    <h3 className="font-semibold text-gray-800 dark:text-[#f1f5f9] group-hover:text-[#1A3A6B] dark:group-hover:text-[#60a5fa] transition-colors truncate">
                      {result.title}
                    </h3>
                  </div>
                  {result.description && (
                    <p className="text-sm text-gray-500 dark:text-[#94a3b8] mt-1 truncate">{result.description}</p>
                  )}
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 dark:text-[#7a8ba3] group-hover:text-[#1A3A6B] dark:group-hover:text-[#60a5fa] transition-colors" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AdminSearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#1A3A6B] animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
