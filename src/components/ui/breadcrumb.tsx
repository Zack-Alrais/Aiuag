"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  labelAr?: string
  href?: string
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  autoGenerate?: boolean
  homeLabel?: string
  homeLabelAr?: string
  homeHref?: string
  className?: string
  dir?: "ltr" | "rtl" | "auto"
  separator?: React.ReactNode
}

const defaultLabels: Record<string, BreadcrumbItem> = {
  home: { label: "Home", labelAr: "الرئيسية", href: "/" },
  about: { label: "About", labelAr: "عن الجمعية", href: "/about" },
  programs: { label: "Programs", labelAr: "البرامج", href: "/programs" },
  services: { label: "Services", labelAr: "الخدمات", href: "/services" },
  news: { label: "News", labelAr: "الأخبار", href: "/news" },
  events: { label: "Events", labelAr: "الأحداث", href: "/events" },
  contact: { label: "Contact", labelAr: "اتصل بنا", href: "/contact" },
  donate: { label: "Donate", labelAr: "تبرع", href: "/donate" },
  volunteers: { label: "Volunteers", labelAr: "المتطوعون", href: "/volunteers" },
  team: { label: "Team", labelAr: "الفريق", href: "/team" },
  gallery: { label: "Gallery", labelAr: "المعرض", href: "/gallery" },
  faq: { label: "FAQ", labelAr: "الأسئلة الشائعة", href: "/faq" },
}

function Breadcrumb({
  items,
  autoGenerate = true,
  homeLabel,
  homeLabelAr,
  homeHref = "/",
  className,
  dir = "ltr",
  separator,
}: BreadcrumbProps) {
  const pathname = usePathname()
  const isRtl = dir === "rtl"

  const generatedItems = React.useMemo(() => {
    if (!autoGenerate) return items || []

    const segments = pathname.split("/").filter(Boolean)
    const crumbs: BreadcrumbItem[] = []

    segments.forEach((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/")
      const known = defaultLabels[segment]
      crumbs.push({
        label: known?.label || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
        labelAr: known?.labelAr || segment,
        href,
      })
    })

    return crumbs
  }, [autoGenerate, items, pathname])

  const defaultSeparator = (
    <svg
      className={cn("h-4 w-4 text-gray-400", isRtl && "rotate-180")}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )

  const displayHomeLabel = isRtl && homeLabelAr ? homeLabelAr : homeLabel

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center", isRtl && "flex-row-reverse", className)} dir={dir}>
      <ol className={cn("flex items-center gap-1.5 text-sm", isRtl && "flex-row-reverse")}>
        <li>
          <Link
            href={homeHref}
            className={cn(
              "text-gray-500 hover:text-[#1A3A6B] transition-colors",
              isRtl && "text-right"
            )}
          >
            {displayHomeLabel || (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            )}
          </Link>
        </li>
        {generatedItems.map((item, index) => {
          const isLast = index === generatedItems.length - 1
          const label = isRtl && item.labelAr ? item.labelAr : item.label

          return (
            <li key={item.href || index} className="flex items-center gap-1.5">
              <span aria-hidden="true">{separator || defaultSeparator}</span>
              {isLast || !item.href ? (
                <span className="text-gray-900 font-medium" aria-current={isLast ? "page" : undefined}>
                  {label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-gray-500 hover:text-[#1A3A6B] transition-colors"
                >
                  {label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export { Breadcrumb }
export type { BreadcrumbProps, BreadcrumbItem }
