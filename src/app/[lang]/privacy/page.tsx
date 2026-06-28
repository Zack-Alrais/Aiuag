import { Shield, Eye, Lock, Cookie, Users, FileText, Bell } from "lucide-react";
import HeroSection from "@/components/ui/hero-section";

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const sections = [
    {
      icon: FileText,
      title: isArabic ? "جمع المعلومات" : "Information Collection",
      content: isArabic
        ? "نقوم بجمع المعلومات الشخصية التي تقدمها طوعاً عند التسجيل في العضوية أو ملء النماذج، بما في ذلك الاسم الكامل وعنوان البريد الإلكتروني ورقم الهاتف والعنوان. كما نجمع معلومات غير شخصية تلقائياً مثل نوع المتصفح وعنوان IP وأنشطة التصفح لتحسين تجربة المستخدم."
        : "We collect personal information you voluntarily provide when registering for membership or filling out forms, including full name, email address, phone number, and address. We also automatically collect non-personal information such as browser type, IP address, and browsing activities to improve user experience."
    },
    {
      icon: Eye,
      title: isArabic ? "استخدام المعلومات" : "Information Usage",
      content: isArabic
        ? "نستخدم المعلومات الشخصية لتقديم الخدمات المطلوبة، بما في ذلك إدارة العضوية والتواصل معك بشأن الفعاليات والبرامج. كما نستخدمها لتحسين خدماتنا وإرسال النشرات الإخبارية والتحديثات ذات الصلة. لن نستخدم معلوماتك لأغراض تجارية دون إذنك الصريح."
        : "We use personal information to provide requested services, including managing membership and communicating with you about events and programs. We also use it to improve our services and send relevant newsletters and updates. We will not use your information for commercial purposes without your explicit consent."
    },
    {
      icon: Users,
      title: isArabic ? "مشاركة المعلومات" : "Information Sharing",
      content: isArabic
        ? "لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك فقط في الحالات التالية: مع شركاء موثوقين يساعدون في تشغيل خدماتنا، أو عند الطلب بموجب قانون، أو لحماية حقوقنا وسلامة أعضائنا والجمهور."
        : "We do not sell or rent your personal information to third parties. We may only share your information in the following cases: with trusted partners who help operate our services, when required by law, or to protect our rights and the safety of our members and the public."
    },
    {
      icon: Lock,
      title: isArabic ? "أمن المعلومات" : "Data Security",
      content: isArabic
        ? "نتخذ تدابير أمنية مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الإتلاف. نستخدم تقنيات التشفير الحديثة وقواعد بيانات آمنة. ومع ذلك، لا يمكن ضمان أمان البيانات بنسبة 100% على الإنترنت."
        : "We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or destruction. We use modern encryption technologies and secure databases. However, 100% data security on the internet cannot be guaranteed."
    },
    {
      icon: Cookie,
      title: isArabic ? "ملفات تعريف الارتباط" : "Cookies",
      content: isArabic
        ? "نستخدم ملفات تعريف الارتباط وتقنيات تتبع مشابهة لتحسين تجربة التصفح وفهم كيفية استخدام موقعنا. يمكنك التحكم في إعدادات ملفات تعريف الارتباط من خلال متصفحك. تعطيل ملفات تعريف الارتباط قد يؤثر على بعض وظائف الموقع."
        : "We use cookies and similar tracking technologies to improve browsing experience and understand how our site is used. You can control cookie settings through your browser. Disabling cookies may affect some website functions."
    },
    {
      icon: Users,
      title: isArabic ? "خصوصية الأطفال" : "Children's Privacy",
      content: isArabic
        ? "خدماتنا مخصصة للأفراد الذين بلغوا 18 عاماً أو أكثر. لا نجمع عمدًا معلومات شخصية من الأطفال تحت 18 عاماً. إذا علمنا أننا جمعنا معلومات من طفل دون 18 عاماً، سنقوم بحذفها فوراً."
        : "Our services are intended for individuals who are 18 years of age or older. We do not knowingly collect personal information from children under 18. If we learn that we have collected information from a child under 18, we will delete it immediately."
    },
    {
      icon: Bell,
      title: isArabic ? "التغييرات على سياسة الخصوصية" : "Changes to Privacy Policy",
      content: isArabic
        ? "نحتفظ بالحق في تحديث سياسة الخصوصية هذه في أي وقت. سنقوم بإشعارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار بارز على موقعنا. استخدامك المستمر لخدماتنا بعد أي تغييرات يشكل قبولاً للتعديلات."
        : "We reserve the right to update this privacy policy at any time. We will notify you of any material changes via email or through a prominent notice on our website. Your continued use of our services after any changes constitutes acceptance of the modifications."
    },
  ];

  return (
    <div dir={dir}>
      <HeroSection
        pageSlug="privacy"
        lang={lang}
        defaultTitle={isArabic ? "سياسة الخصوصية" : "Privacy Policy"}
        defaultSubtitle={isArabic ? "نحترم خصوصيتك ونلتزم بحماية معلوماتك الشخصية" : "We respect your privacy and are committed to protecting your personal information"}
      >
        <div className="max-w-3xl mx-auto text-center">
          <Shield className="w-16 h-16 text-white mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {isArabic ? "سياسة الخصوصية" : "Privacy Policy"}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            {isArabic ? "نحترم خصوصيتك ونلتزم بحماية معلوماتك الشخصية" : "We respect your privacy and are committed to protecting your personal information"}
          </p>
          <p className="text-white/60 text-sm mt-4">
            {isArabic ? "آخر تحديث: يناير 2026" : "Last updated: January 2026"}
          </p>
        </div>
      </HeroSection>

      {/* Content */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Introduction */}
          <div className="bg-surface rounded-2xl p-8 shadow-sm mb-8">
            <p className="text-text-secondary leading-relaxed">
              {isArabic
                ? "مرحباً بك في سياسة الخصوصية لرابطة خريجي جامعة أفريقيا العالمية (AIUAG). نلتزم بحماية خصوصيتك و ensure that your personal information is handled responsibly. هذه السياسة تشرح كيفية جمع واستخدام وحماية معلوماتك."
                : "Welcome to the AIUAG Privacy Policy. We are committed to protecting your privacy and ensuring that your personal information is handled responsibly. This policy explains how we collect, use, and protect your information."}
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, i) => (
              <div key={i} className="bg-surface rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-text">{section.title}</h2>
                </div>
                <p className="text-text-secondary leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="bg-primary rounded-2xl p-8 mt-8 text-center text-white">
            <h3 className="text-xl font-bold mb-3">{isArabic ? "لديك أسئلة؟" : "Have Questions?"}</h3>
            <p className="text-white/80 mb-4">{isArabic ? "تواصل معنا لأي استفسار حول سياسة الخصوصية" : "Contact us for any privacy policy inquiries"}</p>
            <a href={`/${lang}/contact`} className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-xl font-bold hover:bg-secondary/90 transition-all">
              {isArabic ? "تواصل معنا" : "Contact Us"}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
