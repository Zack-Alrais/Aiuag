"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Coins, DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle,
  XCircle, RefreshCw, Download, Search, Filter, Calendar,
  ArrowUpRight, ArrowDownRight, FileText, Loader2,
} from "lucide-react"

interface DonationStats {
  today: { count: number; total: number }
  month: { count: number; total: number }
  year: { count: number; total: number }
  successful: number
  failed: number
  pending: number
  refunded: number
}

interface Donation {
  id: string
  donationNumber: string
  donorName: string
  donorEmail: string | null
  amount: number
  currency: string
  gateway: string | null
  status: string
  isAnonymous: boolean
  createdAt: string
}

export default function DonationsManagement() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [stats, setStats] = useState<DonationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchDonations = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      })
      const res = await fetch(`/api/admin/donations?${params}`)
      const data = await res.json()
      setDonations(data.donations || [])
      setTotalPages(data.totalPages || 1)

      // Compute stats from donations
      if (data.stats) {
        setStats(data.stats)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, searchTerm, dateFrom, dateTo])

  useEffect(() => { fetchDonations() }, [fetchDonations])

  const statusMap: Record<string, { label: string; labelEn: string; color: string; icon: React.ReactNode }> = {
    completed: { label: "مكتمل", labelEn: "Completed", color: "text-green-600 bg-green-50", icon: <CheckCircle className="w-4 h-4" /> },
    pending: { label: "قيد الانتظار", labelEn: "Pending", color: "text-yellow-600 bg-yellow-50", icon: <Clock className="w-4 h-4" /> },
    processing: { label: "قيد المعالجة", labelEn: "Processing", color: "text-blue-600 bg-blue-50", icon: <RefreshCw className="w-4 h-4" /> },
    failed: { label: "فشل", labelEn: "Failed", color: "text-red-600 bg-red-50", icon: <XCircle className="w-4 h-4" /> },
    refunded: { label: "مسترجع", labelEn: "Refunded", color: "text-purple-600 bg-purple-50", icon: <RefreshCw className="w-4 h-4" /> },
  }

  const gatewayNames: Record<string, string> = {
    bankak: "بنكك",
    fawry: "فوري",
    okash: "أوكاش",
    stripe: "Stripe",
    paypal: "PayPal",
    verifone: "2Checkout",
  }

  const statCards = [
    { label: "اليوم", labelEn: "Today", value: stats?.today?.count || 0, total: stats?.today?.total || 0, icon: <Calendar className="w-6 h-6" />, color: "bg-blue-500", trend: "up" },
    { label: "هذا الشهر", labelEn: "This Month", value: stats?.month?.count || 0, total: stats?.month?.total || 0, icon: <TrendingUp className="w-6 h-6" />, color: "bg-green-500", trend: "up" },
    { label: "هذا العام", labelEn: "This Year", value: stats?.year?.count || 0, total: stats?.year?.total || 0, icon: <DollarSign className="w-6 h-6" />, color: "bg-purple-500", trend: "up" },
    { label: "مكتملة", labelEn: "Successful", value: stats?.successful || 0, total: 0, icon: <CheckCircle className="w-6 h-6" />, color: "bg-emerald-500", trend: "up" },
    { label: "فشل", labelEn: "Failed", value: stats?.failed || 0, total: 0, icon: <XCircle className="w-6 h-6" />, color: "bg-red-500", trend: "down" },
    { label: "قيد الانتظار", labelEn: "Pending", value: stats?.pending || 0, total: 0, icon: <Clock className="w-6 h-6" />, color: "bg-yellow-500", trend: "down" },
    { label: "مسترجعة", labelEn: "Refunded", value: stats?.refunded || 0, total: 0, icon: <RefreshCw className="w-6 h-6" />, color: "bg-orange-500", trend: "down" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة التبرعات</h1>
          <p className="text-sm text-gray-500">متابعة وإدارة جميع التبرعات</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#1A3A6B] text-white rounded-xl hover:bg-[#0f2547] transition-colors text-sm font-medium">
          <Download className="w-4 h-4" />
          تصدير التقرير
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                {stat.icon}
              </div>
              {stat.trend === "up" ? (
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            {stat.total > 0 && (
              <div className="text-xs text-gray-400 mt-1">${stat.total.toLocaleString()}</div>
            )}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
              className="w-full ps-10 pe-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B]"
              placeholder="بحث بالاسم أو البريد أو رقم التبرع..."
              dir="rtl"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B]"
          >
            <option value="all">جميع الحالات</option>
            <option value="completed">مكتمل</option>
            <option value="pending">قيد الانتظار</option>
            <option value="failed">فشل</option>
            <option value="refunded">مسترجع</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A3A6B]/20"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1A3A6B]/20"
          />
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#1A3A6B] animate-spin" />
          </div>
        ) : donations.length === 0 ? (
          <div className="text-center py-12">
            <Coins className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">لا توجد تبرعات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">رقم التبرع</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">المتبرع</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">المبلغ</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">البوابة</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">الحالة</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#1A3A6B]">{d.donationNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{d.isAnonymous ? "مجهول" : d.donorName}</div>
                      <div className="text-xs text-gray-400">{d.donorEmail}</div>
                    </td>
                    <td className="px-4 py-3 font-bold">{d.amount} {d.currency}</td>
                    <td className="px-4 py-3 text-gray-600">{gatewayNames[d.gateway || ""] || d.gateway}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusMap[d.status]?.color || ""}`}>
                        {statusMap[d.status]?.icon}
                        {statusMap[d.status]?.label || d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(d.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-4 border-t">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded-lg border text-sm disabled:opacity-50"
            >
              السابق
            </button>
            <span className="text-sm text-gray-500">صفحة {page} من {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded-lg border text-sm disabled:opacity-50"
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
