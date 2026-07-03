import Link from "next/link";
import { Users, Check, ArrowLeft, ArrowRight, Award, BookOpen, Briefcase, Globe, Heart, Shield } from "lucide-react";
import ScrollReveal from "@/components/ui/scroll-reveal";
import HeroSection from "@/components/ui/hero-section";

export default async function MembershipPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const benefits = [
    { icon: Users, title: isArabic ? "شبكة خريجين" : "Alumni Network", desc: isArabic ? "تواصل مع آلاف الخريجين من مختلف التخصصات والكليات" : "Connect with thousands of graduates from various disciplines" },
    { icon: Briefcase, title: isArabic ? "فرص عمل" : "Career Opportunities", desc: isArabic ? "الوصول إلى فرص العمل والتوظيف الحصرية للأعضاء" : "Access exclusive job and recruitment opportunities for members" },
    { icon: BookOpen, title: isArabic ? "برامج تدريبية" : "Training Programs", desc: isArabic ? "استفد من البرامج التدريبية والورش العمل المجانية" : "Benefit from free training programs and workshops" },
    { icon: Award, title: isArabic ? "شهادات معتمدة" : "Certified Credentials", desc: isArabic ? "احصل على شهادة عضوية معتمدة من الرابطة" : "Obtain a membership certificate certified by the association" },
    { icon: Globe, title: isArabic ? "فعاليات حصرية" : "Exclusive Events", desc: isArabic ? "حضور المؤتمرات والندوات بأسعار مميزة" : "Attend conferences and seminars at special prices" },
    { icon: Shield, title: isArabic ? "دعم مستمر" : "Ongoing Support", desc: isArabic ? "احصل على الدعم والاستشارة المهنية على مدار السنة" : "Get professional support and consultation year-round" },
  ];

  const plans = [
    { name: isArabic ? "عضوية سنوية" : "Annual Membership", price: isArabic ? "50,000" : "50,000", currency: isArabic ? "ج.س" : "SDG", features: [isArabic ? "جميع مزايا العضوية الأساسية" : "All basic membership benefits", isArabic ? "حضور 2 فعالية سنوياً" : "Attend 2 events per year", isArabic ? "نشر سيرة ذاتية في موقع الرابطة" : "Publish CV on association website", isArabic ? "newsletter شهري" : "Monthly newsletter"], popular: false },
    { name: isArabic ? "عضوية مميزة" : "Premium Membership", price: isArabic ? "100,000" : "100,000", currency: isArabic ? "ج.س" : "SDG", features: [isArabic ? "جميع مزايا العضوية السنوية" : "All annual membership benefits", isArabic ? "حضور غير محدود للفعاليات" : "Unlimited event attendance", isArabic ? "إرشاد أكاديمي شخصي" : "Personal academic mentoring", isArabic ? "استشارات مهنية شهرية" : "Monthly career consultations", isArabic ? "أولوية في البرامج التدريبية" : "Priority in training programs"], popular: true },
    { name: isArabic ? "عضوية مدى الحياة" : "Lifetime Membership", price: isArabic ? "500,000" : "500,000", currency: isArabic ? "ج.س" : "SDG", features: [isArabic ? "جميع مزايا العضوية المميزة" : "All premium membership benefits", isArabic ? "عضوية دائمة بدون تجديد" : "Permanent membership without renewal", isArabic ? "دعوة لكل الفعاليات الكبرى" : "Invitation to all major events", isArabic ? "عضو مجلس استشاري" : "Advisory council member", isArabic ? "شهادة شرفية" : "Honorary certificate"], popular: false },
  ];

  return (
    <div dir={dir}>
      <HeroSection
        pageSlug="membership"
        lang={lang}
        defaultTitle={isArabic ? "العضوية" : "Membership"}
        defaultSubtitle={isArabic ? "انضم إلى عائلة رابطة خريجي جامعة أفريقيا العالمية واستفد من مزايا حصرية" : "Join the AIUAG family and benefit from exclusive advantages"}
      />

      {/* Benefits */}
      <ScrollReveal direction="up"><section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
              {isArabic ? "مزايا العضوية" : "Membership Benefits"}
            </h2>
            <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {benefits.map((b, i) => (
              <div key={i} className="bg-surface rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <b.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-text mb-3">{b.title}</h3>
                <p className="text-text-secondary text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section></ScrollReveal>

      {/* Pricing */}
      <ScrollReveal direction="up"><section className="py-20 bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
              {isArabic ? "خطط العضوية" : "Membership Plans"}
            </h2>
            <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <div key={i} className={`rounded-2xl p-8 border-2 transition-all ${plan.popular ? "border-secondary bg-surface shadow-xl scale-105 relative" : "border-border bg-background hover:border-primary/30"}`}>
                {plan.popular && (
                  <span className="absolute -top-4 start-1/2 -translate-x-1/2 px-4 py-1 bg-secondary text-white text-sm font-bold rounded-full">
                    {isArabic ? "الأكثر طلباً" : "Most Popular"}
                  </span>
                )}
                <h3 className="text-xl font-bold text-text mb-2 mt-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  <span className="text-text-secondary text-sm ms-1">{plan.currency}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-text-secondary text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/${lang}/membership/apply`}
                  className={`block w-full text-center py-3 rounded-xl font-bold transition-all ${plan.popular ? "bg-secondary text-white hover:bg-secondary/90" : "bg-primary text-white hover:bg-primary/90"}`}
                >
                  {isArabic ? "تقديم طلب" : "Apply Now"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section></ScrollReveal>

      {/* CTA */}
      <ScrollReveal direction="up"><section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <Heart className="w-12 h-12 text-secondary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {isArabic ? "جاهز للانضمام؟" : "Ready to Join?"}
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            {isArabic ? "املأ طلب العضوية وانضم إلى آلاف الخريجين المتميزين" : "Fill out the membership application and join thousands of distinguished graduates"}
          </p>
          <Link
            href={`/${lang}/membership/apply`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-white rounded-xl text-lg font-bold hover:bg-secondary/90 transition-all hover:scale-105"
          >
            {isArabic ? "طلب عضوية" : "Apply for Membership"}
            {isArabic ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
          </Link>
        </div>
        </section></ScrollReveal>
    </div>
  );
}
