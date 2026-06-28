"use client"

import { GridSkeleton, HeroSkeleton } from "@/components/ui/skeleton"

export default function ReportsLoading() {
  return (
    <div>
      <HeroSkeleton />
      <div className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6 animate-pulse" />
          <GridSkeleton count={3} cols={3} />
        </div>
      </div>
    </div>
  )
}
