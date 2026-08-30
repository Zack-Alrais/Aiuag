"use client"

import { useState, useEffect } from "react"
import { Save, Loader2, CheckCircle, XCircle } from "lucide-react"
import { useAdminLang } from "../admin-lang"

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
}

const ALL_PAGES = [
  { id: "dashboard", ar: "الرئيسية", en: "Dashboard" },
  { id: "notifications", ar: "الإشعارات", en: "Notifications" },
  { id: "news", ar: "الأخبار", en: "News" },
  { id: "events", ar: "الأحداث", en: "Events" },
  { id: "posts", ar: "المنشورات التفاعلية", en: "Interactive Posts" },
  { id: "comments", ar: "التعليقات", en: "Comments" },
  { id: "videos", ar: "الفيديوهات", en: "Videos" },
  { id: "gallery", ar: "المعرض", en: "Gallery" },
  { id: "members", ar: "الأعضاء", en: "Members" },
  { id: "cards", ar: "البطاقات", en: "Cards" },
  { id: "board", ar: "مجلس الإدارة", en: "Board" },
  { id: "committees", ar: "اللجان", en: "Committees" },
  { id: "secretariat", ar: "الأمانة العامة", en: "Secretariat" },
  { id: "projects", ar: "المشاريع", en: "Projects" },
  { id: "publications", ar: "المنشورات", en: "Publications" },
  { id: "branches", ar: "الفروع", en: "Branches" },
  { id: "partners", ar: "الشركاء", en: "Partners" },
  { id: "contacts", ar: "رسائل الاتصال", en: "Contact Messages" },
  { id: "donations", ar: "التبرعات", en: "Donations" },
  { id: "settings", ar: "الإعدادات", en: "Settings" },
  { id: "backup", ar: "النسخ الاحتياطي", en: "Backup" },
  { id: "graduates", ar: "الخريجين", en: "Graduates" },
  { id: "activity", ar: "تتبع النشاط", en: "Activity Log" },
  { id: "permissions", ar: "الصلاحيات", en: "Permissions" },
]

export default function PermissionsPage() {
  const { lang, t } = useAdminLang()
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [allPages, setAllPages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editPerms, setEditPerms] = useState<string[]>([])
  const [success, setSuccess] = useState("")
  const [currentUserEmail, setCurrentUserEmail] = useState("")

  const fetchData = async () => {
    setLoading(true)
    try {
      const [permRes, meRes] = await Promise.all([
        fetch("/api/admin/permissions"),
        fetch("/api/admin/auth/me"),
      ])
      const data = await permRes.json()
      const meData = await meRes.json()
      setAdmins(data.data || [])
      setAllPages(data.allPages || [])
      setCurrentUserEmail(meData.email?.toLowerCase() || "")
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])
  const isSuper = currentUserEmail === "pen@cube.com"

  const togglePerm = (page: string) => {
    setEditPerms((prev) => prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page])
  }

  const selectAll = () => setEditPerms([...allPages])
  const deselectAll = () => setEditPerms([])

  const handleSave = async (userId: string) => {
    setSaving(userId)
    setSuccess("")
    try {
      const res = await fetch("/api/admin/permissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, permissions: editPerms }),
      })
      if (res.ok) {
        setAdmins((prev) => prev.map((a) => a.id === userId ? { ...a, permissions: editPerms } : a))
        setEditing(null)
        setSuccess(t("permissions.saved"))
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0f2547] dark:text-white">{t("permissions.title")}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t("permissions.subtitle")}</p>
        </div>
        {success && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl text-sm text-green-700 dark:text-green-400">
            <CheckCircle className="w-4 h-4" /> {success}
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400"><Loader2 className="w-8 h-8 mx-auto animate-spin mb-2" /><span>{t("permissions.loading")}</span></div>
      ) : (
        <div className="space-y-6">
          {admins.map((admin) => (
            <div key={admin.id} className="bg-white dark:bg-[#1a2332] rounded-2xl border border-gray-100 dark:border-[#2a3d56] shadow-sm overflow-hidden">
              {/* Admin Header */}
              <div className="p-5 flex items-center gap-4 border-b border-gray-100 dark:border-[#2a3d56]">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1A3A6B] to-[#2B5EA7] flex items-center justify-center text-white font-bold text-lg">
                  {admin.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#0f2547] dark:text-white">{admin.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{admin.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  admin.role === "admin" ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" : "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                }`}>
                  {admin.role === "admin" ? t("permissions.role.admin") : t("permissions.role.editor")}
                </span>
                {editing !== admin.id ? (
                  isSuper ? (
                    <button
                      onClick={() => { setEditing(admin.id); setEditPerms([...admin.permissions]) }}
                      className="px-4 py-2 border border-gray-200 dark:border-[#3b4f6b] rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1e2d42] transition-colors"
                    >
                      {t("permissions.editBtn")}
                    </button>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 dark:bg-[#2a3d56] rounded-xl text-xs text-gray-400 dark:text-gray-500">{t("permissions.viewOnly")}</span>
                  )
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(null)} className="px-4 py-2 border border-gray-200 dark:border-[#3b4f6b] rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1e2d42] transition-colors">
                      {t("common.cancel")}
                    </button>
                    <button onClick={() => handleSave(admin.id)} disabled={saving === admin.id}
                      className="px-4 py-2 bg-[#1A3A6B] text-white rounded-xl text-sm font-medium hover:bg-[#0f2547] disabled:opacity-60 transition-colors flex items-center gap-2">
                      {saving === admin.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {t("permissions.save")}
                    </button>
                  </div>
                )}
              </div>

              {/* Permissions Grid */}
              <div className="p-5">
                {editing === admin.id && (
                  <div className="flex gap-2 mb-4">
                    <button onClick={selectAll} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors">{t("permissions.selectAll")}</button>
                    <button onClick={deselectAll} className="px-3 py-1.5 bg-gray-100 dark:bg-[#2a3d56] text-gray-600 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-200 dark:hover:bg-[#3b4f6b] transition-colors">{t("permissions.deselectAll")}</button>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {ALL_PAGES.map((page) => {
                    const isEditing = editing === admin.id
                    const permitted = isEditing ? editPerms.includes(page.id) : admin.permissions.includes(page.id)
                    return (
                      <button
                        key={page.id}
                        onClick={() => isEditing && togglePerm(page.id)}
                        disabled={!isEditing}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          permitted
                            ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20"
                            : "bg-gray-50 dark:bg-[#1e2d42] text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-[#2a3d56] opacity-60"
                        } ${isEditing ? "cursor-pointer hover:scale-[1.02]" : "cursor-default"}`}
                      >
                        {permitted ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                        {lang === "ar" ? page.ar : page.en}
                      </button>
                    )
                  })}
                </div>
                {editing !== admin.id && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                    {t("permissions.count").replace("{n}", String(admin.permissions.length)).replace("{total}", String(allPages.length))}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
