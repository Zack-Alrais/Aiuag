"use client"

import { useState, useEffect, useCallback } from "react"
import { Users, Activity, Clock, Shield, Eye, Search, ChevronLeft, ChevronRight, Calendar, FileText, Settings, Trash2, Plus, Edit, Download, LogIn, LogOut, ArrowRight, X } from "lucide-react"
import { useAdminLang } from "../admin-lang"
import { adminDict } from "../admin-i18n"

interface UserSummary {
  id: string
  name: string
  email: string
  role: string
  image?: string | null
  createdAt: string
  member?: { id: string; membershipNumber: string | null; status: string } | null
  totalActions: number
  lastActivity?: { createdAt: string; action: string; entity: string } | null
}

interface AuditLog {
  id: string
  userId: string
  userEmail: string
  userName: string
  action: string
  entity: string
  entityId?: string | null
  details?: string | null
  ipAddress?: string | null
  createdAt: string
}

interface UserStats {
  user: { id: string; name: string; email: string; role: string; createdAt: string; image?: string | null }
  member?: { id: string; membershipNumber: string | null; faculty: string | null; specialization: string | null; graduationYear: number | null; status: string; country: string | null } | null
  totalActions: number
  actionCounts: { action: string; count: number }[]
  entityCounts: { entity: string; count: number }[]
  lastLogins: { createdAt: string; ipAddress?: string | null }[]
  recentLogs: AuditLog[]
}

const ACTION_LABELS: Record<string, { labelKey: string; icon: string; color: string }> = {
  login: { labelKey: "activity.actions.login", icon: "🔑", color: "bg-blue-100 text-blue-700" },
  logout: { labelKey: "activity.actions.logout", icon: "🚪", color: "bg-gray-100 text-gray-600" },
  create: { labelKey: "activity.actions.create", icon: "➕", color: "bg-green-100 text-green-700" },
  update: { labelKey: "activity.actions.update", icon: "✏️", color: "bg-amber-100 text-amber-700" },
  delete: { labelKey: "activity.actions.delete", icon: "🗑️", color: "bg-red-100 text-red-700" },
  view: { labelKey: "activity.actions.view", icon: "👁️", color: "bg-purple-100 text-purple-700" },
  export: { labelKey: "activity.actions.export", icon: "📥", color: "bg-teal-100 text-teal-700" },
}

const ENTITY_LABELS: Record<string, string> = {
  member: "activity.entities.member",
  news: "activity.entities.news",
  event: "activity.entities.event",
  graduate: "activity.entities.graduate",
  settings: "activity.entities.settings",
  permissions: "activity.entities.permissions",
  backup: "activity.entities.backup",
  gallery: "activity.entities.gallery",
  board: "activity.entities.board",
  partner: "activity.entities.partner",
  faq: "activity.entities.faq",
  contact: "activity.entities.contact",
  donation: "activity.entities.donation",
  auth: "activity.entities.auth",
}

function formatDate(d: string, lang: string) {
  return new Date(d).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", { year: "numeric", month: "short", day: "numeric" })
}

function formatDateTime(d: string, lang: string) {
  return new Date(d).toLocaleString(lang === "ar" ? "ar-EG" : "en-GB", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

function timeAgo(d: string, lang: string) {
  const dict = adminDict
  const pick = (key: string, n: string) => {
    const e = dict[key]
    if (!e) return key
    return (lang === "ar" ? e.ar : e.en).replace("{n}", n)
  }
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return pick("activity.time.now", "")
  if (mins < 60) return pick("activity.time.minutesAgo", String(mins))
  const hours = Math.floor(mins / 60)
  if (hours < 24) return pick("activity.time.hoursAgo", String(hours))
  const days = Math.floor(hours / 24)
  if (days < 30) return pick("activity.time.daysAgo", String(days))
  return formatDate(d, lang)
}

export default function ActivityPage() {
  const { lang, t } = useAdminLang()
  const [users, setUsers] = useState<UserSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [logsPage, setLogsPage] = useState(1)
  const [logsTotal, setLogsTotal] = useState(0)
  const [filterAction, setFilterAction] = useState("")
  const [filterEntity, setFilterEntity] = useState("")

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/audit?mode=users")
      const data = await res.json()
      setUsers(data.users || [])
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLogs = useCallback(async (page = 1) => {
    try {
      setLogsLoading(true)
      const params = new URLSearchParams({ page: String(page), limit: "30" })
      if (selectedUserId) params.set("userId", selectedUserId)
      if (filterAction) params.set("action", filterAction)
      if (filterEntity) params.set("entity", filterEntity)
      const res = await fetch(`/api/admin/audit?${params}`)
      const data = await res.json()
      setLogs(data.logs || [])
      setLogsTotal(data.total || 0)
      setLogsPage(data.page || 1)
    } catch {
      setLogs([])
    } finally {
      setLogsLoading(false)
    }
  }, [selectedUserId, filterAction, filterEntity])

  const fetchUserStats = useCallback(async (userId: string) => {
    try {
      setStatsLoading(true)
      const res = await fetch(`/api/admin/audit/${userId}`)
      const data = await res.json()
      setUserStats(data)
    } catch {
      setUserStats(null)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])
  useEffect(() => { fetchLogs(1) }, [fetchLogs])

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId === selectedUserId ? null : userId)
    setUserStats(null)
    if (userId !== selectedUserId) fetchUserStats(userId)
  }

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[#f1f5f9] flex items-center gap-2">
          <Activity className="h-6 w-6" />
          {t("activity.title")}
        </h1>
        <span className="text-sm text-gray-500 dark:text-[#7a8ba3]">{t("activity.usersCount").replace("{n}", String(users.length))}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("activity.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full ps-9 pe-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-[#1a2332] dark:border-[#2a3d56] overflow-hidden max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="py-20 text-center text-gray-400">{t("common.loading")}</div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-20 text-center text-gray-400">{t("activity.noUsers")}</div>
            ) : (
              filteredUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u.id)}
                  className={`w-full text-start px-4 py-3 border-b border-gray-100 dark:border-[#253347] transition-colors ${
                    selectedUserId === u.id
                      ? "bg-blue-50 dark:bg-blue-500/10"
                      : "hover:bg-gray-50 dark:hover:bg-[#1e2d42]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1A3A6B] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900 dark:text-[#f1f5f9] truncate">{u.name}</span>
                        {u.role === "admin" && (
                          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-medium">{t("activity.admin")}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-[#7a8ba3] truncate">{u.email}</div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400 dark:text-[#5a6b83]">
                        <span>{t("activity.operations").replace("{n}", String(u.totalActions))}</span>
                        {u.lastActivity && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {timeAgo(u.lastActivity.createdAt, lang)}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronLeft className={`h-4 w-4 text-gray-400 transition-transform ${selectedUserId === u.id ? "rotate-[-90deg]" : ""}`} />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selectedUserId && userStats && !statsLoading ? (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-[#1a2332] dark:border-[#2a3d56] p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#1A3A6B] text-white flex items-center justify-center text-lg font-bold">
                      {userStats.user.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-[#f1f5f9]">{userStats.user.name}</h2>
                      <p className="text-sm text-gray-500 dark:text-[#7a8ba3]">{userStats.user.email}</p>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedUserId(null); setUserStats(null) }} className="p-1 hover:bg-gray-100 rounded-lg">
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userStats.totalActions}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">{t("activity.totalOps")}</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-500/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{userStats.actionCounts.find((a) => a.action === "login")?.count || 0}</div>
                    <div className="text-xs text-green-600 dark:text-green-400">{t("activity.loginsCount")}</div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-500/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{userStats.actionCounts.find((a) => a.action === "update")?.count || 0}</div>
                    <div className="text-xs text-amber-600 dark:text-amber-400">{t("activity.editsCount")}</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-500/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{userStats.actionCounts.find((a) => a.action === "create")?.count || 0}</div>
                    <div className="text-xs text-purple-600 dark:text-purple-400">{t("activity.createCount")}</div>
                  </div>
                </div>

                {userStats.member && (
                  <div className="bg-gray-50 dark:bg-[#111927] rounded-lg p-3 mb-4 text-sm">
                    <div className="font-medium text-gray-700 dark:text-[#cbd5e1] mb-1">{t("activity.membershipData")}</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-600 dark:text-[#7a8ba3]">
                      <span>{t("members.form.membershipNumber")}: <b className="text-gray-900 dark:text-[#f1f5f9]">{userStats.member.membershipNumber || "-"}</b></span>
                      <span>{t("members.faculty")}: <b className="text-gray-900 dark:text-[#f1f5f9]">{userStats.member.faculty || "-"}</b></span>
                      <span>{t("members.specialization")}: <b className="text-gray-900 dark:text-[#f1f5f9]">{userStats.member.specialization || "-"}</b></span>
                      <span>{t("members.graduationYear")}: <b className="text-gray-900 dark:text-[#f1f5f9]">{userStats.member.graduationYear || "-"}</b></span>
                      <span>{t("members.country")}: <b className="text-gray-900 dark:text-[#f1f5f9]">{userStats.member.country || "-"}</b></span>
                      <span>{t("common.status")}: <b className="text-gray-900 dark:text-[#f1f5f9]">{userStats.member.status === "approved" ? t("common.approved") : userStats.member.status === "pending" ? t("comments.pendingReview") : t("common.rejected")}</b></span>
                    </div>
                  </div>
                )}

                {userStats.lastLogins.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-[#cbd5e1] mb-2 flex items-center gap-1.5">
                      <LogIn className="h-3.5 w-3.5" />
                      {t("activity.recentLogins")}
                    </h3>
                    <div className="space-y-1">
                      {userStats.lastLogins.slice(0, 5).map((login, i) => (
                        <div key={i} className="flex items-center justify-between text-xs text-gray-600 dark:text-[#7a8ba3] bg-gray-50 dark:bg-[#111927] rounded px-3 py-1.5">
                          <span>{formatDateTime(login.createdAt, lang)}</span>
                          {login.ipAddress && <span className="font-mono">{login.ipAddress}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-[#cbd5e1] mb-2">{t("activity.opsByType")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {userStats.actionCounts.map((ac) => (
                      <span key={ac.action} className={`px-2.5 py-1 rounded-full text-xs font-medium ${ACTION_LABELS[ac.action]?.color || "bg-gray-100 text-gray-600"}`}>
                        {ACTION_LABELS[ac.action]?.icon} {ACTION_LABELS[ac.action]?.labelKey ? t(ACTION_LABELS[ac.action].labelKey) : ac.action}: {ac.count}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-[#cbd5e1] mb-2">{t("activity.opsByEntity")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {userStats.entityCounts.map((ec) => (
                      <span key={ec.entity} className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-[#253347] dark:text-[#cbd5e1]">
                        {ENTITY_LABELS[ec.entity] ? t(ENTITY_LABELS[ec.entity]) : ec.entity}: {ec.count}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : selectedUserId && statsLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-[#1a2332] dark:border-[#2a3d56] p-20 text-center text-gray-400">
              {t("activity.loadingStats")}
            </div>
          ) : null}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-[#1a2332] dark:border-[#2a3d56] overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-[#253347] flex items-center justify-between">
              <h3 className="font-medium text-gray-900 dark:text-[#f1f5f9] flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                {t("activity.logTitle")}
              </h3>
              <div className="flex items-center gap-2">
                <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="text-xs px-2 py-1 border border-gray-200 rounded-lg dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]">
                  <option value="">{t("activity.allActions")}</option>
                  <option value="login">{t("activity.actions.login")}</option>
                  <option value="create">{t("activity.actions.create")}</option>
                  <option value="update">{t("activity.actions.update")}</option>
                  <option value="delete">{t("activity.actions.delete")}</option>
                  <option value="export">{t("activity.actions.export")}</option>
                </select>
                <select value={filterEntity} onChange={(e) => setFilterEntity(e.target.value)} className="text-xs px-2 py-1 border border-gray-200 rounded-lg dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]">
                  <option value="">{t("activity.allEntities")}</option>
                  <option value="member">{t("activity.entities.member")}</option>
                  <option value="news">{t("activity.entities.news")}</option>
                  <option value="event">{t("activity.entities.event")}</option>
                  <option value="graduate">{t("activity.entities.graduate")}</option>
                  <option value="settings">{t("activity.entities.settings")}</option>
                  <option value="backup">{t("activity.entities.backup")}</option>
                  <option value="permissions">{t("activity.entities.permissions")}</option>
                  <option value="auth">{t("activity.entities.auth")}</option>
                </select>
              </div>
            </div>

            {logsLoading ? (
              <div className="py-12 text-center text-gray-400">{t("common.loading")}</div>
            ) : logs.length === 0 ? (
              <div className="py-12 text-center text-gray-400">{t("activity.noLogs")}</div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-[#253347]">
                {logs.map((log) => {
                  const actionInfo = ACTION_LABELS[log.action] || { labelKey: "", icon: "•", color: "bg-gray-100 text-gray-600" }
                  return (
                    <div key={log.id} className="px-4 py-3 hover:bg-gray-50/50 dark:hover:bg-[#1e2d42] transition-colors">
                      <div className="flex items-start gap-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${actionInfo.color}`}>
                          {actionInfo.icon} {actionInfo.labelKey ? t(actionInfo.labelKey) : log.action}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-900 dark:text-[#f1f5f9]">{log.userName}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600 dark:text-[#7a8ba3]">{ENTITY_LABELS[log.entity] ? t(ENTITY_LABELS[log.entity]) : log.entity}</span>
                            {log.entityId && (
                              <span className="text-xs text-gray-400 font-mono truncate max-w-[120px]">{log.entityId}</span>
                            )}
                          </div>
                          {log.details && (
                            <div className="text-xs text-gray-500 dark:text-[#5a6b83] mt-0.5 font-mono bg-gray-50 dark:bg-[#111927] rounded px-2 py-1">
                              {log.details}
                            </div>
                          )}
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400 dark:text-[#5a6b83]">
                            <span>{formatDateTime(log.createdAt, lang)}</span>
                            {log.ipAddress && <span className="font-mono">{log.ipAddress}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {logsTotal > 30 && (
              <div className="px-4 py-3 border-t border-gray-100 dark:border-[#253347] flex items-center justify-between">
                <span className="text-xs text-gray-500">{t("activity.totalLogs").replace("{n}", String(logsTotal))}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchLogs(logsPage - 1)}
                    disabled={logsPage <= 1}
                    className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-30 dark:border-[#3b4f6b]"
                  >
                    {lang === "ar" ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
                  </button>
                  <span className="text-xs text-gray-600 dark:text-[#7a8ba3]">{t("activity.pageOf").replace("{n}", String(logsPage))}</span>
                  <button
                    onClick={() => fetchLogs(logsPage + 1)}
                    disabled={logsPage * 30 >= logsTotal}
                    className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-30 dark:border-[#3b4f6b]"
                  >
{lang === "ar" ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
