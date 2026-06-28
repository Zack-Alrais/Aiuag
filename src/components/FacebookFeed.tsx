"use client"

import { useState, useEffect } from "react"
import { Facebook, Share2, ExternalLink } from "lucide-react"

interface FBPost {
  id: string
  message: string
  created_time: string
  full_picture: string | null
  permalink_url: string
  shares: number
}

export default function FacebookFeed({ limit = 6 }: { limit?: number }) {
  const [posts, setPosts] = useState<FBPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    fetch(`/api/public/facebook?limit=${limit}`)
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts || [])
        setIsDemo(data.isDemo || false)
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [limit])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (posts.length === 0) return null

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return "الآن"
    if (diffHours < 24) return `منذ ${diffHours} ساعة`
    if (diffDays < 7) return `منذ ${diffDays} يوم`
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Facebook className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-900">منشوراتنا على فيسبوك</h2>
        </div>
        {isDemo && (
          <p className="text-center text-sm text-amber-600 mb-8">
            عرض تجريبي — أضف FACEBOOK_PAGE_TOKEN في .env لعرض المنشورات الحقيقية
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              {post.full_picture && (
                <img
                  src={post.full_picture}
                  alt=""
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-5 flex flex-col flex-1">
                <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-4 flex-1">
                  {post.message}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                  <span>{formatDate(post.created_time)}</span>
                  <div className="flex items-center gap-3">
                    {post.shares > 0 && (
                      <span className="flex items-center gap-1">
                        <Share2 className="w-3 h-3" />
                        {post.shares}
                      </span>
                    )}
                    <a
                      href={post.permalink_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-3 h-3" />
                      فيسبوك
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <a
            href="https://web.facebook.com/people/%D8%B1%D8%A7%D8%A8%D8%B7%D8%A9-%D8%AE%D8%B1%D9%8A%D8%AC%D9%8A-%D8%AC%D8%A7%D9%85%D8%B9%D8%A9-%D8%A5%D9%81%D8%B1%D9%8A%D9%82%D9%8A%D8%A7-%D8%A7%D9%84%D8%B9%D8%A7%D9%84%D9%85%D9%8A%D8%A9-Association-of-IUA-Graduates/100086028244784/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Facebook className="w-5 h-5" />
            زيارة صفحتنا على فيسبوك
          </a>
        </div>
      </div>
    </section>
  )
}
