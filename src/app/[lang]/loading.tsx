export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark">
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-secondary dark:text-gray-400 text-sm">جاري التحميل...</p>
      </div>
    </div>
  )
}
