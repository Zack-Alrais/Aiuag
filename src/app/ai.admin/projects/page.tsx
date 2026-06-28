"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, FolderOpen, Calendar, DollarSign, Search, X } from "lucide-react"
import ImageUpload from "@/components/admin/ImageUpload"

interface Project {
  id: string
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
  category: string
  status: "active" | "completed" | "paused"
  startDate: string
  endDate: string
  budget: number | null
  featuredImage: string
  createdAt: string
  updatedAt: string
}

interface ProjectFormData {
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
  category: string
  status: string
  startDate: string
  endDate: string
  budget: string
  featuredImage: string
}

const emptyForm: ProjectFormData = {
  titleAr: "",
  titleEn: "",
  descriptionAr: "",
  descriptionEn: "",
  category: "",
  status: "active",
  startDate: "",
  endDate: "",
  budget: "",
  featuredImage: "",
}

export default function ProjectsManagement() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "paused">("all")
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [form, setForm] = useState<ProjectFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/projects")
      const json = await res.json()
      setProjects(json.data ?? json.projects ?? [])
    } catch {
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const filteredProjects = projects
    .filter((p) => filter === "all" || p.status === filter)
    .filter(
      (p) =>
        p.titleAr.toLowerCase().includes(search.toLowerCase()) ||
        p.titleEn.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    )

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-100 text-green-800 border border-green-200",
      completed: "bg-blue-100 text-blue-800 border border-blue-200",
      paused: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    }
    return styles[status] || "bg-gray-100 text-gray-600 border border-gray-200"
  }

  const openAddModal = () => {
    setEditingProject(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEditModal = (project: Project) => {
    setEditingProject(project)
    setForm({
      titleAr: project.titleAr,
      titleEn: project.titleEn,
      descriptionAr: project.descriptionAr,
      descriptionEn: project.descriptionEn,
      category: project.category,
      status: project.status,
      startDate: project.startDate ? project.startDate.split("T")[0] : "",
      endDate: project.endDate ? project.endDate.split("T")[0] : "",
      budget: project.budget != null ? String(project.budget) : "",
      featuredImage: project.featuredImage || "",
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProject(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload = {
        titleAr: form.titleAr,
        titleEn: form.titleEn,
        descriptionAr: form.descriptionAr,
        descriptionEn: form.descriptionEn,
        category: form.category,
        status: form.status,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        budget: form.budget ? Number(form.budget) : null,
        featuredImage: form.featuredImage || null,
      }

      if (editingProject) {
        await fetch(`/api/admin/projects/${editingProject.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch("/api/admin/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      await fetchProjects()
      closeModal()
    } catch {
      // silently fail
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/projects/${id}`, { method: "DELETE" })
      setDeleteConfirmId(null)
      await fetchProjects()
    } catch {
      // silently fail
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatBudget = (budget: number | null) => {
    if (budget == null) return "-"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(budget)
  }

  const handleFieldChange = (field: keyof ProjectFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6 dark:bg-[#0b1120]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-8 w-8 text-blue-600 dark:text-[#60a5fa]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-[#f1f5f9]">إدارة المشاريع</h1>
            <p className="text-sm text-gray-500 dark:text-[#94a3b8]">إدارة وتنظيم مشاريع الرابطة</p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          إضافة مشروع
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 flex-wrap">
          {([
            { value: "all", label: "الكل" },
            { value: "active", label: "نشط" },
            { value: "completed", label: "مكتمل" },
            { value: "paused", label: "متوقف" },
          ] as const).map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`px-4 py-2 rounded-lg capitalize text-sm font-medium transition-colors ${
                filter === item.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#1e2d42] dark:text-[#cbd5e1] dark:hover:bg-[#2a3d56]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#7a8ba3]" />
          <input
            type="text"
            placeholder="بحث في المشاريع..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] dark:placeholder-[#7a8ba3]"
          />
        </div>
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
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FolderOpen className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-sm">لا توجد مشاريع</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 dark:bg-[#111927] dark:border-[#2a3d56]">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                    العنوان (بالعربية)
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                    الفئة
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5" />
                      الميزانية
                    </span>
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      النطاق الزمني
                    </span>
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#253347]">
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-gray-50/50 transition-colors dark:hover:bg-[#1e2d42]"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 text-sm dark:text-[#f1f5f9]">
                          {project.titleAr}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 dark:text-[#7a8ba3]">
                          {project.titleEn}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(project.status)}`}
                      >
                        {project.status === "active" ? "نشط" : project.status === "completed" ? "مكتمل" : "متوقف"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#cbd5e1]">
                      {project.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#cbd5e1]">
                      {formatBudget(project.budget)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#cbd5e1]">
                      <div>{formatDate(project.startDate)}</div>
                      <div className="text-xs text-gray-400 mt-0.5 dark:text-[#7a8ba3]">
                        إلى {formatDate(project.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(project)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {deleteConfirmId === project.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(project.id)}
                              className="px-2.5 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
                            >
                              تأكيد
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2.5 py-1 bg-gray-200 text-gray-600 text-xs rounded-md hover:bg-gray-300 transition-colors"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(project.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto dark:bg-[#1a2332] dark:border dark:border-[#2a3d56]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2a3d56]">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[#f1f5f9]">
                {editingProject ? "تعديل مشروع" : "إضافة مشروع جديد"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                    العنوان (بالعربية) *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.titleAr}
                    onChange={(e) => handleFieldChange("titleAr", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                    dir="rtl"
                    placeholder="العنوان بالعربية"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                    العنوان (بالإنجليزية) *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.titleEn}
                    onChange={(e) => handleFieldChange("titleEn", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                    placeholder="عنوان المشروع بالإنجليزية"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                    الوصف (بالعربية) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={form.descriptionAr}
                    onChange={(e) =>
                      handleFieldChange("descriptionAr", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                    dir="rtl"
                    placeholder="الوصف بالعربية"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                    الوصف (بالإنجليزية) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={form.descriptionEn}
                    onChange={(e) =>
                      handleFieldChange("descriptionEn", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                    placeholder="الوصف بالإنجليزية"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                    الفئة *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.category}
                    onChange={(e) => handleFieldChange("category", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                    placeholder="مثال: البحث، التطوير"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                    الحالة *
                  </label>
                  <select
                    required
                    value={form.status}
                    onChange={(e) => handleFieldChange("status", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                  >
                    <option value="active">نشط</option>
                    <option value="completed">مكتمل</option>
                    <option value="paused">متوقف</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      تاريخ البداية
                    </span>
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => handleFieldChange("startDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      تاريخ النهاية
                    </span>
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => handleFieldChange("endDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5" />
                      الميزانية (دولار أمريكي)
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.budget}
                    onChange={(e) => handleFieldChange("budget", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                    placeholder="0"
                  />
                </div>
              </div>

              <ImageUpload
                value={form.featuredImage}
                onChange={(url) => handleFieldChange("featuredImage", url)}
                folder="projects"
                label="الصورة الرئيسية"
              />

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
                    : editingProject
                      ? "تحديث المشروع"
                      : "إنشاء مشروع"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
