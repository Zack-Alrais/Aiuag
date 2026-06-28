"use client"

import { GridSkeleton, HeroSkeleton } from "@/components/ui/skeleton"

export default function GalleryLoading() {
  return (
    <div>
      <HeroSkeleton />
      <div className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex gap-3 justify-center mb-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            ))}
          </div>
          <GridSkeleton count={8} cols={4} />
        </div>
      </div>
    </div>
  )
}
