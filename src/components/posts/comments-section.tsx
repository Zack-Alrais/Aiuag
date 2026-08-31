"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Send, X, Check, Pencil, Trash2, Reply, LogIn } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface CommentItem {
  id: string
  content: string
  createdAt: string
  memberId: string
  memberName?: string | null
  memberImage?: string | null
  parentId?: string | null
  replies?: CommentItem[]
}

interface MemberIdentity {
  id: string
  name: string
  image?: string | null
}

interface CommentsSectionProps {
  postId: string
  lang: string
  member: MemberIdentity | null
  onCountChange?: (count: number) => void
  loginHref?: string
}

function Avatar({ src, name, size = 30 }: { src?: string | null | undefined; name?: string; size?: number }) {
  const [error, setError] = useState(false)
  const initials = name ? name.charAt(0) : "?"
  if (src && !error) {
    return (
      <div className="relative flex-shrink-0 rounded-full overflow-hidden" style={{ width: size, height: size }}>
        <img src={src} alt={name || ""} loading="lazy" className="rounded-full object-cover w-full h-full" onError={() => setError(true)} />
      </div>
    )
  }
  return (
    <div className="rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold flex-shrink-0" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {initials}
    </div>
  )
}

function countTotal(list: CommentItem[]): number {
  return list.reduce((sum, c) => sum + 1 + (Array.isArray(c.replies) ? c.replies.length : 0), 0)
}

export default function CommentsSection({ postId, lang, member, onCountChange, loginHref }: CommentsSectionProps) {
  const isArabic = lang === "ar"
  const [comments, setComments] = useState<CommentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [text, setText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyName, setReplyName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/posts/${postId}/comments`)
      const data = await res.json()
      const list: CommentItem[] = data.data || []
      setComments(list)
      onCountChange?.(countTotal(list))
    } catch {} finally {
      setLoading(false)
      setLoaded(true)
    }
  }, [postId, onCountChange])

  useEffect(() => { load() }, [load])

  const submit = async () => {
    const content = text.trim()
    if (!content || !member || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: member.id,
          content,
          ...(replyingTo ? { parentId: replyingTo } : {}),
        }),
      })
      if (res.ok) {
        const created = await res.json()
        const item: CommentItem = {
          id: created.id,
          content: created.content,
          createdAt: created.createdAt,
          memberId: created.memberId ?? member.id,
          memberName: created.memberName ?? member.name,
          memberImage: created.memberImage ?? member.image ?? null,
          parentId: created.parentId ?? null,
          replies: [],
        }
        let next: CommentItem[]
        if (replyingTo) {
          next = comments.map((c) =>
            c.id === replyingTo ? { ...c, replies: [...(c.replies || []), item] } : c
          )
        } else {
          next = [...comments, item]
        }
        setComments(next)
        setText("")
        setReplyingTo(null)
        setReplyName("")
        onCountChange?.(countTotal(next))
      } else {
        toast.error(isArabic ? "فشل إرسال التعليق" : "Failed to send comment")
      }
    } catch {
      toast.error(isArabic ? "خطأ في الاتصال" : "Connection error")
    } finally {
      setSubmitting(false)
    }
  }

  const removeFromList = (list: CommentItem[], id: string): CommentItem[] =>
    list
      .filter((c) => c.id !== id)
      .map((c) => (c.replies?.length ? { ...c, replies: removeFromList(c.replies, id) } : c))

  const del = async (commentId: string) => {
    if (!member) return
    try {
      const res = await fetch(`/api/posts/${postId}/comments/${commentId}?memberId=${encodeURIComponent(member.id)}`, {
        method: "DELETE",
      })
      if (res.ok) {
        const next = removeFromList(comments, commentId)
        setComments(next)
        onCountChange?.(countTotal(next))
      } else {
        toast.error(isArabic ? "غير مسموح بحذف التعليق" : "Not allowed to delete this comment")
      }
    } catch {
      toast.error(isArabic ? "خطأ في الاتصال" : "Connection error")
    }
  }

  const saveEdit = async (commentId: string) => {
    const content = editText.trim()
    if (!content || !member) return
    try {
      const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id, content }),
      })
      if (res.ok) {
        const update = (list: CommentItem[]): CommentItem[] =>
          list.map((c) =>
            c.id === commentId
              ? { ...c, content }
              : c.replies?.length ? { ...c, replies: update(c.replies) } : c
          )
        setComments((prev) => update(prev))
        setEditingId(null)
        setEditText("")
      } else {
        toast.error(isArabic ? "غير مسموح بتعديل التعليق" : "Not allowed to edit this comment")
      }
    } catch {
      toast.error(isArabic ? "خطأ في الاتصال" : "Connection error")
    }
  }

  const startReply = (c: CommentItem) => {
    setReplyingTo(c.id)
    setReplyName(c.memberName || (isArabic ? "عضو" : "Member"))
  }

  const renderComment = (c: CommentItem, isReply: boolean) => {
    const isOwn = !!member && c.memberId === member.id
    return (
      <div key={c.id} className={isReply ? "flex gap-2 mt-1.5" : "flex gap-2"}>
        <div className="shrink-0 mt-0.5"><Avatar src={c.memberImage} name={c.memberName || undefined} size={30} /></div>
        <div className="flex-1 min-w-0">
          {editingId === c.id ? (
            <div className="bg-background rounded-2xl border border-border px-3 py-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
                className="w-full bg-transparent text-sm text-text outline-none resize-none"
                dir="auto"
              />
              <div className="flex justify-end gap-2 mt-1">
                <button
                  onClick={() => { setEditingId(null); setEditText("") }}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-text-secondary"
                  aria-label={isArabic ? "إلغاء" : "Cancel"}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => saveEdit(c.id)}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-primary"
                  aria-label={isArabic ? "حفظ" : "Save"}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-background rounded-2xl border border-border px-3 py-2">
              <p className="text-xs font-semibold text-text">
                {c.memberName || (isArabic ? "عضو" : "Member")}
                {isReply && (isArabic ? " رداً على التعليق" : " replying")}
              </p>
              <p className="text-sm text-text-secondary mt-0.5 whitespace-pre-line">{c.content}</p>
            </div>
          )}
          <div className="flex items-center gap-2 mt-1 px-1">
            <span className="text-[10px] text-text-light">
              {new Date(c.createdAt).toLocaleDateString(isArabic ? "ar-SA" : "en-US", {
                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
              })}
            </span>
            <button
              onClick={() => startReply(c)}
              className="flex items-center gap-1 px-1 py-0.5 text-[11px] font-medium text-text-light hover:text-primary transition-colors"
            >
              <Reply className="w-3 h-3" />
              {isArabic ? "رد" : "Reply"}
            </button>
            {isOwn && (
              <>
                <button
                  onClick={() => { setEditingId(c.id); setEditText(c.content) }}
                  className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-text-light hover:text-text-secondary transition-colors"
                  aria-label={isArabic ? "تعديل" : "Edit"}
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => del(c.id)}
                  className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-text-light hover:text-red-500 transition-colors"
                  aria-label={isArabic ? "حذف" : "Delete"}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </>
            )}
          </div>

          {c.replies && c.replies.length > 0 && (
            <div className="mt-1 space-y-1.5 border-s-2 border-border/70 ps-3 ms-1 rtl:border-s-2 rtl:border-r-2 rtl:border-s-0">
              {c.replies.map((r) => renderComment(r, true))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Composer */}
      {member ? (
        <div className="flex items-start gap-2">
          <div className="shrink-0 mt-0.5"><Avatar src={member.image} name={member.name} size={32} /></div>
          <div className="flex-1 min-w-0">
            {replyingTo && (
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-xs text-text-light">
                  {isArabic ? `الرد على ${replyName}` : `Replying to ${replyName}`}
                </span>
                <button onClick={() => { setReplyingTo(null); setReplyName("") }} className="text-text-light hover:text-red-500 transition-colors" aria-label={isArabic ? "إلغاء الرد" : "Cancel reply"}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-1.5">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submit() }}
                placeholder={isArabic ? "اكتب تعليقاً..." : "Write a comment..."}
                className="flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-light"
                dir="auto"
              />
              <button onClick={submit} disabled={submitting || !text.trim()} className="text-primary disabled:opacity-30" aria-label={isArabic ? "إرسال" : "Send"}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-1.5 py-2 text-xs text-text-light">
          <LogIn className="w-3.5 h-3.5" />
           <Link href={loginHref || "/auth/login"} className="text-primary hover:underline">
            {isArabic ? "سجل الدخول للتعليق" : "Log in to comment"}
          </Link>
        </div>
      )}

      {/* List */}
      {loading && !loaded ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-text-secondary text-center py-2">
          {isArabic ? "لا توجد تعليقات بعد. كن أول من يعلق!" : "No comments yet. Be the first!"}
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => renderComment(c, false))}
        </div>
      )}
    </div>
  )
}