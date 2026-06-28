"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  labelAr?: string
  error?: string
  helperText?: string
  maxLength?: number
  autoResize?: boolean
  dir?: "ltr" | "rtl" | "auto"
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, labelAr, error, helperText, maxLength, autoResize = false, id, dir, value, onChange, ...props }, ref) => {
    const textareaId = id || React.useId()
    const isRtl = dir === "rtl"
    const displayLabel = isRtl && labelAr ? labelAr : label
    const [charCount, setCharCount] = React.useState(
      typeof value === "string" ? value.length : 0
    )
    const internalRef = React.useRef<HTMLTextAreaElement>(null)

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (maxLength !== undefined) {
          setCharCount(e.target.value.length)
        }
        if (autoResize) {
          const target = e.target
          target.style.height = "auto"
          target.style.height = `${target.scrollHeight}px`
        }
        onChange?.(e)
      },
      [maxLength, autoResize, onChange]
    )

    React.useImperativeHandle(ref, () => internalRef.current as HTMLTextAreaElement)

    React.useEffect(() => {
      if (autoResize && internalRef.current) {
        internalRef.current.style.height = "auto"
        internalRef.current.style.height = `${internalRef.current.scrollHeight}px`
      }
    }, [autoResize, value])

    return (
      <div className="w-full">
        {displayLabel && (
          <label
            htmlFor={textareaId}
            className={cn(
              "block text-sm font-medium text-gray-700 mb-1.5",
              isRtl && "text-right"
            )}
          >
            {displayLabel}
          </label>
        )}
        <textarea
          id={textareaId}
          dir={dir}
          ref={internalRef}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          className={cn(
            "flex min-h-[80px] w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors resize-none",
            "placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
              : "border-gray-300",
            isRtl && "text-right",
            className
          )}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          {...props}
        />
        <div className="mt-1.5 flex items-center justify-between">
          <div>
            {error && (
              <p id={`${textareaId}-error`} className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            {!error && helperText && (
              <p id={`${textareaId}-helper`} className="text-sm text-gray-500">
                {helperText}
              </p>
            )}
          </div>
          {maxLength !== undefined && (
            <span className={cn(
              "text-xs text-gray-400",
              charCount >= maxLength && "text-red-500"
            )}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
export type { TextareaProps }
