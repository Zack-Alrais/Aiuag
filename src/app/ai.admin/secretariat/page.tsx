"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, Users, Mail, Phone, User, X, UserCircle } from "lucide-react"
import FileUpload from "@/components/admin/FileUpload"

interface SecretariatMember {
  id: string
  name: string
  nameEn: string
  role: string
  roleEn: string | null
  bio: string | null
  phone: string | null
  email: string | null
  image: string | null
  order: number | null
  createdAt: string
}

interface SecretariatFormData {
  name: string
  nameEn: string
  role: string
  roleEn: string
  bio: string
  phone: string
  email: string
  image: string
  order: string
}

const emptyForm: SecretariatFormData = {
  name: "",
  nameEn: "",
  role: "",
  roleEn: "",
  bio: "",
  phone: "",
  email: "",
  image: "",
  order: "",
}

export default function SecretariatManagement() {
  const [items, setItems] = useState<SecretariatMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<SecretariatMember | null>(null)
  const [form, setForm] = useState<SecretariatFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/secretariat")
      const json = await res.json()
      setItems(json.data ?? json.secretariat ?? [])
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
    setShowModal(true)
  }

  const openEditModal = (item: SecretariatMember) => {
    setEditingItem(item)
    setForm({
      name: item.name,
      nameEn: item.nameEn,
      role: item.role,
      roleEn: item.roleEn ?? "",
      bio: item.bio ?? "",
      phone: item.phone ?? "",
      email: item.email ?? "",
      image: item.image ?? "",
      order: item.order != null ? String(item.order) : "",
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
        name: form.name,
        nameEn: form.nameEn,
        role: form.role,
        roleEn: form.roleEn || null,
        bio: form.bio || null,
        phone: form.phone || null,
        email: form.email || null,
        image: form.image || null,
        order: form.order ? Number(form.order) : null,
      }

      if (editingItem) {
        await fetch(`/api/admin/secretariat/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch("/api/admin/secretariat", {
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
      await fetch(`/api/admin/secretariat/${id}`, { method: "DELETE" })
      setDeleteConfirmId(null)
      await fetchItems()
    } catch {
      // silently fail
    }
  }

  const handleFieldChange = (field: keyof SecretariatFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600 dark:text-[#60a5fa]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f1f5f9]">الأمانة العامة</h1>
            <p className="text-sm text-gray-500 dark:text-[#94a3b8]">{items.length} عضو مسجل</p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          إضافة عضو
        </button>
      </div>

      <div className="bg-white dark:bg-[#1a2332] dark:border-[#2a3d56] rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 dark:text-[#3b4f6b]">
            <Users className="h-5 w-5 animate-spin mr-2" />
            جاري تحميل الأعضاء...
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-[#3b4f6b]">
            <Users className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-sm">لا يوجد أعضاء</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#253347] bg-gray-50/60 dark:bg-[#111927]">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                    الاسم
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      المنصب
                    </span>
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      التواصل
                    </span>
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                    الترتيب
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#253347]">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-[#1e2d42] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-[#3b4f6b]" loading="lazy" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center dark:bg-[#111927]">
                            <User className="w-5 h-5 text-blue-600 dark:text-[#60a5fa]" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-[#f1f5f9] text-sm">{item.name}</p>
                          <p className="text-xs text-gray-400 dark:text-[#94a3b8] mt-0.5">{item.nameEn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 dark:text-[#cbd5e1]">{item.role}</div>
                      {item.roleEn && (
                        <div className="text-xs text-gray-400 dark:text-[#94a3b8] mt-0.5">{item.roleEn}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#cbd5e1]">
                      {item.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-gray-400 dark:text-[#94a3b8]" />
                          {item.email}
                        </span>
                      )}
                      {item.phone && (
                        <span className="flex items-center gap-1.5 mt-1 text-xs text-gray-400 dark:text-[#94a3b8]">
                          <Phone className="h-3 w-3" />
                          {item.phone}
                        </span>
                      )}
                      {!item.email && !item.phone && "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#cbd5e1]">
                      {item.order ?? "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 text-blue-600 dark:text-[#60a5fa] hover:bg-blue-50 dark:hover:bg-[#1e2d42] rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {deleteConfirmId === item.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="px-2.5 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
                            >
                              تأكيد
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2.5 py-1 bg-gray-200 dark:bg-[#2a3d56] text-gray-600 dark:text-[#cbd5e1] text-xs rounded-md hover:bg-gray-300 dark:hover:bg-[#3b4f6b] transition-colors"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-2 text-red-500 dark:text-[#f87171] hover:bg-red-50 dark:hover:bg-[#1e2d42] rounded-lg transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-white dark:bg-[#1a2332] rounded-2xl shadow-2xl dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#253347]">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[#f1f5f9]">
                {editingItem ? "تعديل عضو" : "إضافة عضو جديد"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 text-gray-400 dark:text-[#94a3b8] hover:text-gray-600 dark:hover:text-[#f1f5f9] hover:bg-gray-100 dark:hover:bg-[#1e2d42] rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">
                    الاسم بالعربية *
                  </label>
                  <input
                    type="text"
                    required
                    dir="rtl"
                    value={form.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="الاسم بالعربية"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">
                    الاسم بالإنجليزية *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nameEn}
                    onChange={(e) => handleFieldChange("nameEn", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Name in English"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">
                    المنصب بالعربية *
                  </label>
                  <input
                    type="text"
                    required
                    dir="rtl"
                    value={form.role}
                    onChange={(e) => handleFieldChange("role", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="المنصب بالعربية"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">
                    المنصب بالإنجليزية
                  </label>
                  <input
                    type="text"
                    value={form.roleEn}
                    onChange={(e) => handleFieldChange("roleEn", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Role in English"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">
                  نبذة
                </label>
                <textarea
                  rows={3}
                  dir="rtl"
                  value={form.bio}
                  onChange={(e) => handleFieldChange("bio", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                  placeholder="نبذة عن العضو"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      الهاتف
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="+966 5X XXX XXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      البريد الإلكتروني
                    </span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">الترتيب</label>
                <input
                  type="number"
                  min="0"
                  value={form.order}
                  onChange={(e) => handleFieldChange("order", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">الصورة الشخصية</label>
                <FileUpload value={form.image} onChange={(url) => handleFieldChange("image", url)} folder="secretariat" type="image" />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-[#253347]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-[#cbd5e1] bg-gray-100 dark:bg-[#2a3d56] hover:bg-gray-200 dark:hover:bg-[#3b4f6b] rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? "جاري الحفظ..."
                    : editingItem
                      ? "تحديث العضو"
                      : "إنشاء عضو"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
