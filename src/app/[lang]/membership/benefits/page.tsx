import Link from "next/link";
import { Check, Star, Users, Briefcase, BookOpen, Award, Globe, Shield, Heart, ArrowLeft, ArrowRight } from "lucide-react";
import HeroSection from "@/components/ui/hero-section";

export default async function BenefitsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const benefits = [
    {
      icon: Users,
      title: isArabic ? "شبكة خريجين قوية" : "Strong Alumni Network",
      desc: isArabic ? "تواصل مع آلاف الخريجين من مختلف التخصصات والكليات حول العالم. شارك الخبرات وابنِ شراكات مهنية مفيدة" : "Connect with thousands of graduates from various disciplines around the world. Share experiences and build useful professional partnerships",
    },
    {
      icon: Briefcase,
      title: isArabic ? "فرص عمل حصرية" : "Exclusive Job Opportunities",
      desc: isArabic ? "الحصول على فرص العمل والتوظيف الحصرية المقدمة من شركاء الرابطة والخريجين المقيمين في الشركات" : "Access exclusive job and recruitment opportunities provided by association partners and graduates working in companies",
    },
    {
      icon: BookOpen,
      title: isArabic ? "برامج تدريبية مجانية" : "Free Training Programs",
      desc: isArabic ? "الاستفادة من البرامج التدريبية والورش العمل المجانية في مختلف المجالات المهنية والأكاديمية" : "Benefit from free training programs and workshops in various professional and academic fields",
    },
    {
      icon: Award,
      title: isArabic ? "شهادات معتمدة" : "Certified Credentials",
      desc: isArabic ? "الحصول على شهادة عضوية معتمدة من الرابطة تعكس انتماءك وتفتخر بإنجازاتك" : "Obtain a membership certificate certified by the association reflecting your affiliation and celebrating your achievements",
    },
    {
      icon: Globe,
      title: isArabic ? "فعاليات حصرية" : "Exclusive Events",
      desc: isArabic ? "حضور المؤتمرات والندوات والورش بأسعار مميزة للأعضاء مع فرصNetworking مميزة" : "Attend conferences, seminars, and workshops at special member prices with exclusive networking opportunities",
    },
    {
      icon: Shield,
      title: isArabic ? "دعم مهني مستمر" : "Ongoing Career Support",
      desc: isArabic ? "الحصول على الاستشارات المهنية والإرشاد الأكاديمي على مدار العام من خبراء الخريجين" : "Get professional consultations and academic mentoring year-round from graduate experts",
    },
  ];

  const tiers = [
    {
      name: isArabic ? "العضوية الأساسية" : "Basic Membership",
      price: isArabic ? "50,000 ج.س" : "50,000 SDG",
      color: "border-border",
      features: [
        isArabic ? "شبكة الخريجين" : "Alumni Network",
        isArabic ? "newsletter شهري" : "Monthly Newsletter",
        isArabic ? "حضور 2 فعالية سنوياً" : "Attend 2 events per year",
        isArabic ? "نشر سيرة ذاتية" : "Publish CV",
      ],
    },
    {
      name: isArabic ? "العضوية المميزة" : "Premium Membership",
      price: isArabic ? "100,000 ج.س" : "100,000 SDG",
      color: "border-secondary",
      popular: true,
      features: [
        isArabic ? "جميع مزايا العضوية الأساسية" : "All basic membership benefits",
        isArabic ? "حضور غير محدود للفعاليات" : "Unlimited event attendance",
        isArabic ? "إرشاد أكاديمي شخصي" : "Personal academic mentoring",
        isArabic ? "استشارات مهنية شهرية" : "Monthly career consultations",
        isArabic ? "أولوية في التدريب" : "Priority in training programs",
      ],
    },
    {
      name: isArabic ? "عضوية مدى الحياة" : "Lifetime Membership",
      price: isArabic ? "500,000 ج.س" : "500,000 SDG",
      color: "border-primary",
      features: [
        isArabic ? "جميع مزايا العضوية المميزة" : "All premium membership benefits",
        isArabic ? "عضوية دائمة" : "Permanent membership",
        isArabic ? "دعوة لكل الفعاليات الكبرى" : "Invitation to all major events",
        isArabic ? "عضو مجلس استشاري" : "Advisory council member",
        isArabic ? "شهادة شرفية" : "Honorary certificate",
      ],
    },
  ];

  return (
    <div dir={dir}>
      <HeroSection
        pageSlug="benefits"
        lang={lang}
        defaultTitle={isArabic ? "مزايا العضوية" : "Membership Benefits"}
        defaultSubtitle={isArabic
          ? "اكتشف المزايا الحصرية المتاحة لأعضاء رابطة خريجي جامعة أفريقيا العالمية"
          : "Discover the exclusive benefits available to members of the Africa International University Alumni Association"}
      />

      {/* Benefits Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
              {isArabic ? "لماذا تنضم إلينا؟" : "Why Join Us?"}
            </h2>
            <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {benefits.map((b, i) => (
              <div key={i} className="bg-surface rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-border hover:border-primary/20">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
                  <b.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-text mb-3">{b.title}</h3>
                <p className="text-text-secondary leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="py-20 bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
              {isArabic ? "مستويات العضوية" : "Membership Tiers"}
            </h2>
            <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {tiers.map((tier, i) => (
              <div key={i} className={`rounded-2xl p-8 border-2 transition-all ${tier.color} ${tier.popular ? "relative scale-105 shadow-xl" : "hover:border-primary/30"} bg-background`}>
                {tier.popular && (
                  <div className="absolute -top-4 start-1/2 -translate-x-1/2">
                    <span className="bg-secondary text-white text-sm font-bold px-4 py-1 rounded-full inline-flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {isArabic ? "الأكثر طلباً" : "Most Popular"}
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-text mb-2 mt-2">{tier.name}</h3>
                <div className="text-3xl font-bold text-primary mb-6">{tier.price}</div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-text-secondary text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/${lang}/membership/apply`}
                  className={`block w-full text-center py-3 rounded-xl font-bold transition-all ${tier.popular ? "bg-secondary text-white hover:bg-secondary/90" : "bg-primary text-white hover:bg-primary/90"}`}
                >
                  {isArabic ? "تقديم طلب" : "Apply Now"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <Heart className="w-12 h-12 text-secondary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {isArabic ? "جاهز للاستفادة؟" : "Ready to Benefit?"}
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            {isArabic ? "انضم الآن واستفد من جميع المزايا المتاحة للأعضاء" : "Join now and benefit from all available member advantages"}
          </p>
          <Link
            href={`/${lang}/membership/apply`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-white rounded-xl text-lg font-bold hover:bg-secondary/90 transition-all hover:scale-105"
          >
            {isArabic ? "تقديم طلب العضوية" : "Apply for Membership"}
            {isArabic ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
          </Link>
        </div>
      </section>
    </div>
  );
}
