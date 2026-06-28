"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, Image, FolderOpen, Calendar, X, Upload, Film, FileText } from "lucide-react"
import ImageUpload from "@/components/admin/ImageUpload"

interface GalleryItem {
  id: string
  title: string
  description: string
  type: string
  imageUrl: string
  fileUrl: string | null
  thumbnailUrl: string
  album: string
  tags: string
  createdAt: string
}

const albumOptions = ["general", "conferences", "events", "campus"] as const
const albumLabels: Record<string, string> = {
  general: "عام",
  conferences: "مؤتمرات",
  events: "فعاليات",
  campus: "الحرم الجامعي",
}
const typeOptions = [
  { value: "image", label: "صورة", icon: Image },
  { value: "video", label: "فيديو", icon: Film },
  { value: "document", label: "مستند", icon: FileText },
]

const emptyForm = {
  title: "",
  description: "",
  type: "image",
  imageUrl: "",
  fileUrl: "",
  thumbnailUrl: "",
  album: "general",
  tags: "",
}

export default function GalleryManagement() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAlbum, setSelectedAlbum] = useState<string>("All")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/admin/gallery")
      if (!res.ok) throw new Error("فشل في جلب عناصر المعرض")
      const data = await res.json()
      setItems(data.data ?? data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ ما")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const filteredItems = selectedAlbum === "All" ? items : items.filter((item) => item.album === selectedAlbum)

  function openCreateModal() { setEditingItem(null); setForm(emptyForm); setModalOpen(true) }
  function openEditModal(item: GalleryItem) {
    setEditingItem(item)
    setForm({ title: item.title, description: item.description || "", type: item.type || "image", imageUrl: item.imageUrl || "", fileUrl: item.fileUrl || "", thumbnailUrl: item.thumbnailUrl || "", album: item.album || "general", tags: item.tags || "" })
    setModalOpen(true)
  }
  function closeModal() { setModalOpen(false); setEditingItem(null); setForm(emptyForm) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingItem) {
        const res = await fetch(`/api/admin/gallery/${editingItem.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
        if (!res.ok) throw new Error("فشل في تحديث العنصر")
      } else {
        const res = await fetch("/api/admin/gallery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
        if (!res.ok) throw new Error("فشل في إنشاء العنصر")
      }
      await fetchItems(); closeModal()
    } catch (err) { setError(err instanceof Error ? err.message : "حدث خطأ ما") }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("فشل في حذف العنصر")
      setDeleteConfirm(null); await fetchItems()
    } catch (err) { setError(err instanceof Error ? err.message : "حدث خطأ ما") }
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case "video": return <Film className="w-4 h-4" />
      case "document": return <FileText className="w-4 h-4" />
      default: return <Image className="w-4 h-4" />
    }
  }

  function getTypeLabel(type: string) {
    return typeOptions.find(t => t.value === type)?.label || type
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-[#0b1120]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#f1f5f9]">إدارة المعرض</h1>
          <button onClick={openCreateModal} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> إضافة عنصر
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setSelectedAlbum("All")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedAlbum === "All" ? "bg-blue-600 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-[#1e2d42] dark:text-[#cbd5e1] dark:border-[#3b4f6b]"}`}>الكل</button>
          {albumOptions.map((album) => (
            <button key={album} onClick={() => setSelectedAlbum(album)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${selectedAlbum === album ? "bg-blue-600 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-[#1e2d42] dark:text-[#cbd5e1] dark:border-[#3b4f6b]"}`}>{albumLabels[album] || album}</button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse dark:bg-[#1a2332] dark:border-[#2a3d56]">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center dark:bg-[#1a2332] dark:border-[#2a3d56]">
            <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">لا توجد عناصر</p>
            <p className="text-gray-400 text-sm mt-1">اضغط &apos;إضافة عنصر&apos; لرفع أول عنصر.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow dark:bg-[#1a2332] dark:border-[#2a3d56]">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {item.type === "video" && item.fileUrl ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <Film className="w-12 h-12 text-gray-400" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-l-[16px] border-l-white border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ms-1" />
                        </div>
                      </div>
                    </div>
                  ) : item.type === "document" && item.fileUrl ? (
                    <div className="w-full h-full flex items-center justify-center bg-blue-50">
                      <FileText className="w-12 h-12 text-blue-400" />
                    </div>
                  ) : item.imageUrl ? (
                    <img src={item.thumbnailUrl || item.imageUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500"><Image className="w-12 h-12 text-white" /></div>
                  )}
                  <div className="absolute top-2 end-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-black/50 text-white text-[10px] rounded-full backdrop-blur-sm">
                      {getTypeIcon(item.type)} {getTypeLabel(item.type)}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm truncate mb-1 dark:text-[#f1f5f9]">{item.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1"><FolderOpen className="w-3 h-3" /><span className="capitalize">{albumLabels[item.album || ""] || item.album}</span></div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3"><Calendar className="w-3 h-3" /><span>{new Date(item.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" })}</span></div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(item)} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"><Pencil className="w-3 h-3" /> تعديل</button>
                    <button onClick={() => setDeleteConfirm(item.id)} className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium"><Trash2 className="w-3 h-3" /> حذف</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={(e) => e.stopPropagation()} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto dark:bg-[#1a2332]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2a3d56]">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[#f1f5f9]">{editingItem ? "تعديل" : "إضافة"} عنصر</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 shrink-0"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">النوع</label>
                <div className="flex gap-2">
                  {typeOptions.map((t) => (
                    <button key={t.value} type="button" onClick={() => setForm(prev => ({ ...prev, type: t.value }))}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${form.type === t.value ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-300" : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-[#3b4f6b] dark:text-[#94a3b8]"}`}>
                      <t.icon className="w-4 h-4" /> {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">العنوان</label>
                <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                  placeholder="أدخل العنوان" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">الوصف</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                  placeholder="أدخل الوصف" />
              </div>

              {form.type === "image" ? (
                <div>
                  <ImageUpload value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} folder="gallery" label="الصورة" />
                </div>
              ) : form.type === "video" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">رابط الفيديو</label>
                  <input type="url" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                    placeholder="https://youtube.com/watch?v=... أو رابط مباشر للفيديو" />
                  <p className="text-xs text-gray-400 mt-1">YouTube, Vimeo, أو رابط مباشر للفيديو (MP4)</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">رابط المستند</label>
                  <input type="url" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                    placeholder="رابط المستند (PDF, DOC, PPT)" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">الصورة المصغرة</label>
                <ImageUpload value={form.thumbnailUrl} onChange={(url) => setForm({ ...form, thumbnailUrl: url })} folder="gallery" label="الصورة المصغرة (اختياري)" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">الألبوم</label>
                <select value={form.album} onChange={(e) => setForm({ ...form, album: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {albumOptions.map((a) => <option key={a} value={a}>{albumLabels[a] || a}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">الوسوم</label>
                <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                  placeholder="حدث، مؤتمر، حرم جامعي" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">إلغاء</button>
                <button type="submit" disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50">
                  <Upload className="w-4 h-4" /> {saving ? "جاري الحفظ..." : editingItem ? "تحديث" : "إنشاء"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"><Trash2 className="w-5 h-5 text-red-600" /></div>
              <div><h3 className="text-lg font-semibold text-gray-900">حذف العنصر</h3><p className="text-sm text-gray-500">لا يمكن التراجع عن هذا الإجراء.</p></div>
            </div>
            <p className="text-sm text-gray-600 mb-6">هل أنت متأكد من حذف هذا العنصر؟</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">إلغاء</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">حذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
