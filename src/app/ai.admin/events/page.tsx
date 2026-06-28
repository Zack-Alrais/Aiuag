"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, CalendarDays, MapPin, Clock, Users, X } from "lucide-react"

interface Event {
  id: string
  titleAr: string
  titleEn: string
  slug: string
  descriptionAr: string
  descriptionEn: string
  date: string
  time: string | null
  endTime: string | null
  location: string
  capacity: number | null
  category: string | null
  status: string
}

interface EventFormData {
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
  date: string
  time: string
  endTime: string
  location: string
  capacity: string
  category: string
  status: string
}

const emptyForm: EventFormData = {
  titleAr: "",
  titleEn: "",
  descriptionAr: "",
  descriptionEn: "",
  date: "",
  time: "",
  endTime: "",
  location: "",
  capacity: "",
  category: "",
  status: "upcoming",
}

export default function EventsManagement() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [form, setForm] = useState<EventFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/events")
      const json = await res.json()
      setEvents(json.data || [])
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const filteredEvents =
    filter === "all" ? events : events.filter((e) => e.status === filter)

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      upcoming: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      ongoing: "bg-blue-100 text-blue-800 border border-blue-200",
      completed: "bg-gray-100 text-gray-600 border border-gray-200",
      cancelled: "bg-red-100 text-red-800 border border-red-200",
    }
    return styles[status] || "bg-gray-100 text-gray-600 border border-gray-200"
  }

  const openAddModal = () => {
    setEditingEvent(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEditModal = (event: Event) => {
    setEditingEvent(event)
    const dateStr = event.date ? event.date.split("T")[0] : ""
    setForm({
      titleAr: event.titleAr,
      titleEn: event.titleEn,
      descriptionAr: event.descriptionAr,
      descriptionEn: event.descriptionEn,
      date: dateStr,
      time: event.time || "",
      endTime: event.endTime || "",
      location: event.location,
      capacity: event.capacity ? String(event.capacity) : "",
      category: event.category || "",
      status: event.status,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingEvent(null)
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
        date: form.date,
        time: form.time || null,
        endTime: form.endTime || null,
        location: form.location,
        capacity: form.capacity || null,
        category: form.category || null,
        status: form.status,
      }

      if (editingEvent) {
        await fetch(`/api/admin/events/${editingEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch("/api/admin/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      await fetchEvents()
      closeModal()
    } catch {
      // silently fail
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/events/${id}`, { method: "DELETE" })
      setDeleteConfirm(null)
      await fetchEvents()
    } catch {
      // silently fail
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-"
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="dark:bg-[#0b1120]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-7 w-7 text-blue-600 dark:text-[#60a5fa]" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#f1f5f9]">إدارة الأحداث</h1>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          إضافة حدث
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {["all", "upcoming", "ongoing", "completed", "cancelled"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize text-sm font-medium transition-colors ${
              filter === status
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#1e2d42] dark:text-[#cbd5e1] dark:hover:bg-[#2a3d56]"
            }`}
          >
            {status === "all" ? "الكل" : status === "upcoming" ? "قادم" : status === "ongoing" ? "جاري" : status === "completed" ? "مكتمل" : status === "cancelled" ? "ملغي" : status}
          </button>
        ))}
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
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <CalendarDays className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-sm">لا توجد أحداث</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 dark:bg-[#111927] dark:border-[#2a3d56]">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                    العنوان
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      التاريخ
                    </span>
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      الموقع
                    </span>
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      السعة
                    </span>
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-[#94a3b8] uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#253347]">
                {filteredEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="hover:bg-gray-50/50 transition-colors dark:hover:bg-[#1e2d42]"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 text-sm dark:text-[#f1f5f9]">
                          {event.titleAr}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 dark:text-[#7a8ba3]">
                          {event.titleEn}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#cbd5e1]">
                      {formatDate(event.date)}
                      {event.time && (
                        <span className="block text-xs text-gray-400 mt-0.5 dark:text-[#7a8ba3]">
                          {event.time}
                          {event.endTime ? ` - ${event.endTime}` : ""}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#cbd5e1] max-w-[200px] truncate">
                      {event.location}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(event.status)}`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#cbd5e1]">
                      {event.capacity ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(event)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {deleteConfirm === event.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(event.id)}
                              className="px-2.5 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
                            >
                              تأكيد
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2.5 py-1 bg-gray-200 text-gray-600 text-xs rounded-md hover:bg-gray-300 transition-colors"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(event.id)}
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
                {editingEvent ? "تعديل حدث" : "إضافة حدث جديد"}
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
                    العنوان بالعربي *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.titleAr}
                    onChange={(e) =>
                      setForm({ ...form, titleAr: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                    placeholder="العنوان بالعربية"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                    العنوان بالإنجليزي *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.titleEn}
                    onChange={(e) =>
                      setForm({ ...form, titleEn: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                    placeholder="Title in English"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                    الوصف بالعربي *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={form.descriptionAr}
                    onChange={(e) =>
                      setForm({ ...form, descriptionAr: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                    placeholder="الوصف بالعربية"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                    الوصف بالإنجليزي *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={form.descriptionEn}
                    onChange={(e) =>
                      setForm({ ...form, descriptionEn: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                    placeholder="Description in English"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      التاريخ *
                    </span>
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) =>
                      setForm({ ...form, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      وقت البداية
                    </span>
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) =>
                      setForm({ ...form, time: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      وقت النهاية
                    </span>
                  </label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) =>
                      setForm({ ...form, endTime: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      الموقع *
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                    placeholder="موقع الحدث"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      السعة
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.capacity}
                    onChange={(e) =>
                      setForm({ ...form, capacity: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                    placeholder="الحد الأقصى للحضور"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                    التصنيف
                  </label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                    placeholder="مثال: ورشة عمل"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                  الحالة
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
                >
                  <option value="upcoming">قادم</option>
                  <option value="ongoing">جاري</option>
                  <option value="completed">مكتمل</option>
                  <option value="cancelled">ملغي</option>
                </select>
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
                    : editingEvent
                      ? "تحديث الحدث"
                      : "إنشاء الحدث"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
