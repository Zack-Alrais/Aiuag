"use client"

import { useState, useRef } from "react"
import { Upload, X, FileText, Image, Loader2, CheckCircle, AlertCircle } from "lucide-react"

interface UploadedFile {
  url: string
  name: string
  status: "uploading" | "done" | "error"
}

interface MultiFileUploadProps {
  value: string[] // Array of URLs
  onChange: (urls: string[]) => void
  folder?: string
  label?: string
  maxFiles?: number
  className?: string
}

export default function MultiFileUpload({
  value,
  onChange,
  folder = "gallery",
  label,
  maxFiles = 10,
  className = "",
}: MultiFileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const remaining = maxFiles - value.length

  const handleFiles = async (selectedFiles: FileList) => {
    const fileArray = Array.from(selectedFiles)
    if (fileArray.length > remaining) {
      setError(`يمكنك رفع ${remaining} ملفات فقط`)
      return
    }
    setError(null)
    setUploading(true)

    const newUploads: UploadedFile[] = fileArray.map(f => ({ url: "", name: f.name, status: "uploading" as const }))
    setFiles(prev => [...prev, ...newUploads])

    const fd = new FormData()
    fd.append("folder", folder)
    fileArray.forEach(f => fd.append("file", f))

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const newUrls: UploadedFile[] = data.urls.map((url: string, i: number) => ({
        url,
        name: fileArray[i]?.name || "",
        status: "done" as const,
      }))
      setFiles(prev => prev.slice(0, -fileArray.length).concat(newUrls))
      onChange([...value, ...data.urls])
    } catch (e: any) {
      setFiles(prev => {
        const updated = [...prev]
        for (let i = updated.length - fileArray.length; i < updated.length; i++) {
          updated[i] = { ...updated[i], status: "error" as const }
        }
        return updated
      })
      setError(e.message || "فشل الرفع")
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (url: string) => {
    onChange(value.filter(v => v !== url))
    setFiles(prev => prev.filter(f => f.url !== url))
  }

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-[#94a3b8] mb-2">{label}</label>}

      {/* Uploaded files preview */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-3">
          {value.map((url, i) => (
            <div key={url} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-[#3b4f6b] bg-gray-50 dark:bg-[#111927]">
              {url.match(/\.(mp4|webm)$/i) ? (
                <video src={url} className="w-full h-full object-cover" />
              ) : (
                <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
              )}
              <button
                type="button"
                onClick={() => removeFile(url)}
                className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {remaining > 0 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files) }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
            dragOver ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-[#3b4f6b] hover:border-gray-400 dark:hover:border-[#5a7aa3]"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-500 dark:text-[#94a3b8]">جاري الرفع...</p>
              <p className="text-xs text-gray-400">يمكنك اختيار {remaining} ملفات</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Image className="w-8 h-8 text-gray-400 dark:text-[#3b4f6b]" />
              <p className="text-sm text-gray-500 dark:text-[#94a3b8]">اسحب الصور هنا أو اضغط للاختيار</p>
              <p className="text-xs text-gray-400 dark:text-[#5a7aa3]">JPG, PNG, GIF, WebP (حد أقصى {remaining} ملفات)</p>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = "" }}
      />

      {/* Upload progress */}
      {files.length > 0 && (
        <div className="mt-2 space-y-1">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-[#94a3b8]">
              {f.status === "uploading" && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
              {f.status === "done" && <CheckCircle className="w-3 h-3 text-green-500" />}
              {f.status === "error" && <AlertCircle className="w-3 h-3 text-red-500" />}
              <span className="truncate flex-1">{f.name}</span>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      <p className="text-xs text-gray-400 mt-1">{value.length}/{maxFiles} {value.length === 1 ? "صورة" : "صور"}</p>
    </div>
  )
}
