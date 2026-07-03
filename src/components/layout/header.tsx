"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, Globe, Search, ChevronDown, User, LogOut, ChevronUp, CreditCard, LogIn, Sun, Moon } from "lucide-react";
import SearchOverlay from "./search-overlay";

interface NavChild {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

function getNavItems(lang: string): NavItem[] {
  const isArabic = lang === "ar";

  return [
    { label: isArabic ? "الرئيسية" : "Home", href: "/" },
    {
      label: isArabic ? "الرابطة" : "About",
      href: "/about",
    },
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
        { label: isArabic ? "الأخبار" : "News", href: "/news" },
        { label: isArabic ? "الأحداث" : "Events", href: "/events" },
        { label: isArabic ? "المعرض" : "Gallery", href: "/media/gallery" },
        { label: isArabic ? "الفيديوهات" : "Videos", href: "/media/videos" },
        { label: isArabic ? "المنشورات" : "Publications", href: "/media/publications" },
        { label: isArabic ? "التقارير" : "Reports", href: "/media/reports" },
        { label: isArabic ? "المنشورات التفاعلية" : "Interactive Posts", href: "/media/posts" },
      ],
    },
    {
      label: isArabic ? "العضوية" : "Membership",
      href: "/membership",
      children: [
        { label: isArabic ? "طلب عضوية" : "Apply", href: "/membership/apply" },
        { label: isArabic ? "مزايا العضوية" : "Benefits", href: "/membership/benefits" },
        { label: isArabic ? "إدارة العضوية" : "Manage", href: "/membership/manage" },
      ],
    },
    {
      label: isArabic ? "الخدمات" : "Services",
      href: "/services",
      children: [
        { label: isArabic ? "الخدمات" : "Services", href: "/services" },
        { label: isArabic ? "التطوع" : "Volunteer", href: "/volunteer" },
        { label: isArabic ? "التبرعات" : "Donations", href: "/donations" },
      ],
    },
    { label: isArabic ? "اتصل بنا" : "Contact", href: "/contact" },
  ];
}

interface HeaderProps {
  lang?: string;
}

export default function Header({ lang }: HeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const currentLang = lang || (pathname.startsWith("/ar") ? "ar" : "en");
  let navItems = getNavItems(currentLang);
  const isLoggedIn = !!session?.user;
  navItems = navItems.map((item) => {
    // Membership: show/hide children based on login status
    if (item.href === "/membership" && item.children) {
      return {
        ...item,
        children: item.children.filter((child) => {
          if (child.href === "/membership/apply") return !isLoggedIn;
          if (child.href === "/membership/manage") return isLoggedIn;
          return true;
        }),
      };
    }
    // Media: hide interactive posts when not logged in
    if (item.href === "/media" && item.children && !isLoggedIn) {
      return {
        ...item,
        children: item.children.filter((child) => child.href !== "/media/posts"),
      };
    }
    return item;
  });
  const isArabic = currentLang === "ar";

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLanguage = useCallback(() => {
    const newLang = currentLang === "ar" ? "en" : "ar";
    const segments = pathname.split("/");
    segments[1] = newLang;
    window.location.href = segments.join("/");
  }, [currentLang, pathname]);

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setActiveDropdown(label);
  };

  const handleDropdownLeave = () => {
    dropdownTimerRef.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-primary shadow-lg" : "bg-primary/95 backdrop-blur-sm"
      }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href={`/${currentLang}`} className="flex items-center gap-3 shrink-0">
            <img
              src="/uploads/شعار الرابطة.jpg"
              alt="AIUAG Logo"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-white/30"
            />
            <div className="hidden sm:block text-white">
              <div className="text-lg font-bold leading-tight">AIUAG</div>
              <div className="text-[10px] leading-tight opacity-80">
                {isArabic
                  ? "رابطة خريجي جامعة أفريقيا العالمية"
                  : "Association of IUA Graduates"}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
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
                    pathname === `/${currentLang}${item.href}` ||
                    pathname.startsWith(`/${currentLang}${item.href}/`)
                      ? "bg-white/15 text-white"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {item.label}
                  {item.children && <ChevronDown className="w-3.5 h-3.5" />}
                </Link>

                {item.children && activeDropdown === item.label && (
                  <div className="absolute top-full start-0 mt-0 pt-2 w-56 bg-white rounded-xl shadow-xl border border-border py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={`/${currentLang}${child.href}`}
                        className={`block px-4 py-2.5 text-sm transition-colors ${
                          pathname === `/${currentLang}${child.href}`
                            ? "bg-primary/5 text-primary font-medium"
                            : "text-text-secondary hover:bg-gray-50 hover:text-primary"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            {searchOpen && <SearchOverlay lang={currentLang} onClose={() => setSearchOpen(false)} />}

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title={theme === "light" ? "الوضع الليلي" : "الوضع النهاري"}
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
            >
              <Globe className="w-4 h-4" />
              {isArabic ? "EN" : "عربي"}
            </button>

            {!session?.user && (
              <Link
                href={`/${currentLang}/membership/apply`}
                className="hidden md:inline-flex items-center px-5 py-2.5 bg-secondary text-white rounded-lg text-sm font-bold hover:bg-secondary/90 transition-colors"
              >
                {isArabic ? "كن عضواً" : "Become a Member"}
              </Link>
            )}

            {session?.user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 border border-white/30 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || ""}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <span className="hidden md:inline max-w-[100px] truncate">{session.user.name}</span>
                  {userMenuOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {userMenuOpen && (
                  <div className="absolute top-full start-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-border py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="font-bold text-text text-sm truncate">{session.user.name}</p>
                      <p className="text-text-light text-xs truncate">{session.user.email}</p>
                    </div>
                    <Link
                      href={`/${currentLang}/profile`}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-gray-50 hover:text-primary transition-colors"
                    >
                      <User className="w-4 h-4" />
                      {isArabic ? "الملف الشخصي" : "Profile"}
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: `/${currentLang}` })}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {isArabic ? "تسجيل الخروج" : "Logout"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 text-white border border-white/30 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                {isArabic ? "تسجيل الدخول" : "Sign In"}
              </Link>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-primary border-t border-white/10">
          <div className="container mx-auto px-4 py-4 max-h-[60vh] overflow-y-auto" style={{ scrollBehavior: "auto" }}>
            {navItems.map((item) => (
              <div key={item.label} className="mb-1">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/${currentLang}${item.href === "/" ? "" : item.href}`}
                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      pathname === `/${currentLang}${item.href}`
                        ? "bg-white/15 text-white"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <button
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === item.label ? null : item.label
                        )
                      }
                      className="p-2 text-white/60 hover:text-white"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          activeDropdown === item.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>
                {item.children && activeDropdown === item.label && (
                  <div className="ps-4 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={`/${currentLang}${child.href}`}
                        className={`block px-4 py-2.5 rounded-lg text-sm transition-colors ${
                          pathname === `/${currentLang}${child.href}`
                            ? "bg-white/10 text-white font-medium"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                onClick={toggleLanguage}
                className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors mb-3"
              >
                <Globe className="w-4 h-4" />
                {isArabic ? "Switch to English" : "التبديل إلى العربية"}
              </button>

              {!session?.user && (
                <Link
                  href={`/${currentLang}/membership/apply`}
                  className="block w-full text-center px-5 py-3 bg-secondary text-white rounded-lg text-sm font-bold hover:bg-secondary/90 transition-colors"
                >
                  {isArabic ? "كن عضواً" : "Become a Member"}
                </Link>
              )}

              {session?.user ? (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-3 px-5 py-3 bg-white/10 rounded-lg">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      {session.user.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user.name || ""}
                          className="w-10 h-10 rounded-full object-cover"
                        />
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
                    href={`/${currentLang}/profile`}
                    className="flex items-center gap-3 w-full px-5 py-3 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    {isArabic ? "الملف الشخصي" : "Profile"}
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: `/${currentLang}` })}
                    className="flex items-center justify-center gap-3 w-full px-5 py-3 bg-red-500/20 text-red-300 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {isArabic ? "تسجيل الخروج" : "Logout"}
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="mt-3 flex items-center justify-center gap-2 w-full px-5 py-3 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  {isArabic ? "تسجيل الدخول" : "Sign In"}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
