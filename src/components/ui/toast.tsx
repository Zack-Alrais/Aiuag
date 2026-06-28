"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
})

export function useToast() {
  return React.useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2)
    const duration = toast.duration ?? 5000
    setToasts((prev) => [...prev, { ...toast, id }])
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

const typeStyles: Record<ToastType, { container: string; icon: string }> = {
  success: {
    container: "bg-[#2E7D32]/10 border-[#2E7D32]/30 text-[#2E7D32]",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  error: {
    container: "bg-red-50 border-red-200 text-red-800",
    icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  warning: {
    container: "bg-amber-50 border-amber-200 text-amber-800",
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  },
  info: {
    container: "bg-[#1A3A6B]/5 border-[#1A3A6B]/20 text-[#1A3A6B]",
    icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[]
  removeToast: (id: string) => void
}) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none" dir="ltr">
      {toasts.map((toast) => {
        const styles = typeStyles[toast.type]
        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto rounded-lg border p-4 shadow-lg backdrop-blur-sm animate-in slide-in-from-right-full fade-in duration-300",
              styles.container
            )}
            role="alert"
          >
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={styles.icon} />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description && (
                  <p className="mt-1 text-sm opacity-90">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Dismiss"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function toast(type: ToastType, title: string, description?: string) {
  const event = new CustomEvent("toast", { detail: { type, title, description } })
  window.dispatchEvent(event)
}

export function ToastListener() {
  const { addToast } = useToast()

  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      addToast(detail)
    }
    window.addEventListener("toast", handler)
    return () => window.removeEventListener("toast", handler)
  }, [addToast])

  return null
}
