import Link from "next/link";
import { Camera, Play, FileText, BarChart3, ArrowLeft, ArrowRight, MessageSquare, Newspaper, CalendarClock } from "lucide-react";
import HeroSection from "@/components/ui/hero-section";

export default async function MediaPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const sections = [
    {
      icon: Newspaper,
      title: isArabic ? "الأخبار والأحداث" : "News & Events",
      desc: isArabic ? "تابع آخر أخبارنا وأحداثنا وفعالياتنا" : "Follow our latest news, events, and activities",
      href: `/${lang}/news`,
      color: "from-blue-600 to-blue-700",
      stats: isArabic ? "آخر الأخبار" : "Latest News",
    },
    {
      icon: Camera,
      title: isArabic ? "المعرض" : "Gallery",
      desc: isArabic ? "تصفح صور وفيديوهات فعالياتنا والحرم الجامعي" : "Browse photos and videos of our events and campus",
      href: `/${lang}/media/gallery`,
      color: "from-purple-600 to-purple-700",
      stats: isArabic ? "صور + فيديوهات" : "Photos + Videos",
    },
    {
      icon: Play,
      title: isArabic ? "الفيديوهات" : "Videos",
      desc: isArabic ? "شاهد فيديوهات المؤتمرات والمحاضرات والفعاليات" : "Watch videos of conferences, lectures, and events",
      href: `/${lang}/media/videos`,
      color: "from-rose-600 to-rose-700",
      stats: isArabic ? "فيديوهات متنوعة" : "Various Videos",
    },
    {
      icon: FileText,
      title: isArabic ? "المنشورات والتفاعل" : "Posts & Publications",
      desc: isArabic ? "شارك وتفاعل مع مجتمع الخريجين - تقارير ومنشورات تفاعلية" : "Interact with the alumni community - reports and interactive posts",
      href: `/${lang}/media/publications`,
      color: "from-emerald-600 to-emerald-700",
      stats: isArabic ? "تقارير + تفاعل" : "Reports + Feed",
    },
  ];

  return (
    <div dir={dir}>
      <HeroSection
        pageSlug="media"
        lang={lang}
        defaultTitle={isArabic ? "المركز الإعلامي" : "Media Center"}
        defaultSubtitle={isArabic
          ? "تابع آخر أخبارنا وفعالياتنا من خلال الوسائط المتعددة"
          : "Follow our latest news and events through multimedia content"}
      />

      {/* Sections Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text mb-3">
              {isArabic ? "استكشف محتوانا" : "Explore Our Content"}
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              {isArabic
                ? "من الأخبار إلى الفيديوهات، من المعرض إلى التقارير الرسمية"
                : "From news to videos, from gallery to official reports"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {sections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
                <div className="relative z-10 p-8 md:p-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <section.icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-white/60 text-xs font-medium px-3 py-1 bg-white/10 rounded-full">
                      {section.stats}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">
                    {section.title}
                  </h2>
                  <p className="text-white/70 leading-relaxed mb-6">
                    {section.desc}
                  </p>
                  <div className="flex items-center text-white font-medium text-sm group-hover:gap-3 transition-all">
                    <span>{isArabic ? "استكشف" : "Explore"}</span>
                    {isArabic ? (
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    ) : (
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
