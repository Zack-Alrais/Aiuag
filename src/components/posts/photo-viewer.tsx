"use client"

import { useCallback, useEffect, useState } from "react"
import {
  X, ChevronLeft, ChevronRight, Download, Maximize2, Minimize2,
} from "lucide-react"

interface PhotoViewerProps {
  images: string[]
  index: number
  onClose: () => void
  caption?: null | {
    authorName?: string | null
    authorImage?: string | null
    text?: string
  }
  isArabic?: boolean
}

export default function PhotoViewer({ images, index, onClose, caption, isArabic = false }: PhotoViewerProps) {
  const [current, setCurrent] = useState(index)
  const [focused, setFocused] = useState(false)
  const [captionOpen, setCaptionOpen] = useState(true)

  useEffect(() => setCurrent(index), [index])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + images.length) % images.length)
  }, [images.length])

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % images.length)
  }, [images.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      else if (e.key === "ArrowLeft") prev()
      else if (e.key === "ArrowRight") next()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose, prev, next])

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  const saveImage = () => {
    const url = images[current]
    try {
      const a = document.createElement("a")
      a.href = url
      a.target = "_blank"
      a.rel = "noopener"
      a.download = "aiuag-photo"
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch {
      window.open(url, "_blank")
    }
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else {
      document.documentElement.requestFullscreen?.().catch(() => {})
    }
  }

  const src = images[current]

  return (
    <div className="fixed inset-0 z-[80] bg-black/95 flex flex-col" dir="ltr" onClick={onClose}>
      {/* Top bar */}
      <div className="relative flex items-center justify-between px-4 py-3 text-white shrink-0" onClick={(e) => e.stopPropagation()}>
        <span className="text-sm text-white/80 tabular-nums select-none">
          {current + 1} / {images.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={saveImage}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2 text-sm"
            aria-label={isArabic ? "حفظ الصورة" : "Save image"}
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">{isArabic ? "حفظ" : "Save"}</span>
          </button>
          <button
            onClick={() => setFocused((f) => !f)}
            className={`p-2.5 rounded-full transition-colors ${focused ? "bg-white text-black" : "bg-white/10 hover:bg-white/20"}`}
            aria-label={isArabic ? "وضع التركيز" : "Focus mode"}
            title={isArabic ? "وضع التركيز" : "Focus mode"}
          >
            {focused ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="hidden sm:flex p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label={isArabic ? "ملء الشاشة" : "Fullscreen"}
            title={isArabic ? "ملء الشاشة" : "Fullscreen"}
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          <button onClick={onClose} className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors" aria-label={isArabic ? "إغلاق" : "Close"}>
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image area */}
      <div
        className={`relative flex items-center justify-center min-h-0 ${focused ? "flex-1" : "flex-1 px-12 py-2 sm:px-16"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {!focused && (
          <>
            {images.length > 1 && (
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 sm:left-3 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors z-10"
                aria-label={isArabic ? "السابق" : "Previous"}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {images.length > 1 && (
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 sm:right-3 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors z-10"
                aria-label={isArabic ? "التالي" : "Next"}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </>
        )}
        <img src={src} alt="" className="max-w-full max-h-full object-contain select-none rounded-lg shadow-2xl" draggable={false} />
      </div>

      {/* Caption panel */}
      {!focused && caption && captionOpen && (
        <div
          className="shrink-0 border-t border-white/10 bg-black/40 px-4 py-3 text-white max-h-[30vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          dir={isArabic ? "rtl" : "ltr"}
        >
          <div className="flex items-start gap-3">
            {caption.authorImage ? (
              <img src={caption.authorImage} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold shrink-0">
                {(caption.authorName || "?").charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{caption.authorName || (isArabic ? "عضو" : "Member")}</p>
              {caption.text && (
                <p className="text-sm text-white/80 whitespace-pre-line mt-1">{caption.text}</p>
              )}
            </div>
            <button
              onClick={() => setCaptionOpen(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition-colors shrink-0"
              aria-label={isArabic ? "إخفاء الوصف" : "Hide caption"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {focused && caption && !captionOpen && (
        <button
          onClick={(e) => { e.stopPropagation(); setCaptionOpen(true) }}
          className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors shrink-0 z-10"
          aria-label={isArabic ? "إظهار الوصف" : "Show caption"}
        >
          <X className="w-4 h-4 rotate-45" />
        </button>
      )}
    </div>
  )
}