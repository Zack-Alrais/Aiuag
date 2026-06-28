"use client"

import { useState, useEffect } from "react"
import { FileText, Download, Calendar, BarChart3, Activity, Building2 } from "lucide-react"
import { useParams } from "next/navigation"
import HeroSection from "@/components/ui/hero-section"

interface Report {
  id: string
  title: string
  titleEn: string | null
  description: string | null
  category: string | null
  fileUrl: string | null
  year: number | null
  createdAt: string
}

export default function ReportsPage() {
  const params = useParams()
  const lang = (params as { lang?: string })?.lang || "ar"
  const isArabic = lang === "ar"
  const dir = isArabic ? "rtl" : "ltr"

  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/public/reports?limit=50")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setReports(Array.isArray(data) ? data : []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false))
  }, [])

  const annualReports = reports.filter((r) => r.category === "annual" || (!r.category && r.year))
  const financialReports = reports.filter((r) => r.category === "financial")
  const activityReports = reports.filter((r) => r.category === "activity" || r.category === "quarterly")
  const otherReports = reports.filter((r) => !annualReports.includes(r) && !financialReports.includes(r) && !activityReports.includes(r))

  const ReportCard = ({ report }: { report: Report }) => (
    <div className="bg-surface rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all group flex items-start gap-4">
      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
        <BarChart3 className="w-7 h-7 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-bold text-text mb-1 group-hover:text-primary transition-colors">
          {isArabic ? report.title : report.titleEn || report.title}
        </h3>
        {report.description && (
          <p className="text-text-secondary text-sm mb-3 line-clamp-2">
            {report.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            {report.year ? (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{report.year}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(report.createdAt).toLocaleDateString(isArabic ? "ar-EG" : "en-US", { year: "numeric", month: "short" })}</span>
              </div>
            )}
          </div>
          {report.fileUrl ? (
            <a
              href={report.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-light transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              {isArabic ? "تحميل" : "Download"}
            </a>
          ) : (
            <button disabled className="flex items-center gap-1.5 px-4 py-2 bg-gray-300 text-gray-500 text-xs font-bold rounded-lg cursor-not-allowed">
              <Download className="w-3.5 h-3.5" />
              {isArabic ? "تحميل" : "Download"}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  const renderSection = (title: string, icon: React.ReactNode, items: Report[]) => {
    if (items.length === 0) return null
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-text mb-6 flex items-center gap-3">
            {icon}
            {title}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <div dir={dir}>
      <HeroSection
        pageSlug="reports"
        lang={lang}
        defaultTitle={isArabic ? "التقارير" : "Reports"}
        defaultSubtitle={isArabic
          ? "تحميل التقارير السنوية والمالية والنشاطات الصادرة عن الرابطة"
          : "Download annual, financial, and activity reports issued by the association"}
        badge={
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm">
            <FileText className="w-4 h-4" />
            <span>{isArabic ? "تقاريرنا" : "Our Reports"}</span>
          </div>
        }
      />

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : reports.length === 0 ? (
        <section className="py-20 bg-background">
          <div className="text-center py-20 text-text-secondary">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">{isArabic ? "لا توجد تقارير حالياً" : "No reports available yet"}</p>
          </div>
        </section>
      ) : (
        <>
          {renderSection(
            isArabic ? "التقارير السنوية" : "Annual Reports",
            <BarChart3 className="w-6 h-6 text-primary" />,
            annualReports.length > 0 ? annualReports : otherReports
          )}
          {renderSection(
            isArabic ? "التقارير المالية" : "Financial Reports",
            <Building2 className="w-6 h-6 text-primary" />,
            financialReports
          )}
          {renderSection(
            isArabic ? "تقارير النشاطات" : "Activity Reports",
            <Activity className="w-6 h-6 text-primary" />,
            activityReports
          )}
        </>
      )}
    </div>
  )
}
