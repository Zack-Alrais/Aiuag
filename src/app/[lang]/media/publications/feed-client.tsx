"use client"

import { useState, useEffect, useCallback } from "react"
import {
  FileText, Download, Eye, Heart, MessageCircle, Share2, Calendar, User,
  Newspaper, CalendarClock, Megaphone, Plus, Send, Smile, Image as ImageIcon,
  X, ChevronDown, ChevronUp, MapPin, Clock, Users, Loader2, Search, ExternalLink,
  BarChart3, BookOpen, TrendingUp, Award, Target
} from "lucide-react"

interface Post {
  id: string; content: string; images?: string | null; videos?: string | null; authorId?: string | null
  likes: number; sharesCount: number; createdAt: string
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

interface Comment {
  id: string; content: string; createdAt: string; memberId: string
  memberName?: string; member?: { id: string; name: string; email?: string }
}

const REACTIONS = [
  { type: "like", emoji: "👍", label: "أعجبني" },
  { type: "love", emoji: "❤️", label: "أحببته" },
  { type: "haha", emoji: "😂", label: "مضحك" },
  { type: "wow", emoji: "😮", label: "مذهل" },
  { type: "sad", emoji: "😢", label: "محزن" },
  { type: "angry", emoji: "😡", label: "غاضب" },
]

type Tab = "feed" | "reports" | "publications" | "news" | "events"

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
  const [posting, setPosting] = useState(false)

  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({})
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [commentText, setCommentText] = useState<Record<string, string>>({})
  const [submittingComment, setSubmittingComment] = useState<string | null>(null)

  const [reactingPost, setReactingPost] = useState<string | null>(null)
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null)

  const formatDate = (d: string) => new Date(d).toLocaleDateString(isArabic ? "ar-EG" : "en-US", {
    year: "numeric", month: "short", day: "numeric",
  })

  const formatRelative = (d: string) => {
    const diff = Date.now() - new Date(d).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return isArabic ? "الآن" : "Just now"
    if (mins < 60) return `${mins} ${isArabic ? "دقيقة" : "min"}`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} ${isArabic ? "ساعة" : "hr"}`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days} ${isArabic ? "يوم" : "day"}`
    return formatDate(d)
  }

  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const res = await fetch(`/api/posts?page=${page + 1}&limit=10`)
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

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !currentMemberId) return
    setPosting(true)
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPostContent.trim(), authorId: currentMemberId }),
      })
      if (res.ok) {
        const post = await res.json()
        setPosts((prev) => [post, ...prev])
        setNewPostContent("")
        setShowCreatePost(false)
      }
    } catch {} finally {
      setPosting(false)
    }
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
        reactions.forEach((r: { type: string }) => {
          summary[r.type] = (summary[r.type] || 0) + 1
        })
        setPosts((prev) => prev.map((p) =>
          p.id === postId ? { ...p, reactionSummary: summary, _count: { ...p._count, reactions: reactions.length } } : p
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
        body: JSON.stringify({ content: text, memberId: currentMemberId }),
      })
      if (res.ok) {
        const comment = await res.json()
        setComments((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), { ...comment, memberName: isArabic ? "أنت" : "You" }],
        }))
        setCommentText((prev) => ({ ...prev, [postId]: "" }))
        setPosts((prev) => prev.map((p) =>
          p.id === postId ? { ...p, _count: { ...p._count, comments: p._count.comments + 1 } } : p
        ))
      }
    } catch {} finally {
      setSubmittingComment(null)
    }
  }

  const parseImages = (images?: string | null): string[] => {
    if (!images) return []
    try { return JSON.parse(images) } catch { return [] }
  }

  const tabs: { key: Tab; label: string; icon: typeof FileText; count: number; color: string }[] = [
    { key: "feed", label: isArabic ? "التفاعل" : "Feed", icon: Megaphone, count: posts.length, color: "text-blue-600" },
    { key: "reports", label: isArabic ? "التقارير" : "Reports", icon: BarChart3, count: reports.length, color: "text-emerald-600" },
    { key: "publications", label: isArabic ? "المنشورات" : "Publications", icon: BookOpen, count: publications.length, color: "text-amber-600" },
    { key: "news", label: isArabic ? "الأخبار" : "News", icon: Newspaper, count: news.length, color: "text-purple-600" },
    { key: "events", label: isArabic ? "الأحداث" : "Events", icon: CalendarClock, count: events.length, color: "text-rose-600" },
  ]

  const renderPostCard = (post: Post) => {
    const images = parseImages(post.images)
    const topReactions = Object.entries(post.reactionSummary)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type]) => REACTIONS.find((r) => r.type === type)?.emoji || "👍")

    return (
      <div key={post.id} className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-white shadow-sm">
              {post.author?.image
                ? <img src={post.author.image} alt="" className="w-11 h-11 rounded-full object-cover" />
                : <User className="w-5 h-5 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-text text-sm">
                {isArabic ? post.author?.name : (post.author?.nameEn || post.author?.name)}
              </p>
              <p className="text-xs text-text-light">{formatRelative(post.createdAt)}</p>
            </div>
          </div>

          {post.content && (
            <p className="text-text text-sm whitespace-pre-wrap mb-4 leading-relaxed">{post.content}</p>
          )}

          {images.length > 0 && (
            <div className={`mb-4 rounded-xl overflow-hidden ${images.length === 1 ? "" : "grid grid-cols-2 gap-1"}`}>
              {images.slice(0, 4).map((img, i) => (
                <div key={i} className={`relative ${images.length === 1 ? "aspect-video" : "aspect-square"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          )}
        </div>

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

        <div className="px-2 py-1 flex items-center">
          <div className="relative flex-1">
            <button
              onClick={() => setShowReactionPicker(showReactionPicker === post.id ? null : post.id)}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-text-secondary hover:bg-primary/5 rounded-xl transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span>{isArabic ? "إعجاب" : "Like"}</span>
            </button>
            {showReactionPicker === post.id && (
              <div className="absolute bottom-full left-0 mb-2 flex items-center gap-1 bg-surface rounded-full shadow-lg border border-border px-2 py-1.5 z-10">
                {REACTIONS.map((r) => (
                  <button
                    key={r.type}
                    onClick={() => handleReact(post.id, r.type)}
                    disabled={reactingPost === post.id}
                    className="text-2xl hover:scale-125 transition-transform p-1"
                    title={r.label}
                  >
                    {r.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => toggleComments(post.id)}
            className="flex items-center justify-center gap-2 flex-1 py-2.5 text-sm font-medium text-text-secondary hover:bg-primary/5 rounded-xl transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{isArabic ? "تعليق" : "Comment"}</span>
          </button>
          <button className="flex items-center justify-center gap-2 flex-1 py-2.5 text-sm font-medium text-text-secondary hover:bg-primary/5 rounded-xl transition-colors">
            <Share2 className="w-4 h-4" />
            <span>{isArabic ? "مشاركة" : "Share"}</span>
          </button>
        </div>

        {expandedComments[post.id] && (
          <div className="bg-background border-t border-border">
            <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
              {(comments[post.id] || []).length === 0 && (
                <p className="text-xs text-text-light text-center py-2">
                  {isArabic ? "لا توجد تعليقات بعد" : "No comments yet"}
                </p>
              )}
              {(comments[post.id] || []).map((c) => (
                <div key={c.id} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 bg-surface rounded-xl px-3 py-2">
                    <p className="text-xs font-medium text-text">{c.memberName || c.member?.name || (isArabic ? "عضو" : "Member")}</p>
                    <p className="text-sm text-text mt-0.5">{c.content}</p>
                    <p className="text-[10px] text-text-light mt-1">{formatRelative(c.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 pb-3 flex gap-2">
              <input
                type="text"
                placeholder={isArabic ? "اكتب تعليقاً..." : "Write a comment..."}
                value={commentText[post.id] || ""}
                onChange={(e) => setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                className="flex-1 bg-surface border border-border rounded-full px-4 py-2 text-sm text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={() => handleComment(post.id)}
                disabled={!commentText[post.id]?.trim() || submittingComment === post.id}
                className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-light transition-colors disabled:opacity-50"
              >
                {submittingComment === post.id
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderReportCard = (pub: Publication) => (
    <div key={pub.id} className="bg-surface rounded-2xl border border-border overflow-hidden hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50 transition-all group">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-48 h-44 shrink-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 relative overflow-hidden">
          {pub.imageUrl ? (
            <img src={pub.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BarChart3 className="w-12 h-12 text-emerald-500/20" />
            </div>
          )}
          <div className="absolute top-3 start-3">
            <span className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-lg flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {isArabic ? "تقرير" : "Report"}
            </span>
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-text group-hover:text-emerald-600 transition-colors line-clamp-2">
              {isArabic ? pub.title : (pub.titleEn || pub.title)}
            </h3>
            {pub.description && <p className="text-sm text-text-secondary mt-2 line-clamp-2">{pub.description}</p>}
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-text-light flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(pub.createdAt)}</span>
            {pub.fileUrl && (
              <a href={pub.fileUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors">
                <Download className="w-3.5 h-3.5" />{isArabic ? "تحميل" : "Download"}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderPublicationCard = (pub: Publication) => (
    <div key={pub.id} className="bg-surface rounded-2xl border border-border overflow-hidden hover:border-amber-200 hover:shadow-lg hover:shadow-amber-50 transition-all group">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-48 h-44 shrink-0 bg-gradient-to-br from-amber-500/10 to-amber-600/5 relative overflow-hidden">
          {pub.imageUrl ? (
            <img src={pub.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-amber-500/20" />
            </div>
          )}
          <div className="absolute top-3 start-3">
            <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-lg flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {isArabic ? "منشور" : "Publication"}
            </span>
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-text group-hover:text-amber-600 transition-colors line-clamp-2">
              {isArabic ? pub.title : (pub.titleEn || pub.title)}
            </h3>
            {pub.description && <p className="text-sm text-text-secondary mt-2 line-clamp-2">{pub.description}</p>}
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-text-light flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(pub.createdAt)}</span>
            {pub.fileUrl && (
              <a href={pub.fileUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-colors">
                <Download className="w-3.5 h-3.5" />{isArabic ? "تحميل" : "Download"}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderNewsCard = (item: NewsItem) => (
    <div key={item.id} className="bg-surface rounded-2xl border border-border overflow-hidden hover:border-purple-200 hover:shadow-lg hover:shadow-purple-50 transition-all group">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-52 h-44 shrink-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5 relative overflow-hidden">
          {item.featuredImage ? (
            <img src={item.featuredImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Newspaper className="w-12 h-12 text-purple-500/20" />
            </div>
          )}
          <div className="absolute top-3 start-3">
            <span className="px-2.5 py-1 bg-purple-500 text-white text-[10px] font-bold rounded-lg flex items-center gap-1">
              <Newspaper className="w-3 h-3" />
              {isArabic ? "خبر" : "News"}
            </span>
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {item.category && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">{item.category}</span>}
            </div>
            <h3 className="font-bold text-text group-hover:text-purple-600 transition-colors line-clamp-2">{item.title}</h3>
            <p className="text-sm text-text-secondary mt-2 line-clamp-2">{item.excerpt}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-light mt-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(item.date)}</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderEventCard = (item: EventItem) => (
    <div key={item.id} className="bg-surface rounded-2xl border border-border overflow-hidden hover:border-rose-200 hover:shadow-lg hover:shadow-rose-50 transition-all group">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-52 h-44 shrink-0 bg-gradient-to-br from-rose-500/10 to-rose-600/5 relative overflow-hidden">
          {item.featuredImage ? (
            <img src={item.featuredImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CalendarClock className="w-12 h-12 text-rose-500/20" />
            </div>
          )}
          <div className="absolute top-3 start-3">
            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg text-white flex items-center gap-1 ${
              item.status === "upcoming" ? "bg-green-500" : item.status === "ongoing" ? "bg-blue-500" : "bg-gray-500"
            }`}>
              <CalendarClock className="w-3 h-3" />
              {item.status === "upcoming" ? (isArabic ? "قادم" : "Upcoming") : item.status === "ongoing" ? (isArabic ? "جاري" : "Ongoing") : (isArabic ? "منتهي" : "Done")}
            </span>
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {item.category && <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs rounded-full">{item.category}</span>}
            </div>
            <h3 className="font-bold text-text group-hover:text-rose-600 transition-colors line-clamp-2">{item.title}</h3>
            <p className="text-sm text-text-secondary mt-2 line-clamp-2">{item.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-text-light mt-3">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(item.date)}</span>
            {item.time && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{item.time}</span>}
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{item.location}</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-background" dir={isArabic ? "rtl" : "ltr"}>
      {/* Tab Navigation */}
      <div className="bg-surface border-b border-border sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? "bg-primary text-white shadow-md"
                    : "text-text-secondary hover:bg-primary/5"
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.key ? "text-white" : tab.color}`} />
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === tab.key ? "bg-white/20" : "bg-primary/10 text-primary"
                }`}>{tab.count}</span>
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
            <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
              {!showCreatePost ? (
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="w-full p-4 flex items-center gap-3 hover:bg-primary/5 transition-colors"
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-text-secondary text-sm text-start">{isArabic ? "بماذا تفكر؟ شاركنا..." : "What's on your mind? Share..."}</span>
                </button>
              ) : (
                <div>
                  <textarea
                    placeholder={isArabic ? "اكتب منشورك هنا..." : "Write your post here..."}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={4}
                    autoFocus
                    className="w-full p-4 text-sm text-text bg-transparent border-none outline-none resize-none placeholder:text-text-light"
                  />
                  <div className="px-4 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-primary/5 rounded-lg transition-colors text-text-light">
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-primary/5 rounded-lg transition-colors text-text-light">
                        <Smile className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setShowCreatePost(false); setNewPostContent("") }}
                        className="px-4 py-2 text-text-secondary text-sm font-medium hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        {isArabic ? "إلغاء" : "Cancel"}
                      </button>
                      <button
                        onClick={handleCreatePost}
                        disabled={!newPostContent.trim() || posting}
                        className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-light transition-colors disabled:opacity-50 shadow-md"
                      >
                        {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {isArabic ? "نشر" : "Post"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

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
                {hasMore && (
                  <button
                    onClick={loadMorePosts}
                    disabled={loadingMore}
                    className="w-full py-3 text-center text-primary text-sm font-bold bg-surface border border-border rounded-xl hover:bg-primary/5 transition-colors"
                  >
                    {loadingMore ? (
                      <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> {isArabic ? "جاري التحميل..." : "Loading..."}</span>
                    ) : (
                      isArabic ? "تحميل المزيد" : "Load More"
                    )}
                  </button>
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
            ) : reports.map(renderReportCard)}
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
            ) : publications.map(renderPublicationCard)}
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
            ) : news.map(renderNewsCard)}
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
            ) : events.map(renderEventCard)}
          </div>
        )}
      </div>
    </div>
  )
}
