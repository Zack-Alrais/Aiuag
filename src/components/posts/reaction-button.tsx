"use client"

import { useRef, useState, useCallback, useEffect, useMemo, useLayoutEffect } from "react"
import { createPortal } from "react-dom"
import { Heart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ReactionIcon from "@/components/shared/reaction-icon"

const REACTION_TYPES = ["like", "love", "haha", "wow", "sad", "angry"] as const
const LONG_PRESS_MS = 400
const HOVER_DELAY_MS = 120
const CLOSE_GRACE_MS = 150
const PICKER_GAP = 10

interface ReactionButtonProps {
  postId: string
  myReaction: string | null
  isArabic: boolean
  labels: Record<string, string>
  onReact: (postId: string, type: string) => void
  canReact: boolean
  onRequireLogin?: () => void
  className?: string
}

interface Position {
  left: number
  top: number
}

export default function ReactionButton({
  postId,
  myReaction,
  isArabic,
  labels,
  onReact,
  canReact,
  onRequireLogin,
  className = "",
}: ReactionButtonProps) {
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const pickerRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<Position>({ left: 0, top: 0 })
  const longPressRef = useRef(false)
  const suppressClickRef = useRef(false)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const coarse = useMemo(
    () =>
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(pointer: coarse)").matches
        : false,
    []
  )

  const current = myReaction || null
  const active = !!current

  /* ── timers ─────────────────────────────────────────────── */

  const clearPressTimer = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }, [])

  const clearOpenTimer = useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current)
      openTimer.current = null
    }
  }, [])

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])

  const clearAll = useCallback(() => {
    clearPressTimer()
    clearOpenTimer()
    clearCloseTimer()
  }, [clearPressTimer, clearOpenTimer, clearCloseTimer])

  useEffect(() => clearAll, [clearAll])

  /* ── open / close ───────────────────────────────────────── */

  const openPicker = useCallback(() => {
    clearCloseTimer()
    setOpen(true)
  }, [clearCloseTimer])

  const closePicker = useCallback(() => {
    clearAll()
    setOpen(false)
  }, [clearAll])

  /* ── click outside + Escape ─────────────────────────────── */

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) closePicker()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePicker()
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open, closePicker])

  /* ── position picker above button (measured) ────────────── */

  useLayoutEffect(() => {
    if (!open) return
    const btn = btnRef.current
    const picker = pickerRef.current
    if (!btn || !picker) return
    const br = btn.getBoundingClientRect()
    const pr = picker.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const gap = PICKER_GAP

    let left = br.left + br.width / 2 - pr.width / 2
    left = Math.max(8, Math.min(left, vw - pr.width - 8))

    let top = br.top - pr.height - gap
    if (top < 8) {
      top = br.bottom + gap
      if (top + pr.height > vh - 8) top = Math.max(8, vh - pr.height - 8)
    }
    setPos({ left, top })
  }, [open])

  /* ── hover (desktop only) ───────────────────────────────── */

  const handleMouseEnter = useCallback(() => {
    if (coarse) return
    clearOpenTimer()
    if (open) {
      clearCloseTimer()
    } else {
      openTimer.current = setTimeout(openPicker, HOVER_DELAY_MS)
    }
  }, [coarse, open, openPicker, clearOpenTimer, clearCloseTimer])

  const handleMouseLeave = useCallback(() => {
    if (coarse) return
    clearOpenTimer()
    if (open) {
      closeTimer.current = setTimeout(closePicker, CLOSE_GRACE_MS)
    }
  }, [coarse, open, closePicker, clearOpenTimer])

  const handlePickerMouseEnter = useCallback(() => {
    if (coarse) return
    clearCloseTimer()
  }, [coarse, clearCloseTimer])

  const handlePickerMouseLeave = useCallback(() => {
    if (coarse) return
    clearCloseTimer()
    closeTimer.current = setTimeout(closePicker, CLOSE_GRACE_MS)
  }, [coarse, closePicker, clearCloseTimer])

  /* ── long-press (touch / pen) ───────────────────────────── */

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === "mouse") return
      clearPressTimer()
      longPressRef.current = false
      pressTimer.current = setTimeout(() => {
        longPressRef.current = true
        suppressClickRef.current = true
        openPicker()
      }, LONG_PRESS_MS)
    },
    [clearPressTimer, openPicker]
  )

  const handlePointerUp = useCallback(() => {
    clearPressTimer()
  }, [clearPressTimer])

  const handlePointerCancel = useCallback(() => {
    clearPressTimer()
    if (longPressRef.current) {
      longPressRef.current = false
      closePicker()
    }
  }, [clearPressTimer, closePicker])

  /* ── tap / click ────────────────────────────────────────── */

  const handleTap = useCallback(() => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    if (!canReact) {
      openPicker()
      return
    }
    const next = current ? "" : "like"
    onReact(postId, next)
    if (open) closePicker()
  }, [canReact, current, onReact, postId, openPicker, open, closePicker])

  /* ── pick ───────────────────────────────────────────────── */

  const pick = useCallback(
    (type: string) => {
      if (!canReact) {
        closePicker()
        onRequireLogin?.()
        return
      }
      if (type === current) onReact(postId, "")
      else onReact(postId, type)
      suppressClickRef.current = false
      closePicker()
    },
    [canReact, current, onReact, postId, closePicker, onRequireLogin]
  )

  /* ── picker markup ──────────────────────────────────────── */

  const pickerMarkup = (
    <motion.div
      ref={pickerRef}
      dir="ltr"
      initial={{ opacity: 0, scale: 0.8, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 4 }}
      transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
      className="fixed z-[90] bg-surface dark:bg-[#1e2d42] rounded-2xl shadow-2xl border border-border px-2 py-1.5 flex items-center gap-0.5"
      style={{ left: pos.left, top: pos.top }}
      onMouseEnter={handlePickerMouseEnter}
      onMouseLeave={handlePickerMouseLeave}
      onContextMenu={(e) => e.preventDefault()}
    >
      {REACTION_TYPES.map((type, i) => (
        <button
          key={type}
          onClick={(e) => {
            e.stopPropagation()
            pick(type)
          }}
          className={`w-11 h-11 flex items-center justify-center rounded-full transition-all hover:scale-125 active:scale-90 ${
            current === type
              ? "bg-primary/10 scale-110"
              : "hover:bg-black/5 dark:hover:bg-white/10"
          }`}
          style={{ animation: `bounce-in 0.3s ease-out ${i * 50}ms both` }}
          title={labels[type] || type}
          aria-label={labels[type] || type}
        >
          <ReactionIcon type={type} size={26} />
        </button>
      ))}
    </motion.div>
  )

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleTap}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleTap()
        }}
        onContextMenu={(e) => e.preventDefault()}
        className={`flex items-center justify-center gap-2 rounded-xl transition-colors select-none touch-manipulation ${className} ${
          active
            ? "text-primary bg-primary/5 dark:text-primary dark:bg-primary/10"
            : "text-text-secondary hover:bg-black/5 dark:hover:bg-white/5"
        }`}
        aria-pressed={active}
        style={{ WebkitTouchCallout: "none" }}
      >
        {active ? (
          <span className="text-lg leading-none">
            <ReactionIcon type={current as string} size={17} />
          </span>
        ) : (
          <Heart className="w-4 h-4" />
        )}
        <span className="text-sm">
          {active
            ? labels[current as string] || "Like"
            : labels.like || (isArabic ? "إعجاب" : "Like")}
        </span>
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>{open && pickerMarkup}</AnimatePresence>,
          document.body
        )}
    </>
  )
}