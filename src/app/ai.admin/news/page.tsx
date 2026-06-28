"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, Newspaper, Eye, EyeOff, Search, X } from "lucide-react"
import ImageUpload from "@/components/admin/ImageUpload"

interface NewsItem {
  id: number
  titleAr: string
  titleEn: string
  contentAr: string
  contentEn: string
  excerptAr: string
  excerptEn: string
  category: string
  status: "draft" | "published" | "archived"
  featuredImage: string
  createdAt: string
  updatedAt: string
}

const emptyForm: Omit<NewsItem, "id" | "createdAt" | "updatedAt"> = {
  titleAr: "",
  titleEn: "",
  contentAr: "",
  contentEn: "",
  excerptAr: "",
  excerptEn: "",
  category: "",
  status: "draft",
  featuredImage: "",
}

export default function NewsManagement() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "archived">("all")
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchNews = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/news")
      if (res.ok) {
        const data = await res.json()
        setNews(data.data ?? data.news ?? [])
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  const filteredNews = news
    .filter((n) => filter === "all" || n.status === filter)
    .filter(
      (n) =>
        n.titleAr.toLowerCase().includes(search.toLowerCase()) ||
        n.titleEn.toLowerCase().includes(search.toLowerCase()) ||
        n.category.toLowerCase().includes(search.toLowerCase())
    )

  const openCreateModal = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEditModal = (item: NewsItem) => {
    setEditingId(item.id)
    setForm({
      titleAr: item.titleAr,
      titleEn: item.titleEn,
      contentAr: item.contentAr,
      contentEn: item.contentEn,
      excerptAr: item.excerptAr,
      excerptEn: item.excerptEn,
      category: item.category,
      status: item.status,
      featuredImage: item.featuredImage,
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await fetch(`/api/admin/news/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
      } else {
        await fetch("/api/admin/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
      }
      await fetchNews()
      closeModal()
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/admin/news/${id}`, { method: "DELETE" })
      await fetchNews()
    } catch {
      // silent
    } finally {
      setDeleteConfirmId(null)
    }
  }

  const handleFieldChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      published: "bg-green-100 text-green-800",
      draft: "bg-yellow-100 text-yellow-800",
      archived: "bg-gray-100 text-gray-800",
    }
    return styles[status] || "bg-gray-100 text-gray-800"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      published: "منشور",
      draft: "مسودة",
      archived: "مؤرشف",
    }
    return labels[status] || status
  }

  return (
    <div className="space-y-6 dark:bg-[#0b1120]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Newspaper className="w-8 h-8 text-blue-600 dark:text-[#60a5fa]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f1f5f9]">إدارة الأخبار</h1>
            <p className="text-sm text-gray-500 dark:text-[#94a3b8]">إدارة الأخبار</p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة خبر
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 flex-wrap">
          {(["all", "published", "draft", "archived"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#1e2d42] dark:text-[#cbd5e1] dark:hover:bg-[#2a3d56]"
              }`}
            >
              {status === "all" ? "الكل" : getStatusLabel(status)}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#7a8ba3]" />
          <input
            type="text"
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] dark:placeholder-[#7a8ba3]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-[#1a2332] dark:border dark:border-[#2a3d56]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-[#2a3d56]">
            <thead className="bg-gray-50 dark:bg-[#111927]">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-[#94a3b8] uppercase">
                  العنوان
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-[#94a3b8] uppercase">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-[#94a3b8] uppercase">
                  التصنيف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-[#94a3b8] uppercase">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-[#94a3b8] uppercase">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <div>
                      <div className="h-12 bg-gray-100 dark:bg-[#111927] animate-pulse border-b border-gray-200 dark:border-[#2a3d56]" />
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 dark:border-[#2a3d56] last:border-0">
                          <div className="h-4 bg-gray-200 dark:bg-[#1e2d42] rounded flex-1 animate-pulse" />
                          <div className="h-4 bg-gray-200 dark:bg-[#1e2d42] rounded flex-1 animate-pulse" />
                          <div className="h-4 bg-gray-200 dark:bg-[#1e2d42] rounded flex-1 animate-pulse" />
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ) : filteredNews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    لا توجد نتائج
                  </td>
                </tr>
              ) : (
                filteredNews.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors dark:hover:bg-[#1e2d42]">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800 dark:text-[#f1f5f9]">{item.titleAr}</div>
                      <div className="text-sm text-gray-500 dark:text-[#94a3b8]">{item.titleEn}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}
                      >
                        {item.status === "published" ? (
                          <Eye className="w-3 h-3" />
                        ) : item.status === "archived" ? (
                          <EyeOff className="w-3 h-3" />
                        ) : null}
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#cbd5e1]">{item.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#cbd5e1]">
                      {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 dark:bg-[#1a2332] dark:border dark:border-[#2a3d56]">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2a3d56]">
              <h2 className="text-xl font-bold text-gray-800 dark:text-[#f1f5f9]">
                {editingId ? "تعديل خبر" : "إضافة خبر"}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-[#2a3d56]">
                <X className="w-5 h-5 text-gray-500 dark:text-[#7a8ba3]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Arabic Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                  العنوان بالعربي <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.titleAr}
                  onChange={(e) => handleFieldChange("titleAr", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                  dir="rtl"
                />
              </div>

              {/* English Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                  العنوان بالإنجليزي <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.titleEn}
                  onChange={(e) => handleFieldChange("titleEn", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                />
              </div>

              {/* Arabic Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                  ملخص بالعربي
                </label>
                <textarea
                  rows={2}
                  value={form.excerptAr}
                  onChange={(e) => handleFieldChange("excerptAr", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                  dir="rtl"
                />
              </div>

              {/* English Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                  ملخص بالإنجليزي
                </label>
                <textarea
                  rows={2}
                  value={form.excerptEn}
                  onChange={(e) => handleFieldChange("excerptEn", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                />
              </div>

              {/* Arabic Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                  المحتوى بالعربي <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  value={form.contentAr}
                  onChange={(e) => handleFieldChange("contentAr", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                  dir="rtl"
                />
              </div>

              {/* English Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                  المحتوى بالإنجليزي <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  value={form.contentEn}
                  onChange={(e) => handleFieldChange("contentEn", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                    التصنيف <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.category}
                    onChange={(e) => handleFieldChange("category", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                    الحالة <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={form.status}
                    onChange={(e) => handleFieldChange("status", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                  >
                    <option value="draft">مسودة</option>
                    <option value="published">منشور</option>
                    <option value="archived">مؤرشف</option>
                  </select>
                </div>
              </div>

              {/* Featured Image */}
              <ImageUpload
                value={form.featuredImage}
                onChange={(url) => handleFieldChange("featuredImage", url)}
                folder="news"
                label="الصورة الرئيسية"
              />

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-[#2a3d56]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:text-[#cbd5e1] dark:bg-[#1e2d42] dark:hover:bg-[#2a3d56]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving
                    ? "جاري الحفظ..."
                    : editingId
                      ? "تحديث"
                      : "إنشاء"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">تأكيد الحذف</h3>
            </div>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف هذا الخبر؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
