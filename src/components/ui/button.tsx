"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Ripple from "./ripple"

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "link"
type ButtonSize = "sm" | "md" | "lg" | "icon"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
  loading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-light active:bg-primary-dark shadow-sm dark:bg-primary dark:hover:bg-primary-light",
  secondary:
    "bg-secondary text-primary-dark hover:bg-secondary-light active:bg-secondary-dark shadow-sm dark:text-white",
  outline:
    "border-2 border-primary text-primary bg-transparent hover:bg-primary/5 active:bg-primary/10 dark:border-primary dark:text-primary-light",
  ghost:
    "text-primary hover:bg-primary/5 active:bg-primary/10 dark:text-primary-light",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm",
  link:
    "text-primary underline-offset-4 hover:underline p-0 h-auto dark:text-primary-light",
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm rounded-md gap-1.5",
  md: "h-10 px-4 text-sm rounded-lg gap-2",
  lg: "h-12 px-6 text-base rounded-lg gap-2.5",
  icon: "h-10 w-10 rounded-lg flex items-center justify-center",
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const content = (
      <Comp
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </Comp>
    )

    if (disabled || loading) return content

    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
        <Ripple color="rgba(255,255,255,0.25)">
          {content}
        </Ripple>
      </motion.div>
    )
  }
)
Button.displayName = "Button"

export { Button }
export type { ButtonProps, ButtonVariant, ButtonSize }
