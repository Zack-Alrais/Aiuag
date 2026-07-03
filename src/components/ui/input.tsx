"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  labelAr?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  dir?: "rtl" | "ltr"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, labelAr, error, helperText, leftIcon, rightIcon, dir = "ltr", id, ...props }, ref) => {
    const inputId = id || React.useId()
    const errorId = `${inputId}-error`
    const [focused, setFocused] = React.useState(false)

    return (
      <div className="w-full">
        {(label || labelAr) && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            {dir === "rtl" && labelAr ? labelAr : label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-gray-400 dark:text-gray-500">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              "flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900",
              "placeholder:text-gray-400",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
              "dark:bg-dark-surface dark:border-dark-border dark:text-white dark:placeholder:text-gray-500",
              "dark:focus:ring-primary/30 dark:focus:border-primary-light",
              error && "border-red-500 focus:ring-red-200 focus:border-red-500 dark:border-red-400",
              leftIcon && "ps-10",
              rightIcon && "pe-10",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            ref={ref}
            onFocus={(e) => { setFocused(true); props.onFocus?.(e) }}
            onBlur={(e) => { setFocused(false); props.onBlur?.(e) }}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none text-gray-400 dark:text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            id={errorId}
            role="alert"
            className="mt-1 text-xs text-red-500 dark:text-red-400"
          >
            {error}
          </motion.p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
export type { InputProps }
