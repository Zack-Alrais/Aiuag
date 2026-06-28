import Link from "next/link";
import { Briefcase, BookOpen, Search, GraduationCap, Users, Globe, ArrowLeft, ArrowRight, Check } from "lucide-react";
import HeroSection from "@/components/ui/hero-section";

export default async function ServicesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const services = [
    { icon: Briefcase, title: isArabic ? "خدمات الخريجين" : "Alumni Services", desc: isArabic ? "خدمات متكاملة للخريجين تشمل التسجيل وإصدار الشهادات والتواصل مع الجامعة" : "Comprehensive services for graduates including registration, certificate issuance, and university liaison", features: [isArabic ? "إصدار شهادة التخرج" : "Graduation certificate issuance", isArabic ? "تسجيل البيانات في سجل الخريجين" : "Register in alumni database", isArabic ? "الاستعلام عن السجلات الأكاديمية" : "Academic records inquiry"] },
    { icon: BookOpen, title: isArabic ? "الإرشاد الأكاديمي" : "Academic Guidance", desc: isArabic ? "برامج إرشادية تهدف إلى دعم الطلاب الحاليين والخريجين في مساراتهم الأكاديمية" : "Guidance programs aimed at supporting current students and graduates in their academic paths", features: [isArabic ? "إرشاد الطلاب الجدد" : "New student mentoring", isArabic ? "استشارات الدراسات العليا" : "Graduate studies consultation", isArabic ? "دعم البحث العلمي" : "Research support"] },
    { icon: Search, title: isArabic ? "بحث الوظائف" : "Job Search", desc: isArabic ? "منصة متخصصة لربط الخريجين بفرص العمل المناسبة في مختلف القطاعات" : "Specialized platform connecting graduates with suitable job opportunities across sectors", features: [isArabic ? "نشر السيرة الذاتية" : "CV posting", isArabic ? "تنبيهات الوظائف" : "Job alerts", isArabic ? "ورش عمل التوظيف" : "Interview workshops"] },
    { icon: GraduationCap, title: isArabic ? "البرامج التدريبية" : "Training Programs", desc: isArabic ? "برامج تدريبية وورش عمل لتطوير المهارات المهنية والشخصية" : "Training programs and workshops for developing professional and personal skills", features: [isArabic ? "ورش مهارات القيادة" : "Leadership skills workshops", isArabic ? "دورات التكنولوجيا" : "Technology courses", isArabic ? "تدريب على البرامج" : "Software training"] },
    { icon: Users, title: isArabic ? "استشارات مهنية" : "Career Consultations", desc: isArabic ? "جلسات استشارية مع متخصصين في مجالات مهنية مختلفة" : "Consultation sessions with specialists in various professional fields", features: [isArabic ? "استشارة مهنية فردية" : "Individual career consultation", isArabic ? "تقييم المهارات" : "Skills assessment", isArabic ? "خطة التطوير المهني" : "Career development plan"] },
    { icon: Globe, title: isArabic ? "فعاليات التواصل" : "Networking Events", desc: isArabic ? "فعاليات دورية لتعزيز التواصل المهني بين الخريجين وبناء علاقات قوية" : "Regular events to enhance professional networking among graduates and build strong relationships", features: [isArabic ? "لقاءات شهرية" : "Monthly meetups", isArabic ? "مؤتمرات سنوية" : "Annual conferences", isArabic ? "أحداث خاصة" : "Special events"] },
  ];

  return (
    <div dir={dir}>
      <HeroSection
        pageSlug="services"
        lang={lang}
        defaultTitle={isArabic ? "خدماتنا" : "Our Services"}
        defaultSubtitle={isArabic ? "خدمات متكاملة مصممة خصيصاً لخدمة الخريجين ودعم مسيرتهم المهنية" : "Comprehensive services designed specifically for graduates and their career development"}
      />

      {/* Services Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <div key={i} className="bg-surface rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all group">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                  <service.icon className="w-8 h-8 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-text mb-3">{service.title}</h3>
                <p className="text-text-secondary text-sm mb-6">{service.desc}</p>
                <ul className="space-y-2">
                  {service.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-text-secondary">
                      <Check className="w-4 h-4 text-accent shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {isArabic ? "هل تحتاج مساعدة؟" : "Need Help?"}
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            {isArabic ? "تواصل معنا للاستفسار عن خدماتنا أو للحصول على دعم شخصي" : "Contact us to inquire about our services or get personal support"}
          </p>
          <Link
            href={`/${lang}/contact`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-white rounded-xl text-lg font-bold hover:bg-secondary/90 transition-all hover:scale-105"
          >
            {isArabic ? "تواصل معنا" : "Contact Us"}
            {isArabic ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
          </Link>
        </div>
      </section>
    </div>
  );
}
