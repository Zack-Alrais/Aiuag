import Link from "next/link";
import { Camera, Play, FileText, BarChart3, ArrowLeft, ArrowRight, MessageSquare } from "lucide-react";
import HeroSection from "@/components/ui/hero-section";

export default async function MediaPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const sections = [
    {
      icon: Camera,
      title: isArabic ? "معرض الصور" : "Photo Gallery",
      desc: isArabic ? "تصفح صور فعالياتنا وأحداثنا والحرم الجامعي" : "Browse photos of our events, activities, and campus",
      href: `/${lang}/media/gallery`,
      color: "from-primary to-primary-light",
    },
    {
      icon: Play,
      title: isArabic ? "الفيديوهات" : "Videos",
      desc: isArabic ? "شاهد فيديوهات المؤتمرات والمحاضرات والفعاليات" : "Watch videos of conferences, lectures, and events",
      href: `/${lang}/media/videos`,
      color: "from-secondary to-secondary-light",
    },
    {
      icon: FileText,
      title: isArabic ? "المنشورات" : "Publications",
      desc: isArabic ? "اطلع على المنشورات والتقارير الصادرة عن الرابطة" : "View publications and reports issued by the association",
      href: `/${lang}/media/publications`,
      color: "from-accent to-accent-light",
    },
    {
      icon: BarChart3,
      title: isArabic ? "التقارير" : "Reports",
      desc: isArabic ? "تحميل التقارير السنوية وتقارير الفعاليات" : "Download annual reports and event reports",
      href: `/${lang}/media/reports`,
      color: "from-primary-dark to-primary",
    },
    {
      icon: MessageSquare,
      title: isArabic ? "المنشورات التفاعلية" : "Interactive Posts",
      desc: isArabic ? "شارك وأتفاعل مع مجتمع الخريجين - نصوص، صور، فيديوهات، تعليقات" : "Share and interact with the alumni community - text, images, videos, comments",
      href: `/${lang}/media/posts`,
      color: "from-blue-600 to-indigo-600",
    },
  ];

  const stats = [
    { number: "100+", label: isArabic ? "صورة" : "Photos" },
    { number: "50+", label: isArabic ? "فيديو" : "Videos" },
    { number: "30+", label: isArabic ? "منشور" : "Publications" },
    { number: "20+", label: isArabic ? "تقرير" : "Reports" },
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

      {/* Stats */}
      <section className="py-12 bg-surface border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.number}</div>
                <div className="text-text-secondary text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {sections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
                <div className="relative z-10 p-8 md:p-10">
                  <section.icon className="w-12 h-12 text-white mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-3">
                    {section.title}
                  </h2>
                  <p className="text-white/80 leading-relaxed mb-6">
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
