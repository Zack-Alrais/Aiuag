"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Users,
  Newspaper,
  CalendarDays,
  FolderOpen,
  Image,
  MessageSquare,
  Coins,
  Clock,
  Loader2,
  Plus,
  CalendarCheck,
  UserCheck,
  FolderCog,
  ImagePlus,
  MessageCircle,
  TrendingUp,
  ArrowUpRight,
  Activity,
  Play,
  FileText,
  BarChart2,
  MapPin,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Globe,
  GraduationCap,
} from "lucide-react"

interface Analytics {
  overview: {
    totalMembers: number
    activeMembers: number
    pendingMembers: number
    newThisMonth: number
    newThisWeek: number
    totalNews: number
    totalEvents: number
    totalGallery: number
    totalContacts: number
    unreadContacts: number
  }
  memberGrowth: { month: string; count: number }[]
  membersByCountry: { country: string; count: number }[]
  membersByFaculty: { faculty: string; count: number }[]
  membersByStatus: { status: string; count: number }[]
  contentBreakdown: { name: string; nameEn: string; count: number; color: string }[]
  contactsByMonth: { month: string; count: number }[]
  donationsByMonth: { month: string; total: number }[]
  recentActivity: { id: string; userName: string; action: string; entity: string; entityId: string | null; createdAt: string }[]
}

const quickActions = [
  { label: "إضافة خبر", href: "/ai.admin/news", icon: Plus, gradient: "from-[#1A3A6B] to-[#2B5EA7]" },
  { label: "إنشاء حدث", href: "/ai.admin/events", icon: CalendarCheck, gradient: "from-[#2E7D32] to-[#4CAF50]" },
  { label: "عرض الأعضاء", href: "/ai.admin/members", icon: UserCheck, gradient: "from-[#D4A843] to-[#E0BC6A]" },
  { label: "إدارة المشاريع", href: "/ai.admin/projects", icon: FolderCog, gradient: "from-[#7B1FA2] to-[#AB47BC]" },
  { label: "المعرض", href: "/ai.admin/gallery", icon: ImagePlus, gradient: "from-[#C2185B] to-[#E91E63]" },
  { label: "الرسائل", href: "/ai.admin/contacts", icon: MessageCircle, gradient: "from-[#D84315] to-[#FF7043]" },
]

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch analytics")
        return res.json()
      })
      .then(setAnalytics)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1A3A6B] animate-spin" />
          <p className="text-sm text-gray-500">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 flex items-center gap-3">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-red-600 font-bold">!</span>
        </div>
        <div>
          <p className="font-medium">خطأ في تحميل لوحة التحكم</p>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  const o = analytics?.overview
  const maxGrowth = Math.max(...(analytics?.memberGrowth.map((m) => m.count) || [1]), 1)
  const maxCountry = Math.max(...(analytics?.membersByCountry.map((c) => c.count) || [1]), 1)
  const maxFaculty = Math.max(...(analytics?.membersByFaculty.map((f) => f.count) || [1]), 1)
  const maxContent = Math.max(...(analytics?.contentBreakdown.map((c) => c.count) || [1]), 1)

  const monthLabels: Record<string, string> = {
    "01": "يناير", "02": "فبراير", "03": "مارس", "04": "أبريل",
    "05": "مايو", "06": "يونيو", "07": "يوليو", "08": "أغسطس",
    "09": "سبتمبر", "10": "أكتوبر", "11": "نوفمبر", "12": "ديسمبر",
  }

  const formatMonth = (m: string) => {
    const [, month] = m.split("-")
    return monthLabels[month] || m
  }

  const getTimeAgo = (date: string) => {
    const now = new Date()
    const d = new Date(date)
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    if (diffMins < 1) return "الآن"
    if (diffMins < 60) return `منذ ${diffMins} د`
    if (diffHours < 24) return `منذ ${diffHours} س`
    return `منذ ${diffDays} ي`
  }

  const statusLabel = (s: string) => {
    switch (s) {
      case "approved": return "معتمد"
      case "pending": return "معلق"
      case "rejected": return "مرفوض"
      default: return s
    }
  }

  const statusColor = (s: string) => {
    switch (s) {
      case "approved": return "bg-emerald-500"
      case "pending": return "bg-amber-500"
      case "rejected": return "bg-red-500"
      default: return "bg-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-l from-[#1A3A6B] via-[#2B5EA7] to-[#1A3A6B] rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative">
          <h1 className="text-2xl font-bold mb-2">مرحباً بك في لوحة التحكم</h1>
          <p className="text-white/80 text-sm">رابطة خريجي جامعة أفريقيا العالمية - تحليل وإدارة الموقع</p>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
              <Users className="w-4 h-4" />
              <span className="text-sm">{o?.totalMembers ?? 0} عضو</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
              <UserPlus className="w-4 h-4" />
              <span className="text-sm">{o?.newThisMonth ?? 0} جديد هذا الشهر</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{o?.pendingMembers ?? 0} معلق</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">{o?.unreadContacts ?? 0} رسالة جديدة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الأعضاء", value: o?.totalMembers ?? 0, icon: Users, color: "text-[#1A3A6B]", bg: "bg-[#1A3A6B]/10" },
          { label: "أعضاء نشطون", value: o?.activeMembers ?? 0, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "جديد هذا الأسبوع", value: o?.newThisWeek ?? 0, icon: UserPlus, color: "text-[#D4A843]", bg: "bg-[#D4A843]/10" },
          { label: "جديد هذا الشهر", value: o?.newThisMonth ?? 0, icon: TrendingUp, color: "text-[#7B1FA2]", bg: "bg-purple-50" },
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-[#1a2332] rounded-2xl border border-gray-100 dark:border-[#2a3d56] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value.toLocaleString()}</p>
            <p className="text-sm text-gray-500 dark:text-[#94a3b8] mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-gray-100 dark:border-[#2a3d56] p-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-[#f1f5f9] mb-4 flex items-center gap-2">
          <div className="w-1 h-5 bg-[#D4A843] rounded-full" />
          إجراءات سريعة
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`flex flex-col items-center justify-center gap-3 p-5 text-white rounded-2xl bg-gradient-to-br ${action.gradient} hover:shadow-lg hover:scale-105 transition-all`}
            >
              <action.icon className="w-7 h-7" />
              <span className="text-sm font-medium text-center">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Growth Chart */}
        <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-gray-100 dark:border-[#2a3d56] p-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-[#f1f5f9] mb-5 flex items-center gap-2">
            <div className="w-1 h-5 bg-[#1A3A6B] rounded-full" />
            نمو الأعضاء
          </h2>
          <div className="flex items-end gap-2 h-40">
            {(analytics?.memberGrowth || []).map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-[#1A3A6B] dark:text-[#60a5fa]">{item.count}</span>
                <div
                  className="w-full bg-gradient-to-t from-[#1A3A6B] to-[#2B5EA7] rounded-t-lg transition-all"
                  style={{ height: `${(item.count / maxGrowth) * 100}%`, minHeight: 4 }}
                />
                <span className="text-[9px] text-gray-500 dark:text-[#7a8ba3]">{formatMonth(item.month)}</span>
              </div>
            ))}
            {(!analytics?.memberGrowth || analytics.memberGrowth.length === 0) && (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">لا توجد بيانات</div>
            )}
          </div>
        </div>

        {/* Content Breakdown */}
        <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-gray-100 dark:border-[#2a3d56] p-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-[#f1f5f9] mb-5 flex items-center gap-2">
            <div className="w-1 h-5 bg-[#D4A843] rounded-full" />
            توزيع المحتوى
          </h2>
          <div className="space-y-3">
            {(analytics?.contentBreakdown || []).map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 dark:text-[#cbd5e1] w-16 text-left">{item.name}</span>
                <div className="flex-1 h-5 bg-gray-100 dark:bg-[#111927] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(item.count / maxContent) * 100}%`, backgroundColor: item.color, minWidth: item.count > 0 ? 8 : 0 }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-[#e2e8f0] w-8 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Members by Country */}
        <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-gray-100 dark:border-[#2a3d56] p-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-[#f1f5f9] mb-5 flex items-center gap-2">
            <div className="w-1 h-5 bg-[#2E7D32] rounded-full" />
            الأعضاء حسب الدولة
          </h2>
          <div className="space-y-3">
            {(analytics?.membersByCountry || []).slice(0, 8).map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <Globe className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="text-xs text-gray-600 dark:text-[#cbd5e1] w-20 truncate">{item.country}</span>
                <div className="flex-1 h-5 bg-gray-100 dark:bg-[#111927] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] rounded-full transition-all"
                    style={{ width: `${(item.count / maxCountry) * 100}%`, minWidth: item.count > 0 ? 8 : 0 }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-[#e2e8f0] w-8 text-right">{item.count}</span>
              </div>
            ))}
            {(!analytics?.membersByCountry || analytics.membersByCountry.length === 0) && (
              <div className="text-center text-gray-400 text-sm py-4">لا توجد بيانات</div>
            )}
          </div>
        </div>

        {/* Members by Faculty */}
        <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-gray-100 dark:border-[#2a3d56] p-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-[#f1f5f9] mb-5 flex items-center gap-2">
            <div className="w-1 h-5 bg-[#7B1FA2] rounded-full" />
            الأعضاء حسب الكلية
          </h2>
          <div className="space-y-3">
            {(analytics?.membersByFaculty || []).slice(0, 8).map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <GraduationCap className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="text-xs text-gray-600 dark:text-[#cbd5e1] w-20 truncate">{item.faculty}</span>
                <div className="flex-1 h-5 bg-gray-100 dark:bg-[#111927] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#7B1FA2] to-[#AB47BC] rounded-full transition-all"
                    style={{ width: `${(item.count / maxFaculty) * 100}%`, minWidth: item.count > 0 ? 8 : 0 }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-[#e2e8f0] w-8 text-right">{item.count}</span>
              </div>
            ))}
            {(!analytics?.membersByFaculty || analytics.membersByFaculty.length === 0) && (
              <div className="text-center text-gray-400 text-sm py-4">لا توجد بيانات</div>
            )}
          </div>
        </div>
      </div>

      {/* Members by Status */}
      <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-gray-100 dark:border-[#2a3d56] p-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-[#f1f5f9] mb-5 flex items-center gap-2">
          <div className="w-1 h-5 bg-[#D4A843] rounded-full" />
          حالة الأعضاء
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {(analytics?.membersByStatus || []).map((item, i) => (
            <div key={i} className="text-center p-4 bg-gray-50 dark:bg-[#111927] rounded-xl">
              <div className={`w-3 h-3 rounded-full ${statusColor(item.status)} mx-auto mb-2`} />
              <p className="text-2xl font-bold text-gray-800 dark:text-[#f1f5f9]">{item.count}</p>
              <p className="text-xs text-gray-500 dark:text-[#94a3b8] mt-1">{statusLabel(item.status)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-gray-100 dark:border-[#2a3d56] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800 dark:text-[#f1f5f9] flex items-center gap-2">
            <div className="w-1 h-5 bg-[#D84315] rounded-full" />
            آخر النشاطات
          </h2>
          <Link
            href="/ai.admin/activity"
            className="text-sm text-[#1A3A6B] dark:text-[#60a5fa] hover:text-[#2B5EA7] dark:hover:text-[#93c5fd] flex items-center gap-1 font-medium transition-colors"
          >
            عرض الكل
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-2">
          {(analytics?.recentActivity || []).slice(0, 10).map((act) => (
            <div key={act.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1e2d42] transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#1A3A6B]/10 dark:bg-[#1A3A6B]/20 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4 text-[#1A3A6B] dark:text-[#60a5fa]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-[#e2e8f0]">
                  <span className="font-medium">{act.userName}</span>
                  <span className="text-gray-500 dark:text-[#94a3b8] mx-1">{act.action}</span>
                  <span className="font-medium">{act.entity}</span>
                </p>
              </div>
              <span className="text-[10px] text-gray-400 dark:text-[#7a8ba3] shrink-0">{getTimeAgo(act.createdAt)}</span>
            </div>
          ))}
          {(!analytics?.recentActivity || analytics.recentActivity.length === 0) && (
            <div className="text-center py-8 text-gray-400 text-sm">لا توجد نشاطات حديثة</div>
          )}
        </div>
      </div>
    </div>
  )
}
