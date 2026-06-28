import Link from "next/link";
import { Building2, Users, Shield, GitBranch, ArrowLeft, ArrowRight } from "lucide-react";
import HeroSection from "@/components/ui/hero-section";

export default async function OrganizationPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const sections = [
    {
      icon: Shield,
      title: isArabic ? "مجلس الإدارة" : "Board of Directors",
      desc: isArabic ? "يتكون مجلس الإدارة من أعضاء منتخبين يمثلون الخريجين ويقودون استراتيجيات الرابطة" : "The Board consists of elected members who represent graduates and lead the association's strategies",
      href: `/${lang}/organization/board`,
      color: "bg-primary/10 text-primary",
    },
    {
      icon: Building2,
      title: isArabic ? "الأمانة العامة" : "Secretariat",
      desc: isArabic ? "الأمانة العامة مسؤولة عن الإدارة اليومية والتنسيق بين أعضاء الرابطة واللجان" : "The Secretariat is responsible for daily management and coordination between members and committees",
      href: `/${lang}/organization/secretariat`,
      color: "bg-secondary/10 text-secondary",
    },
    {
      icon: Users,
      title: isArabic ? "اللجان" : "Committees",
      desc: isArabic ? "لجان متخصصة تعمل في مختلف المجالات لتحقيق أهداف الرابطة وserve الخريجين" : "Specialized committees working in various fields to achieve the association's goals and serve graduates",
      href: `/${lang}/organization/committees`,
      color: "bg-accent/10 text-accent",
    },
    {
      icon: GitBranch,
      title: isArabic ? "الفروع" : "Branches",
      desc: isArabic ? "فروع الرابطة المنتشرة في مختلف المناطق الجغرافية لتقديم خدمات محلية للخريجين" : "Association branches spread across various geographic regions to provide local services to graduates",
      href: `/${lang}/organization/branches`,
      color: "bg-primary/10 text-primary-light",
    },
  ];

  return (
    <div dir={dir}>
      <HeroSection
        pageSlug="organization"
        lang={lang}
        defaultTitle={isArabic ? "الهيكل التنظيمي" : "Organizational Structure"}
        defaultSubtitle={isArabic
          ? "يتكون الهيكل التنظيمي للرابطة من مجلس الإدارة والأمانة العامة واللجان والفروع"
          : "The association's organizational structure consists of the Board, Secretariat, Committees, and Branches"}
      />

      {/* Sections */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {sections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="group bg-surface rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-border hover:border-primary/20"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${section.color}`}>
                  <section.icon className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-text mb-3 group-hover:text-primary transition-colors">
                  {section.title}
                </h2>
                <p className="text-text-secondary leading-relaxed mb-4">
                  {section.desc}
                </p>
                <div className="flex items-center text-primary font-medium text-sm group-hover:gap-3 transition-all">
                  <span>{isArabic ? "عرض التفاصيل" : "View Details"}</span>
                  {isArabic ? (
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  ) : (
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Org Chart */}
      <section className="py-20 bg-surface">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-text mb-12">
            {isArabic ? "هيكل التنظيمي" : "Organization Chart"}
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="bg-primary text-white rounded-2xl py-6 px-8 inline-block mb-8">
              <div className="text-lg font-bold">{isArabic ? "مجلس الإدارة" : "Board of Directors"}</div>
            </div>
            <div className="flex justify-center mb-4">
              <div className="w-0.5 h-8 bg-border" />
            </div>
            <div className="bg-secondary text-white rounded-2xl py-6 px-8 inline-block mb-8">
              <div className="text-lg font-bold">{isArabic ? "الأمانة العامة" : "Secretariat"}</div>
            </div>
            <div className="flex justify-center mb-4">
              <div className="w-0.5 h-8 bg-border" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-background rounded-xl py-4 px-3 border border-border">
                <div className="text-sm font-bold text-text">{isArabic ? "لجنة المشاريع" : "Projects"}</div>
              </div>
              <div className="bg-background rounded-xl py-4 px-3 border border-border">
                <div className="text-sm font-bold text-text">{isArabic ? "لجنة البرامج" : "Programs"}</div>
              </div>
              <div className="bg-background rounded-xl py-4 px-3 border border-border">
                <div className="text-sm font-bold text-text">{isArabic ? "لجنة المالية" : "Finance"}</div>
              </div>
              <div className="bg-background rounded-xl py-4 px-3 border border-border">
                <div className="text-sm font-bold text-text">{isArabic ? "لجنة العلاقات" : "Relations"}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
