"use client"

import { GridSkeleton, HeroSkeleton } from "@/components/ui/skeleton"

export default function BranchesLoading() {
  return (
    <div>
      <HeroSkeleton />
      <div className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
      <div className="py-20 bg-surface">
        <div className="container mx-auto px-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-12 animate-pulse" />
          <GridSkeleton count={6} cols={3} />
        </div>
      </div>
    </div>
  )
}
