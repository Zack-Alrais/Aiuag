"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SearchableSelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SearchableSelectProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  label?: string
  labelAr?: string
  value: string
  options: SearchableSelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  dir?: "ltr" | "rtl" | "auto"
  error?: string
}

export function SearchableSelect({
  label,
  labelAr,
  value,
  options,
  onChange,
  placeholder,
  dir = "auto",
  error,
  className,
  id,
  ...props
}: SearchableSelectProps) {
  const inputId = id || React.useId()
  const isRtl = dir === "rtl"
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const selected = options.find((option) => option.value === value)
    setQuery(selected ? selected.label : value)
  }, [value, options])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredOptions = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedQuery) || option.value.toLowerCase().includes(normalizedQuery)
    )
  }, [options, query])

  const handleSelect = (option: SearchableSelectOption) => {
    setQuery(option.label)
    onChange(option.value)
    setOpen(false)
  }

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            "block text-sm font-medium text-gray-700 mb-1.5",
            isRtl && "text-right"
          )}
        >
          {isRtl && labelAr ? labelAr : label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          dir={dir}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value)
            onChange(event.target.value)
            setOpen(true)
          }}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20",
            error ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-[#1A3A6B]",
            isRtl ? "text-right" : "text-left",
            className
          )}
          autoComplete="off"
          {...props}
        />
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
        {open && filteredOptions.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg">
            {filteredOptions.map((option) => (
              <li
                key={option.value}
                className={cn(
                  "cursor-pointer px-3 py-2 text-sm text-text hover:bg-gray-100",
                  option.disabled && "cursor-not-allowed text-gray-400 hover:bg-transparent"
                )}
                onMouseDown={(event) => {
                  event.preventDefault()
                  if (!option.disabled) handleSelect(option)
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
