"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  FileText, Download, Eye, Heart, MessageCircle, Share2, Calendar, User,
  Newspaper, CalendarClock, Megaphone, Plus, Send, Smile, Image as ImageIcon,
  X, ChevronDown, ChevronUp, MapPin, Clock, Users, Loader2, Search, ExternalLink,
  BarChart3, BookOpen, TrendingUp, Award, Target, Edit3, Trash2, Reply,
  MoreHorizontal, Camera, Video, Check, AlertCircle, Copy, Link
} from "lucide-react"

interface Post {
  id: string; content: string; images?: string | null; videos?: string | null; authorId?: string | null
  likes: number; sharesCount: number; createdAt: string; editedAt?: string | null
  _count: { comments: number; reactions: number; shares: number }
  reactionSummary: Record<string, number>
  author: { name: string; nameEn?: string; image?: string } | null
}

interface Publication {
  id: string; title: string; titleEn: string; description?: string; category?: string
  fileUrl?: string; imageUrl?: string; createdAt: string
}

interface NewsItem {
  id: string; title: string; excerpt: string; featuredImage?: string; category?: string; date: string
}

interface EventItem {
  id: string; title: string; description: string; featuredImage?: string; date: string
  time?: string; location: string; status: string; category?: string
  capacity?: number; registeredCount: number
}

interface CommentData {
  id: string; content: string; createdAt: string; editedAt?: string | null; memberId: string
  memberName?: string; member?: { id: string; name: string; email?: string }
  parentId?: string | null; replies?: CommentData[]
}

const REACTIONS = [
  { type: "like", emoji: "👍", emojiBig: "👍", labelAr: "أعجبني", labelEn: "Like", color: "text-blue-500" },
  { type: "love", emoji: "❤️", emojiBig: "❤️", labelAr: "أحببته", labelEn: "Love", color: "text-red-500" },
  { type: "haha", emoji: "😂", emojiBig: "😂", labelAr: "مضحك", labelEn: "Haha", color: "text-yellow-500" },
  { type: "wow", emoji: "😮", emojiBig: "😮", labelAr: "مذهل", labelEn: "Wow", color: "text-orange-500" },
  { type: "sad", emoji: "😢", emojiBig: "😢", labelAr: "محزن", labelEn: "Sad", color: "text-indigo-500" },
  { type: "angry", emoji: "😡", emojiBig: "😡", labelAr: "غاضب", labelEn: "Angry", color: "text-red-600" },
]

type Tab = "feed" | "reports" | "publications" | "news" | "events"

function formatRelative(d: string, isArabic: boolean) {
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return isArabic ? "الآن" : "Just now"
  if (mins < 60) return `${mins} ${isArabic ? "دقيقة" : "min"}`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} ${isArabic ? "ساعة" : "hr"}`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ${isArabic ? "يوم" : "day"}`
  return new Date(d).toLocaleDateString(isArabic ? "ar-EG" : "en-US", { year: "numeric", month: "short", day: "numeric" })
}

function formatDate(d: string, isArabic: boolean) {
  return new Date(d).toLocaleDateString(isArabic ? "ar-EG" : "en-US", { year: "numeric", month: "short", day: "numeric" })
}

export default function PublicationsFeedClient({
  initialPosts, reports, publications, news, events, isArabic, lang, currentMemberId,
}: {
  initialPosts: Post[]; reports: Publication[]; publications: Publication[]
  news: NewsItem[]; events: EventItem[]
  isArabic: boolean; lang: string; currentMemberId?: string | null
}) {
  const [activeTab, setActiveTab] = useState<Tab>("feed")
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialPosts.length >= 10)
  const [loadingMore, setLoadingMore] = useState(false)

  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostImages, setNewPostImages] = useState<string[]>([])
  const [newPostVideos, setNewPostVideos] = useState<string[]>([])
  const [posting, setPosting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({})
  const [comments, setComments] = useState<Record<string, CommentData[]>>({})
  const [commentText, setCommentText] = useState<Record<string, string>>({})
  const [replyTo, setReplyTo] = useState<Record<string, string | null>>({})
  const [submittingComment, setSubmittingComment] = useState<string | null>(null)

  const [reactingPost, setReactingPost] = useState<string | null>(null)
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null)

  const [editingPost, setEditingPost] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [editImages, setEditImages] = useState<string[]>([])
  const [editVideos, setEditVideos] = useState<string[]>([])

  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editCommentText, setEditCommentText] = useState("")

  const [copiedPost, setCopiedPost] = useState<string | null>(null)
  const [postMenu, setPostMenu] = useState<string | null>(null)

  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const res = await fetch(`/api/posts?page=${page + 1}&limit=10${currentMemberId ? `&memberId=${currentMemberId}` : ""}`)
      if (res.ok) {
        const data = await res.json()
        if (data.data?.length) {
          setPosts((prev) => [...prev, ...data.data])
          setPage((p) => p + 1)
          setHasMore(data.pagination.hasMore)
        } else {
          setHasMore(false)
        }
      }
    } catch {} finally {
      setLoadingMore(false)
    }
  }, [page, loadingMore, hasMore])

  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMorePosts()
      },
      { threshold: 0.1 }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [loadMorePosts])

  const uploadFiles = async (files: FileList | File[], folder = "posts"): Promise<string[]> => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("folder", folder)
      for (const file of files) formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (res.ok) {
        const data = await res.json()
        return data.urls || []
      }
    } catch {} finally {
      setUploading(false)
    }
    return []
  }

  const handleCreatePost = async () => {
    if ((!newPostContent.trim() && newPostImages.length === 0) || !currentMemberId) return
    setPosting(true)
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newPostContent.trim(),
          authorId: currentMemberId,
          images: newPostImages.length > 0 ? newPostImages : undefined,
          videos: newPostVideos.length > 0 ? newPostVideos : undefined,
        }),
      })
      if (res.ok) {
        const post = await res.json()
        setPosts((prev) => [post, ...prev])
        setNewPostContent("")
        setNewPostImages([])
        setNewPostVideos([])
        setShowCreatePost(false)
      }
    } catch {} finally {
      setPosting(false)
    }
  }

  const handleEditPost = async (postId: string) => {
    if (!editContent.trim() || !currentMemberId) return
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim(), authorId: currentMemberId, images: editImages, videos: editVideos }),
      })
      if (res.ok) {
        setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, content: editContent.trim(), images: editImages.length > 0 ? JSON.stringify(editImages) : p.images, editedAt: new Date().toISOString() } : p))
        setEditingPost(null)
      }
    } catch {}
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm(isArabic ? "هل أنت متأكد من حذف المنشور؟" : "Are you sure you want to delete this post?")) return
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" })
      if (res.ok) setPosts((prev) => prev.filter((p) => p.id !== postId))
    } catch {}
  }

  const handleReact = async (postId: string, type: string) => {
    if (!currentMemberId) return
    setReactingPost(postId)
    try {
      const res = await fetch(`/api/posts/${postId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, memberId: currentMemberId }),
      })
      if (res.ok) {
        const reactions = await res.json()
        const summary: Record<string, number> = {}
        let myType = ""
        reactions.forEach((r: { type: string; memberId: string }) => {
          summary[r.type] = (summary[r.type] || 0) + 1
          if (r.memberId === currentMemberId) myType = r.type
        })
        setPosts((prev) => prev.map((p) =>
          p.id === postId ? { ...p, reactionSummary: summary, _count: { ...p._count, reactions: reactions.length }, myReaction: myType as any } : p
        ))
      }
    } catch {} finally {
      setReactingPost(null)
      setShowReactionPicker(null)
    }
  }

  const toggleComments = async (postId: string) => {
    if (expandedComments[postId]) {
      setExpandedComments((prev) => ({ ...prev, [postId]: false }))
      return
    }
    setExpandedComments((prev) => ({ ...prev, [postId]: true }))
    if (!comments[postId]) {
      try {
        const res = await fetch(`/api/posts/${postId}/comments`)
        if (res.ok) {
          const data = await res.json()
          setComments((prev) => ({ ...prev, [postId]: data.data || [] }))
        }
      } catch {}
    }
  }

  const handleComment = async (postId: string) => {
    const text = commentText[postId]?.trim()
    if (!text || !currentMemberId) return
    setSubmittingComment(postId)
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, memberId: currentMemberId, parentId: replyTo[postId] || null }),
      })
      if (res.ok) {
        const comment = await res.json()
        const newComment: CommentData = {
          ...comment,
          memberName: isArabic ? "أنت" : "You",
          replies: [],
        }
        if (replyTo[postId]) {
          setComments((prev) => ({
            ...prev,
            [postId]: (prev[postId] || []).map((c) =>
              c.id === replyTo[postId]
                ? { ...c, replies: [...(c.replies || []), newComment] }
                : c
            ),
          }))
        } else {
          setComments((prev) => ({
            ...prev,
            [postId]: [...(prev[postId] || []), newComment],
          }))
        }
        setCommentText((prev) => ({ ...prev, [postId]: "" }))
        setReplyTo((prev) => ({ ...prev, [postId]: null }))
        setPosts((prev) => prev.map((p) =>
          p.id === postId ? { ...p, _count: { ...p._count, comments: p._count.comments + 1 } } : p
        ))
      }
    } catch {} finally {
      setSubmittingComment(null)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editCommentText.trim() || !currentMemberId) return
    try {
      const res = await fetch(`/api/posts/${editingComment}/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editCommentText.trim(), memberId: currentMemberId }),
      })
      if (res.ok) {
        const updateCommentInList = (cmts: CommentData[]): CommentData[] =>
          cmts.map((c) => {
            if (c.id === commentId) return { ...c, content: editCommentText.trim(), editedAt: new Date().toISOString() }
            if (c.replies) return { ...c, replies: updateCommentInList(c.replies) }
            return c
          })
        setComments((prev) => {
          const updated = { ...prev }
          for (const key of Object.keys(updated)) {
            updated[key] = updateCommentInList(updated[key])
          }
          return updated
        })
        setEditingComment(null)
        setEditCommentText("")
      }
    } catch {}
  }

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!confirm(isArabic ? "هل أنت متأكد من حذف التعليق؟" : "Are you sure you want to delete this comment?")) return
    try {
      const res = await fetch(`/api/posts/${postId}/comments/${commentId}?memberId=${currentMemberId}`, { method: "DELETE" })
      if (res.ok) {
        const removeFromList = (cmts: CommentData[]): CommentData[] =>
          cmts.filter((c) => {
            if (c.id === commentId) return false
            if (c.replies) c.replies = removeFromList(c.replies)
            return true
          })
        setComments((prev) => {
          const updated = { ...prev }
          if (updated[postId]) updated[postId] = removeFromList(updated[postId])
          return updated
        })
        setPosts((prev) => prev.map((p) =>
          p.id === postId ? { ...p, _count: { ...p._count, comments: Math.max(0, p._count.comments - 1) } } : p
        ))
      }
    } catch {}
  }

  const handleShare = async (postId: string) => {
    if (!currentMemberId) return
    try {
      const res = await fetch(`/api/posts/${postId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: currentMemberId }),
      })
      if (res.ok) {
        setPosts((prev) => prev.map((p) =>
          p.id === postId ? { ...p, sharesCount: p.sharesCount + 1, _count: { ...p._count, shares: p._count.shares + 1 } } : p
        ))
      }
    } catch {}
  }

  const handleCopyLink = async (postId: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${lang}/media/posts/${postId}`)
      setCopiedPost(postId)
      setTimeout(() => setCopiedPost(null), 2000)
    } catch {}
  }

  const parseImages = (images?: string | null): string[] => {
    if (!images) return []
    try { return JSON.parse(images) } catch { return [] }
  }

  const getMyReaction = (post: Post): string | null => {
    return (post as any).myReaction || null
  }

  const setMyReaction = (postId: string, type: string) => {
    setPosts((prev) => prev.map((p) =>
      p.id === postId ? { ...p, myReaction: type as any } : p
    ))
  }

  const tabs: { key: Tab; label: string; icon: typeof FileText; count: number; color: string }[] = [
    { key: "feed", label: isArabic ? "التفاعل" : "Feed", icon: Megaphone, count: posts.length, color: "text-blue-600" },
    { key: "reports", label: isArabic ? "التقارير" : "Reports", icon: BarChart3, count: reports.length, color: "text-emerald-600" },
    { key: "publications", label: isArabic ? "المنشورات" : "Publications", icon: BookOpen, count: publications.length, color: "text-amber-600" },
    { key: "news", label: isArabic ? "الأخبار" : "News", icon: Newspaper, count: news.length, color: "text-purple-600" },
    { key: "events", label: isArabic ? "الأحداث" : "Events", icon: CalendarClock, count: events.length, color: "text-rose-600" },
  ]

  const renderCommentItem = (comment: CommentData, postId: string, depth = 0) => {
    const isMine = comment.memberId === currentMemberId
    const isEditing = editingComment === comment.id

    return (
      <div key={comment.id} className={`${depth > 0 ? "me-8 mt-2" : "mt-3"}`}>
        <div className="flex gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="bg-surface rounded-xl px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-text">{comment.memberName || comment.member?.name || (isArabic ? "عضو" : "Member")}</p>
                {isMine && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingComment(comment.id); setEditCommentText(comment.content) }} className="p-0.5 hover:bg-gray-200 dark:hover:bg-dark-border rounded"><Edit3 className="w-3 h-3 text-text-secondary" /></button>
                    <button onClick={() => handleDeleteComment(postId, comment.id)} className="p-0.5 hover:bg-gray-200 dark:hover:bg-dark-border rounded"><Trash2 className="w-3 h-3 text-red-400" /></button>
                  </div>
                )}
              </div>
              {isEditing ? (
                <div className="mt-1 flex gap-2">
                  <input type="text" value={editCommentText} onChange={(e) => setEditCommentText(e.target.value)} className="flex-1 bg-background border border-border rounded-lg px-2 py-1 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary/30" autoFocus />
                  <button onClick={() => handleEditComment(comment.id)} className="p-1 bg-primary text-white rounded-lg"><Check className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setEditingComment(null)} className="p-1 text-text-secondary"><X className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-text mt-0.5">{comment.content}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-text-light">{formatRelative(comment.createdAt, isArabic)}</span>
                    {comment.editedAt && <span className="text-[10px] text-text-light">({isArabic ? "معدل" : "edited"})</span>}
                    {currentMemberId && depth === 0 && (
                      <button onClick={() => setReplyTo((prev) => ({ ...prev, [postId]: comment.id }))} className="text-[10px] text-primary font-medium hover:underline flex items-center gap-0.5">
                        <Reply className="w-2.5 h-2.5" />{isArabic ? "رد" : "Reply"}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        {comment.replies?.map((r) => renderCommentItem(r, postId, depth + 1))}
      </div>
    )
  }

  const renderPostCard = (post: Post) => {
    const images = parseImages(post.images)
    const myReaction = getMyReaction(post)
    const topReactions = Object.entries(post.reactionSummary)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type]) => REACTIONS.find((r) => r.type === type)?.emoji || "👍")
    const isMine = post.authorId === currentMemberId
    const isEditing = editingPost === post.id

    return (
      <div key={post.id} className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-white shadow-sm">
                {post.author?.image
                  ? <img src={post.author.image} alt="" className="w-11 h-11 rounded-full object-cover" />
                  : <User className="w-5 h-5 text-white" />}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-text text-sm">
                  {isArabic ? post.author?.name : (post.author?.nameEn || post.author?.name)}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-text-light">
                  <span>{formatRelative(post.createdAt, isArabic)}</span>
                  {post.editedAt && <span>({isArabic ? "معدل" : "edited"})</span>}
                </div>
              </div>
            </div>
            {isMine && (
              <div className="relative">
                <button onClick={() => setPostMenu(postMenu === post.id ? null : post.id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-card rounded-lg transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-text-secondary" />
                </button>
                {postMenu === post.id && (
                  <div className={`absolute top-full ${isArabic ? "left-0" : "right-0"} mt-1 w-36 bg-surface border border-border rounded-xl shadow-lg z-20 overflow-hidden`}>
                    <button onClick={() => { setEditingPost(post.id); setEditContent(post.content); setEditImages(parseImages(post.images)); setEditVideos(parseImages(post.videos)); setPostMenu(null) }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-text hover:bg-primary/5 transition-colors">
                      <Edit3 className="w-4 h-4" />{isArabic ? "تعديل" : "Edit"}
                    </button>
                    <button onClick={() => { handleDeletePost(post.id); setPostMenu(null) }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />{isArabic ? "حذف" : "Delete"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="px-5 pb-3">
            <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={4} className="w-full p-3 bg-background border border-border rounded-xl text-sm text-text resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" autoFocus />
            <div className="flex items-center gap-2 mt-2">
              <label className="p-2 hover:bg-primary/5 rounded-lg cursor-pointer text-text-secondary">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => { const urls = await uploadFiles(e.target.files!); setEditImages((prev) => [...prev, ...urls]) }} />
              </label>
              <div className="flex-1" />
              <button onClick={() => handleEditPost(post.id)} className="px-4 py-1.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-light transition-colors">{isArabic ? "حفظ" : "Save"}</button>
              <button onClick={() => setEditingPost(null)} className="px-4 py-1.5 text-text-secondary text-sm font-medium hover:bg-gray-100 rounded-xl transition-colors">{isArabic ? "إلغاء" : "Cancel"}</button>
            </div>
            {editImages.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {editImages.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setEditImages((prev) => prev.filter((_, j) => j !== i))} className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3 text-white" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {post.content && (
              <div className="px-5 pb-2">
                <p className="text-text text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>
              </div>
            )}

            {/* Images */}
            {images.length > 0 && (
              <div className={`mx-5 mb-3 rounded-xl overflow-hidden ${images.length === 1 ? "" : "grid grid-cols-2 gap-1"}`}>
                {images.slice(0, 4).map((img, i) => (
                  <div key={i} className={`relative ${images.length === 1 ? "aspect-video" : "aspect-square"} group`}>
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                    <a href={img} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                ))}
                {images.length > 4 && (
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    +{images.length - 4}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Stats */}
        <div className="px-5 pb-2 flex items-center justify-between text-xs text-text-light">
          <div className="flex items-center gap-1">
            {topReactions.length > 0 && <span className="text-sm">{topReactions.join("")}</span>}
            {post._count.reactions > 0 && <span>{post._count.reactions}</span>}
          </div>
          <div className="flex items-center gap-3">
            {post._count.comments > 0 && <span>{post._count.comments} {isArabic ? "تعليق" : "comments"}</span>}
            {post._count.shares > 0 && <span>{post._count.shares} {isArabic ? "مشاركة" : "shares"}</span>}
          </div>
        </div>

        <div className="mx-5 border-t border-border" />

        {/* Action Bar */}
        <div className="px-2 py-1 flex items-center">
          {/* Reaction */}
          <div className="relative flex-1">
            <button
              onClick={() => setShowReactionPicker(showReactionPicker === post.id ? null : post.id)}
              className={`flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium rounded-xl transition-all ${
                myReaction
                  ? REACTIONS.find((r) => r.type === myReaction)?.color + " bg-primary/5 scale-105"
                  : "text-text-secondary hover:bg-primary/5"
              }`}
            >
              {myReaction ? (
                <span className="text-lg animate-bounce-in">{REACTIONS.find((r) => r.type === myReaction)?.emoji}</span>
              ) : (
                <Heart className="w-4 h-4" />
              )}
              <span>{myReaction ? (isArabic ? REACTIONS.find((r) => r.type === myReaction)?.labelAr : REACTIONS.find((r) => r.type === myReaction)?.labelEn) : (isArabic ? "إعجاب" : "Like")}</span>
            </button>
            {showReactionPicker === post.id && (
              <div className={`absolute bottom-full ${isArabic ? "right-0" : "left-0"} mb-2 flex items-center gap-1 bg-surface rounded-full shadow-lg border border-border px-3 py-2 z-10 animate-slide-up`}>
                {REACTIONS.map((r, i) => (
                  <button
                    key={r.type}
                    onClick={() => { handleReact(post.id, myReaction === r.type ? "" : r.type); if (myReaction === r.type) setMyReaction(post.id, ""); else setMyReaction(post.id, r.type) }}
                    disabled={reactingPost === post.id}
                    className={`text-2xl hover:scale-125 transition-transform p-1 ${myReaction === r.type ? "scale-125" : ""}`}
                    style={{ animationDelay: `${i * 50}ms` }}
                    title={isArabic ? r.labelAr : r.labelEn}
                  >
                    {r.emojiBig}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Comment */}
          <button onClick={() => toggleComments(post.id)} className="flex items-center justify-center gap-2 flex-1 py-2.5 text-sm font-medium text-text-secondary hover:bg-primary/5 rounded-xl transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span>{isArabic ? "تعليق" : "Comment"}</span>
          </button>

          {/* Share */}
          <button onClick={() => handleShare(post.id)} className="flex items-center justify-center gap-2 flex-1 py-2.5 text-sm font-medium text-text-secondary hover:bg-primary/5 rounded-xl transition-colors">
            <Share2 className="w-4 h-4" />
            <span>{isArabic ? "مشاركة" : "Share"}</span>
          </button>

          {/* Copy Link */}
          <button onClick={() => handleCopyLink(post.id)} className="flex items-center justify-center flex-1 py-2.5 text-sm font-medium text-text-secondary hover:bg-primary/5 rounded-xl transition-colors">
            {copiedPost === post.id ? <Check className="w-4 h-4 text-green-500" /> : <Link className="w-4 h-4" />}
          </button>
        </div>

        {/* Comments Section */}
        {expandedComments[post.id] && (
          <div className="bg-background border-t border-border">
            <div className="p-4 max-h-80 overflow-y-auto">
              {(!comments[post.id] || comments[post.id].length === 0) && (
                <p className="text-xs text-text-light text-center py-2">
                  {isArabic ? "لا توجد تعليقات بعد" : "No comments yet"}
                </p>
              )}
              {comments[post.id]?.map((c) => renderCommentItem(c, post.id))}
            </div>
            {currentMemberId && (
              <div className="px-4 pb-3">
                {replyTo[post.id] && (
                  <div className="flex items-center gap-1 mb-2 text-xs text-primary">
                    <Reply className="w-3 h-3" />
                    <span>{isArabic ? "رد على تعليق" : "Replying to comment"}</span>
                    <button onClick={() => setReplyTo((prev) => ({ ...prev, [post.id]: null }))} className="me-auto p-0.5 hover:bg-gray-200 rounded"><X className="w-3 h-3" /></button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input type="text" placeholder={replyTo[post.id] ? (isArabic ? "اكتب رداً..." : "Write a reply...") : (isArabic ? "اكتب تعليقاً..." : "Write a comment...")}
                    value={commentText[post.id] || ""}
                    onChange={(e) => setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                    className="flex-1 bg-surface border border-border rounded-full px-4 py-2 text-sm text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button onClick={() => handleComment(post.id)} disabled={!commentText[post.id]?.trim() || submittingComment === post.id}
                    className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-light transition-colors disabled:opacity-50 shrink-0">
                    {submittingComment === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-background" dir={isArabic ? "rtl" : "ltr"}>
      {/* Tab Navigation */}
      <div className="bg-surface border-b border-border sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.key ? "bg-primary text-white shadow-md" : "text-text-secondary hover:bg-primary/5"
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.key ? "text-white" : tab.color}`} />
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.key ? "bg-white/20" : "bg-primary/10 text-primary"}`}>{tab.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Feed Tab */}
        {activeTab === "feed" && (
          <div className="space-y-4">
            {/* Create Post */}
            {currentMemberId && (
              <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                {!showCreatePost ? (
                  <button onClick={() => setShowCreatePost(true)} className="w-full p-4 flex items-center gap-3 hover:bg-primary/5 transition-colors">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-text-secondary text-sm text-start">{isArabic ? "بماذا تفكر؟ شاركنا..." : "What's on your mind? Share..."}</span>
                  </button>
                ) : (
                  <div>
                    <textarea placeholder={isArabic ? "اكتب منشورك هنا..." : "Write your post here..."} value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)} rows={4} autoFocus
                      className="w-full p-4 text-sm text-text bg-transparent border-none outline-none resize-none placeholder:text-text-light"
                    />
                    {(newPostImages.length > 0 || newPostVideos.length > 0) && (
                      <div className="px-4 flex gap-2 flex-wrap pb-2">
                        {newPostImages.map((url, i) => (
                          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button onClick={() => setNewPostImages((prev) => prev.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"><X className="w-3 h-3 text-white" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="px-4 pb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="p-2 hover:bg-primary/5 rounded-lg cursor-pointer text-text-secondary transition-colors">
                          <ImageIcon className="w-5 h-5" />
                          <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => { const urls = await uploadFiles(e.target.files!); setNewPostImages((prev) => [...prev, ...urls]) }} />
                        </label>
                        <label className="p-2 hover:bg-primary/5 rounded-lg cursor-pointer text-text-secondary transition-colors">
                          <Video className="w-5 h-5" />
                          <input type="file" accept="video/*" multiple className="hidden" onChange={async (e) => { const urls = await uploadFiles(e.target.files!); setNewPostVideos((prev) => [...prev, ...urls]) }} />
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setShowCreatePost(false); setNewPostContent(""); setNewPostImages([]); setNewPostVideos([]) }}
                          className="px-4 py-2 text-text-secondary text-sm font-medium hover:bg-gray-100 rounded-xl transition-colors">
                          {isArabic ? "إلغاء" : "Cancel"}
                        </button>
                        <button onClick={handleCreatePost} disabled={(!newPostContent.trim() && newPostImages.length === 0) || posting}
                          className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-light transition-colors disabled:opacity-50 shadow-md">
                          {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          {isArabic ? "نشر" : "Post"}
                        </button>
                      </div>
                    </div>
                    {uploading && <div className="px-4 pb-3"><div className="flex items-center gap-2 text-xs text-text-secondary"><Loader2 className="w-3 h-3 animate-spin" />{isArabic ? "جاري رفع الملفات..." : "Uploading files..."}</div></div>}
                  </div>
                )}
              </div>
            )}

            {/* Posts */}
            {posts.length === 0 ? (
              <div className="text-center py-16">
                <Megaphone className="w-16 h-16 mx-auto mb-4 text-text-light/30" />
                <p className="text-text-secondary font-medium">{isArabic ? "لا توجد مشاركات بعد" : "No posts yet"}</p>
                <p className="text-text-light text-sm mt-1">{isArabic ? "كن أول من يشارك!" : "Be the first to share!"}</p>
              </div>
            ) : (
              <>
                {posts.map(renderPostCard)}
                {/* Sentinel for infinite scroll */}
                <div ref={sentinelRef} className="h-4" />
                {loadingMore && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
                {!hasMore && posts.length > 0 && (
                  <p className="text-center text-text-light text-sm py-4">{isArabic ? "لا توجد منشورات أخرى" : "No more posts"}</p>
                )}
              </>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            {reports.length === 0 ? (
              <div className="text-center py-16">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-text-light/30" />
                <p className="text-text-secondary font-medium">{isArabic ? "لا توجد تقارير حالياً" : "No reports available"}</p>
              </div>
            ) : reports.map((pub) => (
              <div key={pub.id} className="bg-surface rounded-2xl border border-border overflow-hidden hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50 transition-all group">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-48 h-44 shrink-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 relative overflow-hidden">
                    {pub.imageUrl ? <img src={pub.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                      : <div className="w-full h-full flex items-center justify-center"><BarChart3 className="w-12 h-12 text-emerald-500/20" /></div>}
                    <div className="absolute top-3 start-3"><span className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-lg flex items-center gap-1"><TrendingUp className="w-3 h-3" />{isArabic ? "تقرير" : "Report"}</span></div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-text group-hover:text-emerald-600 transition-colors line-clamp-2">{isArabic ? pub.title : (pub.titleEn || pub.title)}</h3>
                      {pub.description && <p className="text-sm text-text-secondary mt-2 line-clamp-2">{pub.description}</p>}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-text-light flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(pub.createdAt, isArabic)}</span>
                      {pub.fileUrl && <a href={pub.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors"><Download className="w-3.5 h-3.5" />{isArabic ? "تحميل" : "Download"}</a>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Publications Tab */}
        {activeTab === "publications" && (
          <div className="space-y-4">
            {publications.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-text-light/30" />
                <p className="text-text-secondary font-medium">{isArabic ? "لا توجد منشورات حالياً" : "No publications available"}</p>
              </div>
            ) : publications.map((pub) => (
              <div key={pub.id} className="bg-surface rounded-2xl border border-border overflow-hidden hover:border-amber-200 hover:shadow-lg hover:shadow-amber-50 transition-all group">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-48 h-44 shrink-0 bg-gradient-to-br from-amber-500/10 to-amber-600/5 relative overflow-hidden">
                    {pub.imageUrl ? <img src={pub.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                      : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-12 h-12 text-amber-500/20" /></div>}
                    <div className="absolute top-3 start-3"><span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-lg flex items-center gap-1"><FileText className="w-3 h-3" />{isArabic ? "منشور" : "Publication"}</span></div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-text group-hover:text-amber-600 transition-colors line-clamp-2">{isArabic ? pub.title : (pub.titleEn || pub.title)}</h3>
                      {pub.description && <p className="text-sm text-text-secondary mt-2 line-clamp-2">{pub.description}</p>}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-text-light flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(pub.createdAt, isArabic)}</span>
                      {pub.fileUrl && <a href={pub.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-colors"><Download className="w-3.5 h-3.5" />{isArabic ? "تحميل" : "Download"}</a>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* News Tab */}
        {activeTab === "news" && (
          <div className="space-y-4">
            {news.length === 0 ? (
              <div className="text-center py-16">
                <Newspaper className="w-16 h-16 mx-auto mb-4 text-text-light/30" />
                <p className="text-text-secondary font-medium">{isArabic ? "لا توجد أخبار حالياً" : "No news available"}</p>
              </div>
            ) : news.map((item) => (
              <div key={item.id} className="bg-surface rounded-2xl border border-border overflow-hidden hover:border-purple-200 hover:shadow-lg hover:shadow-purple-50 transition-all group">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-52 h-44 shrink-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5 relative overflow-hidden">
                    {item.featuredImage ? <img src={item.featuredImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                      : <div className="w-full h-full flex items-center justify-center"><Newspaper className="w-12 h-12 text-purple-500/20" /></div>}
                    <div className="absolute top-3 start-3"><span className="px-2.5 py-1 bg-purple-500 text-white text-[10px] font-bold rounded-lg flex items-center gap-1"><Newspaper className="w-3 h-3" />{isArabic ? "خبر" : "News"}</span></div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {item.category && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">{item.category}</span>}
                      <h3 className="font-bold text-text group-hover:text-purple-600 transition-colors line-clamp-2 mt-1">{item.title}</h3>
                      <p className="text-sm text-text-secondary mt-2 line-clamp-2">{item.excerpt}</p>
                    </div>
                    <span className="text-xs text-text-light flex items-center gap-1 mt-3"><Calendar className="w-3.5 h-3.5" />{formatDate(item.date, isArabic)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="text-center py-16">
                <CalendarClock className="w-16 h-16 mx-auto mb-4 text-text-light/30" />
                <p className="text-text-secondary font-medium">{isArabic ? "لا توجد أحداث حالياً" : "No events available"}</p>
              </div>
            ) : events.map((item) => (
              <div key={item.id} className="bg-surface rounded-2xl border border-border overflow-hidden hover:border-rose-200 hover:shadow-lg hover:shadow-rose-50 transition-all group">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-52 h-44 shrink-0 bg-gradient-to-br from-rose-500/10 to-rose-600/5 relative overflow-hidden">
                    {item.featuredImage ? <img src={item.featuredImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                      : <div className="w-full h-full flex items-center justify-center"><CalendarClock className="w-12 h-12 text-rose-500/20" /></div>}
                    <div className="absolute top-3 start-3"><span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg text-white flex items-center gap-1 ${item.status === "upcoming" ? "bg-green-500" : item.status === "ongoing" ? "bg-blue-500" : "bg-gray-500"}`}>
                      <CalendarClock className="w-3 h-3" />{item.status === "upcoming" ? (isArabic ? "قادم" : "Upcoming") : item.status === "ongoing" ? (isArabic ? "جاري" : "Ongoing") : (isArabic ? "منتهي" : "Done")}</span></div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {item.category && <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs rounded-full">{item.category}</span>}
                      <h3 className="font-bold text-text group-hover:text-rose-600 transition-colors line-clamp-2 mt-1">{item.title}</h3>
                      <p className="text-sm text-text-secondary mt-2 line-clamp-2">{item.description}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-text-light mt-3">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(item.date, isArabic)}</span>
                      {item.time && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{item.time}</span>}
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{item.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
