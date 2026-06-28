"use client"

import { useState, useEffect, useCallback } from "react"
import { MessageSquare, Mail, Phone, User, Clock, CheckCircle, X, Eye } from "lucide-react"

interface Contact {
  id: number
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: "unread" | "read" | "replied"
  createdAt: string
  updatedAt: string
}

export default function ContactsManagement() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread" | "read" | "replied">("all")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [updating, setUpdating] = useState<number | null>(null)

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/contacts")
      if (res.ok) {
        const data = await res.json()
        setContacts(data.contacts ?? data.data ?? data)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const filteredContacts = contacts.filter((c) => filter === "all" || c.status === filter)

  const updateStatus = async (id: number, status: "read" | "replied") => {
    setUpdating(id)
    try {
      await fetch(`/api/admin/contacts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c))
      )
      if (selectedContact?.id === id) {
        setSelectedContact((prev) => (prev ? { ...prev, status } : prev))
      }
    } catch {
      // silent
    } finally {
      setUpdating(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      unread: "bg-blue-100 text-blue-800",
      read: "bg-green-100 text-green-800",
      replied: "bg-gray-100 text-gray-800",
    }
    return styles[status] || "bg-gray-100 text-gray-800"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      unread: "جديد",
      read: "مقروء",
      replied: "تم الرد",
    }
    return labels[status] || status
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const unreadCount = contacts.filter((c) => c.status === "unread").length

  return (
    <div className="space-y-6 dark:bg-[#0b1120]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-blue-600 dark:text-[#60a5fa]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f1f5f9]">رسائل الاتصال</h1>
            <p className="text-sm text-gray-500">
              إدارة رسائل نموذج الاتصال الواردة
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {unreadCount} جديد
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "unread", "read", "replied"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#1e2d42] dark:text-[#cbd5e1] dark:hover:bg-[#2a3d56]"
            }`}
          >
            {status === "all" ? "الكل" : getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-[#1a2332] dark:border dark:border-[#2a3d56]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-[#253347]">
            <thead className="bg-gray-50 dark:bg-[#111927]">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-[#94a3b8] uppercase">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    الاسم
                  </span>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-[#94a3b8] uppercase">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    البريد
                  </span>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-[#94a3b8] uppercase">
                  الموضوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-[#94a3b8] uppercase">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-[#94a3b8] uppercase">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    التاريخ
                  </span>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-[#94a3b8] uppercase">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#253347]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-[#94a3b8]">
                    جاري تحميل الرسائل...
                  </td>
                </tr>
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-[#94a3b8]">
                    لا توجد رسائل
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className={`hover:bg-gray-50 dark:hover:bg-[#1e2d42] transition-colors cursor-pointer ${
                      contact.status === "unread" ? "bg-blue-50/30 dark:bg-[#0d1a30]" : ""
                    }`}
                    onClick={() => setSelectedContact(contact)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800 dark:text-[#f1f5f9] text-sm">{contact.name}</div>
                      {contact.phone && (
                        <div className="text-xs text-gray-400 dark:text-[#7a8ba3] mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {contact.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#cbd5e1]">{contact.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-[#cbd5e1] max-w-[200px] truncate">
                      {contact.subject}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(contact.status)}`}
                      >
                        {getStatusLabel(contact.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(contact.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedContact(contact)}
                          className="p-2 text-blue-600 dark:text-[#60a5fa] hover:bg-blue-50 dark:hover:bg-[#2a3d56] rounded-lg transition-colors"
                          title="عرض الرسالة"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {contact.status === "unread" && (
                          <button
                            onClick={() => updateStatus(contact.id, "read")}
                            disabled={updating === contact.id}
                            className="p-2 text-green-600 dark:text-[#34d399] hover:bg-green-50 dark:hover:bg-[#2a3d56] rounded-lg transition-colors disabled:opacity-50"
                            title="تحديد كمقروء"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-[#1a2332] rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2a3d56]">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-[#60a5fa]" />
                <h2 className="text-xl font-bold text-gray-800 dark:text-[#f1f5f9]">تفاصيل الرسالة</h2>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-[#2a3d56] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-[#94a3b8]" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Sender Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 dark:text-[#7a8ba3] mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-[#7a8ba3] uppercase tracking-wide">الاسم</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-[#f1f5f9]">{selectedContact.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 dark:text-[#7a8ba3] mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-[#7a8ba3] uppercase tracking-wide">البريد</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-[#f1f5f9]">{selectedContact.email}</p>
                  </div>
                </div>
                {selectedContact.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 dark:text-[#7a8ba3] mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-[#7a8ba3] uppercase tracking-wide">الهاتف</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-[#f1f5f9]">{selectedContact.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 dark:text-[#7a8ba3] mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-[#7a8ba3] uppercase tracking-wide">التاريخ</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-[#f1f5f9]">
                      {formatDate(selectedContact.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <p className="text-xs text-gray-500 dark:text-[#7a8ba3] uppercase tracking-wide mb-1">الموضوع</p>
                <p className="text-sm font-medium text-gray-800 dark:text-[#f1f5f9]">{selectedContact.subject}</p>
              </div>

              {/* Message */}
              <div>
                <p className="text-xs text-gray-500 dark:text-[#7a8ba3] uppercase tracking-wide mb-1">الرسالة</p>
                <div className="bg-gray-50 dark:bg-[#111927] rounded-lg p-4">
                  <p className="text-sm text-gray-700 dark:text-[#cbd5e1] whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200 dark:border-[#253347]">
                <span className="text-sm text-gray-500 dark:text-[#94a3b8]">تحديث الحالة:</span>
                {selectedContact.status !== "read" && (
                  <button
                    onClick={() => updateStatus(selectedContact.id, "read")}
                    disabled={updating === selectedContact.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-[#0d2818] text-green-700 dark:text-[#34d399] rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-[#1a3a2a] transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    تحديد كمقروء
                  </button>
                )}
                {selectedContact.status !== "replied" && (
                  <button
                    onClick={() => updateStatus(selectedContact.id, "replied")}
                    disabled={updating === selectedContact.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-[#1e2d42] text-gray-700 dark:text-[#cbd5e1] rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-[#2a3d56] transition-colors disabled:opacity-50"
                  >
                    <Mail className="w-4 h-4" />
                    تحديد كتم الرد
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
