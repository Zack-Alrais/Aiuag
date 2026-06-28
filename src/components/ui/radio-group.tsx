"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface RadioOption {
  value: string
  label: string
  labelAr?: string
  disabled?: boolean
}

interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  options: RadioOption[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  name?: string
  label?: string
  labelAr?: string
  error?: string
  dir?: "ltr" | "rtl" | "auto"
  orientation?: "horizontal" | "vertical"
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      className,
      options,
      value,
      defaultValue,
      onChange,
      name,
      label,
      labelAr,
      error,
      dir = "ltr",
      orientation = "vertical",
      ...props
    },
    ref
  ) => {
    const groupId = React.useId()
    const isRtl = dir === "rtl"
    const displayLabel = isRtl && labelAr ? labelAr : label
    const [internalValue, setInternalValue] = React.useState(defaultValue)

    const currentValue = value !== undefined ? value : internalValue

    const handleChange = (optionValue: string) => {
      if (value === undefined) {
        setInternalValue(optionValue)
      }
      onChange?.(optionValue)
    }

    return (
      <div ref={ref} role="radiogroup" aria-labelledby={displayLabel ? `${groupId}-label` : undefined} dir={dir} {...props}>
        {displayLabel && (
          <p
            id={`${groupId}-label`}
            className={cn(
              "text-sm font-medium text-gray-700 mb-2",
              isRtl && "text-right"
            )}
          >
            {displayLabel}
          </p>
        )}
        <div
          className={cn(
            orientation === "horizontal" ? "flex flex-wrap gap-4" : "space-y-2",
            isRtl && "flex-row-reverse"
          )}
        >
          {options.map((option) => {
            const optionLabel = isRtl && option.labelAr ? option.labelAr : option.label
            const optionId = `${groupId}-${option.value}`
            const isChecked = currentValue === option.value

            return (
              <div
                key={option.value}
                className={cn(
                  "flex items-center gap-2",
                  isRtl && "flex-row-reverse"
                )}
              >
                <div className="relative flex items-center">
                  <input
                    type="radio"
                    id={optionId}
                    name={name || groupId}
                    value={option.value}
                    checked={isChecked}
                    disabled={option.disabled}
                    onChange={() => handleChange(option.value)}
                    className="peer sr-only"
                  />
                  <div
                    className={cn(
                      "h-4 w-4 rounded-full border border-gray-300 bg-white transition-colors",
                      "peer-focus-visible:ring-2 peer-focus-visible:ring-[#1A3A6B] peer-focus-visible:ring-offset-2",
                      "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
                      isChecked && "border-[#1A3A6B]"
                    )}
                  >
                    {isChecked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-[#1A3A6B]" />
                      </div>
                    )}
                  </div>
                </div>
                <label
                  htmlFor={optionId}
                  className={cn(
                    "text-sm font-medium text-gray-700 leading-none",
                    option.disabled && "opacity-50 cursor-not-allowed",
                    isRtl && "text-right"
                  )}
                >
                  {optionLabel}
                </label>
              </div>
            )
          })}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

export { RadioGroup }
export type { RadioGroupProps, RadioOption }
