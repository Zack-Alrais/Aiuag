import Link from "next/link";
import { Heart, Users, BookOpen, Clock, ArrowLeft, ArrowRight, Star, HandHeart, Target } from "lucide-react";
import HeroSection from "@/components/ui/hero-section";
import VolunteerForm from "@/components/sections/volunteer-form";

export default async function VolunteerPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const benefits = [
    { icon: Heart, title: isArabic ? "إثراء الشخصية" : "Personal Enrichment", desc: isArabic ? "تطوير مهارات التواصل والقيادة والعمل الجماعي" : "Develop communication, leadership, and teamwork skills" },
    { icon: Users, title: isArabic ? "بناء شبكة علاقات" : "Networking", desc: isArabic ? "التواصل مع خريجين ومتخصصين من مختلف المجالات" : "Connect with graduates and professionals from various fields" },
    { icon: BookOpen, title: isArabic ? "خبرة عملية" : "Practical Experience", desc: isArabic ? "الحصول على خبرة عملية في إدارة الفعاليات والمشاريع" : "Gain practical experience in event and project management" },
    { icon: Star, title: isArabic ? "شهادة تطوعية" : "Volunteer Certificate", desc: isArabic ? "احصل على شهادة رسمية تعكس جهدك التطوعي" : "Obtain an official certificate reflecting your volunteer efforts" },
  ];

  const opportunities = [
    { title: isArabic ? "تنظيم المؤتمرات" : "Conference Organization", desc: isArabic ? "المساعدة في تنظيم مؤتمر الخريجين السنوي" : "Help organize the annual alumni conference", spots: 5, deadline: isArabic ? "15 يوليو 2026" : "July 15, 2026" },
    { title: isArabic ? "إرشاد الطلاب" : "Student Mentoring", desc: isArabic ? "إرشاد الطلاب الحاليين وتوجيههم أكاديمياً" : "Guide and mentor current students academically", spots: 10, deadline: isArabic ? "1 أغسطس 2026" : "August 1, 2026" },
    { title: isArabic ? "حملات التبرع" : "Fundraising Campaigns", desc: isArabic ? "المشاركة في حملات جمع التبرعات للصندوق" : "Participate in fundraising campaigns for the fund", spots: 8, deadline: isArabic ? "20 أغسطس 2026" : "August 20, 2026" },
    { title: isArabic ? "الدعم الفني" : "Technical Support", desc: isArabic ? "المساعدة في إدارة المنصة الرقمية للرابطة" : "Help manage the association's digital platform", spots: 3, deadline: isArabic ? "10 سبتمبر 2026" : "September 10, 2026" },
  ];

  return (
    <div dir={dir}>
      <HeroSection
        pageSlug="volunteer"
        lang={lang}
        defaultTitle={isArabic ? "التطوع معنا" : "Volunteer With Us"}
        defaultSubtitle={isArabic ? "كن جزءاً من فريق التطوع وساهم في بناء مستقبل أفضل للخريجين والمجتمع" : "Be part of the volunteer team and contribute to building a better future"}
        gradient="from-accent via-accent-light to-accent"
      >
        <div className="max-w-3xl mx-auto text-center">
          <HandHeart className="w-16 h-16 text-white mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {isArabic ? "التطوع معنا" : "Volunteer With Us"}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            {isArabic ? "كن جزءاً من فريق التطوع وساهم في بناء مستقبل أفضل للخريجين والمجتمع" : "Be part of the volunteer team and contribute to building a better future"}
          </p>
        </div>
      </HeroSection>

      {/* Benefits */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
              {isArabic ? "مزايا التطوع" : "Volunteering Benefits"}
            </h2>
            <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-4 bg-surface rounded-2xl p-6 shadow-sm">
                <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center shrink-0">
                  <b.icon className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text mb-2">{b.title}</h3>
                  <p className="text-text-secondary text-sm">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Opportunities */}
      <section className="py-20 bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
              {isArabic ? "فرص التطوع الحالية" : "Current Volunteer Opportunities"}
            </h2>
            <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {opportunities.map((opp, i) => (
              <div key={i} className="bg-background rounded-2xl p-6 border border-border hover:border-accent/30 transition-all">
                <h3 className="text-lg font-bold text-text mb-2">{opp.title}</h3>
                <p className="text-text-secondary text-sm mb-4">{opp.desc}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-accent" />
                    <span className="text-sm text-text-secondary">{isArabic ? `أماكن متبقية: ${opp.spots}` : `Spots left: ${opp.spots}`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-text-light" />
                    <span className="text-xs text-text-light">{opp.deadline}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form Placeholder */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-text mb-4">{isArabic ? "نموذج طلب التطوع" : "Volunteer Application Form"}</h2>
          </div>
          <div className="bg-surface rounded-2xl p-8 shadow-sm">
            <VolunteerForm isArabic={isArabic} dir={dir} />
          </div>
        </div>
      </section>
    </div>
  );
}
