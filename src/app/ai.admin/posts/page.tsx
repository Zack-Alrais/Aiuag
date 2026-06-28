"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, FileText, Image, Film, Heart, MessageSquare, Calendar, X, Loader2 } from "lucide-react"
import FileUpload from "@/components/admin/FileUpload"

interface Post {
  id: string
  content: string
  images: string | null
  videos: string | null
  authorId: string | null
  likes: number
  createdAt: string
  updatedAt: string
  _count?: { comments: number }
}

interface PostFormData {
  content: string
  images: string[]
  videos: string[]
}

const emptyForm: PostFormData = { content: "", images: [], videos: [] }

export default function PostsManagement() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [form, setForm] = useState<PostFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [filterDate, setFilterDate] = useState("")

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      const url = filterDate ? `/api/admin/posts?date=${filterDate}` : "/api/admin/posts"
      const res = await fetch(url)
      const json = await res.json()
      setPosts(json.data ?? [])
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [filterDate])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const openAddModal = () => {
    setEditingPost(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEditModal = (post: Post) => {
    setEditingPost(post)
    setForm({
      content: post.content,
      images: post.images ? JSON.parse(post.images) : [],
      videos: post.videos ? JSON.parse(post.videos) : [],
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingPost(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload = {
        content: form.content,
        images: form.images.length > 0 ? JSON.stringify(form.images) : null,
        videos: form.videos.length > 0 ? JSON.stringify(form.videos) : null,
      }

      if (editingPost) {
        await fetch(`/api/admin/posts/${editingPost.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch("/api/admin/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      await fetchPosts()
      closeModal()
    } catch {
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/posts/${id}`, { method: "DELETE" })
      setDeleteConfirmId(null)
      await fetchPosts()
    } catch {}
  }

  const addImageSlot = () => {
    setForm(prev => ({ ...prev, images: [...prev.images, ""] }))
  }

  const removeImage = (index: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const updateImage = (index: number, url: string) => {
    setForm(prev => {
      const imgs = [...prev.images]
      if (url) {
        imgs[index] = url
      } else {
        imgs.splice(index, 1)
      }
      return { ...prev, images: imgs }
    })
  }

  const addVideoSlot = () => {
    setForm(prev => ({ ...prev, videos: [...prev.videos, ""] }))
  }

  const removeVideo = (index: number) => {
    setForm(prev => ({ ...prev, videos: prev.videos.filter((_, i) => i !== index) }))
  }

  const updateVideo = (index: number, url: string) => {
    setForm(prev => {
      const vids = [...prev.videos]
      if (url) {
        vids[index] = url
      } else {
        vids.splice(index, 1)
      }
      return { ...prev, videos: vids }
    })
  }

  const truncate = (text: string, len: number) =>
    text.length > len ? text.slice(0, len) + "..." : text

  return (
    <div className="space-y-6 dark:bg-[#0b1120] min-h-screen p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600 dark:text-[#60a5fa]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f1f5f9]">إدارة المنشورات</h1>
            <p className="text-sm text-gray-500 dark:text-[#94a3b8]">إدارة منشورات النظام الأساسي</p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          إضافة منشور
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative">
          <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#7a8ba3]" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="pr-4 pl-9 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]"
          />
        </div>
        {filterDate && (
          <button
            onClick={() => setFilterDate("")}
            className="text-sm text-blue-600 dark:text-[#60a5fa] hover:underline"
          >
            إعادة تعيين
          </button>
        )}
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
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FileText className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-sm">لا يوجد منشورات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 dark:bg-[#111927] dark:border-[#2a3d56]">
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">المحتوى</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">
                    <span className="flex items-center gap-1.5"><Image className="h-3.5 w-3.5" /> الصور</span>
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">
                    <span className="flex items-center gap-1.5"><Film className="h-3.5 w-3.5" /> الفيديو</span>
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">
                    <span className="flex items-center gap-1.5"><Heart className="h-3.5 w-3.5" /> الإعجابات</span>
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">
                    <span className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> التعليقات</span>
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> التاريخ</span>
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#253347]">
                {posts.map((post) => {
                  const imagesArr = post.images ? JSON.parse(post.images) : []
                  const videosArr = post.videos ? JSON.parse(post.videos) : []
                  return (
                    <tr key={post.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-[#1e2d42]">
                      <td className="px-4 py-4 max-w-[300px]">
                        <p className="text-sm text-gray-900 dark:text-[#f1f5f9] line-clamp-2 leading-relaxed" dir="rtl">
                          {truncate(post.content, 120)}
                        </p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-[#cbd5e1]">{imagesArr.length}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-[#cbd5e1]">{videosArr.length}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-[#cbd5e1]">{post.likes}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-[#cbd5e1]">{post._count?.comments ?? 0}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-[#94a3b8]">
                        {new Date(post.createdAt).toLocaleDateString("ar-EG", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-start gap-1">
                          <button
                            onClick={() => openEditModal(post)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="تعديل"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          {deleteConfirmId === post.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(post.id)}
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
                              onClick={() => setDeleteConfirmId(post.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto dark:bg-[#1a2332] dark:border dark:border-[#2a3d56]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2a3d56]">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[#f1f5f9]">
                {editingPost ? "تعديل منشور" : "إضافة منشور جديد"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors dark:text-[#7a8ba3] dark:hover:text-[#cbd5e1] dark:hover:bg-[#2a3d56]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">المحتوى</label>
                <textarea
                  dir="rtl"
                  required
                  value={form.content}
                  onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] dark:placeholder-[#7a8ba3] resize-y"
                  placeholder="اكتب محتوى المنشور..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#cbd5e1]">
                    <span className="flex items-center gap-1.5"><Image className="h-3.5 w-3.5" /> الصور</span>
                  </label>
                  <button type="button" onClick={addImageSlot} className="text-xs text-blue-600 dark:text-[#60a5fa] hover:underline">
                    + إضافة صورة
                  </button>
                </div>
                {form.images.map((url, i) => (
                  <div key={i} className="relative mb-2 p-3 border border-dashed border-gray-300 dark:border-[#3b4f6b] rounded-lg">
                    <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 z-10">×</button>
                    <FileUpload value={url} onChange={(newUrl) => updateImage(i, newUrl)} type="image" folder="posts" />
                    <div className="mt-2">
                      <input
                        type="text"
                        dir="ltr"
                        value={url}
                        onChange={(e) => updateImage(i, e.target.value)}
                        placeholder="أو الصق رابط الصورة هنا..."
                        className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] dark:placeholder-[#7a8ba3]"
                      />
                    </div>
                  </div>
                ))}
                {form.images.length === 0 && (
                  <p className="text-xs text-gray-400 dark:text-[#7a8ba3]">لا توجد صور مرفوعة. اضف "إضافة صورة" للرفع.</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#cbd5e1]">
                    <span className="flex items-center gap-1.5"><Film className="h-3.5 w-3.5" /> الفيديو</span>
                  </label>
                  <button type="button" onClick={addVideoSlot} className="text-xs text-blue-600 dark:text-[#60a5fa] hover:underline">
                    + إضافة فيديو
                  </button>
                </div>
                {form.videos.map((url, i) => (
                  <div key={i} className="relative mb-2 p-3 border border-dashed border-gray-300 dark:border-[#3b4f6b] rounded-lg">
                    <button type="button" onClick={() => removeVideo(i)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 z-10">×</button>
                    <FileUpload value={url} onChange={(newUrl) => updateVideo(i, newUrl)} type="video" folder="posts" />
                    <div className="mt-2">
                      <input
                        type="text"
                        dir="ltr"
                        value={url}
                        onChange={(e) => updateVideo(i, e.target.value)}
                        placeholder="أو الصق رابط الفيديو هنا..."
                        className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] dark:placeholder-[#7a8ba3]"
                      />
                    </div>
                  </div>
                ))}
                {form.videos.length === 0 && (
                  <p className="text-xs text-gray-400 dark:text-[#7a8ba3]">لا توجد فيديوهات مرفوعة. اضف "إضافة فيديو" للرفع.</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-[#2a3d56]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:text-[#cbd5e1] dark:bg-[#1e2d42] dark:hover:bg-[#2a3d56]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? "جاري الحفظ..." : editingPost ? "حفظ التغييرات" : "إضافة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
