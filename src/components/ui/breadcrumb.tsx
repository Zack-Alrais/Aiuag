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
  services: { label: "Services", labelAr: "الخدمات", href: "/services" },
  news: { label: "News", labelAr: "الأخبار", href: "/news" },
  events: { label: "Events", labelAr: "الأحداث", href: "/events" },
  contact: { label: "Contact", labelAr: "اتصل بنا", href: "/contact" },
  donations: { label: "Donations", labelAr: "التبرعات", href: "/donations" },
  volunteer: { label: "Volunteer", labelAr: "التطوع", href: "/volunteer" },
  media: { label: "Media", labelAr: "الإعلام", href: "/media" },
  gallery: { label: "Gallery", labelAr: "المعرض", href: "/media/gallery" },
  faq: { label: "FAQ", labelAr: "الأسئلة الشائعة", href: "/faq" },
  projects: { label: "Projects", labelAr: "المشاريع", href: "/projects" },
  membership: { label: "Membership", labelAr: "العضوية", href: "/membership" },
  organization: { label: "Organization", labelAr: "الهيكل التنظيمي", href: "/organization" },
  board: { label: "Board", labelAr: "مجلس الإدارة", href: "/organization/board" },
  committees: { label: "Committees", labelAr: "اللجان", href: "/organization/committees" },
  secretariat: { label: "Secretariat", labelAr: "الأمانة العامة", href: "/organization/secretariat" },
  branches: { label: "Branches", labelAr: "الفروع", href: "/organization/branches" },
  publications: { label: "Publications", labelAr: "المنشورات", href: "/publications" },
  partners: { label: "Partners", labelAr: "الشركاء", href: "/partners" },
  support: { label: "Support", labelAr: "الدعم", href: "/support" },
  privacy: { label: "Privacy", labelAr: "سياسة الخصوصية", href: "/privacy" },
  terms: { label: "Terms", labelAr: "الشروط والأحكام", href: "/terms" },
  verify: { label: "Verify", labelAr: "التحقق", href: "/verify" },
  cards: { label: "Cards", labelAr: "البطاقات", href: "/cards" },
  posts: { label: "Posts", labelAr: "المنشورات", href: "/posts" },
  resources: { label: "Resources", labelAr: "الموارد", href: "/resources" },
  profile: { label: "Profile", labelAr: "الملف الشخصي", href: "/profile" },
  dashboard: { label: "Dashboard", labelAr: "لوحة التحكم", href: "/dashboard" },
  graduate: { label: "Graduate", labelAr: "الخريج", href: "/graduate" },
  history: { label: "History", labelAr: "التاريخ", href: "/about/history" },
  mission: { label: "Mission", labelAr: "الرسالة", href: "/about/mission" },
  vision: { label: "Vision", labelAr: "الرؤية", href: "/about/vision" },
  objectives: { label: "Objectives", labelAr: "الأهداف", href: "/about/objectives" },
  apply: { label: "Apply", labelAr: "التقديم", href: "/membership/apply" },
  benefits: { label: "Benefits", labelAr: "المزايا", href: "/membership/benefits" },
  manage: { label: "Manage", labelAr: "الإدارة", href: "/membership/manage" },
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
  const lang = pathname.split("/")[1]
  const resolvedHomeHref = homeHref === "/" && (lang === "ar" || lang === "en") ? `/${lang}` : homeHref

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
            href={resolvedHomeHref}
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
