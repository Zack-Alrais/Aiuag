"use client"

import { usePathname } from "next/navigation"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export default function LayoutShell({ lang, children }: { lang: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isCleanPage = pathname.includes("/verify") || pathname.includes("/graduate/claim")

  return (
    <>
      {!isCleanPage && <Header lang={lang} />}
      <main className={isCleanPage ? "" : "min-h-screen pt-20"}>
        {children}
      </main>
      {!isCleanPage && <Footer lang={lang} />}
    </>
  )
}
