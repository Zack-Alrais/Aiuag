"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, Building2, Mail, Phone, Users, X } from "lucide-react"
import ImageUpload from "@/components/admin/ImageUpload"

interface BoardMember {
  id: string
  nameAr: string
  nameEn: string
  positionAr: string
  positionEn: string
  bioAr: string | null
  bioEn: string | null
  email: string
  phone: string | null
  photo: string | null
  order: number
  term: string | null
  isActive: boolean
}

interface BoardFormData {
  nameAr: string
  nameEn: string
  positionAr: string
  positionEn: string
  bioAr: string
  bioEn: string
  email: string
  phone: string
  photo: string
  order: string
  term: string
  isActive: string
}

const POSITIONS = [
  { ar: "رئيس الرابطة", en: "Head of Association" },
  { ar: "النائب", en: "Vice President" },
  { ar: "الأمين العام", en: "Secretary General" },
  { ar: "نائب الأمين العام لشؤون الرابطة", en: "Deputy Secretary General for Association Affairs" },
  { ar: "نائب رئيس الرابطة", en: "Deputy Head of Association" },
  { ar: "نائب الأمين العام والإدارة", en: "Deputy Secretary General and Administration" },
  { ar: "أمين الشؤون الإدارية", en: "Administrative Affairs Officer" },
  { ar: "أمين العلاقات الإدارية", en: "Administrative Relations Officer" },
  { ar: "أمين الشؤون الثقافية", en: "Cultural Affairs Officer" },
  { ar: "أمين الأكاديمية", en: "Academic Officer" },
  { ar: "أمين التخطيط والتدريب", en: "Planning and Training Officer" },
  { ar: "أمين الإعلام", en: "Public Relations Officer" },
  { ar: "أمين البحث والدراسات", en: "Research and Studies Officer" },
  { ar: "أمين تنمية العلاقات الاقتصادية", en: "Economic Relations Officer" },
  { ar: "أمين الشؤون الاجتماعية", en: "Social Affairs Officer" },
  { ar: "أمين الإحصاء والمعلومات والعضوية", en: "Statistics, Information and Membership Officer" },
  { ar: "أمينة الرأي", en: "Advisory Officer" },
  { ar: "نائب أمين الشؤون الإدارية", en: "Deputy Administrative Affairs Officer" },
  { ar: "نائب أمين العلاقات الإدارية", en: "Deputy Administrative Relations Officer" },
  { ar: "نائب أمين الشؤون الثقافية", en: "Deputy Cultural Affairs Officer" },
  { ar: "نائب الأمين الأكاديمية", en: "Deputy Academic Officer" },
  { ar: "نائب أمين التخطيط والتدريب", en: "Deputy Planning and Training Officer" },
  { ar: "نائب أمين البحث والدراسات", en: "Deputy Research and Studies Officer" },
  { ar: "نائب أمين تنمية العلاقات الاقتصادية", en: "Deputy Economic Relations Officer" },
  { ar: "نائبة أمينة الرأي", en: "Deputy Advisory Officer" },
  { ar: "عضو", en: "Member" },
]

const emptyForm: BoardFormData = {
  nameAr: "",
  nameEn: "",
  positionAr: "",
  positionEn: "",
  bioAr: "",
  bioEn: "",
  email: "",
  phone: "",
  photo: "",
  order: "0",
  term: "",
  isActive: "true",
}

export default function BoardManagement() {
  const [members, setMembers] = useState<BoardMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState<BoardMember | null>(null)
  const [form, setForm] = useState<BoardFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/board")
      const json = await res.json()
      setMembers(json.data ?? json.board ?? [])
    } catch {
      setMembers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const openAddModal = () => {
    setEditingMember(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEditModal = (member: BoardMember) => {
    setEditingMember(member)
    setForm({
      nameAr: member.nameAr,
      nameEn: member.nameEn,
      positionAr: member.positionAr,
      positionEn: member.positionEn,
      bioAr: member.bioAr ?? "",
      bioEn: member.bioEn ?? "",
      email: member.email,
      phone: member.phone ?? "",
      photo: member.photo ?? "",
      order: String(member.order),
      term: member.term ?? "",
      isActive: String(member.isActive),
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingMember(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload: Record<string, unknown> = {
        nameAr: form.nameAr,
        nameEn: form.nameEn,
        positionAr: form.positionAr,
        positionEn: form.positionEn,
        bioAr: form.bioAr || null,
        bioEn: form.bioEn || null,
        email: form.email,
        phone: form.phone || null,
        photo: form.photo || null,
        order: Number(form.order) || 0,
        term: form.term || null,
        isActive: form.isActive === "true",
      }

      if (editingMember) {
        await fetch(`/api/admin/board/${editingMember.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch("/api/admin/board", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      await fetchMembers()
      closeModal()
    } catch {
      // silently fail
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/board/${id}`, { method: "DELETE" })
      setDeleteConfirmId(null)
      await fetchMembers()
    } catch {
      // silently fail
    }
  }

  const handleFieldChange = (field: keyof BoardFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6 dark:bg-[#0b1120] min-h-screen p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
           <Building2 className="w-8 h-8 text-blue-600 dark:text-[#60a5fa]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f1f5f9]">إدارة مجلس الإدارة</h1>
            <p className="text-sm text-gray-500 dark:text-[#94a3b8]">أعضاء مجلس الإدارة ومناصبهم</p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          إضافة عضو مجلس
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden dark:bg-[#1a2332] dark:border-[#2a3d56]">
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
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-[#94a3b8]">
            <Building2 className="h-12 w-12 mb-3 opacity-40 dark:text-[#60a5fa]" />
            <p className="text-sm">لا يوجد أعضاء مجلس</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 dark:bg-[#111927] dark:border-[#2a3d56]">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-[#94a3b8]">
                      الاسم بالعربية
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-[#94a3b8]">
                      المنصب بالعربية
                    </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-[#94a3b8]">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      البريد
                    </span>
                  </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-[#94a3b8]">
                      الترتيب
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-[#94a3b8]">
                      الحالة
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-[#94a3b8]">
                      الإجراءات
                    </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#253347]">
                {members.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-gray-50/50 transition-colors dark:hover:bg-[#1e2d42]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {member.photo ? (
                          <img
                            src={member.photo}
                            alt={member.nameAr}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center dark:bg-[#111927]">
                            <Users className="w-5 h-5 text-blue-600 dark:text-[#60a5fa]" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 text-sm dark:text-[#f1f5f9]">{member.nameAr}</p>
                          <p className="text-xs text-gray-400 mt-0.5 dark:text-[#94a3b8]">{member.nameEn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#cbd5e1]">
                      {member.positionAr}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#cbd5e1]">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-gray-400 dark:text-[#94a3b8]" />
                        {member.email}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#cbd5e1]">
                      {member.order}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.isActive
                            ? "bg-green-100 text-green-800 border border-green-200 dark:bg-[#0d2818] dark:text-[#34d399] dark:border-[#1a3a2a]"
                            : "bg-gray-100 text-gray-600 border border-gray-200 dark:bg-[#111927] dark:text-[#94a3b8] dark:border-[#2a3d56]"
                        }`}
                      >
                        {member.isActive ? "نشط" : "غير نشط"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(member)}
                           className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:text-[#60a5fa] dark:hover:bg-[#2a3d56]"
                           title="تعديل"
                         >
                           <Pencil className="h-4 w-4 dark:text-[#60a5fa]" />
                        </button>
                        {deleteConfirmId === member.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(member.id)}
                               className="px-2.5 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors dark:hover:bg-red-800"
                            >
                              تأكيد
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                               className="px-2.5 py-1 bg-gray-200 text-gray-600 text-xs rounded-md hover:bg-gray-300 transition-colors dark:bg-[#2a3d56] dark:text-[#cbd5e1] dark:hover:bg-[#3b4f6b]"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(member.id)}
                             className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors dark:text-[#f87171] dark:hover:bg-[#2a3d56]"
                             title="حذف"
                           >
                             <Trash2 className="h-4 w-4 dark:text-[#f87171]" />
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
            className="absolute inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/70"
            onClick={closeModal}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto dark:bg-[#1a2332]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2a3d56]">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[#f1f5f9]">
                 {editingMember ? "تعديل عضو مجلس" : "إضافة عضو مجلس جديد"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors dark:text-[#94a3b8] dark:hover:text-[#f1f5f9] dark:hover:bg-[#2a3d56]"
              >
                <X className="h-5 w-5 dark:text-[#94a3b8]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#94a3b8]">
                     الاسم بالعربية *
                   </label>
                   <input
                     type="text"
                     required
                     dir="rtl"
                     value={form.nameAr}
                     onChange={(e) => handleFieldChange("nameAr", e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                     placeholder="الاسم بالعربية"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#94a3b8]">
                     الاسم بالإنجليزية *
                   </label>
                   <input
                     type="text"
                     required
                     value={form.nameEn}
                     onChange={(e) => handleFieldChange("nameEn", e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                     placeholder="الاسم بالإنجليزية"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#94a3b8]">
                     المنصب *
                   </label>
                   <select
                     required
                     value={form.positionAr}
                     onChange={(e) => {
                       const pos = POSITIONS.find(p => p.ar === e.target.value)
                       handleFieldChange("positionAr", e.target.value)
                       if (pos) handleFieldChange("positionEn", pos.en)
                     }}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                   >
                     <option value="">اختر المنصب</option>
                     {POSITIONS.map((p) => (
                       <option key={p.ar} value={p.ar}>{p.ar}</option>
                     ))}
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#94a3b8]">
                     المنصب بالإنجليزية
                   </label>
                   <input
                     type="text"
                     readOnly
                     value={form.positionEn}
                     className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 dark:bg-[#0b1120] dark:border-[#2a3d56] dark:text-[#94a3b8] outline-none"
                     placeholder="يملأ تلقائياً"
                  />
                </div>
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#94a3b8]">
                   نبذة بالعربية
                 </label>
                 <textarea
                   rows={3}
                   dir="rtl"
                   value={form.bioAr}
                   onChange={(e) => handleFieldChange("bioAr", e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                   placeholder="نبذة بالعربية"
                 />
               </div>

               <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#94a3b8]">
                   نبذة بالإنجليزية
                 </label>
                 <textarea
                   rows={3}
                   value={form.bioEn}
                   onChange={(e) => handleFieldChange("bioEn", e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                   placeholder="نبذة بالإنجليزية"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      البريد *
                    </span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      الهاتف
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                    placeholder="+966 5X XXX XXXX"
                  />
                </div>
              </div>

              <div>
                <ImageUpload
                  value={form.photo}
                  onChange={(url) => handleFieldChange("photo", url)}
                  folder="board"
                  label="صورة العضو"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                      الترتيب
                    </label>
                  <input
                    type="number"
                    min="0"
                    value={form.order}
                    onChange={(e) => handleFieldChange("order", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                    placeholder="0"
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                      الفترة
                    </label>
                  <input
                    type="text"
                    value={form.term}
                    onChange={(e) => handleFieldChange("term", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                    placeholder="e.g. 2024-2025"
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                      الحالة
                    </label>
                  <select
                    value={form.isActive}
                    onChange={(e) => handleFieldChange("isActive", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                  >
                    <option value="true">نشط</option>
                    <option value="false">غير نشط</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? "جاري الحفظ..."
                    : editingMember
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
