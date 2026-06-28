"use client"

import { GridSkeleton, HeroSkeleton } from "@/components/ui/skeleton"

export default function PublicationsInteractiveLoading() {
  return (
    <div>
      <HeroSkeleton />
      <div className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto mb-8">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          </div>
          <div className="flex gap-3 justify-center mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            ))}
          </div>
          <GridSkeleton count={6} cols={3} />
        </div>
      </div>
    </div>
  )
}
