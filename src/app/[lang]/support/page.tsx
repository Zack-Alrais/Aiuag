"use client";

import { useState, useEffect } from "react";
import { Search, HelpCircle, BookOpen, Users, CreditCard, Headphones, MessageCircle, Phone, Mail } from "lucide-react";
import HeroSection from "@/components/ui/hero-section";

export default function SupportPage({ params }: { params: Promise<{ lang: string }> }) {
  const [lang, setLang] = useState("ar");

  useEffect(() => {
    params.then((p) => setLang(p.lang));
  }, [params]);
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";
  const [searchQuery, setSearchQuery] = useState("");

  const helpCategories = [
    { icon: BookOpen, title: isArabic ? "العضوية" : "Membership", desc: isArabic ? "معلومات عن العضوية والتسجيل والتجديد" : "Information about membership, registration, and renewal", count: 5 },
    { icon: CreditCard, title: isArabic ? "المدفوعات" : "Payments", desc: isArabic ? "الأسئلة المتعلقة بالتبرعات والدفع" : "Questions about donations and payments", count: 3 },
    { icon: Users, title: isArabic ? "الأحداث" : "Events", desc: isArabic ? "تفاصيل الأحداث والحضور" : "Event details and attendance", count: 4 },
    { icon: Headphones, title: isArabic ? "الدعم الفني" : "Technical Support", desc: isArabic ? "مساعدة في استخدام الموقع والمنصة" : "Help with using the website and platform", count: 6 },
  ];

  const quickLinks = [
    { title: isArabic ? "كيف أسجل في العضوية؟" : "How do I register for membership?", category: isArabic ? "عضوية" : "Membership" },
    { title: isArabic ? "كيف أغير كلمة المرور؟" : "How do I change my password?", category: isArabic ? "حسابي" : "My Account" },
    { title: isArabic ? "كيف أحجز مقعد في حدث؟" : "How do I book an event seat?", category: isArabic ? "أحداث" : "Events" },
    { title: isArabic ? "هل يمكنني استرداد التبرع؟" : "Can I get a refund on my donation?", category: isArabic ? "تبرعات" : "Donations" },
    { title: isArabic ? "كيف أحمل شهادتي؟" : "How do I download my certificate?", category: isArabic ? "حسابي" : "My Account" },
  ];

  return (
    <div dir={dir}>
      <HeroSection
        pageSlug="support"
        lang={lang}
        defaultTitle={isArabic ? "مركز المساعدة" : "Help Center"}
        defaultSubtitle={isArabic ? "كيف يمكننا مساعدتك اليوم؟" : "How can we help you today?"}
      >
        <div className="max-w-3xl mx-auto text-center">
          <Headphones className="w-16 h-16 text-white mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {isArabic ? "مركز المساعدة" : "Help Center"}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            {isArabic ? "كيف يمكننا مساعدتك اليوم؟" : "How can we help you today?"}
          </p>
        </div>
      </HeroSection>

      {/* Search */}
      <section className="py-8 bg-background border-b border-border">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="relative">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isArabic ? "ابحث عن مساعدة..." : "Search for help..."}
              className="w-full h-12 rounded-xl border border-border bg-surface ps-12 pe-4 text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              dir={dir}
            />
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text mb-4">
              {isArabic ? "اختر موضوعاً" : "Choose a Topic"}
            </h2>
            <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {helpCategories.map((cat, i) => (
              <div key={i} className="bg-surface rounded-2xl p-6 text-center shadow-sm hover:shadow-lg transition-all cursor-pointer hover:border-primary/30 border border-border group">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <cat.icon className="w-8 h-8 text-primary group-hover:text-white" />
                </div>
                <h3 className="font-bold text-text mb-2">{cat.title}</h3>
                <p className="text-text-secondary text-sm mb-3">{cat.desc}</p>
                <span className="text-primary text-sm font-medium">{isArabic ? `${cat.count} مقال` : `${cat.count} articles`}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20 bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text mb-4">
              {isArabic ? "أسئلة سريعة" : "Quick Questions"}
            </h2>
            <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {quickLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-4 bg-background rounded-xl p-4 border border-border hover:border-primary/30 transition-all cursor-pointer">
                <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-text text-sm">{link.title}</p>
                </div>
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded shrink-0">{link.category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support CTA */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <MessageCircle className="w-12 h-12 text-secondary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {isArabic ? "لم تجد الإجابة؟" : "Didn't Find Your Answer?"}
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            {isArabic ? "فريق الدعم لدينا جاهز لمساعدتك. تواصل معنا وسنرد في أقرب وقت ممكن." : "Our support team is ready to help. Contact us and we'll respond as soon as possible."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={`/${lang}/contact`} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-white rounded-xl text-lg font-bold hover:bg-secondary/90 transition-all">
              <Mail className="w-5 h-5" />
              {isArabic ? "تواصل معنا" : "Contact Us"}
            </a>
            <a href="tel:+249114210853" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white border-2 border-white/30 rounded-xl text-lg font-bold hover:bg-white/20 transition-all">
              <Phone className="w-5 h-5" />
              +249 11 421 0853
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
