"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface Tab {
  id: string
  label: string
  labelAr?: string
  content: React.ReactNode
  icon?: React.ReactNode
  disabled?: boolean
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  onChange?: (tabId: string) => void
  className?: string
  dir?: "ltr" | "rtl" | "auto"
}

function Tabs({ tabs, defaultTab, onChange, className, dir }: TabsProps) {
  const isRtl = dir === "rtl"
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id)
  const tabListRef = React.useRef<HTMLDivElement>(null)
  const tabRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map())

  const handleChange = React.useCallback(
    (tabId: string) => {
      setActiveTab(tabId)
      onChange?.(tabId)
    },
    [onChange]
  )

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      const enabledTabs = tabs.filter((t) => !t.disabled)
      const currentIndex = enabledTabs.findIndex((t) => t.id === activeTab)
      let nextIndex: number

      if (isRtl) {
        if (e.key === "ArrowRight") {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : enabledTabs.length - 1
        } else if (e.key === "ArrowLeft") {
          nextIndex = currentIndex < enabledTabs.length - 1 ? currentIndex + 1 : 0
        } else if (e.key === "Home") {
          nextIndex = enabledTabs.length - 1
        } else if (e.key === "End") {
          nextIndex = 0
        } else {
          return
        }
      } else {
        if (e.key === "ArrowRight") {
          nextIndex = currentIndex < enabledTabs.length - 1 ? currentIndex + 1 : 0
        } else if (e.key === "ArrowLeft") {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : enabledTabs.length - 1
        } else if (e.key === "Home") {
          nextIndex = 0
        } else if (e.key === "End") {
          nextIndex = enabledTabs.length - 1
        } else {
          return
        }
      }

      e.preventDefault()
      const nextTab = enabledTabs[nextIndex]
      if (nextTab) {
        handleChange(nextTab.id)
        tabRefs.current.get(nextTab.id)?.focus()
      }
    },
    [activeTab, tabs, isRtl, handleChange]
  )

  const activeTabData = tabs.find((t) => t.id === activeTab)

  return (
    <div className={cn("w-full", className)} dir={dir}>
      <div
        ref={tabListRef}
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
        className={cn(
          "flex border-b border-gray-200",
          isRtl && "flex-row-reverse"
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          const displayLabel = isRtl && tab.labelAr ? tab.labelAr : tab.label
          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el)
              }}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => handleChange(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
                isActive
                  ? "border-[#1A3A6B] text-[#1A3A6B]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                tab.disabled && "opacity-50 cursor-not-allowed",
                isRtl && "flex-row-reverse"
              )}
            >
              {tab.icon}
              {displayLabel}
            </button>
          )
        })}
      </div>
      {activeTabData && (
        <div
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="py-4"
        >
          {activeTabData.content}
        </div>
      )}
    </div>
  )
}

export { Tabs }
export type { TabsProps, Tab }
