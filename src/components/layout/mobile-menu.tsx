"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Globe, LogIn, LogOut, User, ChevronDown } from "lucide-react"
import { useState, type ReactNode } from "react"
import { signOut } from "next-auth/react"

interface NavChild {
  label: string
  href: string
}

interface NavItem {
  label: string
  href: string
  children?: NavChild[]
}

interface MobileMenuProps {
  lang: string
  navItems: NavItem[]
  pathname: string
  session: { user?: { name?: string | null; email?: string | null; image?: string | null } } | null
  onClose: () => void
  isArabic: boolean
  toggleLanguage: () => void
}

export default function MobileMenu({ lang, navItems, pathname, session, onClose, isArabic, toggleLanguage }: MobileMenuProps) {
  const [openSections, setOpenSections] = useState<string[]>([])

  const toggleSection = (label: string) => {
    setOpenSections((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="lg:hidden bg-primary/98 dark:bg-dark-surface/98 backdrop-blur-lg border-t border-white/10 dark:border-dark-border overflow-hidden"
    >
      <div className="container mx-auto px-4 py-4 max-h-[70vh] overflow-y-auto no-scrollbar">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === `/${lang}${item.href}` || pathname.startsWith(`/${lang}${item.href}/`)
            const isOpen = openSections.includes(item.label)

            return (
              <motion.div key={item.label} variants={itemVariants}>
                <div className="flex items-center justify-between">
                  <Link
                    href={`/${lang}${item.href === "/" ? "" : item.href}`}
                    onClick={() => { if (!item.children) onClose() }}
                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? "bg-white/15 text-white" : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <button
                      onClick={() => toggleSection(item.label)}
                      className="p-2 text-white/60 hover:text-white"
                    >
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </button>
                  )}
                </div>
                <motion.div
                  initial={false}
                  animate={{
                    height: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="ps-4 mt-1 space-y-1 pb-2">
                    {item.children?.map((child) => {
                      const isChildActive = pathname === `/${lang}${child.href}`
                      return (
                        <Link
                          key={child.href}
                          href={`/${lang}${child.href}`}
                          onClick={onClose}
                          className={`block px-4 py-2.5 rounded-lg text-sm transition-colors ${
                            isChildActive
                              ? "bg-white/10 text-white font-medium"
                              : "text-white/60 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {child.label}
                        </Link>
                      )
                    })}
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </motion.div>

        <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={toggleLanguage}
            className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
          >
            <Globe className="w-4 h-4" />
            {isArabic ? "Switch to English" : "التبديل إلى العربية"}
          </motion.button>

          {!session?.user && (
            <Link
              href={`/${lang}/membership/apply`}
              onClick={onClose}
              className="block w-full text-center px-5 py-3 bg-secondary text-primary-dark rounded-lg text-sm font-bold hover:bg-secondary-light transition-colors"
            >
              {isArabic ? "كن عضواً" : "Become a Member"}
            </Link>
          )}

          {session?.user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-5 py-3 bg-white/10 rounded-lg">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  {session.user.image ? (
                    <img src={session.user.image} alt={session.user.name || ""} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{session.user.name}</p>
                  <p className="text-white/60 text-xs">{session.user.email}</p>
                </div>
              </div>
              <Link
                href={`/${lang}/profile`}
                onClick={onClose}
                className="flex items-center gap-3 w-full px-5 py-3 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
              >
                <User className="w-4 h-4" />
                {isArabic ? "الملف الشخصي" : "Profile"}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: `/${lang}` })}
                className="flex items-center justify-center gap-3 w-full px-5 py-3 bg-red-500/20 text-red-300 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {isArabic ? "تسجيل الخروج" : "Logout"}
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              {isArabic ? "تسجيل الدخول" : "Sign In"}
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}
