"use client"

import { GridSkeleton, HeroSkeleton } from "@/components/ui/skeleton"

export default function PublicationsLoading() {
  return (
    <div>
      <HeroSkeleton />
      <div className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <GridSkeleton count={6} cols={3} />
        </div>
      </div>
    </div>
  )
}
