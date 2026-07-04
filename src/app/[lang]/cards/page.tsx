"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Loader2, Search, Users, CreditCard, Plus, Download, Printer, X, Check } from "lucide-react"
import { MembershipCardEngine } from "@/components/cards/membership-card-engine"

interface MemberCardItem {
  id: string
  nameAr: string
  nameEn: string | null
  membershipNumber: string | null
  membershipType: string | null
  status: string
  faculty: string | null
  specialization: string | null
  graduationYear: number | null
  phone: string | null
  email: string | null
  cardPhoto: string | null
  user: { id: string; name: string; email: string; image: string | null }
}

export default function CardsPage({ params }: { params: Promise<{ lang: string }> }) {
  const [lang, setLang] = useState("ar")
  const isArabic = lang === "ar"
  const { data: session, status: authStatus } = useSession()

  const [members, setMembers] = useState<MemberCardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const [generating, setGenerating] = useState(false)
  const [generatedCard, setGeneratedCard] = useState<{ frontHtml: string; backHtml: string } | null>(null)
  const [generatedError, setGeneratedError] = useState("")

  useEffect(() => { params.then((p) => setLang(p.lang)) }, [params])

  useEffect(() => {
    fetch("/api/members?status=approved&limit=500")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setMembers(json.data as MemberCardItem[])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleGenerateCard = async () => {
    setGenerating(true)
    setGeneratedError("")
    setGeneratedCard(null)
    try {
      const res = await fetch("/api/cards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang, format: "html" }),
      })
      const json = await res.json()
      if (json.success) {
        setGeneratedCard(json.card)
      } else {
        setGeneratedError(json.error || (isArabic ? "فشل في إنشاء البطاقة" : "Failed to generate card"))
      }
    } catch {
      setGeneratedError(isArabic ? "خطأ في الاتصال" : "Connection error")
    } finally {
      setGenerating(false)
    }
  }

  const handlePrint = (html: string) => {
    const w = window.open("", "_blank")
    if (!w) return
    w.document.write(`
      <!DOCTYPE html><html><head><title>${isArabic ? "بطاقة العضوية" : "Membership Card"}</title>
      <style>body{margin:0;padding:20px}@media print{body{margin:0;padding:10px}}</style></head>
      <body>${html}<script>setTimeout(function(){window.print()},500)<\/script></body></html>
    `)
    w.document.close()
  }

  const handleDownload = (html: string) => {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `membership-card-${session?.user?.email || "card"}.html`
    a.click()
  }

  const filtered = members.filter((m) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      m.nameAr?.toLowerCase().includes(q) ||
      m.nameEn?.toLowerCase().includes(q) ||
      m.membershipNumber?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.faculty?.toLowerCase().includes(q) ||
      m.specialization?.toLowerCase().includes(q)
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-6 sm:py-10">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text mb-2">
            {isArabic ? "أعضاء الرابطة" : "Association Members"}
          </h1>
          <p className="text-text-secondary max-w-xl mx-auto">
            {isArabic
              ? "بطاقات أعضاء رابطة خريجي جامعة أفريقيا العالمية – تصفح وابحث عن الأعضاء"
              : "Membership cards of AIUAG – browse and search for members"}
          </p>

          {/* Generate Card Button (logged-in only) */}
          {authStatus === "authenticated" && (
            <div className="mt-6">
              <button
                onClick={handleGenerateCard}
                disabled={generating}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 text-base font-bold"
              >
                {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                {generating
                  ? (isArabic ? "جاري الإنشاء..." : "Generating...")
                  : (isArabic ? "إنشاء بطاقتي" : "Create My Card")}
              </button>
            </div>
          )}
        </div>

        {/* Generated Card Preview */}
        {generatedCard && (
          <div className="mb-10 bg-surface rounded-2xl border border-gray-200 p-6 shadow-sm max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-bold text-text">
                  {isArabic ? "تم إنشاء البطاقة" : "Card Created"}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handlePrint(generatedCard.frontHtml)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  <Printer className="w-4 h-4" /> {isArabic ? "طباعة" : "Print"}
                </button>
                <button onClick={() => handleDownload(generatedCard.frontHtml)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">
                  <Download className="w-4 h-4" /> {isArabic ? "تحميل" : "Download"}
                </button>
                <button onClick={() => setGeneratedCard(null)} className="p-1.5 text-text-light hover:text-text rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4" dangerouslySetInnerHTML={{ __html: generatedCard.frontHtml + generatedCard.backHtml }} />
          </div>
        )}

        {generatedError && (
          <div className="mb-6 max-w-md mx-auto bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center">
            {generatedError}
          </div>
        )}

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isArabic ? "ابحث عن عضو..." : "Search for a member..."}
              className="w-full pr-10 pl-4 py-3 bg-surface border border-gray-200 rounded-xl text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Members Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <CreditCard className="w-16 h-16 text-text-light mx-auto mb-4" />
            <h3 className="text-lg font-bold text-text mb-2">
              {isArabic ? "لا يوجد أعضاء" : "No members found"}
            </h3>
            <p className="text-text-secondary">
              {search
                ? (isArabic ? "لا توجد نتائج مطابقة للبحث" : "No results matching your search")
                : (isArabic ? "لا يوجد أعضاء بعد" : "No members yet")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((m) => (
              <div key={m.id} className="flex justify-center">
                <MembershipCardEngine
                  member={{
                    id: m.id,
                    nameAr: m.nameAr || m.user.name,
                    nameEn: m.nameEn || m.user.name,
                    membershipNumber: m.membershipNumber || "",
                    memberType: m.membershipType || m.status,
                    photo: m.cardPhoto || m.user.image || undefined,
                    specialization: m.faculty || m.specialization || undefined,
                    graduationYear: m.graduationYear || undefined,
                    phone: m.phone || undefined,
                    email: m.email || m.user.email || undefined,
                  }}
                  showActions={false}
                  size="sm"
                />
              </div>
            ))}
          </div>
        )}

        {/* Count */}
        <div className="text-center mt-8 text-sm text-text-light">
          {isArabic
            ? `إجمالي الأعضاء: ${members.length}`
            : `Total members: ${members.length}`}
        </div>
      </div>
    </div>
  )
}