"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, MapPin, Mail, Phone, Building, User, X } from "lucide-react"

interface Branch {
  id: string
  name: string
  nameEn: string
  city: string | null
  country: string | null
  status: string | null
  type: string | null
  address: string | null
  phone: string | null
  email: string | null
  headName: string | null
  memberCount: number | null
  createdAt: string
}

interface BranchFormData {
  name: string
  nameEn: string
  city: string
  country: string
  status: string
  type: string
  address: string
  phone: string
  email: string
  headName: string
}

const emptyForm: BranchFormData = {
  name: "",
  nameEn: "",
  city: "",
  country: "",
  status: "active",
  type: "sudan",
  address: "",
  phone: "",
  email: "",
  headName: "",
}

export default function BranchesManagement() {
  const [items, setItems] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Branch | null>(null)
  const [form, setForm] = useState<BranchFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/branches")
      const json = await res.json()
      setItems(json.data ?? json.branches ?? [])
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

  const openEditModal = (item: Branch) => {
    setEditingItem(item)
    setForm({
      name: item.name,
      nameEn: item.nameEn,
      city: item.city ?? "",
      country: item.country ?? "",
      status: item.status ?? "active",
      type: item.type ?? "sudan",
      address: item.address ?? "",
      phone: item.phone ?? "",
      email: item.email ?? "",
      headName: item.headName ?? "",
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
        city: form.city || null,
        country: form.country || null,
        status: form.status || "active",
        type: form.type || "sudan",
        address: form.address || null,
        phone: form.phone || null,
        email: form.email || null,
        headName: form.headName || null,
      }

      if (editingItem) {
        await fetch(`/api/admin/branches/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch("/api/admin/branches", {
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
      await fetch(`/api/admin/branches/${id}`, { method: "DELETE" })
      setDeleteConfirmId(null)
      await fetchItems()
    } catch {
      // silently fail
    }
  }

  const handleFieldChange = (field: keyof BranchFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <MapPin className="w-8 h-8 text-blue-600 dark:text-[#60a5fa]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f1f5f9]">إدارة الفروع</h1>
            <p className="text-sm text-gray-500 dark:text-[#94a3b8]">{items.length} فرع مسجل</p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          إضافة فرع
        </button>
      </div>

      <div className="bg-white dark:bg-[#1a2332] dark:border-[#2a3d56] rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 dark:text-[#3b4f6b]">
            <Building className="h-5 w-5 animate-spin mr-2" />
            جاري تحميل الفروع...
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-[#3b4f6b]">
            <Building className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-sm">لا توجد فروع</p>
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
                      <MapPin className="h-3.5 w-3.5" />
                      الموقع
                    </span>
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      التواصل
                    </span>
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      مدير الفرع
                    </span>
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                    الحالة
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
                      <div>
                        <p className="font-medium text-gray-900 dark:text-[#f1f5f9] text-sm">{item.name}</p>
                        <p className="text-xs text-gray-400 dark:text-[#94a3b8] mt-0.5">{item.nameEn}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#cbd5e1]">
                      <div>{item.city ?? "-"}</div>
                      {item.country && (
                        <div className="text-xs text-gray-400 dark:text-[#94a3b8] mt-0.5">{item.country}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#cbd5e1]">
                      {item.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-gray-400 dark:text-[#94a3b8]" />
                          {item.phone}
                        </span>
                      )}
                      {item.email && (
                        <span className="flex items-center gap-1.5 mt-1 text-xs text-gray-400 dark:text-[#94a3b8]">
                          <Mail className="h-3 w-3" />
                          {item.email}
                        </span>
                      )}
                      {!item.phone && !item.email && "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#cbd5e1]">
                      {item.headName ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                        item.status === "establishing" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                        {item.status === "active" ? "نشط" : item.status === "establishing" ? "قيد التأسيس" : "مخطط له"}
                      </span>
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
          />
          <div className="relative bg-white dark:bg-[#1a2332] rounded-2xl shadow-2xl dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#253347]">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[#f1f5f9]">
                {editingItem ? "تعديل فرع" : "إضافة فرع جديد"}
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
                    اسم الفرع بالعربية *
                  </label>
                  <input
                    type="text"
                    required
                    dir="rtl"
                    value={form.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="اسم الفرع بالعربية"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">
                    اسم الفرع بالإنجليزية *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nameEn}
                    onChange={(e) => handleFieldChange("nameEn", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Branch name in English"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      المدينة
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => handleFieldChange("city", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="المدينة"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">
                    الدولة
                  </label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => handleFieldChange("country", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="الدولة"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">
                    الحالة
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => handleFieldChange("status", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="active">نشط</option>
                    <option value="establishing">قيد التأسيس</option>
                    <option value="planned">مخطط له</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">
                    النوع
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => handleFieldChange("type", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="sudan">السودان</option>
                    <option value="africa">أفريقيا والعالم</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">
                  العنوان
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => handleFieldChange("address", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="العنوان التفصيلي"
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
                    placeholder="branch@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    اسم مدير الفرع
                  </span>
                </label>
                <input
                  type="text"
                  value={form.headName}
                  onChange={(e) => handleFieldChange("headName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="اسم مدير الفرع"
                />
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
                      ? "تحديث الفرع"
                      : "إنشاء فرع"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
