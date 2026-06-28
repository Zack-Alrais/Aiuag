"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, Handshake, Globe, X } from "lucide-react"
import ImageUpload from "@/components/admin/ImageUpload"

interface Partner {
  id: string
  nameAr: string
  nameEn: string
  logo: string | null
  website: string | null
  descriptionAr: string | null
  descriptionEn: string | null
  type: "partner" | "sponsor" | "supporter"
  order: number
  isActive: boolean
}

interface PartnerFormData {
  nameAr: string
  nameEn: string
  logo: string
  website: string
  descriptionAr: string
  descriptionEn: string
  type: string
  order: string
}

const emptyForm: PartnerFormData = {
  nameAr: "",
  nameEn: "",
  logo: "",
  website: "",
  descriptionAr: "",
  descriptionEn: "",
  type: "partner",
  order: "0",
}

const typeLabels: Record<string, string> = {
  partner: "Partner",
  sponsor: "Sponsor",
  supporter: "Supporter",
}

const typeBadgeStyles: Record<string, string> = {
  partner: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-[#60a5fa] dark:border-blue-800/50",
  sponsor: "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:text-[#a78bfa] dark:border-purple-800/50",
  supporter: "bg-teal-100 text-teal-800 border border-teal-200 dark:bg-teal-900/30 dark:text-[#2dd4bf] dark:border-teal-800/50",
}

export default function PartnersManagement() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [form, setForm] = useState<PartnerFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/partners")
      const json = await res.json()
      setPartners(json.data ?? json.partners ?? [])
    } catch {
      setPartners([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPartners()
  }, [fetchPartners])

  const openAddModal = () => {
    setEditingPartner(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEditModal = (partner: Partner) => {
    setEditingPartner(partner)
    setForm({
      nameAr: partner.nameAr,
      nameEn: partner.nameEn,
      logo: partner.logo ?? "",
      website: partner.website ?? "",
      descriptionAr: partner.descriptionAr ?? "",
      descriptionEn: partner.descriptionEn ?? "",
      type: partner.type,
      order: String(partner.order),
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingPartner(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload: Record<string, unknown> = {
        nameAr: form.nameAr,
        nameEn: form.nameEn,
        logo: form.logo || null,
        website: form.website || null,
        descriptionAr: form.descriptionAr || null,
        descriptionEn: form.descriptionEn || null,
        type: form.type,
        order: Number(form.order) || 0,
      }

      if (editingPartner) {
        await fetch(`/api/admin/partners/${editingPartner.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch("/api/admin/partners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      await fetchPartners()
      closeModal()
    } catch {
      // silently fail
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/partners/${id}`, { method: "DELETE" })
      setDeleteConfirmId(null)
      await fetchPartners()
    } catch {
      // silently fail
    }
  }

  const handleFieldChange = (field: keyof PartnerFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Handshake className="w-8 h-8 text-blue-600 dark:text-[#60a5fa]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f1f5f9]">إدارة الشركاء</h1>
            <p className="text-sm text-gray-500 dark:text-[#94a3b8]">إدارة الشركاء والراعيين والداعمين</p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          إضافة شريك
        </button>
      </div>

      <div className="bg-white dark:bg-[#1a2332] dark:border-[#2a3d56] rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
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
        ) : partners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-[#3b4f6b]">
            <Handshake className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-sm">لا يوجد شركاء</p>
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
                      النوع
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5" />
                        الموقع الإلكتروني
                      </span>
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                      الترتيب
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
                {partners.map((partner) => (
                  <tr
                    key={partner.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-[#1e2d42] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {partner.logo ? (
                          <img
                            src={partner.logo}
                            alt={partner.nameAr}
                            className="w-10 h-10 rounded-lg object-contain bg-gray-50 dark:bg-[#111927] border border-gray-100 dark:border-[#2a3d56]"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#111927] flex items-center justify-center">
                            <Handshake className="w-5 h-5 text-gray-400 dark:text-[#3b4f6b]" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-[#f1f5f9] text-sm">{partner.nameAr}</p>
                          <p className="text-xs text-gray-400 dark:text-[#94a3b8] mt-0.5">{partner.nameEn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeBadgeStyles[partner.type] || "bg-gray-100 text-gray-600 border border-gray-200"}`}
                      >
                        {typeLabels[partner.type] || partner.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#cbd5e1]">
                      {partner.website ? (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                           className="flex items-center gap-1.5 text-blue-600 dark:text-[#60a5fa] hover:underline"
                        >
                          <Globe className="h-3.5 w-3.5" />
                          {partner.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#cbd5e1]">
                      {partner.order}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          partner.isActive
                            ? "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-[#34d399] dark:border-green-800/50"
                            : "bg-gray-100 text-gray-600 border border-gray-200 dark:bg-[#2a3d56] dark:text-[#cbd5e1] dark:border-[#3b4f6b]"
                        }`}
                      >
                        {partner.isActive ? "نشط" : "غير نشط"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(partner)}
                          className="p-2 text-blue-600 dark:text-[#60a5fa] hover:bg-blue-50 dark:hover:bg-[#1e2d42] rounded-lg transition-colors"
                           title="تعديل"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {deleteConfirmId === partner.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(partner.id)}
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
                            onClick={() => setDeleteConfirmId(partner.id)}
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
                {editingPartner ? "تعديل شريك" : "إضافة شريك جديد"}
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
                    value={form.nameAr}
                    onChange={(e) => handleFieldChange("nameAr", e.target.value)}
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

              <div>
                <ImageUpload
                  value={form.logo}
                  onChange={(url) => handleFieldChange("logo", url)}
                  folder="partners"
                  label="شعار الشريك"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">
                  <span className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    الموقع الإلكتروني
                  </span>
                </label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => handleFieldChange("website", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">
                  الوصف بالعربية
                </label>
                <textarea
                  rows={3}
                  dir="rtl"
                  value={form.descriptionAr}
                  onChange={(e) => handleFieldChange("descriptionAr", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                  placeholder="الوصف بالعربية"
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
                  placeholder="Description in English"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">
                    النوع *
                  </label>
                  <select
                    required
                    value={form.type}
                    onChange={(e) => handleFieldChange("type", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                  >
                    <option value="partner">شريك</option>
                    <option value="sponsor">راعي</option>
                    <option value="supporter">داعم</option>
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
                    placeholder="0"
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
                     : editingPartner
                       ? "تحديث الشريك"
                       : "إنشاء شريك"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
