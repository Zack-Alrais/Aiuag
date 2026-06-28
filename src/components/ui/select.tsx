"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string
  labelAr?: string
  error?: string
  placeholder?: string
  options: SelectOption[]
  dir?: "ltr" | "rtl" | "auto"
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, labelAr, error, placeholder, options, id, dir, ...props }, ref) => {
    const selectId = id || React.useId()
    const isRtl = dir === "rtl"
    const displayLabel = isRtl && labelAr ? labelAr : label

    return (
      <div className="w-full">
        {displayLabel && (
          <label
            htmlFor={selectId}
            className={cn(
              "block text-sm font-medium text-gray-700 mb-1.5",
              isRtl && "text-right"
            )}
          >
            {displayLabel}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            dir={dir}
            ref={ref}
            className={cn(
              "flex h-10 w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-8 text-sm transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                : "border-gray-300",
              isRtl && "text-right pl-8 pr-3",
              className
            )}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${selectId}-error` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <div
            className={cn(
              "pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-400",
              isRtl ? "left-3" : "right-3"
            )}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        {error && (
          <p id={`${selectId}-error`} className="mt-1.5 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
export type { SelectProps, SelectOption }
