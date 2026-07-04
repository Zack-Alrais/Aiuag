import ErrorBoundary from "@/components/admin/ErrorBoundary"
import AdminLayoutClient from "./AdminLayoutClient"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </ErrorBoundary>
  )
}
