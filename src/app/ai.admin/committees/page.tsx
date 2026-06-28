"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, Building2, Mail, Phone, Users, X, ToggleLeft, ToggleRight } from "lucide-react"

interface Committee {
  id: string
  nameAr: string
  nameEn: string
  descriptionAr: string | null
  descriptionEn: string | null
  type: string
  chairNameAr: string | null
  chairNameEn: string | null
  email: string | null
  phone: string | null
  order: number | null
  isActive: boolean
}

interface CommitteeFormData {
  nameAr: string
  nameEn: string
  descriptionAr: string
  descriptionEn: string
  type: string
  chairNameAr: string
  chairNameEn: string
  email: string
  phone: string
  order: string
}

const emptyForm: CommitteeFormData = {
  nameAr: "",
  nameEn: "",
  descriptionAr: "",
  descriptionEn: "",
  type: "standing",
  chairNameAr: "",
  chairNameEn: "",
  email: "",
  phone: "",
  order: "",
}

export default function CommitteesManagement() {
  const [committees, setCommittees] = useState<Committee[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | string>("all")
  const [showModal, setShowModal] = useState(false)
  const [editingCommittee, setEditingCommittee] = useState<Committee | null>(null)
  const [form, setForm] = useState<CommitteeFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const fetchCommittees = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/committees")
      const json = await res.json()
      setCommittees(json.data ?? json.committees ?? [])
    } catch {
      setCommittees([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCommittees()
  }, [fetchCommittees])

  const filteredCommittees =
    filter === "all"
      ? committees
      : committees.filter((c) => c.type === filter)

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      standing: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-[#60a5fa] dark:border-blue-800/50",
      adhoc: "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:text-[#a78bfa] dark:border-purple-800/50",
      special: "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-[#fbbf24] dark:border-amber-800/50",
    }
    return styles[type] || "bg-gray-100 text-gray-600 border border-gray-200 dark:bg-[#2a3d56] dark:text-[#cbd5e1] dark:border-[#3b4f6b]"
  }

  const openAddModal = () => {
    setEditingCommittee(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEditModal = (committee: Committee) => {
    setEditingCommittee(committee)
    setForm({
      nameAr: committee.nameAr,
      nameEn: committee.nameEn,
      descriptionAr: committee.descriptionAr ?? "",
      descriptionEn: committee.descriptionEn ?? "",
      type: committee.type,
      chairNameAr: committee.chairNameAr ?? "",
      chairNameEn: committee.chairNameEn ?? "",
      email: committee.email ?? "",
      phone: committee.phone ?? "",
      order: committee.order != null ? String(committee.order) : "",
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCommittee(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload: Record<string, unknown> = {
        nameAr: form.nameAr,
        nameEn: form.nameEn,
        descriptionAr: form.descriptionAr || null,
        descriptionEn: form.descriptionEn || null,
        type: form.type,
        chairNameAr: form.chairNameAr || null,
        chairNameEn: form.chairNameEn || null,
        email: form.email || null,
        phone: form.phone || null,
        order: form.order ? Number(form.order) : null,
      }

      if (editingCommittee) {
        await fetch(`/api/admin/committees/${editingCommittee.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch("/api/admin/committees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      await fetchCommittees()
      closeModal()
    } catch {
      // silently fail
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/committees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })
      await fetchCommittees()
    } catch {
      // silently fail
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/committees/${id}`, { method: "DELETE" })
      setDeleteConfirmId(null)
      await fetchCommittees()
    } catch {
      // silently fail
    }
  }

  const handleFieldChange = (field: keyof CommitteeFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600 dark:text-[#60a5fa]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f1f5f9]">إدارة اللجان</h1>
            <p className="text-sm text-gray-500 dark:text-[#94a3b8]">إدارة اللجان التنظيمية وأعضائها</p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          إضافة لجنة
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", "standing", "adhoc", "special"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === type
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-[#2a3d56] text-gray-700 dark:text-[#cbd5e1] hover:bg-gray-200 dark:hover:bg-[#3b4f6b]"
            }`}
          >
            {type === "all" ? "جميع الأنواع" : type}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-[#1a2332] dark:border-[#2a3d56] rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 dark:text-[#3b4f6b]">
            <Users className="h-5 w-5 animate-spin mr-2" />
            جاري تحميل اللجان...
          </div>
        ) : filteredCommittees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-[#3b4f6b]">
            <Users className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-sm">لا توجد لجان</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#253347] bg-gray-50/60 dark:bg-[#111927]">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                      الاسم بالعربية
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        النوع
                      </span>
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        رئيس اللجنة
                      </span>
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        البريد الإلكتروني
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
                {filteredCommittees.map((committee) => (
                  <tr
                    key={committee.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-[#1e2d42] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-[#f1f5f9] text-sm">{committee.nameAr}</p>
                        <p className="text-xs text-gray-400 dark:text-[#94a3b8] mt-0.5">{committee.nameEn}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getTypeBadge(committee.type)}`}
                      >
                        {committee.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 dark:text-[#cbd5e1]">{committee.chairNameAr ?? "-"}</div>
                      {committee.chairNameEn && (
                        <div className="text-xs text-gray-400 dark:text-[#94a3b8] mt-0.5">{committee.chairNameEn}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#cbd5e1]">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-gray-400 dark:text-[#94a3b8]" />
                        {committee.email ?? "-"}
                      </span>
                      {committee.phone && (
                        <span className="flex items-center gap-1.5 mt-1 text-xs text-gray-400 dark:text-[#94a3b8]">
                          <Phone className="h-3 w-3" />
                          {committee.phone}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(committee.id, committee.isActive)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          committee.isActive
                            ? "bg-green-100 text-green-800 border border-green-200 hover:bg-green-200 dark:bg-green-900/30 dark:text-[#34d399] dark:border-green-800/50 dark:hover:bg-green-900/50"
                            : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200 dark:bg-[#2a3d56] dark:text-[#94a3b8] dark:border-[#3b4f6b] dark:hover:bg-[#3b4f6b]"
                        }`}
                      >
                        {committee.isActive ? (
                          <ToggleRight className="h-3.5 w-3.5" />
                        ) : (
                          <ToggleLeft className="h-3.5 w-3.5" />
                        )}
                        {committee.isActive ? "نشط" : "غير نشط"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(committee)}
                          className="p-2 text-blue-600 dark:text-[#60a5fa] hover:bg-blue-50 dark:hover:bg-[#1e2d42] rounded-lg transition-colors"
                           title="تعديل"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {deleteConfirmId === committee.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(committee.id)}
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
                            onClick={() => setDeleteConfirmId(committee.id)}
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
                {editingCommittee ? "تعديل لجنة" : "إضافة لجنة جديدة"}
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
                    value={form.nameAr}
                    onChange={(e) => handleFieldChange("nameAr", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="اسم اللجنة بالعربية"
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
                    placeholder="اسم اللجنة بالإنجليزية"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">
                    الوصف بالعربية
                  </label>
                  <textarea
                    rows={3}
                    value={form.descriptionAr}
                    onChange={(e) => handleFieldChange("descriptionAr", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                    placeholder="وصف اللجنة بالعربية"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">
                    الوصف بالإنجليزية
                  </label>
                  <textarea
                    rows={3}
                    value={form.descriptionEn}
                    onChange={(e) => handleFieldChange("descriptionEn", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                    placeholder="وصف اللجنة بالإنجليزية"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      النوع *
                    </span>
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => handleFieldChange("type", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                  >
                    <option value="standing">دورية</option>
                    <option value="adhoc">مؤقتة</option>
                    <option value="special">خاصة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">
                    الترتيب
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.order}
                    onChange={(e) => handleFieldChange("order", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="الترتيب الظاهر"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">
                    اسم رئيس اللجنة بالعربية
                  </label>
                  <input
                    type="text"
                    value={form.chairNameAr}
                    onChange={(e) => handleFieldChange("chairNameAr", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="اسم رئيس اللجنة بالعربية"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">
                    اسم رئيس اللجنة بالإنجليزية
                  </label>
                  <input
                    type="text"
                    value={form.chairNameEn}
                    onChange={(e) => handleFieldChange("chairNameEn", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="اسم الرئيس بالإنجليزية"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="chair@example.com"
                  />
                </div>
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
                    placeholder="+1 234 567 890"
                  />
                </div>
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
                     : editingCommittee
                       ? "تحديث اللجنة"
                       : "إنشاء اللجنة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}