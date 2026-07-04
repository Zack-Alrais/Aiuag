"use client"

import { Toaster } from "sonner"

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-left"
      richColors
      closeButton
      dir="rtl"
      toastOptions={{
        className: "dark:bg-dark-surface dark:text-white dark:border-dark-border",
      }}
    />
  )
}
