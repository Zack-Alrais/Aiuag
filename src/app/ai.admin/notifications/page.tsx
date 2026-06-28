"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell, Check, Trash2, Eye, Loader2, Filter } from "lucide-react"

interface Notification {
  id: string
  titleAr: string
  titleEn: string
  messageAr: string
  messageEn: string
  type: string
  entityType: string | null
  entityId: string | null
  isRead: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const fetchNotifications = useCallback(async () => {
    try {
      const url = filter === "unread" ? "/api/admin/notifications?unread=true" : "/api/admin/notifications"
      const res = await fetch(url)
      const data = await res.json()
      setNotifications(data.data || [])
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const markAsRead = async (id: string) => {
    await fetch(`/api/admin/notifications/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    })
    fetchNotifications()
  }

  const markAllAsRead = async () => {
    await fetch("/api/admin/notifications/read-all", { method: "PUT" })
    fetchNotifications()
  }

  const deleteNotification = async (id: string) => {
    await fetch(`/api/admin/notifications/${id}`, { method: "DELETE" })
    fetchNotifications()
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success": return "bg-green-100 text-green-700"
      case "warning": return "bg-yellow-100 text-yellow-700"
      case "error": return "bg-red-100 text-red-700"
      default: return "bg-blue-100 text-blue-700"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "success": return "نجاح"
      case "warning": return "تحذير"
      case "error": return "خطأ"
      default: return "معلومات"
    }
  }

  const getEntityLabel = (entityType: string | null) => {
    switch (entityType) {
      case "member": return "عضو"
      case "news": return "خبر"
      case "event": return "حدث"
      case "contact": return "اتصال"
      case "donation": return "تبرع"
      case "newsletter": return "نشرة"
      case "gallery": return "معرض"
      default: return ""
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="space-y-6 dark:bg-[#0b1120] min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-blue-600 dark:text-[#60a5fa]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f1f5f9]">الإشعارات</h1>
            <p className="text-sm text-gray-500 dark:text-[#94a3b8]">
              {unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : "جميع الإشعارات مقروءة"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#1e2d42] rounded-lg p-1">
            <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === "all" ? "bg-white dark:bg-[#1a2332] shadow text-gray-800 dark:text-[#f1f5f9]" : "text-gray-500 dark:text-[#94a3b8] hover:text-gray-700 dark:hover:text-[#f1f5f9]"}`}>
              الكل
            </button>
            <button onClick={() => setFilter("unread")} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === "unread" ? "bg-white dark:bg-[#1a2332] shadow text-gray-800 dark:text-[#f1f5f9]" : "text-gray-500 dark:text-[#94a3b8] hover:text-gray-700 dark:hover:text-[#f1f5f9]"}`}>
              غير مقروءة
            </button>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              <Check className="w-4 h-4" />
              قراءة الكل
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 dark:text-[#60a5fa] animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white dark:bg-[#1a2332] rounded-xl shadow-sm dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-[#2a3d56] p-12 text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-[#3b4f6b]" />
          <h3 className="text-lg font-semibold text-gray-600 dark:text-[#cbd5e1] mb-2">لا توجد إشعارات</h3>
          <p className="text-sm text-gray-500 dark:text-[#94a3b8]">
            {filter === "unread" ? "جميع الإشعارات مقروءة" : "لم تُستلم أي إشعارات بعد"}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1a2332] rounded-xl shadow-sm dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-[#2a3d56] overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-[#253347]">
            {notifications.map((notif) => (
              <div key={notif.id} className={`flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-[#1e2d42] transition-colors ${!notif.isRead ? "bg-blue-50/30 dark:bg-[#0d1a30]" : ""}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${getTypeColor(notif.type)}`}>
                  {notif.type === "success" ? "✓" : notif.type === "warning" ? "⚠" : notif.type === "error" ? "✕" : "ℹ"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-sm ${!notif.isRead ? "font-bold text-gray-900 dark:text-[#ffffff]" : "font-medium text-gray-700 dark:text-[#e2e8f0]"}`}>
                      {notif.titleAr}
                    </h3>
                    {!notif.isRead && (
                      <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded">جديد</span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getTypeColor(notif.type)}`}>
                      {getTypeLabel(notif.type)}
                    </span>
                    {notif.entityType && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-[#111927] text-gray-600 dark:text-[#94a3b8] rounded text-[10px] font-medium">
                        {getEntityLabel(notif.entityType)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-[#cbd5e1] mb-1">{notif.messageAr}</p>
                  <p className="text-xs text-gray-400 dark:text-[#7a8ba3]">{new Date(notif.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!notif.isRead && (
                    <button onClick={() => markAsRead(notif.id)} className="p-2 hover:bg-gray-200 dark:hover:bg-[#2a3d56] rounded-lg text-gray-400 dark:text-[#94a3b8] hover:text-blue-600 dark:hover:text-[#60a5fa] transition-colors" title="تعليم كمقروء">
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => deleteNotification(notif.id)} className="p-2 hover:bg-gray-200 dark:hover:bg-[#2a3d56] rounded-lg text-gray-400 dark:text-[#94a3b8] hover:text-red-600 dark:hover:text-[#f87171] transition-colors" title="حذف">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
