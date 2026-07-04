"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Calendar, FileText, Settings, Bell, BookOpen, Heart, Award, Clock, ChevronLeft, ChevronRight, MapPin, LogOut, Edit, Loader2, CreditCard } from "lucide-react";
import { MembershipCardEngine } from "@/components/cards/membership-card-engine";
import Link from "next/link";

interface ProfileData {
  id: string
  name: string
  email: string
  image: string | null
  nameEn: string
  phone: string
  membershipType: string
  membershipNumber: string
  memberStatus: string
  memberSince: string
  faculty: string
  specialization: string
  cardPhoto: string
}

export default function DashboardPage({ params }: { params: Promise<{ lang: string }> }) {
  const [lang, setLang] = useState("ar");
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { params.then((p) => setLang(p.lang)) }, [params]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "loading" && session?.user?.id) {
      fetch("/api/profile")
        .then((r) => { if (r.status === 401) { router.push("/auth/login"); return null } return r.json() })
        .then((data) => { if (data) setProfile(data) })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [session, status, router]);

  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  if (loading || status === "loading") {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-text-secondary">{isArabic ? "يرجى تسجيل الدخول" : "Please login"}</p></div>
  }

  const quickActions = [
    { icon: Calendar, title: isArabic ? "الأحداث" : "Events", href: `/${lang}/events`, color: "bg-primary/10 text-primary" },
    { icon: CreditCard, title: isArabic ? "بطاقتي" : "My Card", href: `/${lang}/cards`, color: "bg-secondary/10 text-secondary" },
    { icon: Heart, title: isArabic ? "التبرعات" : "Donations", href: `/${lang}/donations`, color: "bg-error/10 text-error" },
    { icon: FileText, title: isArabic ? "المنشورات" : "Posts", href: `/${lang}/media/posts`, color: "bg-accent/10 text-accent" },
    { icon: BookOpen, title: isArabic ? "المشاريع" : "Projects", href: `/${lang}/projects`, color: "bg-primary/10 text-primary" },
    { icon: Settings, title: isArabic ? "الإعدادات" : "Settings", href: `/${lang}/membership/manage`, color: "bg-text-secondary/10 text-text-secondary" },
  ];

  return (
    <div dir={dir} className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">
            {isArabic ? `مرحباً، ${profile.name}` : `Welcome, ${profile.name}`}
          </h1>
          <p className="text-text-secondary">{isArabic ? "لوحة التحكم الخاصة بك" : "Your Dashboard"}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Summary */}
            <div className="bg-surface rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-text">{isArabic ? "ملفي الشخصي" : "My Profile"}</h2>
                <Link href={`/${lang}/profile`} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />{isArabic ? "تعديل" : "Edit"}
                </Link>
              </div>
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                  {profile.image ? <img src={profile.image} alt="" className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-primary" />}
                </div>
                <div className="flex-1 grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-text-light text-xs mb-1">{isArabic ? "الاسم" : "Name"}</p>
                    <p className="font-medium text-text">{profile.name}</p>
                  </div>
                  <div>
                    <p className="text-text-light text-xs mb-1">{isArabic ? "البريد الإلكتروني" : "Email"}</p>
                    <p className="font-medium text-text">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-text-light text-xs mb-1">{isArabic ? "رقم العضوية" : "Membership Number"}</p>
                    <p className="font-mono font-medium text-text">{profile.membershipNumber || "—"}</p>
                  </div>
                  <div>
                    <p className="text-text-light text-xs mb-1">{isArabic ? "الكلية" : "Faculty"}</p>
                    <p className="font-medium text-text">{profile.faculty || profile.specialization || "—"}</p>
                  </div>
                  <div>
                    <p className="text-text-light text-xs mb-1">{isArabic ? "عضو منذ" : "Member Since"}</p>
                    <p className="font-medium text-text">{profile.memberSince || "—"}</p>
                  </div>
                  <div>
                    <p className="text-text-light text-xs mb-1">{isArabic ? "نوع العضوية" : "Membership Type"}</p>
                    <p className="font-medium text-secondary">{profile.membershipType || "—"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-surface rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-text mb-6">{isArabic ? "إجراءات سريعة" : "Quick Actions"}</h2>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {quickActions.map((action, i) => (
                  <Link key={i} href={action.href} className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-background transition-colors text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${action.color}`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium text-text">{action.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Membership Card */}
            <div className="bg-gradient-to-br from-primary to-primary-light rounded-2xl p-6 text-white">
              <Award className="w-8 h-8 text-secondary mb-4" />
              <h3 className="font-bold text-lg mb-1">{profile.membershipType || "عضو عامل"}</h3>
              <p className="text-white/70 text-sm mb-4">{isArabic ? "عضو منذ" : "Member since"} {profile.memberSince || "—"}</p>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-white/60 text-xs mb-1">{isArabic ? "رقم العضوية" : "Membership Number"}</p>
                <p className="font-mono font-bold">{profile.membershipNumber || "—"}</p>
              </div>
              <Link href={`/${lang}/cards`} className="mt-4 block text-center px-4 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
                {isArabic ? "عرض البطاقة" : "View Card"}
              </Link>
            </div>

            {/* Notifications */}
            <div className="bg-surface rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-text">{isArabic ? "الإشعارات" : "Notifications"}</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                  <div>
                    <p className="text-sm text-text">{isArabic ? "مرحباً بك في رابطة الخريجين" : "Welcome to AIUAG"}</p>
                    <p className="text-xs text-text-light">{isArabic ? "تصفح المزايا المتاحة" : "Browse available benefits"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout */}
            <button onClick={() => signOut({ callbackUrl: `/${lang}` })} className="flex items-center justify-center gap-2 w-full py-3 bg-error/10 text-error rounded-xl font-bold hover:bg-error/20 transition-all">
              <LogOut className="w-5 h-5" />{isArabic ? "تسجيل الخروج" : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
