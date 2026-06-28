"use client"

import { useState, useRef } from "react"
import { Upload, X, Image, Crop } from "lucide-react"
import ImageEditor from "@/components/ui/image-editor"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  folder?: string
  label?: string
  className?: string
  aspect?: number
  showCropButton?: boolean
}

export default function ImageUpload({
  value,
  onChange,
  folder = "general",
  label,
  className = "",
  aspect = 1,
  showCropButton = true,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [editorImage, setEditorImage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", folder)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (res.ok) {
        const data = await res.json()
        onChange(data.url)
      }
    } catch {
    } finally {
      setUploading(false)
    }
  }

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = () => {
      setEditorImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    setEditorImage(null)
    const file = new File([croppedBlob], "cropped-image.jpg", { type: "image/jpeg" })
    await uploadFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      {value ? (
        <div className="relative group">
          <img src={value} alt="Preview" className="w-full h-40 object-cover rounded-lg border border-gray-200" loading="lazy" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            {showCropButton && (
              <button
                type="button"
                onClick={() => setEditorImage(value)}
                className="p-1.5 bg-white text-blue-600 rounded-md hover:bg-gray-100"
                title="قص وتعديل"
              >
                <Crop className="w-4 h-4" />
              </button>
            )}
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
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-blue-500 animate-bounce" />
              <p className="text-sm text-gray-500">جاري الرفع...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Image className="w-8 h-8 text-gray-400" />
              <p className="text-sm text-gray-500">اسحب الصورة هنا أو اضغط للاختيار</p>
              <p className="text-xs text-gray-400">JPG, PNG, GIF, WebP</p>
            </div>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ""
        }}
      />

      {editorImage && (
        <ImageEditor
          image={editorImage}
          onCropComplete={handleCropComplete}
          onCancel={() => setEditorImage(null)}
          aspect={aspect}
        />
      )}
    </div>
  )
}
