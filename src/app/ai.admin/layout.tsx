"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { ThemeProvider, useTheme } from "@/components/admin/theme-provider"
import {
  LayoutDashboard,
  Newspaper,
  CalendarDays,
  Users,
  FolderOpen,
  Image,
  Building2,
  Handshake,
  HelpCircle,
  MessageSquare,
  Coins,
  Settings,
  Database,
  Shield,
  GraduationCap,
  Activity,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Check,
  Trash2,
  Eye,
  CreditCard,
  Sun,
  Moon,
  Globe,
  Play,
  FileText,
  BarChart2,
  MapPin,
  UserCheck,
  ChevronDown,
  MessageCircle,
  FileEdit,
} from "lucide-react"

interface Notification {
  id: string
  titleAr: string
  titleEn: string
  messageAr: string
  messageEn: string
  type: string
  entityType: string | null
  entityId: string | null
  isRead: boolean
  createdAt: string
}

const navGroups = [
  {
    title: "الرئيسية",
    items: [
      { name: "Dashboard", nameAr: "الرئيسية", href: "/ai.admin", icon: LayoutDashboard, perm: "dashboard" },
      { name: "Notifications", nameAr: "الإشعارات", href: "/ai.admin/notifications", icon: Bell, perm: "notifications" },
    ],
  },
  {
    title: "المحتوى",
    items: [
      { name: "News", nameAr: "الأخبار", href: "/ai.admin/news", icon: Newspaper, perm: "news" },
      { name: "Events", nameAr: "الأحداث", href: "/ai.admin/events", icon: CalendarDays, perm: "events" },
      { name: "Posts", nameAr: "منشورات تفاعلية", href: "/ai.admin/posts", icon: FileEdit, perm: "posts" },
      { name: "Comments", nameAr: "التعليقات", href: "/ai.admin/comments", icon: MessageCircle, perm: "comments" },
      { name: "Videos", nameAr: "الفيديوهات", href: "/ai.admin/videos", icon: Play, perm: "videos" },
      { name: "Gallery", nameAr: "المعرض", href: "/ai.admin/gallery", icon: Image, perm: "gallery" },
    ],
  },
  {
    title: "المؤسسة",
    items: [
      { name: "Members", nameAr: "الأعضاء", href: "/ai.admin/members", icon: Users, perm: "members" },
      { name: "Cards", nameAr: "البطاقات", href: "/ai.admin/cards", icon: CreditCard, perm: "cards" },
      { name: "Board", nameAr: "مجلس الإدارة", href: "/ai.admin/board", icon: Building2, perm: "board" },
      { name: "Committees", nameAr: "اللجان", href: "/ai.admin/committees", icon: Building2, perm: "committees" },
      { name: "Secretariat", nameAr: "الأمانة العامة", href: "/ai.admin/secretariat", icon: UserCheck, perm: "secretariat" },
    ],
  },
  {
    title: "المزيد",
    items: [
      { name: "Projects", nameAr: "المشاريع", href: "/ai.admin/projects", icon: FolderOpen, perm: "projects" },
      { name: "Publications", nameAr: "المنشورات", href: "/ai.admin/publications", icon: FileText, perm: "publications" },
      { name: "Branches", nameAr: "الفروع", href: "/ai.admin/branches", icon: MapPin, perm: "branches" },
      { name: "Partners", nameAr: "الشركاء", href: "/ai.admin/partners", icon: Handshake, perm: "partners" },
      { name: "Contacts", nameAr: "رسائل الاتصال", href: "/ai.admin/contacts", icon: MessageSquare, perm: "contacts" },
      { name: "Donations", nameAr: "التبرعات", href: "/ai.admin/donations", icon: Coins, perm: "donations" },
    ],
  },
  {
    title: "النظام",
    items: [
      { name: "Settings", nameAr: "الإعدادات", href: "/ai.admin/settings", icon: Settings, perm: "settings" },
      { name: "Page Contents", nameAr: "نصوص الصفحات", href: "/ai.admin/page-contents", icon: FileEdit, perm: "settings" },
      { name: "Backup", nameAr: "النسخ الاحتياطي", href: "/ai.admin/backup", icon: Database, perm: "backup" },
      { name: "Graduates", nameAr: "الخريجين", href: "/ai.admin/graduates", icon: GraduationCap, perm: "settings" },
      { name: "Activity", nameAr: "تتبع النشاط", href: "/ai.admin/activity", icon: Activity, perm: "settings" },
      { name: "Permissions", nameAr: "الصلاحيات", href: "/ai.admin/permissions", icon: Shield, perm: "settings" },
    ],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </ThemeProvider>
  )
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})
  const [notifOpen, setNotifOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [lang, setLang] = useState<"ar" | "en">("ar")
  const [userPerms, setUserPerms] = useState<string[]>([])
  const [userRole, setUserRole] = useState<string>("")
  const [userEmail, setUserEmail] = useState<string>("")
  const [userName, setUserName] = useState<string>("")
  const [userImage, setUserImage] = useState<string | null>(null)
  const [userNameEn, setUserNameEn] = useState<string>("")
  const [userMemberSince, setUserMemberSince] = useState<string>("")
  const [userMembershipNumber, setUserMembershipNumber] = useState<string>("")
  const [permsLoaded, setPermsLoaded] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const isLoginPage = pathname === "/ai.admin/login"

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications?limit=20")
      const data = await res.json()
      setNotifications(data.data || [])
      setUnreadCount(data.unreadCount || 0)
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    fetchNotifications()

    // Real-time SSE for notifications
    const eventSource = new EventSource("/api/admin/notifications/stream")
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.notifications) {
          setNotifications((prev) => {
            const newIds = new Set(data.notifications.map((n: any) => n.id))
            const existing = prev.filter((n) => !newIds.has(n.id))
            return [...data.notifications, ...existing].slice(0, 20)
          })
          setUnreadCount(data.unreadCount)
        }
      } catch {}
    }
    eventSource.onerror = () => {}

    return () => { eventSource.close() }
  }, [fetchNotifications])

  useEffect(() => {
    if (isLoginPage) {
      setPermsLoaded(true)
      return
    }
    fetch("/api/admin/auth/me").then((r) => r.json()).then((d) => {
      if (d.permissions) setUserPerms(d.permissions)
      if (d.role) setUserRole(d.role)
      if (d.email) {
        setUserEmail(d.email)
        ;(window as any).__adminEmail = d.email.toLowerCase()
      }
      if (d.name) setUserName(d.name)
      if (d.image) setUserImage(d.image)
      if (d.nameEn) setUserNameEn(d.nameEn)
      if (d.memberSince) setUserMemberSince(d.memberSince)
      if (d.membershipNumber) setUserMembershipNumber(d.membershipNumber)
    }).catch(() => {}).finally(() => setPermsLoaded(true))
  }, [isLoginPage])

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/admin/notifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      })
      fetchNotifications()
    } catch {}
  }

  const markAllAsRead = async () => {
    try {
      await fetch("/api/admin/notifications/read-all", { method: "PUT" })
      fetchNotifications()
    } catch {}
  }

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/admin/notifications/${id}`, { method: "DELETE" })
      fetchNotifications()
    } catch {}
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success": return "bg-emerald-100 text-emerald-600"
      case "warning": return "bg-amber-100 text-amber-600"
      case "error": return "bg-red-100 text-red-600"
      default: return "bg-blue-100 text-blue-600"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success": return "✓"
      case "warning": return "⚠"
      case "error": return "✕"
      default: return "ℹ"
    }
  }

  const sidebar = (
    <aside className={`bg-[#0f2547] dark:bg-[#0d1a2d] text-white transition-all duration-300 flex flex-col h-screen sticky top-0 ${sidebarOpen ? "w-64" : "w-20"}`}>
      {/* Logo */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        {sidebarOpen && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden">
              <img src="/uploads/شعار الرابطة.jpg" alt="AIUAG" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">AIUAG</span>
              <span className="text-xs text-white/50 block">لوحة التحكم</span>
            </div>
          </div>
        )}
        {!sidebarOpen && (
          <div className="w-10 h-10 rounded-xl overflow-hidden mx-auto">
            <img src="/uploads/شعار الرابطة.jpg" alt="AIUAG" className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg hidden lg:block transition-colors">
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
        {!permsLoaded ? (
          <div className="px-6 py-4">
            <div className="animate-pulse space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-8 bg-white/10 rounded-lg" />
              ))}
            </div>
          </div>
        ) : navGroups.map((group) => {
          const filteredItems = group.items.filter((item) => {
            if (userRole === "admin") return true
            if (item.perm === "dashboard") return true
            return userPerms.includes(item.perm)
          })
          if (filteredItems.length === 0) return null
          const isCollapsed = collapsedGroups[group.title] || false
          return (
            <div key={group.title} className="mb-2">
              {sidebarOpen && (
                <button
                  onClick={() => setCollapsedGroups((prev) => ({ ...prev, [group.title]: !prev[group.title] }))}
                  className="w-full flex items-center justify-between px-6 py-1.5 text-[10px] uppercase tracking-wider text-white/30 hover:text-white/50 transition-colors"
                >
                  <span className="font-medium">{group.title}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                </button>
              )}
              {(!isCollapsed || !sidebarOpen) &&
                filteredItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/ai.admin" && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 mx-3 mb-1 px-3 py-2.5 rounded-lg transition-all ${
                        isActive
                          ? "bg-[#D4A843] text-[#0f2547] font-semibold shadow-lg shadow-[#D4A843]/20"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                      title={item.name}
                    >
                      <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-[#0f2547]" : ""}`} />
                      {sidebarOpen && <span className="text-sm">{item.nameAr}</span>}
                    </Link>
                  )
                })}
            </div>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-white/10">
        {sidebarOpen && (
          <div className="bg-gradient-to-br from-[#1A3A6B] to-[#122848] rounded-xl p-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-white/30">
                {userImage ? (
                  <img src={userImage} alt={userName || ""} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-[#D4A843] flex items-center justify-center">
                    <span className="text-[#0f2547] text-base font-bold">{userName?.charAt(0) || userEmail?.charAt(0) || "U"}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{userName || "مدير النظام"}</p>
                {userNameEn && <p className="text-[11px] text-white/60 truncate">{userNameEn}</p>}
                <p className="text-[10px] text-white/50 truncate">{userEmail || ""}</p>
                {userMemberSince && (
                  <p className="text-[10px] text-white/40 mt-0.5">مدير منذ {userMemberSince}</p>
                )}
              </div>
            </div>
            {userMembershipNumber && (
              <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between text-[10px]">
                <span className="text-white/50">رقم العضوية</span>
                <span className="font-bold text-white/80">{userMembershipNumber}</span>
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/ai.admin/login" })}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-white/50 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          {sidebarOpen && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    router.push(`/ai.admin/search?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0b1120] flex transition-colors duration-300">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">{sidebar}</div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64">{sidebar}</div>
          <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white/80 dark:bg-[#141e30]/90 backdrop-blur-md border-b border-gray-200/50 dark:border-[#2a3d56]/60 h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <form onSubmit={handleSearch} className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="بحث عن أعضاء، أخبار، أحداث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-100/80 dark:bg-[#111927] dark:border dark:border-[#3b4f6b] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 dark:focus:ring-blue-500/30 focus:bg-white dark:focus:bg-[#1a2332] w-72 transition-all text-gray-800 dark:text-[#f1f5f9] placeholder-gray-500 dark:placeholder-[#7a8ba3]"
              />
            </form>

            {/* Theme Toggle - between search and language */}
            <button
              onClick={toggleTheme}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              title={theme === "light" ? "الوضع الليلي" : "الوضع النهاري"}
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-500" />
              )}
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-sm font-medium text-gray-600 dark:text-gray-300"
              title={lang === "ar" ? "English" : "العربية"}
            >
              <Globe className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#D4A843] text-[#0f2547] text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-[#1a2332] rounded-2xl shadow-2xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-[#2a3d56] z-50 overflow-hidden" style={{ direction: "rtl" }}>
                    <div className="flex items-center justify-between px-4 py-3 border-b dark:border-[#2a3d56] bg-gradient-to-l from-[#1A3A6B] to-[#2B5EA7]">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-white" />
                        <span className="font-semibold text-sm text-white">الإشعارات</span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 bg-[#D4A843] text-[#0f2547] text-[10px] font-bold rounded-full">{unreadCount}</span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-white/80 hover:text-white flex items-center gap-1 transition-colors">
                          <Check className="w-3 h-3" />
                          قراءة الكل
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 dark:text-[#94a3b8] text-sm">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-[#3b4f6b]" />
                          لا توجد إشعارات
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 dark:border-[#253347] hover:bg-gray-50 dark:hover:bg-[#1e2d42] transition-colors ${!notif.isRead ? "bg-[#1A3A6B]/5 dark:bg-[#1a3050]" : ""}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${getTypeColor(notif.type)}`}>
                              {getTypeIcon(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-medium truncate ${!notif.isRead ? "text-gray-900 dark:text-[#ffffff]" : "text-gray-700 dark:text-[#e2e8f0]"}`}>{notif.titleAr}</p>
                                {!notif.isRead && <div className="w-2 h-2 bg-[#D4A843] rounded-full shrink-0" />}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-[#94a3b8] truncate mt-0.5">{notif.messageAr}</p>
                              <p className="text-[10px] text-gray-400 dark:text-[#7a8ba3] mt-1">{new Date(notif.createdAt).toLocaleDateString("ar-EG")}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {!notif.isRead && (
                                <button onClick={() => markAsRead(notif.id)} className="p-1 hover:bg-gray-200 dark:hover:bg-[#2a3d56] rounded-lg text-gray-400 dark:text-[#94a3b8] hover:text-[#1A3A6B] dark:hover:text-[#60a5fa] transition-colors" title="تعليم كمقروء">
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button onClick={() => deleteNotification(notif.id)} className="p-1 hover:bg-gray-200 dark:hover:bg-[#2a3d56] rounded-lg text-gray-400 dark:text-[#94a3b8] hover:text-red-600 dark:hover:text-[#f87171] transition-colors" title="حذف">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <Link
                      href="/ai.admin/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="block px-4 py-3 text-center text-sm font-medium text-[#1A3A6B] dark:text-[#60a5fa] hover:bg-gray-50 dark:hover:bg-[#1e2d42] border-t dark:border-[#253347] transition-colors"
                    >
                      عرض جميع الإشعارات
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* User Avatar with dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-9 h-9 rounded-xl overflow-hidden shrink-0 transition-transform hover:scale-105"
              >
                {userImage ? (
                  <img src={userImage} alt={userName || ""} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1A3A6B] to-[#2B5EA7] flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {userName?.charAt(0) || userEmail?.charAt(0) || "U"}
                  </div>
                )}
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-[#1a2332] rounded-2xl shadow-2xl border border-gray-100 dark:border-[#2a3d56] z-50 overflow-hidden" style={{ direction: "rtl" }}>
                    <div className="bg-gradient-to-br from-[#1A3A6B] to-[#122848] p-4 text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-white/30">
                          {userImage ? (
                            <img src={userImage} alt={userName || ""} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-white/20 flex items-center justify-center">
                              <span className="text-white font-bold">{userName?.charAt(0) || "U"}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{userName || "مدير النظام"}</p>
                          {userNameEn && <p className="text-[11px] text-white/60 truncate">{userNameEn}</p>}
                          <p className="text-[10px] text-white/50 truncate">{userEmail || ""}</p>
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/ar/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-[#e2e8f0] hover:bg-gray-50 dark:hover:bg-[#1e2d42] transition-colors"
                    >
                      <User className="w-4 h-4" />
                      الملف الشخصي
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/ai.admin/login" })}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
