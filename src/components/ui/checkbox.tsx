"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string
  labelAr?: string
  indeterminate?: boolean
  dir?: "ltr" | "rtl" | "auto"
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, labelAr, indeterminate, id, dir, checked, ...props }, ref) => {
    const checkboxId = id || React.useId()
    const isRtl = dir === "rtl"
    const displayLabel = isRtl && labelAr ? labelAr : label
    const internalRef = React.useRef<HTMLInputElement>(null)

    React.useImperativeHandle(ref, () => internalRef.current as HTMLInputElement)

    React.useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate ?? false
      }
    }, [indeterminate])

    return (
      <div className={cn("flex items-center gap-2", isRtl && "flex-row-reverse")}>
        <div className="relative flex items-center">
          <input
            type="checkbox"
            id={checkboxId}
            ref={internalRef}
            checked={checked}
            className={cn(
              "peer h-4 w-4 shrink-0 rounded border border-gray-300 bg-white transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3A6B] focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "checked:bg-[#1A3A6B] checked:border-[#1A3A6B]",
              className
            )}
            {...props}
          />
          <svg
            className="absolute left-0 top-0 h-4 w-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            {indeterminate ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            )}
          </svg>
        </div>
        {displayLabel && (
          <label
            htmlFor={checkboxId}
            className={cn(
              "text-sm font-medium text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              isRtl && "text-right"
            )}
          >
            {displayLabel}
          </label>
        )}
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
export type { CheckboxProps }
