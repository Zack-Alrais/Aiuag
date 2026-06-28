"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, Video, Play, X, Film, Link } from "lucide-react"
import FileUpload from "@/components/admin/FileUpload"

interface VideoItem {
  id: string
  title: string
  titleEn: string
  url: string
  thumbnail: string | null
  description: string | null
  category: string | null
  createdAt: string
}

interface VideoFormData {
  title: string
  titleEn: string
  url: string
  thumbnail: string
  description: string
  category: string
}

const emptyForm: VideoFormData = {
  title: "",
  titleEn: "",
  url: "",
  thumbnail: "",
  description: "",
  category: "",
}

function getYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?#]+)/
  )
  return match ? match[1] : null
}

function getYoutubeThumbnail(url: string): string | null {
  const id = getYoutubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null
}

function isVideoFile(url: string): boolean {
  return /\.(mp4|webm|ogg)$/i.test(url)
}

export default function VideosManagement() {
  const [items, setItems] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<VideoItem | null>(null)
  const [form, setForm] = useState<VideoFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [videoSource, setVideoSource] = useState<"youtube" | "upload">("youtube")

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/videos")
      const json = await res.json()
      setItems(json.data ?? json.videos ?? [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const openAddModal = () => {
    setEditingItem(null)
    setForm(emptyForm)
    setVideoSource("youtube")
    setShowModal(true)
  }

  const openEditModal = (item: VideoItem) => {
    setEditingItem(item)
    const isUploaded = !getYoutubeId(item.url)
    setVideoSource(isUploaded ? "upload" : "youtube")
    setForm({
      title: item.title,
      titleEn: item.titleEn,
      url: item.url,
      thumbnail: item.thumbnail ?? "",
      description: item.description ?? "",
      category: item.category ?? "",
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingItem(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        titleEn: form.titleEn,
        url: form.url,
        thumbnail: form.thumbnail || null,
        description: form.description || null,
        category: form.category || null,
      }

      if (editingItem) {
        await fetch(`/api/admin/videos/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch("/api/admin/videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      await fetchItems()
      closeModal()
    } catch {
      // silently fail
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/videos/${id}`, { method: "DELETE" })
      setDeleteConfirmId(null)
      await fetchItems()
    } catch {
      // silently fail
    }
  }

  const handleFieldChange = (field: keyof VideoFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const getPreviewUrl = (item: VideoItem) => {
    if (item.thumbnail) return item.thumbnail
    const ytThumb = getYoutubeThumbnail(item.url)
    if (ytThumb) return ytThumb
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Video className="w-8 h-8 text-blue-600 dark:text-[#60a5fa]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f1f5f9]">إدارة الفيديوهات</h1>
            <p className="text-sm text-gray-500 dark:text-[#94a3b8]">{items.length} فيديو مسجل</p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          إضافة فيديو
        </button>
      </div>

      <div className="bg-white dark:bg-[#1a2332] dark:border-[#2a3d56] rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 dark:text-[#3b4f6b]">
            <Video className="h-5 w-5 animate-spin mr-2" />
            جاري تحميل الفيديوهات...
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-[#3b4f6b]">
            <Video className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-sm">لا توجد فيديوهات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#253347] bg-gray-50/60 dark:bg-[#111927]">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                    العنوان
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                    المعاينة
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                    المصدر
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                    التصنيف
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#253347]">
                {items.map((item) => {
                  const preview = getPreviewUrl(item)
                  const isYT = !!getYoutubeId(item.url)
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1e2d42] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-[#f1f5f9] text-sm">{item.title}</p>
                          <p className="text-xs text-gray-400 dark:text-[#94a3b8] mt-0.5">{item.titleEn}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {preview ? (
                          <img src={preview} alt={item.title} className="w-24 h-14 rounded-md object-cover border border-gray-200 dark:border-[#3b4f6b]" loading="lazy" />
                        ) : isVideoFile(item.url) ? (
                          <div className="w-24 h-14 rounded-md bg-gray-100 dark:bg-[#111927] flex items-center justify-center">
                            <Film className="w-5 h-5 text-gray-400 dark:text-[#3b4f6b]" />
                          </div>
                        ) : (
                          <div className="w-24 h-14 rounded-md bg-gray-100 dark:bg-[#111927] flex items-center justify-center">
                            <Play className="w-5 h-5 text-gray-400 dark:text-[#3b4f6b]" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isYT ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"}`}>
                          {isYT ? <Link className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                          {isYT ? "يوتيوب" : "مرفوع"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#cbd5e1]">
                        {item.category ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-[#94a3b8]">
                        {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEditModal(item)} className="p-2 text-blue-600 dark:text-[#60a5fa] hover:bg-blue-50 dark:hover:bg-[#1e2d42] rounded-lg transition-colors" title="تعديل">
                            <Pencil className="h-4 w-4" />
                          </button>
                          {deleteConfirmId === item.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDelete(item.id)} className="px-2.5 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 dark:hover:bg-red-800 transition-colors">تأكيد</button>
                              <button onClick={() => setDeleteConfirmId(null)} className="px-2.5 py-1 bg-gray-200 dark:bg-[#2a3d56] text-gray-600 dark:text-[#cbd5e1] text-xs rounded-md hover:bg-gray-300 dark:hover:bg-[#3b4f6b] transition-colors">إلغاء</button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirmId(item.id)} className="p-2 text-red-500 dark:text-[#f87171] hover:bg-red-50 dark:hover:bg-[#1e2d42] rounded-lg transition-colors" title="حذف">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-white dark:bg-[#1a2332] rounded-2xl shadow-2xl dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#253347]">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[#f1f5f9]">
                {editingItem ? "تعديل فيديو" : "إضافة فيديو جديد"}
              </h2>
              <button onClick={closeModal} className="p-1.5 text-gray-400 dark:text-[#94a3b8] hover:text-gray-600 dark:hover:text-[#f1f5f9] hover:bg-gray-100 dark:hover:bg-[#1e2d42] rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">العنوان بالعربية *</label>
                  <input type="text" required dir="rtl" value={form.title} onChange={(e) => handleFieldChange("title", e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="عنوان الفيديو بالعربية" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">العنوان بالإنجليزية *</label>
                  <input type="text" required value={form.titleEn} onChange={(e) => handleFieldChange("titleEn", e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Video title in English" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-2">مصدر الفيديو</label>
                <div className="flex gap-2 mb-3">
                  <button type="button" onClick={() => { setVideoSource("youtube"); handleFieldChange("url", "") }} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${videoSource === "youtube" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700" : "bg-gray-100 dark:bg-[#111927] text-gray-600 dark:text-[#94a3b8] border border-gray-200 dark:border-[#3b4f6b]"}`}>
                    <Link className="w-4 h-4" /> رابط يوتيوب
                  </button>
                  <button type="button" onClick={() => { setVideoSource("upload"); handleFieldChange("url", "") }} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${videoSource === "upload" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700" : "bg-gray-100 dark:bg-[#111927] text-gray-600 dark:text-[#94a3b8] border border-gray-200 dark:border-[#3b4f6b]"}`}>
                    <Film className="w-4 h-4" /> رفع من الجهاز
                  </button>
                </div>

                {videoSource === "youtube" ? (
                  <div>
                    <input type="url" required={videoSource === "youtube"} value={form.url} onChange={(e) => handleFieldChange("url", e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="https://www.youtube.com/watch?v=..." />
                    {getYoutubeThumbnail(form.url) && (
                      <div className="mt-2">
                        <img src={getYoutubeThumbnail(form.url)!} alt="معاينة" className="w-48 h-28 rounded-lg object-cover border border-gray-200 dark:border-[#3b4f6b]" loading="lazy" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <FileUpload value={form.url} onChange={(url) => handleFieldChange("url", url)} folder="videos" type="video" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">الوصف</label>
                <textarea rows={3} dir="rtl" value={form.description} onChange={(e) => handleFieldChange("description", e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none" placeholder="وصف الفيديو" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">التصنيف</label>
                  <input type="text" value={form.category} onChange={(e) => handleFieldChange("category", e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="مثال: تعليمي" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">صورة مصغرة (اختياري)</label>
                  <FileUpload value={form.thumbnail} onChange={(url) => handleFieldChange("thumbnail", url)} folder="videos/thumbnails" type="image" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-[#253347]">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-[#cbd5e1] bg-gray-100 dark:bg-[#2a3d56] hover:bg-gray-200 dark:hover:bg-[#3b4f6b] rounded-lg transition-colors">إلغاء</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? "جاري الحفظ..." : editingItem ? "تحديث الفيديو" : "إنشاء فيديو"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
