"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AccordionItem {
  id: string
  title: string
  titleAr?: string
  content: React.ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
  multiple?: boolean
  defaultOpen?: string[]
  className?: string
  dir?: "ltr" | "rtl" | "auto"
}

interface AccordionContextValue {
  openItems: Set<string>
  toggle: (id: string) => void
}

const AccordionContext = React.createContext<AccordionContextValue>({
  openItems: new Set(),
  toggle: () => {},
})

function Accordion({ items, multiple = false, defaultOpen = [], className, dir }: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<Set<string>>(new Set(defaultOpen))

  const toggle = React.useCallback(
    (id: string) => {
      setOpenItems((prev) => {
        const next = new Set(prev)
        if (next.has(id)) {
          next.delete(id)
        } else {
          if (!multiple) next.clear()
          next.add(id)
        }
        return next
      })
    },
    [multiple]
  )

  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      <div className={cn("w-full", className)} dir={dir} role="region">
        {items.map((item) => (
          <AccordionItem key={item.id} item={item} dir={dir} />
        ))}
      </div>
    </AccordionContext.Provider>
  )
}

function AccordionItem({ item, dir }: { item: AccordionItem; dir?: string }) {
  const { openItems, toggle } = React.useContext(AccordionContext)
  const isOpen = openItems.has(item.id)
  const isRtl = dir === "rtl"
  const displayTitle = isRtl && item.titleAr ? item.titleAr : item.title
  const contentId = `accordion-content-${item.id}`
  const headerId = `accordion-header-${item.id}`

  return (
    <div className="border-b border-gray-200">
      <h3>
        <button
          id={headerId}
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={() => toggle(item.id)}
          className={cn(
            "flex w-full items-center justify-between py-4 text-sm font-medium transition-colors hover:text-[#1A3A6B]",
            isRtl && "flex-row-reverse text-right",
            isOpen && "text-[#1A3A6B]"
          )}
        >
          {displayTitle}
          <svg
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </h3>
      <div
        id={contentId}
        role="region"
        aria-labelledby={headerId}
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[500px] opacity-100 pb-4" : "max-h-0 opacity-0"
        )}
      >
        <div className="text-sm text-gray-600 leading-relaxed">
          {item.content}
        </div>
      </div>
    </div>
  )
}

export { Accordion }
export type { AccordionProps, AccordionItem }
