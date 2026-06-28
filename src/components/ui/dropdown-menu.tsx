"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuItem {
  label: string
  labelAr?: string
  icon?: React.ReactNode
  onClick?: () => void
  href?: string
  disabled?: boolean
  danger?: boolean
  divider?: boolean
}

interface DropdownMenuProps {
  trigger: React.ReactNode
  items: DropdownMenuItem[]
  align?: "left" | "right"
  className?: string
  dir?: "ltr" | "rtl" | "auto"
}

function DropdownMenu({ trigger, items, align = "left", className, dir = "ltr" }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLDivElement>(null)
  const isRtl = dir === "rtl"
  const effectiveAlign = isRtl ? (align === "left" ? "right" : "left") : align

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    if (open) {
      document.addEventListener("keydown", handleEscape)
    }
    return () => document.removeEventListener("keydown", handleEscape)
  }, [open])

  return (
    <div className="relative inline-flex" dir={dir}>
      <div ref={triggerRef} onClick={() => setOpen(!open)}>
        {trigger}
      </div>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          className={cn(
            "absolute z-50 mt-2 min-w-[180px] overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg",
            "animate-in fade-in-0 zoom-in-95",
            effectiveAlign === "left" ? "left-0" : "right-0",
            className
          )}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return <div key={index} className="my-1.5 h-px bg-gray-200" />
            }

            const displayLabel = isRtl && item.labelAr ? item.labelAr : item.label
            const content = (
              <div
                role="menuitem"
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick?.()
                    setOpen(false)
                  }
                }}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 text-sm transition-colors cursor-pointer",
                  item.danger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-gray-700 hover:bg-gray-100",
                  item.disabled && "opacity-50 cursor-not-allowed",
                  isRtl && "flex-row-reverse text-right"
                )}
                aria-disabled={item.disabled}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                {displayLabel}
              </div>
            )

            return item.href ? (
              <a key={index} href={item.href} className="block" onClick={() => setOpen(false)}>
                {content}
              </a>
            ) : (
              <React.Fragment key={index}>{content}</React.Fragment>
            )
          })}
        </div>
      )}
    </div>
  )
}

export { DropdownMenu }
export type { DropdownMenuProps, DropdownMenuItem }
