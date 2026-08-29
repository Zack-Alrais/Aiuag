"use client"

import { useState, useRef } from "react"
import { Upload, X, FileText, Film, File, Image } from "lucide-react"

interface FileUploadProps {
  value: string
  onChange: (url: string) => void
  folder?: string
  label?: string
  accept?: string
  className?: string
  type?: "image" | "video" | "pdf" | "any"
}

const TYPE_CONFIG = {
  image: { accept: "image/*", icon: FileText, label: "اسحب الصورة هنا أو اضغط للاختيار", hint: "JPG, PNG, GIF, WebP", max: "10 ميجا" },
  video: { accept: "video/*", icon: Film, label: "اسحب الفيديو هنا أو اضغط للاختيار", hint: "MP4, WebM", max: "10 ميجا" },
  pdf: { accept: ".pdf,application/pdf", icon: FileText, label: "اسحب الملف هنا أو اضغط للاختيار", hint: "PDF فقط", max: "10 ميجا" },
  any: { accept: "*", icon: File, label: "اسحب الملف هنا أو اضغط للاختيار", hint: "جميع أنواع الملفات", max: "10 ميجا" },
}

const MAX_FILE_SIZE = 10 * 1024 * 1024

export default function FileUpload({
  value,
  onChange,
  folder = "general",
  label,
  accept,
  className = "",
  type = "any",
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imgError, setImgError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const config = TYPE_CONFIG[type]
  const finalAccept = accept || config.accept
  const Icon = config.icon

  const uploadFile = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setError("لا يُسمح برفع ملفات أكبر من 10 ميجا بايت")
      return
    }
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", folder)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (res.ok) {
        const data = await res.json()
        onChange(data.files?.[0]?.url || data.urls?.[0])
      } else {
        const err = await res.json()
        setError(err.error || "فشل في رفع الملف")
      }
    } catch {
      setError("فشل في رفع الملف")
    } finally {
      setUploading(false)
    }
  }

  const handleFile = (file: File) => {
    uploadFile(file)
  }

  const getFileName = (url: string) => {
    const parts = url.split("/")
    return parts[parts.length - 1]
  }

  const isVideo = (url: string) => /\.(mp4|webm|ogg)$/i.test(url) || /^data:video\//.test(url)
  const isPdf = (url: string) => /\.pdf$/i.test(url)
  const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp|svg|bmp|avif|tiff)(\?|$)/i.test(url) || /image\//i.test(url) || url.includes('blob.vercel-storage.com') && /\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)/i.test(url)

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-1">{label}</label>
      )}
      {value ? (
        <div className="relative group">
          {isImage(value) ? (
            imgError ? (
              <div className="w-full h-40 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                <Image className="w-8 h-8 text-red-400" />
                <p className="text-sm text-red-500 dark:text-red-300">تعذر عرض الصورة — الرابط غير متاح</p>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="px-3 py-1.5 bg-white text-gray-800 text-xs rounded-md hover:bg-gray-100 dark:bg-[#1e2d42] dark:text-[#f1f5f9]"
                >
                  إعادة الرفع
                </button>
              </div>
            ) : (
              <img key={value} src={value} alt="Preview" onError={() => setImgError(true)} className="w-full h-40 object-cover rounded-lg border border-gray-200 dark:border-[#3b4f6b]" loading="lazy" />
            )
          ) : isVideo(value) ? (
            <video src={value} controls className="w-full h-40 object-cover rounded-lg border border-gray-200 dark:border-[#3b4f6b]" />
          ) : isPdf(value) ? (
            <div className="w-full h-24 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 px-4">
              <FileText className="w-8 h-8 text-red-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-[#f1f5f9] truncate">{getFileName(value)}</p>
                <p className="text-xs text-gray-500">PDF</p>
              </div>
              <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">فتح</a>
            </div>
          ) : (
            <div className="w-full h-24 bg-gray-50 dark:bg-[#111927] border border-gray-200 dark:border-[#3b4f6b] rounded-lg flex items-center gap-3 px-4">
              <File className="w-8 h-8 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-[#f1f5f9] truncate">{getFileName(value)}</p>
              </div>
              <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">فتح</a>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-gray-800 text-xs rounded-md hover:bg-gray-100"
            >
              تغيير
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-1.5 bg-white text-red-600 rounded-md hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const file = e.dataTransfer.files[0]
            if (file) handleFile(file)
          }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-[#3b4f6b] hover:border-gray-400 dark:hover:border-[#5a7aa3]"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-blue-500 animate-bounce" />
              <p className="text-sm text-gray-500 dark:text-[#94a3b8]">جاري الرفع...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Icon className="w-8 h-8 text-gray-400 dark:text-[#3b4f6b]" />
              <p className="text-sm text-gray-500 dark:text-[#94a3b8]">{config.label}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">{config.hint} (تنبيه: الحد الأقصى {config.max})</p>
            </div>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={finalAccept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ""
        }}
      />
    </div>
  )
}
