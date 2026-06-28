"use client"

import { useState, useEffect, useCallback } from "react"
import { MessageSquare, CheckCircle, XCircle, Trash2, ThumbsUp, Loader2, Search } from "lucide-react"

interface PostComment {
  id: string
  postId: string
  post?: { title: string }
  memberId: string
  member?: { id: string; name: string; email: string; image?: string | null }
  content: string
  isApproved: boolean
  createdAt: string
}

export default function CommentsManagement() {
  const [comments, setComments] = useState<PostComment[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending">("all")
  const [search, setSearch] = useState("")
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/comments")
      const json = await res.json()
      setComments(json.data ?? [])
    } catch {
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchComments() }, [fetchComments])

  const toggleApproval = async (comment: PostComment) => {
    try {
      await fetch(`/api/admin/comments/${comment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: !comment.isApproved }),
      })
      await fetchComments()
    } catch {}
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/comments/${id}`, { method: "DELETE" })
      setDeleteConfirmId(null)
      await fetchComments()
    } catch {}
  }

  const filteredComments = comments
    .filter((c) => filterStatus === "all" || (filterStatus === "approved" ? c.isApproved : !c.isApproved))
    .filter((c) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        c.content.toLowerCase().includes(q) ||
        (c.member?.name ?? "").toLowerCase().includes(q) ||
        (c.post?.title ?? "").toLowerCase().includes(q)
      )
    })

  const truncate = (text: string, len: number) =>
    text.length > len ? text.slice(0, len) + "..." : text

  return (
    <div className="space-y-6 dark:bg-[#0b1120] min-h-screen p-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="w-8 h-8 text-blue-600 dark:text-[#60a5fa]" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f1f5f9]">إدارة التعليقات</h1>
          <p className="text-sm text-gray-500 dark:text-[#94a3b8]">مراجعة وإدارة تعليقات المنشورات</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 flex-wrap">
          {([
            { value: "all", label: "الكل" },
            { value: "pending", label: "قيد المراجعة" },
            { value: "approved", label: "مقبول" },
          ] as const).map((item) => (
            <button
              key={item.value}
              onClick={() => setFilterStatus(item.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filterStatus === item.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#1e2d42] dark:text-[#cbd5e1] dark:hover:bg-[#2a3d56]"
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
            placeholder="بحث في التعليقات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] dark:placeholder-[#7a8ba3]"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden dark:bg-[#1a2332] dark:border-[#2a3d56]">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            جاري تحميل التعليقات...
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <MessageSquare className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-sm">لا يوجد تعليقات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 dark:bg-[#111927] dark:border-[#2a3d56]">
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">العضو</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">المنشور</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">التعليق</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">التاريخ</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">الحالة</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#253347]">
                {filteredComments.map((comment) => (
                  <tr key={comment.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-[#1e2d42]">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-[#f1f5f9]">
                        {comment.member?.name ?? comment.memberId}
                      </div>
                      {comment.member?.email && (
                        <div className="text-xs text-gray-400 dark:text-[#7a8ba3]">{comment.member.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 max-w-[200px]">
                      <p className="text-sm text-gray-600 dark:text-[#cbd5e1] truncate" title={comment.post?.title ?? ""}>
                        {comment.post?.title ?? "-"}
                      </p>
                    </td>
                    <td className="px-4 py-4 max-w-[250px]">
                      <p className="text-sm text-gray-700 dark:text-[#e2e8f0] leading-relaxed" dir="rtl">
                        {truncate(comment.content, 100)}
                      </p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-[#94a3b8]">
                      {new Date(comment.createdAt).toLocaleDateString("ar-EG", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        comment.isApproved
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                      }`}>
                        {comment.isApproved ? "مقبول" : "قيد المراجعة"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-start gap-1">
                        <button
                          onClick={() => toggleApproval(comment)}
                          className={`p-2 rounded-lg transition-colors ${
                            comment.isApproved
                              ? "text-yellow-600 hover:bg-yellow-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={comment.isApproved ? "إلغاء الموافقة" : "موافقة"}
                        >
                          {comment.isApproved ? <XCircle className="h-4 w-4" /> : <ThumbsUp className="h-4 w-4" />}
                        </button>
                        {deleteConfirmId === comment.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(comment.id)}
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
                            onClick={() => setDeleteConfirmId(comment.id)}
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
    </div>
  )
}
