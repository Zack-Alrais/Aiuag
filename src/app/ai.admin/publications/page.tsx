"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, BookOpen, FileText, X } from "lucide-react"
import FileUpload from "@/components/admin/FileUpload"

interface Publication {
  id: string
  title: string
  titleEn: string
  description: string | null
  category: string | null
  fileUrl: string | null
  imageUrl: string | null
  createdAt: string
}

interface PublicationFormData {
  title: string
  titleEn: string
  description: string
  category: string
  fileUrl: string
  imageUrl: string
}

const emptyForm: PublicationFormData = {
  title: "",
  titleEn: "",
  description: "",
  category: "",
  fileUrl: "",
  imageUrl: "",
}

export default function PublicationsManagement() {
  const [items, setItems] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Publication | null>(null)
  const [form, setForm] = useState<PublicationFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/publications")
      const json = await res.json()
      setItems(json.data ?? json.publications ?? [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const openAddModal = () => { setEditingItem(null); setForm(emptyForm); setShowModal(true) }

  const openEditModal = (item: Publication) => {
    setEditingItem(item)
    setForm({ title: item.title, titleEn: item.titleEn, description: item.description ?? "", category: item.category ?? "", fileUrl: item.fileUrl ?? "", imageUrl: item.imageUrl ?? "" })
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditingItem(null); setForm(emptyForm) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        title: form.title, titleEn: form.titleEn, description: form.description || null,
        category: form.category || null, fileUrl: form.fileUrl || null, imageUrl: form.imageUrl || null,
      }
      if (editingItem) {
        await fetch(`/api/admin/publications/${editingItem.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      } else {
        await fetch("/api/admin/publications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      }
      await fetchItems(); closeModal()
    } catch {} finally { setSubmitting(false) }
  }

  const handleDelete = async (id: string) => {
    try { await fetch(`/api/admin/publications/${id}`, { method: "DELETE" }); setDeleteConfirmId(null); await fetchItems() } catch {}
  }

  const handleFieldChange = (field: keyof PublicationFormData, value: string) => { setForm((prev) => ({ ...prev, [field]: value })) }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600 dark:text-[#60a5fa]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f1f5f9]">إدارة المنشورات</h1>
            <p className="text-sm text-gray-500 dark:text-[#94a3b8]">{items.length} منشور مسجل</p>
          </div>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus className="w-4 h-4" /> إضافة منشور
        </button>
      </div>

      <div className="bg-white dark:bg-[#1a2332] dark:border-[#2a3d56] rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400"><BookOpen className="h-5 w-5 animate-spin mr-2" /> جاري تحميل المنشورات...</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400"><BookOpen className="h-12 w-12 mb-3 opacity-40" /><p className="text-sm">لا توجد منشورات</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 dark:border-[#253347] bg-gray-50/60 dark:bg-[#111927]">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8]">العنوان</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8]">التصنيف</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8]">الغلاف</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8]">الملف</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8]">التاريخ</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-[#94a3b8]">الإجراءات</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#253347]">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1e2d42]">
                    <td className="px-6 py-4"><div><p className="font-medium text-gray-900 dark:text-[#f1f5f9] text-sm">{item.title}</p><p className="text-xs text-gray-400 dark:text-[#94a3b8] mt-0.5">{item.titleEn}</p></div></td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#cbd5e1]">{item.category ?? "-"}</td>
                    <td className="px-6 py-4">{item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="w-12 h-12 rounded-md object-cover border border-gray-200 dark:border-[#3b4f6b]" loading="lazy" /> : <div className="w-12 h-12 rounded-md bg-gray-100 dark:bg-[#111927] flex items-center justify-center"><BookOpen className="w-5 h-5 text-gray-400" /></div>}</td>
                    <td className="px-6 py-4 text-sm">{item.fileUrl ? <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 dark:text-[#60a5fa] hover:underline"><FileText className="h-3.5 w-3.5" /> <span className="truncate max-w-[120px]">{item.fileUrl.split("/").pop()}</span></a> : "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-[#94a3b8]">{new Date(item.createdAt).toLocaleDateString("ar-EG")}</td>
                    <td className="px-6 py-4"><div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEditModal(item)} className="p-2 text-blue-600 dark:text-[#60a5fa] hover:bg-blue-50 dark:hover:bg-[#1e2d42] rounded-lg"><Pencil className="h-4 w-4" /></button>
                      {deleteConfirmId === item.id ? (<div className="flex items-center gap-1"><button onClick={() => handleDelete(item.id)} className="px-2.5 py-1 bg-red-600 text-white text-xs rounded-md">تأكيد</button><button onClick={() => setDeleteConfirmId(null)} className="px-2.5 py-1 bg-gray-200 dark:bg-[#2a3d56] text-gray-600 dark:text-[#cbd5e1] text-xs rounded-md">إلغاء</button></div>) : (<button onClick={() => setDeleteConfirmId(item.id)} className="p-2 text-red-500 dark:text-[#f87171] hover:bg-red-50 dark:hover:bg-[#1e2d42] rounded-lg"><Trash2 className="h-4 w-4" /></button>)}
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white dark:bg-[#1a2332] rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#253347]">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[#f1f5f9]">{editingItem ? "تعديل منشور" : "إضافة منشور جديد"}</h2>
              <button onClick={closeModal} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="h-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">العنوان بالعربية *</label><input type="text" required dir="rtl" value={form.title} onChange={(e) => handleFieldChange("title", e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="عنوان المنشور بالعربية" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">العنوان بالإنجليزية *</label><input type="text" required value={form.titleEn} onChange={(e) => handleFieldChange("titleEn", e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Publication title in English" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">الوصف</label><textarea rows={3} dir="rtl" value={form.description} onChange={(e) => handleFieldChange("description", e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="وصف المنشور" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">التصنيف</label><input type="text" value={form.category} onChange={(e) => handleFieldChange("category", e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="مثال: بحثي" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1"><span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> ملف المنشور (PDF)</span></label><FileUpload value={form.fileUrl} onChange={(url) => handleFieldChange("fileUrl", url)} folder="publications" type="pdf" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">صورة الغلاف (اختياري)</label><FileUpload value={form.imageUrl} onChange={(url) => handleFieldChange("imageUrl", url)} folder="publications/covers" type="image" /></div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-[#253347]">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-[#cbd5e1] bg-gray-100 dark:bg-[#2a3d56] hover:bg-gray-200 dark:hover:bg-[#3b4f6b] rounded-lg">إلغاء</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">{submitting ? "جاري الحفظ..." : editingItem ? "تحديث المنشور" : "إنشاء منشور"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
