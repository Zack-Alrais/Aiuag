"use client"

import { useState, useRef } from "react"
import { Upload, X, Image as ImageIcon, Crop } from "lucide-react"
import ImageEditor from "./image-editor"

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void
  onImageRemove?: () => void
  currentImage?: string
  aspect?: number
  label?: string
  className?: string
}

export default function ImageUpload({
  onImageSelect,
  onImageRemove,
  currentImage,
  aspect = 1,
  label = "ارفع صورة",
  className = "",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(currentImage || "")
  const [editorImage, setEditorImage] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = () => {
      setEditorImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = (croppedBlob: Blob) => {
    const file = new File([croppedBlob], "cropped-image.jpg", { type: "image/jpeg" })
    const previewUrl = URL.createObjectURL(croppedBlob)
    setPreview(previewUrl)
    setEditorImage(null)
    onImageSelect(file, previewUrl)
  }

  const handleRemove = () => {
    setPreview("")
    if (onImageRemove) onImageRemove()
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  return (
    <>
      <div className={`relative ${className}`}>
        {preview ? (
          <div className="relative group">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditorImage(preview)
                }}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white"
                title="تعديل"
              >
                <Crop className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white"
                title="إزالة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => inputRef.current?.click()}
            className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${
              isDragOver
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
            }`}
          >
            <ImageIcon className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileSelect(file)
          }}
          className="hidden"
        />
      </div>

      {editorImage && (
        <ImageEditor
          image={editorImage}
          onCropComplete={handleCropComplete}
          onCancel={() => setEditorImage(null)}
          aspect={aspect}
        />
      )}
    </>
  )
}
