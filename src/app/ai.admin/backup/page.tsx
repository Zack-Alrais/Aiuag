"use client"

import { useState, useEffect } from "react"
import { Download, Trash2, RefreshCw, Database, Clock, HardDrive, CheckCircle, XCircle, Loader2, FileDown, Upload, RotateCcw } from "lucide-react"
import { useAdminLang } from "../admin-lang"

interface BackupItem {
  id: string
  type: "manual" | "auto"
  status: string
  size: number
  tables: number
  createdAt: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function formatDate(dateStr: string, locale: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

export default function BackupPage() {
  const { lang, t } = useAdminLang()
  const [backups, setBackups] = useState<BackupItem[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [total, setTotal] = useState(0)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  const fetchBackups = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/backup")
      const data = await res.json()
      setBackups(data.backups || [])
      setTotal(data.total || 0)
    } catch (e) {
      console.error("Failed to fetch backups:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBackups() }, [])

  const handleCreate = async () => {
    setCreating(true)
    try {
      await fetch("/api/admin/backup", { method: "POST" })
      await fetchBackups()
    } catch (e) {
      console.error("Failed to create backup:", e)
    } finally {
      setCreating(false)
    }
  }

  const handleRestore = async (id: string) => {
    if (!confirm(t("backup.restoreConfirm"))) return
    setRestoring(id)
    setMessage("")
    try {
      const res = await fetch(`/api/admin/backup/${id}`, { method: "POST" })
      const data = await res.json()
      if (data.success) {
        setMessage(t("backup.restoreSuccess"))
        setMessageType("success")
      } else {
        setMessage(t("backup.restoreFailed").replace("{msg}", data.message))
        setMessageType("error")
      }
    } catch {
      setMessage(t("backup.restoreFailedShort"))
      setMessageType("error")
    } finally {
      setRestoring(null)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setMessage("")
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/admin/backup/import", { method: "POST", body: formData })
      const data = await res.json()
      if (data.success) {
        setMessage(t("backup.importSuccess"))
        setMessageType("success")
      } else {
        setMessage(t("backup.importFailed").replace("{msg}", data.message))
        setMessageType("error")
      }
      if (data.success) fetchBackups()
    } catch {
      setMessage(t("backup.importFailedShort"))
      setMessageType("error")
    } finally {
      setImporting(false)
      e.target.value = ""
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t("backup.deleteConfirm"))) return
    try {
      await fetch(`/api/admin/backup?id=${id}`, { method: "DELETE" })
      setBackups((prev) => prev.filter((b) => b.id !== id))
      setTotal((t) => t - 1)
    } catch (e) {
      console.error("Failed to delete backup:", e)
    }
  }

  const handleDownload = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/backup/${id}`)
      const data = await res.json()
      if (!data.data) return
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `aiuag-backup-${id.slice(0, 8)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error("Failed to download backup:", e)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0f2547] dark:text-white">{t("backup.title")}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t("backup.subtitle")}</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={fetchBackups}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-[#3b4f6b] rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1e2d42] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {t("backup.refresh")}
          </button>
          <button
            onClick={() => document.getElementById("import-file-input")?.click()}
            disabled={importing}
            className="flex items-center gap-2 px-4 py-2.5 border border-emerald-300 dark:border-emerald-700 rounded-xl text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
          >
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {importing ? t("backup.importing") : t("backup.import")}
          </button>
          <input id="import-file-input" type="file" accept=".json" onChange={handleImport} className="hidden" />
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1A3A6B] text-white rounded-xl text-sm font-medium hover:bg-[#0f2547] disabled:opacity-60 transition-colors shadow-sm"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            {creating ? t("backup.creating") : t("backup.createBtn")}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-[#1a2332] rounded-2xl p-5 border border-gray-100 dark:border-[#2a3d56] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("backup.totalLabel")}</p>
              <p className="text-xl font-bold text-[#0f2547] dark:text-white">{total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1a2332] rounded-2xl p-5 border border-gray-100 dark:border-[#2a3d56] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("backup.latestLabel")}</p>
              <p className="text-sm font-semibold text-[#0f2547] dark:text-white truncate">
                {backups.length > 0 ? formatDate(backups[0].createdAt, lang === "ar" ? "ar-EG" : "en-US") : t("backup.none")}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1a2332] rounded-2xl p-5 border border-gray-100 dark:border-[#2a3d56] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("backup.autoLabel")}</p>
              <p className="text-sm font-semibold text-[#0f2547] dark:text-white">{t("backup.autoValue")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl border text-sm ${messageType === "success" ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300"}`}>
          {message}
        </div>
      )}

      {/* Backup List */}
      <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-gray-100 dark:border-[#2a3d56] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#2a3d56]">
          <h2 className="font-semibold text-[#0f2547] dark:text-white">{t("backup.historyTitle")}</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <Loader2 className="w-8 h-8 mx-auto animate-spin mb-2" />
            <span>{t("backup.loading")}</span>
          </div>
        ) : backups.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Database className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-base font-medium">{t("backup.emptyTitle")}</p>
            <p className="text-sm mt-1">{t("backup.emptyHint")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-50 dark:border-[#253347]">
                  <th className="text-start px-6 py-3 font-medium">{t("backup.dateCol")}</th>
                  <th className="text-start px-6 py-3 font-medium">{t("backup.typeCol")}</th>
                  <th className="text-start px-6 py-3 font-medium">{t("backup.statusCol")}</th>
                  <th className="text-start px-6 py-3 font-medium">{t("backup.tablesCol")}</th>
                  <th className="text-start px-6 py-3 font-medium">{t("backup.sizeCol")}</th>
                  <th className="text-end px-6 py-3 font-medium">{t("backup.actionsCol")}</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((backup) => (
                  <tr key={backup.id} className="border-b border-gray-50 dark:border-[#253347] hover:bg-gray-50/50 dark:hover:bg-[#1e2d42]/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-[#0f2547] dark:text-white">{formatDate(backup.createdAt, lang === "ar" ? "ar-EG" : "en-US")}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                        backup.type === "auto"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                          : "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                      }`}>
                        <Clock className="w-3 h-3" />
                        {backup.type === "auto" ? t("backup.type.auto") : t("backup.type.manual")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-sm ${
                        backup.status === "completed" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                      }`}>
                        {backup.status === "completed" ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        {backup.status === "completed" ? t("backup.status.completed") : t("backup.status.failed")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                        <HardDrive className="w-3.5 h-3.5" />
                        {backup.tables}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{formatBytes(backup.size)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleRestore(backup.id)}
                          disabled={restoring === backup.id}
                          className="p-2 hover:bg-amber-100 dark:hover:bg-amber-500/10 rounded-lg text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors disabled:opacity-40"
                          title={t("backup.restoreTitle")}
                        >
                          {restoring === backup.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDownload(backup.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-[#2a3d56] rounded-lg text-gray-400 hover:text-[#1A3A6B] dark:hover:text-blue-400 transition-colors"
                          title={t("backup.downloadTitle")}
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(backup.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title={t("backup.deleteTitle")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 bg-amber-50/80 dark:bg-amber-500/5 border border-amber-200/60 dark:border-amber-500/20 rounded-2xl p-5">
        <h3 className="font-semibold text-amber-800 dark:text-amber-400 text-sm mb-2">{t("backup.infoTitle")}</h3>
        <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1.5 list-disc list-inside">
          <li>{t("backup.info1")}</li>
          <li>{t("backup.info2")}</li>
          <li>{t("backup.info3")}</li>
          <li>{t("backup.info4")}</li>
        </ul>
      </div>
    </div>
  )
}
