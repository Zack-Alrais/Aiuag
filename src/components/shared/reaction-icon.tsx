const icons: Record<string, { viewBox: string; paths: string[] }> = {
  like: {
    viewBox: "0 0 24 24",
    paths: [
      "M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3m7-2V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14Z",
    ],
  },
  love: {
    viewBox: "0 0 24 24",
    paths: [
      "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
    ],
  },
  haha: {
    viewBox: "0 0 24 24",
    paths: [
      "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z",
      "M8 14s1.5 2 4 2 4-2 4-2",
      "M9 9h.01",
      "M15 9h.01",
    ],
  },
  wow: {
    viewBox: "0 0 24 24",
    paths: [
      "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z",
      "M9 10h.01",
      "M15 10h.01",
      "M12 14c1.5 0 3 .5 3 2s-1.5 2-3 2-3-.5-3-2 1.5-2 3-2Z",
    ],
  },
  sad: {
    viewBox: "0 0 24 24",
    paths: [
      "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z",
      "M16 16s-1.5-2-4-2-4 2-4 2",
      "M9 9h.01",
      "M15 9h.01",
    ],
  },
  angry: {
    viewBox: "0 0 24 24",
    paths: [
      "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z",
      "M16 16s-1.5-2-4-2-4 2-4 2",
      "M8.5 8.5l2 1",
      "M13.5 9.5l2-1",
    ],
  },
}

interface ReactionIconProps {
  type: string
  size?: number
  className?: string
}

export default function ReactionIcon({ type, size = 24, className = "" }: ReactionIconProps) {
  const icon = icons[type] || icons.like
  return (
    <svg
      viewBox={icon.viewBox}
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {icon.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}
