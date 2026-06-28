import { FileText, Scale, Users, AlertTriangle, Shield, Globe, Mail } from "lucide-react";
import HeroSection from "@/components/ui/hero-section";

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const sections = [
    {
      icon: FileText,
      title: isArabic ? "المقدمة" : "Introduction",
      content: isArabic
        ? "مرحباً بك في شروط الخدمة لرابطة خريجي جامعة أفريقيا العالمية (AIUAG). bằng استخدامك لموقعنا وخدماتنا، أنت توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية قبل استخدام خدماتنا."
        : "Welcome to the AIUAG Terms of Service. By using our website and services, you agree to comply with these terms and conditions. Please read them carefully before using our services."
    },
    {
      icon: Users,
      title: isArabic ? "الأهلية والعضوية" : "Eligibility & Membership",
      content: isArabic
        ? "يجب أن تكون خريجاً من جامعة أفريقيا العالمية أو طالباً حاليها للحصول على العضوية. يجب تقديم معلومات دقيقة وصحيحة عند التسجيل. نحتفظ بالحق في رفض أو إلغاء العضوية في حالة تقديم معلومات كاذبة أو انتهاك هذه الشروط."
        : "You must be a graduate or current student of Africa International University to obtain membership. You must provide accurate and correct information when registering. We reserve the right to refuse or cancel membership if false information is provided or these terms are violated."
    },
    {
      icon: Scale,
      title: isArabic ? "الحقوق والمسؤوليات" : "Rights & Responsibilities",
      content: isArabic
        ? "لك الحق في الوصول إلى خدماتنا والاستفادة منها وفقاً لخطتك. أنت مسؤول عن الحفاظ على سرية حسابك وكلمة المرور. أنت مسؤول عن جميع الأنشطة التي تحدث تحت حسابك. يجب ألا تستخدم خدماتنا لأي أغراض غير قانونية أو ضارة."
        : "You have the right to access and use our services according to your plan. You are responsible for maintaining the confidentiality of your account and password. You are responsible for all activities that occur under your account. You must not use our services for any illegal or harmful purposes."
    },
    {
      icon: AlertTriangle,
      title: isArabic ? "القيود والاستثناءات" : "Limitations & Exclusions",
      content: isArabic
        ? "لا نضمن دقة أو اكتمال المعلومات المقدمة على موقعنا. خدماتنا مقدمة 'كما هي' دون ضمانات من أي نوع. لا نتحمل المسؤولية عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام خدماتنا. نحتفظ بالحق في تعديل أو إيقاف أي خدمة في أي وقت."
        : "We do not guarantee the accuracy or completeness of information provided on our website. Our services are provided 'as is' without warranties of any kind. We are not liable for any direct or indirect damages resulting from the use of our services. We reserve the right to modify or discontinue any service at any time."
    },
    {
      icon: Shield,
      title: isArabic ? "الملكية الفكرية" : "Intellectual Property",
      content: isArabic
        ? "جميع المحتويات والمعلومات على موقعنا محمية بحقوق الملكية الفكرية. لا يجوز نسخ أو توزيع أو تعديل أي محتوى دون إذن مسبق كتابياً. العلامات التجارية والشعارات المستخدمة في خدماتنا مملوكة لنا أو لمرخصينا."
        : "All content and information on our website are protected by intellectual property rights. No content may be copied, distributed, or modified without prior written permission. The trademarks and logos used in our services are owned by us or our licensors."
    },
    {
      icon: Globe,
      title: isArabic ? "القانون الحاكم" : "Governing Law",
      content: isArabic
        ? "تخضع هذه الشروط والأحكام لقوانين جمهورية السودان. أي نزاع ينشأ عن هذه الشروط أو يتعلق بها يخضع للاختصاص الحصري للمحاكم المختصة في الختوم. نسعى لحل أي خلافات ودياً قبل اللجوء إلى الإجراءات القانونية."
        : "These terms and conditions are governed by the laws of the Republic of Sudan. Any dispute arising from or relating to these terms shall be subject to the exclusive jurisdiction of the competent courts in Khartoum. We seek to resolve any disputes amicably before resorting to legal proceedings."
    },
    {
      icon: Mail,
      title: isArabic ? "التواصل" : "Contact",
      content: isArabic
        ? "إذا كانت لديك أي أسئلة أو استفسارات حول هذه الشروط، يرجى التواصل معنا عبر البريد الإلكتروني aiuagho@gmail.com أو على الهاتف +249 11 421 0853. نحن متاحون للإجابة على استفساراتك."
        : "If you have any questions or inquiries about these terms, please contact us via email aiuagho@gmail.com or phone +249 11 421 0853. We are available to answer your inquiries."
    },
  ];

  return (
    <div dir={dir}>
      <HeroSection
        pageSlug="terms"
        lang={lang}
        defaultTitle={isArabic ? "الشروط والأحكام" : "Terms of Service"}
        defaultSubtitle={isArabic ? "الشروط والأحكام التي تحكم استخدامك لخدماتنا" : "The terms and conditions governing your use of our services"}
      >
        <div className="max-w-3xl mx-auto text-center">
          <Scale className="w-16 h-16 text-white mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {isArabic ? "الشروط والأحكام" : "Terms of Service"}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            {isArabic ? "الشروط والأحكام التي تحكم استخدامك لخدماتنا" : "The terms and conditions governing your use of our services"}
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
                ? "باستخدامك لموقعنا وخدماتنا، أنت تؤكد أنك قرأت وفهمت هذه الشروط وتوافق على الالتزام بها. إذا لم توافق على أي من هذه الشروط، يرجى عدم استخدام خدماتنا."
                : "By using our website and services, you acknowledge that you have read and understood these terms and agree to comply with them. If you do not agree to any of these terms, please do not use our services."}
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

          {/* Acceptance */}
          <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-8 mt-8">
            <h3 className="text-lg font-bold text-text mb-3">{isArabic ? "القبول بالشروط" : "Acceptance of Terms"}</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              {isArabic
                ? "باستخدامك لموقعنا وخدماتنا، أنت توافق صراحةً على الالتزام بهذه الشروط والأحكام. نحتفظ بالحق في تعديل هذه الشروط في أي وقت، ويشكل استمرار استخدامك للخدمات بعد أي تعديلات قبولاً لها."
                : "By using our website and services, you expressly agree to comply with these terms and conditions. We reserve the right to modify these terms at any time, and continued use of the services after any modifications constitutes acceptance of them."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
