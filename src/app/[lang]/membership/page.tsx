import Link from "next/link";
import { Users, Briefcase, BookOpen, Award, Globe, Shield, Heart, ArrowLeft, ArrowRight, UserCog, CreditCard, Bell, FileText, Settings, Calendar, Mail } from "lucide-react";
import ScrollReveal from "@/components/ui/scroll-reveal";
import HeroSection from "@/components/ui/hero-section";

export default async function MembershipPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const benefits = [
    { icon: Users, title: isArabic ? "شبكة خريجين قوية" : "Strong Alumni Network", desc: isArabic ? "تواصل مع آلاف الخريجين من مختلف التخصصات والكليات حول العالم. شارك الخبرات وابنِ شراكات مهنية مفيدة" : "Connect with thousands of graduates from various disciplines around the world. Share experiences and build useful professional partnerships" },
    { icon: Briefcase, title: isArabic ? "فرص عمل حصرية" : "Exclusive Job Opportunities", desc: isArabic ? "الحصول على فرص العمل والتوظيف الحصرية المقدمة من شركاء الرابطة والخريجين المقيمين في الشركات" : "Access exclusive job and recruitment opportunities provided by association partners and graduates working in companies" },
    { icon: BookOpen, title: isArabic ? "برامج تدريبية مجانية" : "Free Training Programs", desc: isArabic ? "الاستفادة من البرامج التدريبية والورش العمل المجانية في مختلف المجالات المهنية والأكاديمية" : "Benefit from free training programs and workshops in various professional and academic fields" },
    { icon: Award, title: isArabic ? "شهادات معتمدة" : "Certified Credentials", desc: isArabic ? "الحصول على شهادة عضوية معتمدة من الرابطة تعكس انتماءك وتفتخر بإنجازاتك" : "Obtain a membership certificate certified by the association reflecting your affiliation and celebrating your achievements" },
    { icon: Globe, title: isArabic ? "فعاليات حصرية" : "Exclusive Events", desc: isArabic ? "حضور المؤتمرات والندوات والورش بأسعار مميزة للأعضاء مع فرصNetworking مميزة" : "Attend conferences, seminars, and workshops at special member prices with exclusive networking opportunities" },
    { icon: Shield, title: isArabic ? "دعم مهني مستمر" : "Ongoing Career Support", desc: isArabic ? "الحصول على الاستشارات المهنية والإرشاد الأكاديمي على مدار العام من خبراء الخريجين" : "Get professional consultations and academic mentoring year-round from graduate experts" },
  ];

  const manageFeatures = [
    { icon: UserCog, title: isArabic ? "إدارة الملف الشخصي" : "Profile Management", desc: isArabic ? "تحديث معلوماتك الشخصية والمهنية والحفاظ على بياناتك محدثة" : "Update your personal and professional information and keep your data current" },
    { icon: CreditCard, title: isArabic ? "تجديد العضوية" : "Renew Membership", desc: isArabic ? "تجديد عضويتك مجاناً وتحديث بياناتك في أي وقت" : "Renew your membership free of charge and update your details anytime" },
    { icon: Bell, title: isArabic ? "الإشعارات" : "Notifications", desc: isArabic ? "إدارة تفضيلات الإشعارات واستلام آخر الأخبار والفعاليات" : "Manage notification preferences and receive the latest news and events" },
    { icon: FileText, title: isArabic ? "شهادة العضوية" : "Membership Certificate", desc: isArabic ? "تحميل شهادة العضوية المعتمدة وطباعتها في أي وقت" : "Download your certified membership certificate anytime" },
    { icon: Calendar, title: isArabic ? "سجل الفعاليات" : "Event History", desc: isArabic ? "عرض سجل الفعاليات التي حضرتها والفعاليات القادمة" : "View your attended events history and upcoming events" },
    { icon: Settings, title: isArabic ? "إعدادات الحساب" : "Account Settings", desc: isArabic ? "تعديل كلمة المرور وإعدادات الأمان وتفضيلات اللغة" : "Change password, security settings, and language preferences" },
  ];

  return (
    <div dir={dir}>
      <HeroSection
        pageSlug="membership"
        lang={lang}
        defaultTitle={isArabic ? "العضوية" : "Membership"}
        defaultSubtitle={isArabic ? "انضم إلى عائلة رابطة خريجي جامعة أفريقيا العالمية واستفد من مزايا حصرية مجاناً" : "Join the AIUAG family and benefit from exclusive free advantages"}
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
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {benefits.map((b, i) => (
              <div key={i} className="bg-surface rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-border hover:border-primary/20">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
                  <b.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-text mb-3">{b.title}</h3>
                <p className="text-text-secondary leading-relaxed text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section></ScrollReveal>

      {/* Manage / Login */}
      <ScrollReveal direction="up"><section className="py-20 bg-surface">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <div className="bg-background rounded-3xl p-12 shadow-sm border border-border">
              <Mail className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-text mb-4">
                {isArabic ? "تسجيل الدخول مطلوب" : "Login Required"}
              </h2>
              <p className="text-text-secondary mb-8">
                {isArabic
                  ? "قم بتسجيل الدخول للوصول إلى حسابك وإدارة عضويتك"
                  : "Sign in to access your account and manage your membership"}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/${lang}/membership/apply`}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all"
                >
                  {isArabic ? "تقديم طلب عضوية جديد" : "Apply for New Membership"}
                  {isArabic ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text mb-4">
              {isArabic ? "ما يمكنك إدارته" : "What You Can Manage"}
            </h2>
            <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {manageFeatures.map((feature, i) => (
              <div key={i} className="bg-background rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-border hover:border-primary/20 text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-text mb-3">{feature.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{feature.desc}</p>
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
            {isArabic ? "انضم الآن مجاناً واستفد من جميع المزايا المتاحة للأعضاء" : "Join now for free and benefit from all available member advantages"}
          </p>
          <Link
            href={`/${lang}/membership/apply`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-white rounded-xl text-lg font-bold hover:bg-secondary/90 transition-all hover:scale-105"
          >
            {isArabic ? "تقديم طلب العضوية" : "Apply for Membership"}
            {isArabic ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
          </Link>
        </div>
      </section></ScrollReveal>
    </div>
  );
}
