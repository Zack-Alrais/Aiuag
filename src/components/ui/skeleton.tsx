"use client";

export function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light rounded ${className}`} />
  );
}

export function SkeletonCircle({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light rounded-full ${className}`} />
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-surface rounded-2xl border border-border overflow-hidden ${className}`}>
      <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-48" />
      <div className="p-4 space-y-3">
        <SkeletonLine className="h-4 w-3/4" />
        <SkeletonLine className="h-3 w-1/2" />
        <SkeletonLine className="h-3 w-full" />
      </div>
    </div>
  );
}

export function PostSkeleton() {
  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <SkeletonCircle className="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <SkeletonLine className="h-3 w-1/3" />
          <SkeletonLine className="h-2.5 w-1/5" />
        </div>
      </div>
      <div className="px-4 pb-3 space-y-2">
        <SkeletonLine className="h-3 w-full" />
        <SkeletonLine className="h-3 w-5/6" />
        <SkeletonLine className="h-3 w-2/3" />
      </div>
      <div className="px-4 pb-3">
        <div className="grid grid-cols-2 gap-0.5 rounded-xl overflow-hidden">
          <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-48" />
          <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-48" />
        </div>
      </div>
      <div className="flex items-center border-t border-border">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 flex items-center justify-center py-3">
            <SkeletonLine className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function VideoCardSkeleton() {
  return (
    <div className="shrink-0 w-56 lg:w-64 rounded-xl overflow-hidden border border-border">
      <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light aspect-video" />
      <div className="p-3 space-y-2 bg-surface">
        <SkeletonLine className="h-3 w-3/4" />
        <SkeletonLine className="h-2.5 w-1/2" />
      </div>
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-48" />
      <div className="p-5 space-y-3">
        <SkeletonLine className="h-4 w-2/3" />
        <SkeletonLine className="h-3 w-1/2" />
        <div className="flex gap-4">
          <SkeletonLine className="h-3 w-24" />
          <SkeletonLine className="h-3 w-20" />
        </div>
        <SkeletonLine className="h-8 w-full" />
      </div>
    </div>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-56" />
      <div className="p-5 space-y-3">
        <SkeletonLine className="h-5 w-3/4" />
        <SkeletonLine className="h-3 w-full" />
        <SkeletonLine className="h-3 w-5/6" />
        <SkeletonLine className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[180px] sm:auto-rows-[220px]">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className={`rounded-2xl overflow-hidden bg-surface border border-border ${
            i % 7 === 0 ? "row-span-2 col-span-2" : ""
          }`}
        >
          <div className="w-full h-full animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-12 border-b border-border" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-border-light">
          {Array.from({ length: cols }).map((_, j) => (
            <SkeletonLine key={j} className="h-3 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 bg-surface rounded-xl border border-border">
          <SkeletonCircle className="w-10 h-10" />
          <div className="space-y-1.5">
            <SkeletonLine className="h-5 w-8" />
            <SkeletonLine className="h-2.5 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative bg-gradient-to-br from-primary via-primary-light to-primary-dark py-24">
      <div className="container mx-auto px-4 text-center">
        <SkeletonLine className="h-8 w-64 mx-auto bg-white/20 mb-3" />
        <SkeletonLine className="h-4 w-96 mx-auto bg-white/10" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 8, cols = 4 }: { count?: number; cols?: number }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-${cols} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light aspect-square" />
          <div className="p-4 space-y-2">
            <SkeletonLine className="h-4 w-3/4" />
            <SkeletonLine className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
