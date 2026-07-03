import Link from "next/link"
import { Users, Calendar, FolderOpen, Award, ArrowLeft, ArrowRight, Heart, BookOpen, MapPin, Phone, Mail, ChevronLeft, ChevronRight, Clock, Star } from "lucide-react"
import HeroSection from "@/components/ui/hero-section"
import prisma from "@/lib/prisma"
import HomeClient from "./home-client"

export const dynamic = "force-dynamic"

interface HomeProps {
  params: Promise<{ lang: string }>
}

export default async function HomePage({ params }: HomeProps) {
  const { lang } = await params
  const isArabic = lang === "ar"
  const dir = isArabic ? "rtl" : "ltr"

  const [galleryImages, latestNews, upcomingEvents, featuredProjects] = await Promise.all([
    prisma.gallery.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" }, take: 8 }).catch(() => []),
    prisma.news.findMany({
      where: { status: "published" },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, titleAr: true, titleEn: true, slug: true, excerptAr: true, excerptEn: true, featuredImage: true, category: true, publishedAt: true, createdAt: true },
    }).catch(() => []),
    prisma.event.findMany({
      where: { status: { in: ["upcoming", "ongoing"] } },
      orderBy: { date: "asc" },
      take: 3,
      select: { id: true, titleAr: true, titleEn: true, slug: true, date: true, time: true, location: true, status: true },
    }).catch(() => []),
    prisma.project.findMany({
      where: { status: { in: ["active", "completed"] } },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, titleAr: true, titleEn: true, slug: true, descriptionAr: true, descriptionEn: true, status: true, featuredImage: true },
    }).catch(() => []),
  ])

  const [memberCount, eventCount, projectCount] = await Promise.all([
    prisma.member.count({ where: { status: "approved" } }).catch(() => 0),
    prisma.event.count().catch(() => 0),
    prisma.project.count().catch(() => 0),
  ])

  const stats = [
    { icon: Users, value: memberCount || 2500, label: isArabic ? "عضو مسجل" : "Registered Members" },
    { icon: Calendar, value: eventCount || 50, label: isArabic ? "حدث وفعالية" : "Events & Activities" },
    { icon: FolderOpen, value: projectCount || 100, label: isArabic ? "مشروع تنفيذي" : "Implemented Projects" },
    { icon: Award, value: 10, label: isArabic ? "سنوات من العطاء" : "Years of Giving", suffix: "+" },
  ]

  const sections = [
    { key: "news", title: isArabic ? "آخر الأخبار" : "Latest News", items: latestNews, href: `/${lang}/news` },
    { key: "events", title: isArabic ? "الأحداث القادمة" : "Upcoming Events", items: upcomingEvents, href: `/${lang}/events` },
    { key: "projects", title: isArabic ? "المشاريع المميزة" : "Featured Projects", items: featuredProjects, href: `/${lang}/projects` },
  ].filter(s => s.items.length > 0)

  return (
    <div dir={dir}>
      <HeroSection
        pageSlug="home"
        lang={lang}
        defaultTitle={isArabic ? "رابطة خريجي جامعة أفريقيا العالمية" : "Association of IUA Graduates"}
        defaultSubtitle={isArabic ? "نجمع الخريجين لبناء مستقبل أفضل — رابطة مهنية واجتماعية تخدم المجتمع والتنمية" : "Uniting graduates for a better future — A professional and social association serving the community"}
        gradient="from-primary via-primary-light to-primary"
      >
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <img
              src="/uploads/شعار الرابطة.jpg"
              alt="AIUAG Logo"
              className="w-28 h-28 mx-auto rounded-full object-cover border-2 border-white/30"
            />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {isArabic ? "رابطة خريجي جامعة أفريقيا العالمية" : "Association of IUA Graduates"}
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-8 leading-relaxed">
            {isArabic
              ? "نجمع الخريجين لبناء مستقبل أفضل — رابطة مهنية واجتماعية تخدم المجتمع والتنمية"
              : "Uniting graduates for a better future — A professional and social association serving the community"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${lang}/membership/apply`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-primary-dark rounded-xl text-lg font-bold hover:bg-secondary-light transition-all hover:scale-105 shadow-lg"
            >
              {isArabic ? "انضم إلينا" : "Join Us"}
              {isArabic ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            </Link>
            <Link
              href={`/${lang}/about`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white border-2 border-white/30 rounded-xl text-lg font-bold hover:bg-white/20 transition-all"
            >
              {isArabic ? "اعرف المزيد" : "Learn More"}
            </Link>
          </div>
        </div>
      </HeroSection>

      <HomeClient
        lang={lang}
        isArabic={isArabic}
        stats={stats}
        sections={sections}
        galleryImages={galleryImages}
        formatDate={(d: Date | null | undefined) => {
          if (!d) return ""
          return d.toLocaleDateString(isArabic ? "ar" : "en", { year: "numeric", month: "long", day: "numeric" })
        }}
      />
    </div>
  )
}
