"use client";

import { useState, useEffect } from "react";
import { Search, HelpCircle, Users, Calendar, Heart, Briefcase } from "lucide-react";
import HeroSection from "@/components/ui/hero-section";

export default function FaqPage({ params }: { params: Promise<{ lang: string }> }) {
  const [lang] = useState("ar");
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";
  const [searchQuery, setSearchQuery] = useState("");
  const [openItem, setOpenItem] = useState<string | null>(null);

  const [faqData, setFaqData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryIconMap: Record<string, any> = {
    "عضوية": Users,
    "Membership": Users,
    "أحداث": Calendar,
    "Events": Calendar,
    "تبرعات": Heart,
    "Donations": Heart,
    "خدمات": Briefcase,
    "Services": Briefcase,
  };

  useEffect(() => {
    fetch("/api/public/faqs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const grouped: Record<string, any[]> = {};
          data.forEach((faq: any) => {
            const cat = faq.category || (isArabic ? "عام" : "General");
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push({
              q: isArabic ? faq.questionAr : faq.questionEn,
              a: isArabic ? faq.answerAr : faq.answerEn,
            });
          });
          setFaqData(
            Object.entries(grouped).map(([category, items]) => ({
              category,
              icon: categoryIconMap[category] || HelpCircle,
              items,
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isArabic]);

  const toggleItem = (id: string) => {
    setOpenItem(openItem === id ? null : id);
  };

  const filteredFaq = faqData.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div dir={dir}>
      <HeroSection
        pageSlug="faq"
        lang={lang}
        defaultTitle={isArabic ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
        defaultSubtitle={isArabic ? "إجابات لأكثر الأسئلة شيوعاً حول خدماتنا وعضويتنا" : "Answers to the most common questions about our services and membership"}
      >
        <div className="max-w-3xl mx-auto text-center">
          <HelpCircle className="w-16 h-16 text-white mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {isArabic ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            {isArabic ? "إجابات لأكثر الأسئلة شيوعاً حول خدماتنا وعضويتنا" : "Answers to the most common questions about our services and membership"}
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
              placeholder={isArabic ? "ابحث عن سؤال..." : "Search for a question..."}
              className="w-full h-12 rounded-xl border border-border bg-surface ps-12 pe-4 text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              dir={dir}
            />
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          {loading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, ci) => (
                <div key={ci} className="space-y-3">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light w-10 h-10 rounded-full" />
                    <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-5 w-32 rounded" />
                  </div>
                  <div className="bg-surface rounded-2xl border border-border overflow-hidden">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4 border-b border-border-light last:border-0 space-y-2">
                        <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-4 w-3/4 rounded" />
                        <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-3 w-full rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : filteredFaq.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-text-light mx-auto mb-4" />
              <p className="text-text-secondary text-lg">{isArabic ? "لم يتم العثور على نتائج" : "No results found"}</p>
            </div>
          ) : (
            filteredFaq.map((cat, ci) => (
              <div key={ci} className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <cat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-text">{cat.category}</h2>
                </div>
                <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
                  {cat.items.map((item, ii) => {
                    const id = `${ci}-${ii}`;
                    const isOpen = openItem === id;
                    return (
                      <div key={ii} className="border-b border-border last:border-0">
                        <button
                          onClick={() => toggleItem(id)}
                          className="flex items-center justify-between w-full p-5 text-start hover:bg-background/50 transition-colors"
                        >
                          <span className="font-medium text-text pe-4">{item.q}</span>
                          <svg className={`w-5 h-5 shrink-0 text-text-secondary transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 opacity-100 pb-5 px-5" : "max-h-0 opacity-0"}`}>
                          <p className="text-text-secondary text-sm leading-relaxed">{item.a}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
