"use client"

import { useCallback } from "react"
import { motion } from "framer-motion"
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

  const select = useCallback(
    (type: string) => {
      if (!canReact) {
        onRequireLogin?.()
        return
      }
      if (type === current) onReact(postId, "")
      else onReact(postId, type)
    },
    [canReact, current, onReact, postId, onRequireLogin]
  )

  return (
    <div
      role="group"
      aria-label={isArabic ? "ردود الفعل" : "Reactions"}
      className={`flex items-center justify-center gap-0.5 sm:gap-1 ${className}`}
    >
      {REACTION_TYPES.map((type) => {
        const isActive = type === current
        return (
          <motion.button
            key={type}
            type="button"
            whileTap={{ scale: 0.85 }}
            onClick={() => select(type)}
            aria-pressed={isActive}
            aria-label={labels[type] || type}
            title={labels[type] || type}
            className={`relative flex items-center justify-center rounded-full transition-all select-none touch-manipulation ${
              isActive
                ? "bg-primary/15 dark:bg-primary/20 ring-2 ring-primary/40"
                : "hover:bg-black/5 dark:hover:bg-white/10"
            }`}
            style={{
              width: 34,
              height: 34,
              WebkitTouchCallout: "none",
            }}
          >
            <span
              className="inline-flex leading-none transition-transform active:scale-90"
              style={{ transform: isActive ? "scale(1.2)" : "scale(1)" }}
            >
              <ReactionIcon type={type} size={22} />
            </span>
            {/* Active indicator dot */}
            <span
              className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 rounded-full transition-all ${
                isActive ? "w-1 h-1 bg-primary" : "w-0 h-0"
              }`}
            />
          </motion.button>
        )
      })}
    </div>
  )
}
