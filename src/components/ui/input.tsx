"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  labelAr?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  dir?: "ltr" | "rtl" | "auto"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, labelAr, error, helperText, leftIcon, rightIcon, id, dir, ...props }, ref) => {
    const inputId = id || React.useId()
    const isRtl = dir === "rtl"
    const displayLabel = isRtl && labelAr ? labelAr : label

    return (
      <div className="w-full">
        {displayLabel && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium text-gray-700 mb-1.5",
              isRtl && "text-right"
            )}
          >
            {displayLabel}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className={cn(
              "absolute top-1/2 -translate-y-1/2 text-gray-400",
              isRtl ? "right-3" : "left-3"
            )}>
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            dir={dir}
            className={cn(
              "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors",
              "placeholder:text-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                : "border-gray-300",
              leftIcon && (isRtl ? "pr-10" : "pl-10"),
              rightIcon && (isRtl ? "pl-10" : "pr-10"),
              isRtl && "text-right",
              className
            )}
            ref={ref}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className={cn(
              "absolute top-1/2 -translate-y-1/2 text-gray-400",
              isRtl ? "left-3" : "right-3"
            )}>
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
export type { InputProps }
