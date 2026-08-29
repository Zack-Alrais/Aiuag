"use client"

const EMOJI_MAP: Record<string, { emoji: string; label: string }> = {
  like: { emoji: "👍", label: "Like" },
  love: { emoji: "❤️", label: "Love" },
  haha: { emoji: "😂", label: "Haha" },
  wow: { emoji: "😮", label: "Wow" },
  sad: { emoji: "😢", label: "Sad" },
  angry: { emoji: "😡", label: "Angry" },
}

interface ReactionIconProps {
  type: string
  size?: number
  className?: string
}

export default function ReactionIcon({ type, size = 24, className = "" }: ReactionIconProps) {
  const config = EMOJI_MAP[type] || EMOJI_MAP.like
  return (
    <span
      className={`inline-flex items-center justify-center transition-transform active:scale-125 ${className}`}
      style={{ fontSize: size }}
      role="img"
      aria-label={config.label}
    >
      {config.emoji}
    </span>
  )
}
