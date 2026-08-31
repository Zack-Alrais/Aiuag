"use client"

import { useState, useEffect, useCallback, Fragment } from "react"
import {
  MessageSquare, XCircle, Trash2, ThumbsUp, Loader2, Search,
  ChevronDown, ChevronUp, MessageSquareText, Plus,
} from "lucide-react"
import { useAdminLang } from "../admin-lang"

interface PostComment {
  id: string
  postId: string
  post?: { id: string; content: string; images?: string | null } | null
  memberId: string
  member?: { id: string; name: string; email: string; image?: string | null } | null
  content: string
  isApproved: boolean
  parentId?: string | null
  createdAt: string
}

interface ReactionMember {
  id: string
  name: string
  email?: string
  image?: string | null
}

interface ReactionBreakdown {
  count: number
  members: ReactionMember[]
}

interface ReactionPost {
  postId: string
  postContent: string
  postImage: string | null
  total: number
  breakdown: Record<string, ReactionBreakdown>
}

const REACTION_META: Record<string, { emoji: string }> = {
  like: { emoji: "👍" },
  love: { emoji: "❤️" },
  haha: { emoji: "😂" },
  wow: { emoji: "😮" },
  sad: { emoji: "😢" },
  angry: { emoji: "😡" },
}

export default function CommentsManagement() {
  const { lang, t } = useAdminLang()
  const [view, setView] = useState<"comments" | "reactions">("comments")
  const [comments, setComments] = useState<PostComment[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending">("all")
  const [search, setSearch] = useState("")
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const [reactions, setReactions] = useState<ReactionPost[]>([])
  const [reactionsLoading, setReactionsLoading] = useState(false)
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null)

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

  const fetchReactions = useCallback(async () => {
    try {
      setReactionsLoading(true)
      const res = await fetch("/api/admin/reactions")
      const json = await res.json()
      setReactions(json.data ?? [])
    } catch {
      setReactions([])
    } finally {
      setReactionsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (view === "comments") {
      fetchComments()
    } else {
      fetchReactions()
    }
  }, [view, fetchComments, fetchReactions])

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
        (c.post?.content ?? "").toLowerCase().includes(q)
      )
    })

  const truncate = (text: string, len: number) =>
    text.length > len ? text.slice(0, len) + "..." : text

  const postThumb = (c: PostComment) => {
    if (!c.post?.images) return null
    try {
      const arr = JSON.parse(c.post.images)
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : null
    } catch {
      return null
    }
  }

  const tabBtn = (value: "comments" | "reactions", label: string) => (
    <button
      onClick={() => setView(value)}
      className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors flex items-center gap-1.5 ${
        view === value
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#1e2d42] dark:text-[#cbd5e1] dark:hover:bg-[#2a3d56]"
      }`}
    >
      {value === "comments" ? <MessageSquareText className="w-4 h-4" /> : <ThumbsUp className="w-4 h-4" />}
      {label}
    </button>
  )

  return (
    <div className="space-y-6 dark:bg-[#0b1120] min-h-screen p-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="w-8 h-8 text-blue-600 dark:text-[#60a5fa]" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f1f5f9]">{t("comments.title")}</h1>
          <p className="text-sm text-gray-500 dark:text-[#94a3b8]">{t("comments.subtitle")}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabBtn("comments", t("comments.tab"))}
        {tabBtn("reactions", t("reactions.tab"))}
      </div>

      {view === "reactions" ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden dark:bg-[#1a2332] dark:border-[#2a3d56]">
          {reactionsLoading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin ms-2" />
              {t("reactions.loading")}
            </div>
          ) : reactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <ThumbsUp className="h-12 w-12 mb-3 opacity-40" />
              <p className="text-sm">{t("reactions.none")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60 dark:bg-[#111927] dark:border-[#2a3d56]">
                    <th className="px-4 py-3.5 text-start text-xs font-semibold text-gray-500 dark:text-[#94a3b8]">{t("reactions.post")}</th>
                    <th className="px-4 py-3.5 text-start text-xs font-semibold text-gray-500 dark:text-[#94a3b8]">{t("reactions.total")}</th>
                    <th className="px-4 py-3.5 text-start text-xs font-semibold text-gray-500 dark:text-[#94a3b8]">{t("reactions.reactionsType")}</th>
                    <th className="px-4 py-3.5 text-end text-xs font-semibold text-gray-500 dark:text-[#94a3b8]">{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#253347]">
                  {reactions.map((rp) => {
                    const entries = Object.entries(rp.breakdown).sort((a, b) => b[1].count - a[1].count)
                    const expanded = expandedPostId === rp.postId
                    return (
                      <Fragment key={rp.postId}>
                        <tr className="transition-colors hover:bg-gray-50/50 dark:hover:bg-[#1e2d42]">
                          <td className="px-4 py-4 max-w-[280px]">
                            <div className="flex items-center gap-2">
                              {rp.postImage && (
                                <img src={rp.postImage} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                              )}
                              <p className="text-sm text-gray-700 dark:text-[#e2e8f0] line-clamp-2" dir={lang === "ar" ? "rtl" : "ltr"}>
                                {truncate(rp.postContent || "-", 120)}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 dark:text-[#93c5fd] dark:bg-blue-900/30 dark:border-blue-800">
                              {rp.total}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {entries.map(([type, b]) => (
                                <span key={type} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-[#253347] text-gray-700 dark:text-[#cbd5e1]">
                                  <span>{REACTION_META[type]?.emoji ?? "👍"}</span>
                                  <b>{b.count}</b>
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-end">
                            <button
                              onClick={() => setExpandedPostId(expanded ? null : rp.postId)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-[#94a3b8] hover:bg-gray-100 dark:hover:bg-[#2a3d56] transition-colors"
                            >
                              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              {expanded ? t("reactions.collapse") : t("reactions.expand")}
                            </button>
                          </td>
                        </tr>
                        {expanded && (
                          <tr className="bg-gray-50/60 dark:bg-[#111927]">
                            <td colSpan={4} className="px-6 py-4">
                              <div className="space-y-3">
                                {entries.map(([type, b]) => (
                                  <div key={type} className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-[#e2e8f0] w-40 shrink-0">
                                      <span className="text-lg">{REACTION_META[type]?.emoji ?? "👍"}</span>
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-[#2a3d56]">
                                        {b.count}
                                      </span>
                                    </span>
                                    <span className="flex flex-wrap gap-1.5">
                                      {b.members.length === 0 ? (
                                        <span className="text-xs text-gray-400">{t("reactions.noMembers")}</span>
                                      ) : (
                                        b.members.map((m) => (
                                          <span key={m.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-[#1a2332] border border-gray-200 dark:border-[#2a3d56] text-xs text-gray-700 dark:text-[#cbd5e1]" title={m.email ?? m.name}>
                                            {m.image ? (
                                              <img src={m.image} alt="" className="w-5 h-5 rounded-full object-cover" />
                                            ) : (
                                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">
                                                {m.name.charAt(0)}
                                              </span>
                                            )}
                                            {m.name}
                                          </span>
                                        ))
                                      )}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2 flex-wrap">
              {([
                { value: "all", label: t("common.all") },
                { value: "pending", label: t("comments.pendingReview") },
                { value: "approved", label: t("common.approved") },
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
              <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#7a8ba3]" />
              <input
                type="text"
                placeholder={t("comments.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full ps-9 pe-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] dark:placeholder-[#7a8ba3]"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden dark:bg-[#1a2332] dark:border-[#2a3d56]">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin ms-2" />
                {t("comments.loading")}
              </div>
            ) : filteredComments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <MessageSquare className="h-12 w-12 mb-3 opacity-40" />
                <p className="text-sm">{t("comments.none")}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60 dark:bg-[#111927] dark:border-[#2a3d56]">
                      <th className="px-4 py-3.5 text-start text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">{t("comments.member")}</th>
                      <th className="px-4 py-3.5 text-start text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">{t("comments.post")}</th>
                      <th className="px-4 py-3.5 text-start text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">{t("comments.comment")}</th>
                      <th className="px-4 py-3.5 text-start text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">{t("common.date")}</th>
                      <th className="px-4 py-3.5 text-start text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">{t("common.status")}</th>
                      <th className="px-4 py-3.5 text-end text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">{t("common.actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#253347]">
                    {filteredComments.map((comment) => (
                      <tr key={comment.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-[#1e2d42]">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {comment.member?.image ? (
                              <img src={comment.member.image} alt="" className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold shrink-0">
                                {(comment.member?.name ?? "?").charAt(0)}
                              </span>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-[#f1f5f9]">
                                {comment.member?.name ?? comment.memberId}
                              </div>
                              {comment.member?.email && (
                                <div className="text-xs text-gray-400 dark:text-[#7a8ba3]">{comment.member.email}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 max-w-[220px]">
                          <p className="text-sm text-gray-600 dark:text-[#cbd5e1] line-clamp-2" dir={lang === "ar" ? "rtl" : "ltr"}>
                            {comment.post?.content ?? "-"}
                          </p>
                        </td>
                        <td className="px-4 py-4 max-w-[250px]">
                          <p className="text-sm text-gray-700 dark:text-[#e2e8f0] leading-relaxed" dir={lang === "ar" ? "rtl" : "ltr"}>
                            {comment.parentId && (
                              <span className="inline-flex items-center gap-0.5 me-1.5 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#253347] text-[10px] font-semibold text-gray-500 dark:text-[#94a3b8] align-middle">
                                <Plus className="w-2.5 h-2.5" />
                                {t("comments.replyBadge")}
                              </span>
                            )}
                            {truncate(comment.content, 100)}
                          </p>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-[#94a3b8]">
                          {new Date(comment.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
                            year: "numeric", month: "short", day: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            comment.isApproved
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                          }`}>
                            {comment.isApproved ? t("common.approved") : t("comments.pendingReview")}
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
                              title={comment.isApproved ? t("comments.unapprove") : t("comments.approve")}
                            >
                              {comment.isApproved ? <XCircle className="h-4 w-4" /> : <ThumbsUp className="h-4 w-4" />}
                            </button>
                            {deleteConfirmId === comment.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(comment.id)}
                                  className="px-2.5 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
                                >
                                  {t("common.confirm")}
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-2.5 py-1 bg-gray-200 text-gray-600 text-xs rounded-md hover:bg-gray-300 transition-colors"
                                >
                                  {t("common.cancel")}
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(comment.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title={t("common.delete")}
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
        </>
      )}
    </div>
  )
}