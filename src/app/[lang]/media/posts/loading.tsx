export default function MediaPostsLoading() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0a0f1a]">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="h-8 w-32 bg-gray-200 dark:bg-[#1e2d42] rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-48 bg-gray-200 dark:bg-[#1e2d42] rounded animate-pulse" />
          </div>
        </div>

        {/* Create post skeleton */}
        <div className="bg-white dark:bg-[#111927] rounded-2xl p-4 space-y-3 animate-pulse">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-[#1e2d42] rounded-full" />
            <div className="flex-1 h-12 bg-gray-200 dark:bg-[#1e2d42] rounded-2xl" />
          </div>
        </div>

        {/* Post skeletons */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-[#111927] rounded-2xl p-4 space-y-3 animate-pulse">
            <div className="flex gap-3">
              <div className="w-11 h-11 bg-gray-200 dark:bg-[#1e2d42] rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-[#1e2d42] rounded w-1/3" />
                <div className="h-3 bg-gray-200 dark:bg-[#1e2d42] rounded w-1/4" />
              </div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-[#1e2d42] rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-[#1e2d42] rounded w-2/3" />
            <div className="h-48 bg-gray-200 dark:bg-[#1e2d42] rounded-xl" />
            <div className="flex gap-4 pt-2">
              <div className="h-8 bg-gray-200 dark:bg-[#1e2d42] rounded-xl flex-1" />
              <div className="h-8 bg-gray-200 dark:bg-[#1e2d42] rounded-xl flex-1" />
              <div className="h-8 bg-gray-200 dark:bg-[#1e2d42] rounded-xl flex-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
