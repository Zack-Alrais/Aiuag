"use client"

import { HeroSkeleton } from "@/components/ui/skeleton"

export default function VideosLoading() {
  return (
    <div>
      <HeroSkeleton />

      {/* Tabs skeleton */}
      <div className="sticky top-20 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 py-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      <section className="py-6 bg-background">
        <div className="container mx-auto px-4 space-y-6">
          {/* Main player skeleton */}
          <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />

          {/* Info skeleton */}
          <div className="space-y-3">
            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
          </div>

          {/* Thumbnail list skeleton */}
          <div className="mt-8">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4 animate-pulse" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="shrink-0 w-56 lg:w-64">
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse mb-1" />
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
