"use client"

import { usePathname } from "next/navigation"
import { AnimatePresence } from "framer-motion"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import PageTransition from "@/components/ui/page-transition"
import TopProgress from "@/components/ui/top-progress"

export default function LayoutShell({ lang, children }: { lang: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isCleanPage = pathname.includes("/verify") || pathname.includes("/graduate/claim")

  return (
    <>
      {!isCleanPage && <Header lang={lang} />}
      <TopProgress />
      <main className={isCleanPage ? "" : "min-h-screen pt-20"}>
        <AnimatePresence mode="wait">
          <PageTransition key={pathname}>
            {children}
          </PageTransition>
        </AnimatePresence>
      </main>
      {!isCleanPage && <Footer lang={lang} />}
    </>
  )
}
