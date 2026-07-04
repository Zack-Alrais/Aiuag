"use client";

import { useState, useEffect } from "react";
import { Calendar, Search, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Tag } from "lucide-react";
import Link from "next/link";
import ScrollReveal from "@/components/ui/scroll-reveal";
import HeroSection from "@/components/ui/hero-section-client";

export default function NewsPage({ params }: { params: Promise<{ lang: string }> }) {
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("ar");

  useEffect(() => {
    params.then(({ lang: l }) => setLang(l));
  }, [params]);

  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  useEffect(() => {
    fetch("/api/public/news")
      .then((res) => res.json())
      .then((data) => setNewsItems(Array.isArray(data) ? data : []))
      .catch(() => setNewsItems([]))
      .finally(() => setLoading(false));
  }, []);

  const featuredNews = newsItems.length > 0 ? newsItems[0] : null;
  const remainingNews = newsItems.length > 1 ? newsItems.slice(1) : [];

  const categories = [
    { id: "all", label: isArabic ? "الكل" : "All" },
    { id: "conferences", label: isArabic ? "مؤتمرات" : "Conferences" },
    { id: "forums", label: isArabic ? "مهرجانات" : "Forums" },
    { id: "projects", label: isArabic ? "مشاريع" : "Projects" },
    { id: "workshops", label: isArabic ? "ورش عمل" : "Workshops" },
    { id: "initiatives", label: isArabic ? "مبادرات" : "Initiatives" },
    { id: "partnerships", label: isArabic ? "شراكات" : "Partnerships" },
  ];

  if (loading) {
    return (
      <div dir={dir}>
        <div className="bg-gradient-to-br from-primary via-primary-light to-primary-dark py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-pulse bg-white/20 h-8 w-48 mx-auto rounded-full mb-3" />
            <div className="animate-pulse bg-white/10 h-4 w-64 mx-auto rounded" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-10 w-80 mx-auto rounded-full mb-8" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`bg-surface rounded-2xl overflow-hidden border border-border ${i === 0 ? "md:col-span-2" : ""}`}>
                <div className={`animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light ${i === 0 ? "h-64" : "h-44"}`} />
                <div className="p-5 space-y-3">
                  <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-2 w-20 rounded-full" />
                  <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-5 w-3/4 rounded" />
                  <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-3 w-full rounded" />
                  <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-3 w-2/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir={dir}>
      <HeroSection
        pageSlug="news"
        lang={lang}
        defaultTitle={isArabic ? "الأخبار" : "News"}
        defaultSubtitle={isArabic
          ? "تابع آخر أخبار وفعاليات رابطة خريجي جامعة أفريقيا العالمية"
          : "Follow the latest news and events of the Africa International University Alumni Association"}
        badge={
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm">
            <Tag className="w-4 h-4" />
            <span>{isArabic ? "آخر الأخبار" : "Latest News"}</span>
          </div>
        }
      />

      {/* Search & Categories */}
      <ScrollReveal direction="up"><section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-6">
            <div className="relative">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary ${isArabic ? "right-4" : "left-4"}`} />
              <input
                type="text"
                placeholder={isArabic ? "ابحث في الأخبار..." : "Search news..."}
                className={`w-full py-3 px-12 bg-surface border border-border rounded-xl focus:outline-none focus:border-primary transition-colors text-text`}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  cat.id === "all"
                    ? "bg-primary text-white"
                    : "bg-surface text-text-secondary hover:bg-primary/10 hover:text-primary border border-border"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section></ScrollReveal>

      {/* Featured News */}
      {featuredNews && (
        <ScrollReveal direction="up"><section className="py-8 bg-background">
          <div className="container mx-auto px-4">
            <article className="bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group">
              <div className="grid md:grid-cols-2">
                <div className="h-64 md:h-auto bg-gradient-to-br from-primary to-primary-light relative overflow-hidden">
                  {featuredNews.featuredImage ? (
                    <img
                      src={featuredNews.featuredImage}
                      alt={featuredNews.titleAr || featuredNews.titleEn || ""}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <span className="absolute top-4 start-4 px-3 py-1 bg-secondary text-white text-xs font-bold rounded-full">
                    {isArabic ? "مميز" : "Featured"}
                  </span>
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-3 w-fit">
                    {featuredNews.category || ""}
                  </span>
                  <div className="flex items-center gap-2 text-text-secondary text-sm mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>{featuredNews.publishedAt ? new Date(featuredNews.publishedAt).toLocaleDateString(isArabic ? "ar" : "en") : ""}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-text mb-3 group-hover:text-primary transition-colors">
                    {isArabic ? (featuredNews.titleAr || featuredNews.title || "") : (featuredNews.titleEn || featuredNews.title || "")}
                  </h2>
                  <p className="text-text-secondary mb-4 line-clamp-3">
                    {isArabic ? (featuredNews.excerptAr || featuredNews.excerpt || "") : (featuredNews.excerptEn || featuredNews.excerpt || "")}
                  </p>
                  <Link
                    href={`/${lang}/news/${featuredNews.slug || featuredNews.id}`}
                    className="inline-flex items-center gap-1 text-primary font-medium hover:gap-2 transition-all w-fit"
                  >
                    {isArabic ? "اقرأ المزيد" : "Read More"}
                    {isArabic ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </section></ScrollReveal>
      )}

      {/* News Grid */}
      <ScrollReveal direction="up"><section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {remainingNews.map((news: any) => (
              <article
                key={news.id}
                className="bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
              >
                <div className="h-44 bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
                  {news.featuredImage ? (
                    <img
                      src={news.featuredImage}
                      alt={news.titleAr || news.titleEn || ""}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                  <span className="absolute top-3 start-3 px-2 py-0.5 bg-secondary text-white text-xs font-bold rounded-full">
                    {news.category || ""}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-text-secondary text-xs mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{news.publishedAt ? new Date(news.publishedAt).toLocaleDateString(isArabic ? "ar" : "en") : ""}</span>
                  </div>
                  <h3 className="text-base font-bold text-text mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {isArabic ? (news.titleAr || news.title || "") : (news.titleEn || news.title || "")}
                  </h3>
                  <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                    {isArabic ? (news.excerptAr || news.excerpt || "") : (news.excerptEn || news.excerpt || "")}
                  </p>
                  <Link
                    href={`/${lang}/news/${news.slug || news.id}`}
                    className="inline-flex items-center gap-1 text-primary font-medium text-sm hover:gap-2 transition-all"
                  >
                    {isArabic ? "اقرأ المزيد" : "Read More"}
                    {isArabic ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 mt-12">
            <button className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center">
              {isArabic ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-all ${
                  page === 1
                    ? "bg-primary text-white"
                    : "bg-surface text-text-secondary hover:bg-primary/10 border border-border"
                }`}
              >
                {page}
              </button>
            ))}
            <button className="w-10 h-10 rounded-lg bg-surface text-text-secondary hover:bg-primary/10 border border-border flex items-center justify-center">
              {isArabic ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
        </section></ScrollReveal>
    </div>
  );
}
