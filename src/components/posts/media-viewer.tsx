"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, Maximize2, RotateCcw, Heart,
} from "lucide-react"

interface MediaViewerProps {
  images: string[]
  index: number
  onClose: () => void
  onLike?: () => void       // double-tap / double-click: trigger like (never unlike)
  liked?: boolean
  isArabic?: boolean
  caption?: null | {
    authorName?: string | null
    authorImage?: string | null
    text?: string
  }
}

const MIN_SCALE = 1
const MAX_SCALE = 4

export default function MediaViewer({
  images,
  index,
  onClose,
  onLike,
  liked = false,
  isArabic = false,
  caption,
}: MediaViewerProps) {
  const [current, setCurrent] = useState(index)
  const [scale, setScale] = useState(MIN_SCALE)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [heart, setHeart] = useState<{ id: number; x: number; y: number } | null>(null)

  // gesture refs
  const touchStart = useRef<{ x: number; y: number; t: number; dist: number | null } | null>(null)
  const lastTap = useRef<{ t: number; x: number; y: number } | null>(null)
  const pinchDist = useRef<number | null>(null)
  const dragX = useRef(0)
  const dragY = useRef(0)
  const heartId = useRef(0)
  const dragging = useRef(false)

  useEffect(() => setCurrent(index), [index])
  useEffect(() => { setScale(MIN_SCALE); setOffset({ x: 0, y: 0 }) }, [current])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + images.length) % images.length)
  }, [images.length])
  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % images.length)
  }, [images.length])

  // keyboard: ESC close, arrows navigate
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      else if (e.key === "ArrowLeft") prev()
      else if (e.key === "ArrowRight") next()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose, prev, next])

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  // trigger like + burst heart at coordinates (x,y) relative to stage
  const triggerLike = useCallback((x: number, y: number) => {
    onLike?.()
    heartId.current += 1
    setHeart({ id: heartId.current, x, y })
    setTimeout(() => setHeart(null), 900)
  }, [onLike])

  // double-tap like (touch): two taps within 320ms & ~40px
  const handleTap = useCallback((x: number, y: number) => {
    const now = Date.now()
    const prevTap = lastTap.current
    if (prevTap && now - prevTap.t < 320 && Math.abs(prevTap.x - x) < 40 && Math.abs(prevTap.y - y) < 40) {
      lastTap.current = null
      triggerLike(x, y)
    } else {
      lastTap.current = { t: now, x, y }
    }
  }, [triggerLike])

  // desktop double-click
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    triggerLike(e.clientX - rect.left, e.clientY - rect.top)
  }, [triggerLike])

  // touch handling: swipe nav, swipe-down close, pinch zoom, double-tap
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches
    if (t.length === 1) {
      const pt = t[0]
      touchStart.current = { x: pt.clientX, y: pt.clientY, t: Date.now(), dist: null }
      pinchDist.current = null
      dragX.current = pt.clientX
      dragY.current = pt.clientY
      dragging.current = true
    } else if (t.length === 2) {
      const d = Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)
      pinchDist.current = d
      dragging.current = false
      touchStart.current = null
    }
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const ts = e.touches
      const d = Math.hypot(ts[0].clientX - ts[1].clientX, ts[0].clientY - ts[1].clientY)
      if (pinchDist.current != null) {
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * (d / pinchDist.current)))
        setScale(newScale)
      }
      pinchDist.current = d
      return
    }
    if (e.touches.length === 1 && touchStart.current && scale === MIN_SCALE) {
      const t = e.touches[0]
      dragX.current = t.clientX - touchStart.current.x
      dragY.current = t.clientY - touchStart.current.y
    }
  }, [scale])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const start = touchStart.current
    const dx = dragX.current
    const dy = dragY.current
    touchStart.current = null
    pinchDist.current = null
    dragging.current = false

    // if zoomed, allow pan; no swipe nav when zoomed in
    if (scale > MIN_SCALE) return

    const now = Date.now()
    // tap (little movement)
    if (start && Math.abs(dx) < 10 && Math.abs(dy) < 10 && now - start.t < 400) {
      const pt = e.changedTouches[0]
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      handleTap(pt.clientX - rect.left, pt.clientY - rect.top)
      return
    }
    // swipe down -> close
    if (Math.abs(dy) > 90 && Math.abs(dy) > Math.abs(dx)) {
      onClose()
      return
    }
    // swipe left/right -> nav (respect RTL? Images quantum same for both)
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) prev()   // swipe right
      else next()          // swipe left
    }
  }, [scale, onClose, handleTap, prev, next])

  const saveImage = () => {
    const url = images[current]
    try {
      const a = document.createElement("a")
      a.href = url
      a.target = "_blank"
      a.rel = "noopener"
      a.download = "ait-url-photo"
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch {
      window.open(url, "_blank")
    }
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    else document.documentElement.requestFullscreen?.().catch(() => {})
  }

  const src = images[current]
  const multiple = images.length > 1
  const isZoomed = scale > MIN_SCALE

  return (
    <motion.div
      className="fixed inset-0 z-[90] bg-black/95 flex flex-col"
      dir="ltr"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      style={{ touchAction: "none" }}
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="relative flex items-center justify-between px-4 py-3 text-white shrink-0" onClick={(e) => e.stopPropagation()}>
        <span className="text-sm text-white/70 tabular-nums select-none">
          {multiple ? `${current + 1} / ${images.length}` : (isArabic ? "صورة" : "Image")}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={saveImage} className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors" aria-label={isArabic ? "حفظ الصورة" : "Save image"}>
            <Download className="w-5 h-5" />
          </button>
          <button onClick={toggleFullscreen} className="hidden sm:flex p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors" aria-label={isArabic ? "ملء الشاشة" : "Fullscreen"}>
            <Maximize2 className="w-5 h-5" />
          </button>
          <button onClick={onClose} className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors" aria-label={isArabic ? "إغلاق" : "Close"}>
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image stage */}
      <div
        className="relative flex-1 flex items-center justify-center min-h-0 overflow-hidden px-4 sm:px-16"
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={handleDoubleClick}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {multiple && !isZoomed && (
          <>
            <button onClick={(e) => { e.stopPropagation(); prev() }} className="absolute left-2 top-1/2 -translate-y-1/2 sm:left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center z-20" aria-label={isArabic ? "السابق" : "Previous"}>
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); next() }} className="absolute right-2 top-1/2 -translate-y-1/2 sm:right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center z-20" aria-label={isArabic ? "التالي" : "Next"}>
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        <motion.img
          key={src}
          src={src}
          alt=""
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale, opacity: 1, x: offset.x, y: offset.y }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.24 }}
          className="max-w-full max-h-full object-contain select-none rounded-lg shadow-2xl"
          draggable={false}
          style={{ cursor: "zoom-in", touchAction: "none" }}
        />

        {/* Animated Heart on double-tap */}
        <AnimatePresence>
          {heart && (
            <motion.div
              key={heart.id}
              className="pointer-events-none absolute"
              style={{ left: heart.x, top: heart.y, transform: "translate(-50%,-50%)" }}
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: [0.2, 1.25, 1, 1.4], opacity: [0, 1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, times: [0, 0.4, 0.7, 1] }}
            >
              <div className="relative">
                <Heart className="w-24 h-24" fill="#ef4444" stroke="#ef4444" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  {[0, 72, 144, 216, 288].map((deg) => (
                    <motion.span
                      key={deg}
                      className="absolute w-2 h-2 rounded-full"
                      style={{ background: "#f87171" }}
                      initial={{ x: 0, y: 0, opacity: 1 }}
                      animate={{
                        x: Math.cos((deg * Math.PI) / 180) * 44,
                        y: Math.sin((deg * Math.PI) / 180) * 44,
                        opacity: 0,
                        scale: 0.4,
                      }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Zoom controls (desktop) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setScale((s) => Math.min(MAX_SCALE, +(s * 1.3).toFixed(2)))} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center" aria-label={isArabic ? "تكبير" : "Zoom in"}>
          <ZoomIn className="w-5 h-5" />
        </button>
        <button onClick={() => setScale((s) => Math.max(MIN_SCALE, +(s / 1.3).toFixed(2)))} disabled={!isZoomed} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center disabled:opacity-30" aria-label={isArabic ? "تصغير" : "Zoom out"}>
          <ZoomOut className="w-5 h-5" />
        </button>
        <button onClick={() => { setScale(MIN_SCALE); setOffset({ x: 0, y: 0 }) }} disabled={!isZoomed} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center disabled:opacity-30" aria-label={isArabic ? "إعادة التعيين" : "Reset"}>
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Caption */}
      {caption && (
        <div
          className="relative shrink-0 border-t border-white/10 bg-black/40 px-4 py-3 max-h-[25vh] overflow-y-auto"
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
              {caption.text && <p className="text-sm text-white/80 whitespace-pre-line mt-1">{caption.text}</p>}
            </div>
          </div>
        </div>
      )}

      {/* like status indicator */}
      <div className="absolute top-16 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-xs z-20" onClick={(e) => e.stopPropagation()}>
        <Heart className={`w-4 h-4 ${liked ? "text-red-500 fill-red-500" : "text-white/70"}`} />
        <span>{isArabic ? (liked ? "أعجبك" : "اضغط مرتين للإعجاب") : (liked ? "You liked this" : "Double-tap to like")}</span>
      </div>
    </motion.div>
  )
}
