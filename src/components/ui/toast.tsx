import { toast as sonnerToast } from "sonner"
import { type ReactNode } from "react"

export function toast(message: string, options?: { description?: string; action?: { label: string; onClick: () => void } }) {
  return sonnerToast(message, options)
}

toast.success = (message: string, options?: Parameters<typeof sonnerToast.success>[1]) => sonnerToast.success(message, options)
toast.error = (message: string, options?: Parameters<typeof sonnerToast.error>[1]) => sonnerToast.error(message, options)
toast.info = (message: string, options?: Parameters<typeof sonnerToast.info>[1]) => sonnerToast.info(message, options)
toast.warning = (message: string, options?: Parameters<typeof sonnerToast.warning>[1]) => sonnerToast.warning(message, options)
toast.promise = <T,>(
  promise: Promise<T> | (() => Promise<T>),
  messages: { loading: string; success: string | ((data: T) => string); error: string | ((error: Error) => string) }
) => sonnerToast.promise(promise, messages)

export function Toaster() {
  return null
}

export { sonnerToast }
