import * as React from "react"
import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "outline"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-800",
  primary: "bg-[#1A3A6B]/10 text-[#1A3A6B]",
  secondary: "bg-[#D4A843]/15 text-[#8B6914]",
  success: "bg-[#2E7D32]/10 text-[#2E7D32]",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
  outline: "border border-gray-300 text-gray-700 bg-transparent",
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
export type { BadgeProps, BadgeVariant }
