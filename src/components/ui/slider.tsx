"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  min?: number
  max?: number
  step?: number
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
  showValue?: boolean
  showMarks?: boolean
  marks?: { value: number; label: string }[]
  dir?: "ltr" | "rtl" | "auto"
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min = 0, max = 100, step = 1, value, defaultValue = 0, onChange, showValue = true, showMarks = false, marks, dir = "ltr", ...props }, ref) => {
    const isRtl = dir === "rtl"
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const currentValue = value !== undefined ? value : internalValue

    const percentage = ((currentValue - min) / (max - min)) * 100

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value)
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onChange?.(newValue)
    }

    return (
      <div className={cn("w-full", isRtl && "text-right", className)} dir={dir}>
        {showValue && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">{min}</span>
            <span className="text-sm font-medium text-[#1A3A6B]">{currentValue}</span>
            <span className="text-sm text-gray-500">{max}</span>
          </div>
        )}
        <div className="relative">
          <input
            type="range"
            ref={ref}
            min={min}
            max={max}
            step={step}
            value={currentValue}
            onChange={handleChange}
            className={cn(
              "w-full h-2 rounded-full appearance-none cursor-pointer",
              "bg-gray-200",
              "[&::-webkit-slider-thumb]:appearance-none",
              "[&::-webkit-slider-thumb]:h-5",
              "[&::-webkit-slider-thumb]:w-5",
              "[&::-webkit-slider-thumb]:rounded-full",
              "[&::-webkit-slider-thumb]:bg-[#1A3A6B]",
              "[&::-webkit-slider-thumb]:border-2",
              "[&::-webkit-slider-thumb]:border-white",
              "[&::-webkit-slider-thumb]:shadow-md",
              "[&::-webkit-slider-thumb]:cursor-pointer",
              "[&::-webkit-slider-thumb]:transition-transform",
              "[&::-webkit-slider-thumb]:hover:scale-110",
              "[&::-moz-range-thumb]:h-5",
              "[&::-moz-range-thumb]:w-5",
              "[&::-moz-range-thumb]:rounded-full",
              "[&::-moz-range-thumb]:bg-[#1A3A6B]",
              "[&::-moz-range-thumb]:border-2",
              "[&::-moz-range-thumb]:border-white",
              "[&::-moz-range-thumb]:shadow-md",
              "[&::-moz-range-thumb]:cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3A6B]/20"
            )}
            style={{
              background: `linear-gradient(to right, #1A3A6B 0%, #1A3A6B ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
            }}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={currentValue}
            {...props}
          />
        </div>
        {showMarks && marks && marks.length > 0 && (
          <div className="relative mt-2">
            {marks.map((mark) => {
              const markPercentage = ((mark.value - min) / (max - min)) * 100
              return (
                <div
                  key={mark.value}
                  className="absolute -translate-x-1/2"
                  style={{ left: `${markPercentage}%` }}
                >
                  <div className="h-1.5 w-0.5 bg-gray-300 mx-auto" />
                  <span className="text-xs text-gray-500 block mt-1 whitespace-nowrap">
                    {mark.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
export type { SliderProps }
