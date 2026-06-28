import Link from "next/link";
import { UserCog, CreditCard, Bell, FileText, ArrowLeft, ArrowRight, Settings, Calendar, Mail } from "lucide-react";
import HeroSection from "@/components/ui/hero-section";

export default async function ManageMembershipPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const features = [
    {
      icon: UserCog,
      title: isArabic ? "إدارة الملف الشخصي" : "Profile Management",
      desc: isArabic ? "تحديث معلوماتك الشخصية والمهنية والحفاظ على بياناتك محدثة" : "Update your personal and professional information and keep your data current",
    },
    {
      icon: CreditCard,
      title: isArabic ? "تجديد العضوية" : "Renew Membership",
      desc: isArabic ? "تجديد عضويتك بسهولة عبر الإنترنت واطلاع على حالة الاشتراك" : "Renew your membership easily online and check your subscription status",
    },
    {
      icon: Bell,
      title: isArabic ? "الإشعارات" : "Notifications",
      desc: isArabic ? "إدارة تفضيلات الإشعارات واستلام آخر الأخبار والفعاليات" : "Manage notification preferences and receive the latest news and events",
    },
    {
      icon: FileText,
      title: isArabic ? "شهادة العضوية" : "Membership Certificate",
      desc: isArabic ? "تحميل شهادة العضوية المعتمدة وطباعتها في أي وقت" : "Download your certified membership certificate anytime",
    },
    {
      icon: Calendar,
      title: isArabic ? "سجل الفعاليات" : "Event History",
      desc: isArabic ? "عرض سجل الفعاليات التي حضرتها والفعاليات القادمة" : "View your attended events history and upcoming events",
    },
    {
      icon: Settings,
      title: isArabic ? "إعدادات الحساب" : "Account Settings",
      desc: isArabic ? "تعديل كلمة المرور وإعدادات الأمان وتفضيلات اللغة" : "Change password, security settings, and language preferences",
    },
  ];

  return (
    <div dir={dir}>
      <HeroSection
        pageSlug="manage"
        lang={lang}
        defaultTitle={isArabic ? "إدارة العضوية" : "Manage Membership"}
        defaultSubtitle={isArabic
          ? "أدر حسابك وعضويتك بسهولة من خلال لوحة التحكم"
          : "Manage your account and membership easily through the dashboard"}
      />

      {/* Login Prompt */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <div className="bg-surface rounded-3xl p-12 shadow-sm border border-border">
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

          {/* Features */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text mb-4">
              {isArabic ? "ما يمكنك إدارته" : "What You Can Manage"}
            </h2>
            <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <div key={i} className="bg-surface rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-border hover:border-primary/20 text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-text mb-3">{feature.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {isArabic ? "ليس لديك عضوية بعد؟" : "Don't have a membership yet?"}
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            {isArabic ? "انضم الآن واستمتع بجميع المزايا" : "Join now and enjoy all the benefits"}
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
