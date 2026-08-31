"use client"

import { useCallback, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import ReactionIcon from "@/components/shared/reaction-icon"

const REACTION_TYPES = ["like", "love", "haha", "wow", "sad", "angry"] as const

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
  const current = myReaction || null
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const isTouch = useRef(false)

  const select = useCallback(
    (type: string) => {
      if (!canReact) {
        onRequireLogin?.()
        setOpen(false)
        return
      }
      if (type === current) onReact(postId, "")
      else onReact(postId, type)
      setOpen(false)
    },
    [canReact, current, onReact, postId, onRequireLogin]
  )

  const currentLabel = current ? labels[current] || current : isArabic ? "أعجبني" : "Like"
  const currentEmojiNil = current ? (
    <ReactionIcon type={current} size={20} />
  ) : null

  return (
    <div
      ref={wrapRef}
      className={`relative flex w-full ${className}`}
      onMouseEnter={() => { if (!isTouch.current) setOpen(true) }}
      onMouseLeave={() => { if (!isTouch.current) setOpen(false) }}
      onTouchStart={() => { isTouch.current = true }}
    >
      {/* Main like button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.88 }}
        onClick={(e) => {
          e.preventDefault()
          setOpen((o) => !o)
        }}
        aria-pressed={!!current}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={currentLabel}
        className={`w-full h-full py-2.5 flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors active:scale-95 ${
          current
            ? "text-blue-600 dark:text-blue-400"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e2d42]"
        }`}
      >
        {currentEmojiNil || <ReactionIcon type="like" size={20} />}
        <span>{currentLabel}</span>
      </motion.button>

      {/* Fly-out reaction picker */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label={isArabic ? "اختر تفاعلاً" : "Choose a reaction"}
            className="absolute left-1/2 -translate-x-1/2 -top-14 z-40 flex items-center justify-between gap-0.5 rounded-2xl bg-white dark:bg-[#1a2440] shadow-xl border border-gray-100 dark:border-[#2a3f5f] px-2 py-1 sm:px-3 min-w-[285px]"
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            {REACTION_TYPES.map((type) => {
              const isActive = type === current
              return (
                <motion.button
                  key={type}
                  role="menuitem"
                  type="button"
                  whileHover={{ scale: 1.35, y: -4 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => select(type)}
                  aria-pressed={isActive}
                  aria-label={labels[type] || type}
                  title={labels[type] || type}
                  className={`flex items-center justify-center rounded-full transition-colors ${
                    isActive ? "ring-2 ring-primary/50 bg-primary/10" : ""
                  }`}
                  style={{ width: 40, height: 40, WebkitTouchCallout: "none" }}
                >
                  <ReactionIcon type={type} size={26} />
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
