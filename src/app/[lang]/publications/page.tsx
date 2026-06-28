"use client"

import { useState, useEffect } from "react"
import { FileText, Download, Calendar, Search, Filter, Loader2 } from "lucide-react"
import HeroSection from "@/components/ui/hero-section"

interface Publication {
  id: string
  title: string
  titleEn: string | null
  description: string | null
  category: string | null
  fileUrl: string | null
  imageUrl: string | null
  createdAt: string
}

export default function PublicationsPage({ params }: { params: Promise<{ lang: string }> }) {
  const [lang, setLang] = useState("ar")
  const isArabic = lang === "ar"
  const dir = isArabic ? "rtl" : "ltr"

  const [publications, setPublications] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    params.then((p) => setLang(p.lang))
  }, [params])

  useEffect(() => {
    fetch("/api/public/publications?limit=50")
      .then((res) => res.json())
      .then((data) => setPublications(Array.isArray(data) ? data : []))
      .catch(() => setPublications([]))
      .finally(() => setLoading(false))
  }, [])

  const categories = [
    { id: "all", label: isArabic ? "الكل" : "All" },
    ...Array.from(new Set(publications.map((p) => p.category).filter(Boolean))).map((cat) => ({
      id: cat!,
      label: cat!,
    })),
  ]

  const filtered = publications.filter((pub) => {
    const matchesSearch =
      !searchQuery ||
      pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pub.titleEn && pub.titleEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (pub.description && pub.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || pub.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div dir={dir}>
      <HeroSection
        pageSlug="publications"
        lang={lang}
        defaultTitle={isArabic ? "المنشورات" : "Publications"}
        defaultSubtitle={isArabic ? "تحميل المنشورات والتقارير والمجلات الصادرة عن الرابطة" : "Download publications, reports, and magazines issued by the association"}
      />

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isArabic ? "ابحث عن منشور..." : "Search publications..."}
                className="w-full h-12 rounded-xl border border-border bg-surface ps-11 pe-4 text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="relative">
              <Filter className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-12 rounded-xl border border-border bg-surface ps-10 pe-8 text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count */}
          <p className="text-text-secondary text-sm mb-6 max-w-4xl mx-auto">
            {isArabic ? `عدد النتائج: ${filtered.length}` : `Results: ${filtered.length}`}
          </p>

          {/* Publications Grid */}
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
              <p className="text-text-secondary mt-4">{isArabic ? "جاري التحميل..." : "Loading..."}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-text-secondary">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">{isArabic ? "لا توجد منشورات" : "No publications found"}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {filtered.map((pub) => (
                <div key={pub.id} className="bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group">
                  <div className="h-36 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative overflow-hidden">
                    {pub.imageUrl ? (
                      <img src={pub.imageUrl} alt={pub.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <FileText className="w-12 h-12 text-primary/30 group-hover:scale-110 transition-transform" />
                    )}
                    {pub.category && (
                      <div className="absolute top-3 end-3">
                        <span className="px-2.5 py-0.5 bg-secondary text-white text-xs font-bold rounded-full">
                          {pub.category}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold text-text mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {isArabic ? pub.title : pub.titleEn || pub.title}
                    </h3>
                    {pub.description && (
                      <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                        {pub.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-text-secondary mb-4">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(pub.createdAt).toLocaleDateString(isArabic ? "ar-EG" : "en-US", { year: "numeric", month: "short" })}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-xs text-text-light font-medium">PDF</span>
                      {pub.fileUrl ? (
                        <a
                          href={pub.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-light transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {isArabic ? "تحميل" : "Download"}
                        </a>
                      ) : (
                        <button disabled className="flex items-center gap-1.5 px-4 py-2 bg-gray-200 text-gray-400 text-xs font-bold rounded-lg cursor-not-allowed">
                          <Download className="w-3.5 h-3.5" />
                          {isArabic ? "غير متاح" : "N/A"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
