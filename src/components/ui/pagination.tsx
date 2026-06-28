"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  siblingCount?: number
  showPrevNext?: boolean
  showFirstLast?: boolean
  className?: string
  dir?: "ltr" | "rtl" | "auto"
}

function generatePages(current: number, total: number, siblingCount: number): (number | "ellipsis")[] {
  const totalNumbers = siblingCount * 2 + 5
  if (total <= totalNumbers) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const leftSiblingIndex = Math.max(current - siblingCount, 1)
  const rightSiblingIndex = Math.min(current + siblingCount, total)
  const showLeftEllipsis = leftSiblingIndex > 2
  const showRightEllipsis = rightSiblingIndex < total - 1

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = 3 + 2 * siblingCount
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1)
    return [...leftRange, "ellipsis", total]
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightItemCount = 3 + 2 * siblingCount
    const rightRange = Array.from({ length: rightItemCount }, (_, i) => total - rightItemCount + i + 1)
    return [1, "ellipsis", ...rightRange]
  }

  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i
  )
  return [1, "ellipsis", ...middleRange, "ellipsis", total]
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showPrevNext = true,
  showFirstLast = false,
  className,
  dir = "ltr",
}: PaginationProps) {
  const isRtl = dir === "rtl"
  const pages = generatePages(currentPage, totalPages, siblingCount)

  const ChevronLeft = (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={isRtl ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
    </svg>
  )
  const ChevronRight = (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={isRtl ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
    </svg>
  )

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("flex items-center gap-1", isRtl && "flex-row-reverse", className)}
      dir={dir}
    >
      {showFirstLast && (
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="inline-flex items-center justify-center h-9 min-w-[36px] rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
          aria-label="First page"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={isRtl ? "M11 19l-7-7 7-7M18 19l-7-7 7-7" : "M13 19l-7-7 7-7M6 19l7-7-7-7"} />
          </svg>
        </button>
      )}
      {showPrevNext && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center justify-center h-9 min-w-[36px] rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
          aria-label="Previous page"
        >
          {ChevronLeft}
        </button>
      )}
      {pages.map((page, index) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="inline-flex items-center justify-center h-9 min-w-[36px] text-sm text-gray-500">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={cn(
              "inline-flex items-center justify-center h-9 min-w-[36px] rounded-lg text-sm font-medium transition-colors",
              page === currentPage
                ? "bg-[#1A3A6B] text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            {page}
          </button>
        )
      )}
      {showPrevNext && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center justify-center h-9 min-w-[36px] rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
          aria-label="Next page"
        >
          {ChevronRight}
        </button>
      )}
      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center justify-center h-9 min-w-[36px] rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
          aria-label="Last page"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={isRtl ? "M13 19l-7-7 7-7M6 19l7-7-7-7" : "M11 19l-7-7 7-7M18 19l-7-7 7-7"} />
          </svg>
        </button>
      )}
    </nav>
  )
}

interface PaginationInfoProps {
  totalItems: number
  currentPage: number
  itemsPerPage: number
  className?: string
}

function PaginationInfo({ totalItems, currentPage, itemsPerPage, className }: PaginationInfoProps) {
  const start = (currentPage - 1) * itemsPerPage + 1
  const end = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <p className={cn("text-sm text-gray-600", className)}>
      Showing {start}–{end} of {totalItems}
    </p>
  )
}

export { Pagination, PaginationInfo }
export type { PaginationProps, PaginationInfoProps }
