"use client"

import { useRef, useState, useCallback, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import { Heart } from "lucide-react"
import ReactionIcon from "@/components/shared/reaction-icon"

const REACTION_TYPES = ["like", "love", "haha", "wow", "sad", "angry"] as const
const LONG_PRESS_MS = 450
const HOVER_DELAY_MS = 180
const PICKER_W = 292
const PICKER_H = 58

interface ReactionButtonProps {
  postId: string
  /** Current reaction of the logged-in member ("" / null = none) */
  myReaction: string | null
  isArabic: boolean
  /** Label per reaction type, already in the current language */
  labels: Record<string, string>
  /** Called with type "" to cancel, otherwise the chosen type */
  onReact: (postId: string, type: string) => void
  /** Whether the current user may react (logged in) */
  canReact: boolean
  /** Invoked when an unauthenticated user tries to react */
  onRequireLogin?: () => void
  className?: string
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
  const longPressRef = useRef(false)
  const suppressClickRef = useRef(false)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const coarse = useMemo(
    () => typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(pointer: coarse)").matches
      : false,
    []
  )

  const current = myReaction || null
  const active = !!current

  const clearPressTimer = useCallback(() => {
    if (pressTimer.current) { clearTimeout(pressTimer.current); pressTimer.current = null }
  }, [])

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null }
  }, [])

  const closePicker = useCallback(() => {
    clearCloseTimer()
    setOpen(false)
  }, [clearCloseTimer])

  const openPicker = useCallback(() => {
    clearCloseTimer()
    setOpen(true)
  }, [clearCloseTimer])

  useEffect(() => {
    return () => { clearPressTimer(); clearCloseTimer() }
  }, [clearPressTimer, clearCloseTimer])

  // Click outside + Escape to dismiss
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (pickerRef.current && !pickerRef.current.contains(t)) closePicker()
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closePicker() }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open, closePicker])

  const handleTap = useCallback(() => {
    if (suppressClickRef.current) { suppressClickRef.current = false; return }
    if (!btnRef.current) return
    if (!canReact) {
      // Guests can preview the options, selecting prompts login
      openPicker()
      return
    }
    const next = current ? "" : "like"
    onReact(postId, next)
  }, [canReact, current, onReact, postId, openPicker])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return
    clearPressTimer()
    longPressRef.current = false
    pressTimer.current = setTimeout(() => {
      longPressRef.current = true
      suppressClickRef.current = true
      openPicker()
    }, LONG_PRESS_MS)
  }, [clearPressTimer, openPicker])

  const handlePointerUp = useCallback(() => {
    clearPressTimer()
  }, [clearPressTimer])

  const handlePointerCancel = useCallback(() => {
    clearPressTimer()
    if (longPressRef.current) { longPressRef.current = false; closePicker() }
  }, [clearPressTimer, closePicker])

  const handleMouseEnter = useCallback(() => {
    if (coarse) return
    clearPressTimer()
    closeTimer.current = setTimeout(() => openPicker(), HOVER_DELAY_MS)
  }, [coarse, clearPressTimer, openPicker])

  const handleMouseLeave = useCallback(() => {
    if (coarse) return
    clearCloseTimer()
    closeTimer.current = setTimeout(() => closePicker(), 200)
  }, [coarse, clearCloseTimer, closePicker])

  const pick = useCallback((type: string) => {
    if (!canReact) {
      closePicker()
      onRequireLogin?.()
      return
    }
    if (type === current) {
      onReact(postId, "")
    } else {
      onReact(postId, type)
    }
    suppressClickRef.current = false
    closePicker()
  }, [canReact, current, onReact, postId, closePicker, onRequireLogin])

  const bottomSheet = coarse || (typeof window !== "undefined" && window.innerWidth < 430)

  const renderPicker = () => {
    if (!open || typeof document === "undefined" || !btnRef.current) return null

    if (bottomSheet) {
      return createPortal(
        <div className="fixed inset-x-0 bottom-5 z-[70] flex justify-center px-3 pointer-events-none">
          <div
            ref={pickerRef}
            dir="ltr"
            className="pointer-events-auto bg-surface dark:bg-[#1e2d42] rounded-full shadow-2xl border border-border px-3 py-2 flex items-center gap-1 animate-slide-up"
            style={{ maxWidth: "calc(100vw - 24px)" }}
          >
            {REACTION_TYPES.map((type, i) => (
              <button
                key={type}
                onClick={() => pick(type)}
                className={`w-11 h-11 flex items-center justify-center rounded-full transition-all active:scale-90 hover:scale-125 ${
                  current === type ? "bg-primary/10 scale-110" : ""
                }`}
                style={{ animation: `bounce-in 0.3s ease-out ${i * 50}ms both` }}
                title={labels[type] || type}
                aria-label={labels[type] || type}
              >
                <ReactionIcon type={type} size={28} />
              </button>
            ))}
          </div>
        </div>,
        document.body
      )
    }

    const rect = btnRef.current.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    let left = rect.left + rect.width / 2 - PICKER_W / 2
    left = Math.max(8, Math.min(left, vw - PICKER_W - 8))
    let top = rect.top - PICKER_H - 8
    if (top < 8) {
      top = rect.bottom + 8
      if (top + PICKER_H > vh) {
        top = Math.max(8, vh - PICKER_H - 8)
      }
    }

    return createPortal(
      <div
        ref={pickerRef}
        dir="ltr"
        className="fixed z-[70] bg-surface dark:bg-[#1e2d42] rounded-2xl shadow-2xl border border-border px-2 py-1.5 flex items-center gap-0.5 animate-slide-up"
        style={{ left, top, width: PICKER_W }}
      >
        {REACTION_TYPES.map((type, i) => (
          <button
            key={type}
            onClick={() => pick(type)}
            onPointerEnter={clearCloseTimer}
            className={`w-11 h-11 flex items-center justify-center rounded-full transition-all hover:scale-125 active:scale-90 ${
              current === type ? "bg-primary/10 scale-110" : "hover:bg-black/5 dark:hover:bg-white/10"
            }`}
            style={{ animation: `bounce-in 0.3s ease-out ${i * 50}ms both` }}
            title={labels[type] || type}
            aria-label={labels[type] || type}
          >
            <ReactionIcon type={type} size={26} />
          </button>
        ))}
      </div>,
      document.body
    )
  }

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={handleTap}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={coarse && open ? closePicker : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleTap() }}
      className={`flex items-center justify-center gap-2 rounded-xl transition-colors select-none ${
        active
          ? "text-primary bg-primary/5 dark:text-primary dark:bg-primary/10"
          : "text-text-secondary hover:bg-black/5 dark:hover:bg-white/5"
      } ${className}`}
      aria-pressed={active}
    >
      {active ? (
        <span className="text-lg leading-none"><ReactionIcon type={current as string} size={17} /></span>
      ) : (
        <Heart className="w-4 h-4" />
      )}
      <span className="text-sm">
        {active ? (labels[current as string] || "Like") : (labels.like || (isArabic ? "إعجاب" : "Like"))}
      </span>
      {renderPicker()}
    </button>
  )
}