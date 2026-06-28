import prisma from "@/lib/prisma";
import { Calendar, Tag, ChevronLeft, ChevronRight, User, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";

export default async function NewsDetailPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params;
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const news = await prisma.news.findFirst({
    where: {
      status: "published",
      OR: [{ slug: id }, { id }],
    },
    include: { author: { select: { name: true } } },
  });

  if (!news) notFound();

  const title = isArabic ? news.titleAr : news.titleEn;
  const content = isArabic ? news.contentAr : news.contentEn;
  const excerpt = isArabic ? news.excerptAr : news.excerptEn;
  const date = news.publishedAt ? formatDate(news.publishedAt, lang) : "";

  return (
    <div dir={dir}>
      {/* Hero */}
      <section className="relative py-16 bg-gradient-to-br from-primary via-primary-light to-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 start-20 w-72 h-72 rounded-full bg-secondary blur-3xl" />
          <div className="absolute bottom-20 end-20 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {news.category && (
              <span className="inline-block px-3 py-1 bg-secondary text-white text-xs font-bold rounded-full mb-4">
                {news.category}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h1>
            <div className="flex items-center justify-center gap-4 text-white/70 text-sm flex-wrap">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {date}</span>
              {news.author?.name && (
                <span className="flex items-center gap-1"><User className="w-4 h-4" /> {news.author.name}</span>
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60L60 52.5C120 45 240 30 360 22.5C480 15 600 15 720 18.75C840 22.5 960 30 1080 33.75C1200 37.5 1320 37.5 1380 37.5L1440 37.5V60H0Z" fill="var(--color-background)" />
          </svg>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Link
              href={`/${lang}/news`}
              className="inline-flex items-center gap-1 text-primary font-medium hover:gap-2 transition-all mb-8"
            >
              {isArabic ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              {isArabic ? "العودة للأخبار" : "Back to News"}
            </Link>

            <article className="bg-surface rounded-2xl p-6 md:p-10 shadow-sm">
              {news.featuredImage ? (
                <img
                  src={news.featuredImage}
                  alt={title}
                  className="w-full h-64 md:h-80 object-cover rounded-xl mb-8"
                />
              ) : (
                <div className="h-64 md:h-80 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl mb-8 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Tag className="w-16 h-16 text-primary/20" />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mb-6 pb-6 border-b border-border">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {date}</span>
                {news.author?.name && (
                  <span className="flex items-center gap-1"><User className="w-4 h-4" /> {news.author.name}</span>
                )}
              </div>

              {excerpt && (
                <p className="text-lg font-medium text-text mb-6 italic border-r-4 border-primary pr-4">
                  {excerpt}
                </p>
              )}

              <div className="prose prose-lg max-w-none">
                <p className="text-text-secondary leading-relaxed whitespace-pre-line">{content}</p>
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <Link
                  href={`/${lang}/news`}
                  className="inline-flex items-center gap-1 text-primary font-medium hover:gap-2 transition-all"
                >
                  {isArabic ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  {isArabic ? "العودة للأخبار" : "Back to News"}
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
