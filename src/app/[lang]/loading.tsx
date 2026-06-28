export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="mt-6 text-xl font-semibold text-gray-700">جاري التحميل...</p>
        <p className="mt-2 text-sm text-gray-500">يرجى الانتظار</p>
      </div>
    </div>
  );
}
