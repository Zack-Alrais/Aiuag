"use client"

import { useState } from "react"
import { FileText, Download, Eye, Heart, MessageCircle, Share2, Calendar, User } from "lucide-react"

interface Post {
  id: string; content: string; images?: string; videos?: string; authorId?: string | null
  likes: number; sharesCount: number; createdAt: string
  _count: { comments: number; reactions: number; shares: number }
  reactionSummary: Record<string, number>
  author: { name: string; nameEn?: string; image?: string } | null
}

interface Publication {
  id: string; title: string; titleEn: string; description?: string; category?: string
  fileUrl?: string; imageUrl?: string; createdAt: string
}

export default function PublicationsFeedClient({ initialPosts, publications, isArabic, lang }: {
  initialPosts: Post[]; publications: Publication[]; isArabic: boolean; lang: string
}) {
  const [activeTab, setActiveTab] = useState<"posts" | "publications">("publications")

  const formatDate = (d: string) => new Date(d).toLocaleDateString(isArabic ? "ar-EG" : "en-US", {
    year: "numeric", month: "short", day: "numeric",
  })

  return (
    <div className="bg-background py-8" dir={isArabic ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab("publications")}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === "publications" ? "bg-primary text-white" : "bg-surface text-text-secondary hover:bg-primary/5"}`}>
            {isArabic ? "المنشورات" : "Publications"}
          </button>
          <button onClick={() => setActiveTab("posts")}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === "posts" ? "bg-primary text-white" : "bg-surface text-text-secondary hover:bg-primary/5"}`}>
            {isArabic ? "التفاعل" : "Interactive Posts"}
          </button>
        </div>

        {activeTab === "publications" && (
          <div className="space-y-4">
            {publications.length === 0 ? (
              <p className="text-center py-12 text-text-secondary">{isArabic ? "لا توجد منشورات" : "No publications"}</p>
            ) : publications.map((pub) => (
              <div key={pub.id} className="bg-surface rounded-2xl border border-border overflow-hidden hover:border-primary/20 transition-all">
                <div className="flex flex-col sm:flex-row">
                  {pub.imageUrl && (
                    <div className="sm:w-48 h-48 shrink-0">
                      <img src={pub.imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-text">{isArabic ? pub.title : (pub.titleEn || pub.title)}</h3>
                      {pub.description && <p className="text-sm text-text-secondary mt-2 line-clamp-2">{pub.description}</p>}
                      <div className="flex items-center gap-3 mt-3 text-xs text-text-light">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(pub.createdAt)}</span>
                        {pub.category && <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full">{pub.category}</span>}
                      </div>
                    </div>
                    {pub.fileUrl && (
                      <a href={pub.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors self-start">
                        <Download className="w-4 h-4" />{isArabic ? "تحميل" : "Download"}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "posts" && (
          <div className="space-y-4">
            {initialPosts.length === 0 ? (
              <p className="text-center py-12 text-text-secondary">{isArabic ? "لا توجد مشاركات" : "No posts"}</p>
            ) : initialPosts.map((post) => (
              <div key={post.id} className="bg-surface rounded-2xl border border-border p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {post.author?.image ? <img src={post.author.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                      : <User className="w-5 h-5 text-primary" />}
                  </div>
                  <div>
                    <p className="font-medium text-text text-sm">{isArabic ? post.author?.name : (post.author?.nameEn || post.author?.name)}</p>
                    <p className="text-xs text-text-light">{formatDate(post.createdAt)}</p>
                  </div>
                </div>
                <p className="text-text text-sm whitespace-pre-wrap">{post.content}</p>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border text-text-light text-xs">
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{post._count.reactions}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{post._count.comments}</span>
                  <span className="flex items-center gap-1"><Share2 className="w-3.5 h-3.5" />{post._count.shares}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
