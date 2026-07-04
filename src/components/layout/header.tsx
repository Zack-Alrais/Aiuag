"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Globe, Search, ChevronDown, User, LogOut, ChevronUp, LogIn, Sun, Moon, ChevronLeft, ChevronRight } from "lucide-react"
import SearchOverlay from "./search-overlay"
import MobileMenu from "./mobile-menu"
import { ASSETS } from "@/lib/assets"
import { useTheme } from "@/components/theme/theme-provider"

interface NavChild {
  label: string
  href: string
  authRequired?: boolean
}

interface NavItem {
  label: string
  href: string
  children?: NavChild[]
}

function getNavItems(lang: string): NavItem[] {
  const isArabic = lang === "ar"
  return [
    { label: isArabic ? "الرئيسية" : "Home", href: "/" },
    { label: isArabic ? "الرابطة" : "About", href: "/about" },
    {
      label: isArabic ? "الهيكل التنظيمي" : "Organization",
      href: "/organization",
      children: [
        { label: isArabic ? "مجلس الإدارة" : "Board of Directors", href: "/organization/board" },
        { label: isArabic ? "الأمانة العامة" : "Secretariat", href: "/organization/secretariat" },
        { label: isArabic ? "اللجان" : "Committees", href: "/organization/committees" },
        { label: isArabic ? "الفروع" : "Branches", href: "/organization/branches" },
      ],
    },
    { label: isArabic ? "المشاريع" : "Projects", href: "/projects" },
    {
      label: isArabic ? "المركز الإعلامي" : "Media",
      href: "/media",
      children: [
        { label: isArabic ? "الأخبار والأحداث" : "News & Events", href: "/news" },
        { label: isArabic ? "المعرض والفيديوهات" : "Gallery & Videos", href: "/media/gallery" },
        { label: isArabic ? "المنشورات والتفاعل" : "Posts & Publications", href: "/media/publications" },
        { label: isArabic ? "التقارير" : "Reports", href: "/media/reports" },
      ],
    },
    {
      label: isArabic ? "العضوية" : "Membership",
      href: "/membership",
      children: [
        { label: isArabic ? "طلب عضوية" : "Apply", href: "/membership/apply" },
        { label: isArabic ? "مزايا العضوية" : "Benefits", href: "/membership/benefits" },
        { label: isArabic ? "بطاقتي" : "My Card", href: "/cards", authRequired: true },
        { label: isArabic ? "إدارة العضوية" : "Manage", href: "/membership/manage" },
      ],
    },
    {
      label: isArabic ? "الخدمات" : "Services",
      href: "/services",
      children: [
        { label: isArabic ? "التطوع" : "Volunteer", href: "/volunteer" },
        { label: isArabic ? "التبرعات" : "Donations", href: "/donations" },
      ],
    },
    { label: isArabic ? "اتصل بنا" : "Contact", href: "/contact" },
  ]
}

interface HeaderProps {
  lang?: string
}

export default function Header({ lang }: HeaderProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const dropdownTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { theme, toggleTheme } = useTheme()
  const [profileData, setProfileData] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  const currentLang = lang || (pathname.startsWith("/ar") ? "ar" : "en")
  let navItems = getNavItems(currentLang)
  const isLoggedIn = !!session?.user
  navItems = navItems.map((item) => {
    if (item.href === "/membership" && item.children) {
      return {
        ...item,
        children: item.children.filter((child) => {
          if (child.href === "/membership/apply") return !isLoggedIn
          if ((child as any).authRequired) return isLoggedIn
          return true
        }),
      }
    }
    return item
  })
  const isArabic = currentLang === "ar"

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
    setActiveDropdown(null)
    setUserMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (userMenuOpen && !profileData && !profileLoading) {
      setProfileLoading(true)
      fetch("/api/profile").then((r) => r.json()).then((d) => {
        if (d && !d.error) setProfileData(d)
      }).catch(() => {}).finally(() => setProfileLoading(false))
    }
  }, [userMenuOpen, profileData, profileLoading])

  const toggleLanguage = useCallback(() => {
    const newLang = currentLang === "ar" ? "en" : "ar"
    const segments = pathname.split("/")
    segments[1] = newLang
    window.location.href = segments.join("/")
  }, [currentLang, pathname])

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current)
    setActiveDropdown(label)
  }

  const handleDropdownLeave = () => {
    dropdownTimerRef.current = setTimeout(() => setActiveDropdown(null), 150)
  }

  const dropdownVariants = {
    hidden: { opacity: 0, y: -4, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.15, ease: "easeOut" } },
  }

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-dark-surface/90 backdrop-blur-xl shadow-soft"
          : "bg-primary/95 backdrop-blur-sm"
      }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4">
        <motion.div
          animate={{ height: scrolled ? 64 : 80 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-between"
        >
          <Link href={`/${currentLang}`} className="flex items-center gap-3 shrink-0">
            <img
              src={ASSETS.logo}
              alt="AIUAG Logo"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-white/30"
            />
            <motion.div
              animate={{ opacity: scrolled ? 0 : 1, width: scrolled ? 0 : "auto" }}
              transition={{ duration: 0.2 }}
              className="hidden sm:block overflow-hidden text-white"
            >
              <div className="text-lg font-bold leading-tight">AIUAG</div>
              <div className="text-[10px] leading-tight opacity-80">
                {isArabic
                  ? "رابطة خريجي جامعة أفريقيا العالمية"
                  : "Association of IUA Graduates"}
              </div>
            </motion.div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && handleDropdownEnter(item.label)}
                onMouseLeave={handleDropdownLeave}
              >
                <Link
                  href={`/${currentLang}${item.href === "/" ? "" : item.href}`}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    scrolled ? "text-text hover:bg-gray-100 dark:text-white dark:hover:bg-dark-card" : "text-white/80 hover:text-white hover:bg-white/10"
                  } ${
                    pathname === `/${currentLang}${item.href}` || pathname.startsWith(`/${currentLang}${item.href}/`)
                      ? scrolled ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light" : "bg-white/15 text-white"
                      : ""
                  }`}
                >
                  {item.label}
                  {item.children && <ChevronDown className="w-3.5 h-3.5" />}
                </Link>

                <AnimatePresence>
                  {item.children && activeDropdown === item.label && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={dropdownVariants}
                      className={`absolute top-full start-0 mt-0 pt-2 w-56 ${
                        scrolled ? "" : "pt-2"
                      }`}
                    >
                      <div className={`rounded-xl shadow-xl border py-2 ${
                        scrolled
                          ? "bg-white dark:bg-dark-surface dark:border-dark-border"
                          : "bg-white border-border"
                      }`}>
                        {item.children.map((child, i) => (
                          <motion.div
                            key={child.href}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                          >
                            <Link
                              href={`/${currentLang}${child.href}`}
                              className={`block px-4 py-2.5 text-sm transition-colors ${
                                pathname === `/${currentLang}${child.href}`
                                  ? "bg-primary/5 text-primary font-medium dark:text-primary-light"
                                  : "text-text-secondary hover:bg-gray-50 hover:text-primary dark:text-gray-300 dark:hover:bg-dark-card dark:hover:text-white"
                              }`}
                            >
                              {child.label}
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className={`p-2.5 rounded-lg transition-colors ${
                scrolled ? "text-text hover:bg-gray-100 dark:text-white dark:hover:bg-dark-card" : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            {searchOpen && <SearchOverlay lang={currentLang} onClose={() => setSearchOpen(false)} />}

            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-lg transition-colors ${
                scrolled ? "text-text hover:bg-gray-100 dark:text-white dark:hover:bg-dark-card" : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
              title={theme === "light" ? "الوضع الليلي" : "الوضع النهاري"}
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleLanguage}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                scrolled ? "text-text hover:bg-gray-100 dark:text-white dark:hover:bg-dark-card" : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Globe className="w-4 h-4" />
              {isArabic ? "EN" : "عربي"}
            </button>

            {!session?.user && (
              <Link
                href={`/${currentLang}/membership/apply`}
                className="hidden md:inline-flex items-center px-5 py-2.5 bg-secondary text-primary-dark rounded-lg text-sm font-bold hover:bg-secondary-light transition-colors"
              >
                {isArabic ? "كن عضواً" : "Become a Member"}
              </Link>
            )}

            {session?.user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    scrolled
                      ? "text-text border border-gray-200 hover:bg-gray-100 dark:text-white dark:border-dark-border dark:hover:bg-dark-card"
                      : "text-white border border-white/30 hover:bg-white/10"
                  }`}
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                    {session.user.image ? (
                      <img src={session.user.image} alt={session.user.name || ""} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                        <span className="text-white font-bold text-xs">{session.user.name?.charAt(0) || "U"}</span>
                      </div>
                    )}
                  </div>
                  <span className="hidden md:inline max-w-[100px] truncate">{session.user.name}</span>
                  {userMenuOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-full start-0 mt-2 w-64 bg-white dark:bg-dark-surface dark:border dark:border-dark-border rounded-xl shadow-xl border border-border z-50 overflow-hidden"
                    >
                      <div className="bg-gradient-to-br from-primary to-primary-dark p-5 text-white">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/30 shrink-0">
                            {session.user.image ? (
                              <img src={session.user.image} alt={session.user.name || ""} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-white/20 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">{session.user.name?.charAt(0) || "U"}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{session.user.name}</p>
                            {profileData?.nameEn && <p className="text-white/70 text-xs truncate">{profileData.nameEn}</p>}
                            <p className="text-white/60 text-[10px] truncate mt-0.5">{session.user.email}</p>
                            {profileData?.memberSince && (
                              <p className="text-white/50 text-[10px] mt-1">
                                {isArabic ? "عضو منذ " : "Member since "}{profileData.memberSince}
                              </p>
                            )}
                          </div>
                        </div>
                        {profileData?.membershipNumber && (
                          <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
                            <span className="text-white/70">{isArabic ? "رقم العضوية" : "ID"}</span>
                            <span className="font-bold text-white/90">{profileData.membershipNumber}</span>
                          </div>
                        )}
                      </div>
                      <Link
                        href={`/${currentLang}/profile`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-card hover:text-primary transition-colors border-b border-border dark:border-dark-border"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        {isArabic ? "الملف الشخصي" : "Profile"}
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: `/${currentLang}` })}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        {isArabic ? "تسجيل الخروج" : "Logout"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className={`hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  scrolled
                    ? "text-primary border border-primary hover:bg-primary hover:text-white dark:text-primary-light dark:border-primary-light"
                    : "text-white border border-white/30 hover:bg-white/20"
                }`}
              >
                <LogIn className="w-4 h-4" />
                {isArabic ? "تسجيل الدخول" : "Sign In"}
              </Link>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`lg:hidden p-2.5 rounded-lg transition-colors ${
                scrolled ? "text-text hover:bg-gray-100 dark:text-white dark:hover:bg-dark-card" : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <MobileMenu
            lang={currentLang}
            navItems={navItems}
            pathname={pathname}
            session={session}
            onClose={() => setIsOpen(false)}
            isArabic={isArabic}
            toggleLanguage={toggleLanguage}
          />
        )}
      </AnimatePresence>
    </motion.header>
  )
}
