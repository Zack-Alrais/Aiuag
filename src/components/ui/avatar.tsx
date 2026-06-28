"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type AvatarSize = "sm" | "md" | "lg" | "xl"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  fallback?: string
  size?: AvatarSize
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-xl",
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getBackgroundColor(name: string): string {
  const colors = [
    "bg-[#1A3A6B]",
    "bg-[#2E7D32]",
    "bg-[#D4A843]",
    "bg-blue-600",
    "bg-purple-600",
    "bg-pink-600",
    "bg-indigo-600",
    "bg-teal-600",
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function Avatar({ className, src, alt = "", fallback, size = "md", ...props }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false)
  const initials = fallback ? getInitials(fallback) : alt ? getInitials(alt) : "?"
  const bgColor = getBackgroundColor(fallback || alt || "User")
  const showImage = src && !imgError

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={cn(
            "flex h-full w-full items-center justify-center rounded-full text-white font-medium",
            bgColor
          )}
        >
          {initials}
        </div>
      )}
    </div>
  )
}

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  max?: number
  size?: AvatarSize
}

function AvatarGroup({ className, children, max = 5, size = "md", ...props }: AvatarGroupProps) {
  const childArray = React.Children.toArray(children)
  const visible = childArray.slice(0, max)
  const remaining = childArray.length - max

  return (
    <div className={cn("flex items-center -space-x-2", className)} dir="ltr" {...props}>
      {visible.map((child, i) => (
        <div key={i} className="relative ring-2 ring-white rounded-full">
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            "relative inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-700 ring-2 ring-white font-medium",
            sizeStyles[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  )
}

export { Avatar, AvatarGroup }
export type { AvatarProps, AvatarGroupProps, AvatarSize }
