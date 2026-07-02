import Link from "next/link";
import { Users, Calendar, FolderOpen, Award, ArrowLeft, ArrowRight, Heart, BookOpen, MapPin, Phone, Mail, ChevronLeft, ChevronRight, Clock, Star } from "lucide-react";
import HeroSection from "@/components/ui/hero-section";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface HomeProps {
  params: Promise<{ lang: string }>;
}

export default async function HomePage({ params }: HomeProps) {
  const { lang } = await params;
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  // Fetch dynamic data in parallel
  const [galleryImages, latestNews, upcomingEvents, featuredProjects] = await Promise.all([
    prisma.gallery.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }).catch(() => []),
    prisma.news.findMany({
      where: { status: "published" },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        titleAr: true,
        titleEn: true,
        slug: true,
        excerptAr: true,
        excerptEn: true,
        featuredImage: true,
        category: true,
        publishedAt: true,
        createdAt: true,
      },
    }).catch(() => []),
    prisma.event.findMany({
      where: { status: { in: ["upcoming", "ongoing"] } },
      orderBy: { date: "asc" },
      take: 3,
      select: {
        id: true,
        titleAr: true,
        titleEn: true,
        slug: true,
        date: true,
        time: true,
        location: true,
        status: true,
      },
    }).catch(() => []),
    prisma.project.findMany({
      where: { status: { in: ["active", "completed"] } },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        titleAr: true,
        titleEn: true,
        slug: true,
        descriptionAr: true,
        descriptionEn: true,
        status: true,
        featuredImage: true,
      },
    }).catch(() => []),
  ]);

  // Count stats from DB
  const [memberCount, eventCount, projectCount] = await Promise.all([
    prisma.member.count({ where: { status: "approved" } }).catch(() => 0),
    prisma.event.count().catch(() => 0),
    prisma.project.count().catch(() => 0),
  ]);

  const stats = [
    { icon: Users, value: `${memberCount > 0 ? memberCount.toLocaleString() : "2,500"}+`, label: isArabic ? "عضو مسجل" : "Registered Members" },
    { icon: Calendar, value: `${eventCount > 0 ? eventCount : "50"}+`, label: isArabic ? "حدث وفعالية" : "Events & Activities" },
    { icon: FolderOpen, value: `${projectCount > 0 ? projectCount : "100"}+`, label: isArabic ? "مشروع تنفيذي" : "Implemented Projects" },
    { icon: Award, value: "10+", label: isArabic ? "سنوات من العطاء" : "Years of Giving" },
  ];

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "";
    return date.toLocaleDateString(isArabic ? "ar" : "en", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getMonthDay = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleDateString(isArabic ? "ar" : "en", { month: "short" });
    return { day: day.toString().padStart(2, "0"), month };
  };

  const getStatusLabel = (status: string) => {
    if (status === "active") return isArabic ? "نشط" : "Active";
    if (status === "completed") return isArabic ? "مكتمل" : "Completed";
    if (status === "upcoming") return isArabic ? "قادم" : "Upcoming";
    if (status === "ongoing") return isArabic ? "جاري" : "Ongoing";
    return status;
  };

  return (
    <div dir={dir}>
      {/* Hero Section */}
      <HeroSection
        pageSlug="home"
        lang={lang}
        defaultTitle={isArabic ? "رابطة خريجي جامعة أفريقيا العالمية" : "Association of IUA Graduates"}
        defaultSubtitle={isArabic ? "نجمع الخريجين لبناء مستقبل أفضل — رابطة مهنية واجتماعية تخدم المجتمع والتنمية" : "Uniting graduates for a better future — A professional and social association serving the community"}
        gradient="from-primary via-primary-light to-primary"
      >
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8 animate-fade-in">
            <img
              src="/uploads/شعار الرابطة.jpg"
              alt="AIUAG Logo"
              className="w-28 h-28 mx-auto rounded-full object-cover border-2 border-white/30"
            />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in leading-tight">
            {isArabic ? "رابطة خريجي جامعة أفريقيا العالمية" : "Association of IUA Graduates"}
          </h1>

          <p className="text-xl md:text-2xl text-white/80 mb-8 animate-fade-in leading-relaxed">
            {isArabic
              ? "نجمع الخريجين لبناء مستقبل أفضل — رابطة مهنية واجتماعية تخدم المجتمع والتنمية"
              : "Uniting graduates for a better future — A professional and social association serving the community"}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link
              href={`/${lang}/membership/apply`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-white rounded-xl text-lg font-bold hover:bg-secondary/90 transition-all hover:scale-105 shadow-lg"
            >
              {isArabic ? "انضم إلينا" : "Join Us"}
              {isArabic ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            </Link>
            <Link
              href={`/${lang}/about`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white border-2 border-white/30 rounded-xl text-lg font-bold hover:bg-white/20 transition-all"
            >
              {isArabic ? "اعرف المزيد" : "Learn More"}
            </Link>
          </div>
        </div>
      </HeroSection>

      {/* Statistics Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-surface rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-text-secondary text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      {latestNews.length > 0 && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
                {isArabic ? "آخر الأخبار" : "Latest News"}
              </h2>
              <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
              {latestNews.map((news) => (
                <article key={news.id} className="bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group">
                  <div className="h-48 bg-gradient-to-br from-primary to-primary-light relative overflow-hidden">
                    {news.featuredImage && (
                      <img src={news.featuredImage} alt={isArabic ? news.titleAr : news.titleEn} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <span className="absolute top-4 start-4 px-3 py-1 bg-secondary text-white text-xs font-bold rounded-full">
                      {news.category || (isArabic ? "أخبار" : "News")}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-text-secondary text-sm mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(news.publishedAt || news.createdAt)}</span>
                    </div>
                    <h3 className="text-lg font-bold text-text mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {isArabic ? news.titleAr : news.titleEn}
                    </h3>
                    <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                      {isArabic ? (news.excerptAr || "") : (news.excerptEn || "")}
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

            <div className="text-center mt-8">
              <Link
                href={`/${lang}/news`}
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary hover:text-white transition-all"
              >
                {isArabic ? "عرض جميع الأخبار" : "View All News"}
                {isArabic ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {galleryImages.length > 0 && (
        <section className="py-16 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
                {isArabic ? "معرض الصور" : "Photo Gallery"}
              </h2>
              <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                {isArabic ? "لحظات لا تُنسى من فعالياتنا وأنشطةنا" : "Unforgettable moments from our events and activities"}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {galleryImages.slice(0, 8).map((image) => (
                <div key={image.id} className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl overflow-hidden relative group cursor-pointer">
                  <img
                    src={image.imageUrl}
                    alt={image.title || ""}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 inset-x-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs font-bold truncate">{image.title}</p>
                    <p className="text-[10px] text-white/70">{formatDate(image.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href={`/${lang}/media/gallery`}
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary hover:text-white transition-all"
              >
                {isArabic ? "عرض المعرض كاملاً" : "View Full Gallery"}
                {isArabic ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events Section */}
      {upcomingEvents.length > 0 && (
        <section className="py-20 bg-surface">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
                {isArabic ? "الأحداث القادمة" : "Upcoming Events"}
              </h2>
              <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => {
                const { day, month } = getMonthDay(event.date);
                return (
                  <div key={event.id} className="bg-background rounded-2xl p-6 border border-border hover:border-primary/30 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-primary rounded-xl flex flex-col items-center justify-center text-white shrink-0">
                        <span className="text-xs font-bold">{day}</span>
                        <span className="text-lg font-bold">{month}</span>
                      </div>
                      <div className="flex-1">
                        <span className="inline-block px-2 py-0.5 bg-accent/10 text-accent text-xs font-bold rounded mb-2">
                          {getStatusLabel(event.status)}
                        </span>
                        <h3 className="font-bold text-text mb-2">
                          {isArabic ? event.titleAr : event.titleEn}
                        </h3>
                        {event.time && (
                          <div className="flex items-center gap-2 text-text-secondary text-sm mb-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{event.time}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-text-secondary text-sm">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-8">
              <Link
                href={`/${lang}/events`}
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary hover:text-white transition-all"
              >
                {isArabic ? "عرض جميع الأحداث" : "View All Events"}
                {isArabic ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Projects Section */}
      {featuredProjects.length > 0 && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
                {isArabic ? "المشاريع المميزة" : "Featured Projects"}
              </h2>
              <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <div key={project.id} className="bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group">
                  <div className="h-48 bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center relative overflow-hidden">
                    {project.featuredImage ? (
                      <img src={project.featuredImage} alt={isArabic ? project.titleAr : project.titleEn} className="w-full h-full object-cover" />
                    ) : (
                      <FolderOpen className="w-16 h-16 text-secondary/40" />
                    )}
                  </div>
                  <div className="p-6">
                    <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full mb-3">
                      {getStatusLabel(project.status)}
                    </span>
                    <h3 className="text-lg font-bold text-text mb-2 group-hover:text-primary transition-colors">
                      {isArabic ? project.titleAr : project.titleEn}
                    </h3>
                    <p className="text-text-secondary text-sm line-clamp-2">
                      {isArabic ? project.descriptionAr : project.descriptionEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href={`/${lang}/projects`}
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary hover:text-white transition-all"
              >
                {isArabic ? "عرض جميع المشاريع" : "View All Projects"}
                {isArabic ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-primary-light rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 start-10 w-40 h-40 rounded-full bg-secondary blur-3xl" />
              <div className="absolute bottom-10 end-10 w-60 h-60 rounded-full bg-accent blur-3xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {isArabic ? "انضم إلى عائلة الرابطة" : "Join the Association Family"}
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                {isArabic
                  ? "كن جزءاً من شبكة واسعة من خريجي جامعة أفريقيا العالمية واستفد من المزايا والعروض الحصرية"
                  : "Be part of a vast network of Africa International University graduates and benefit from exclusive benefits and offers"}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/${lang}/membership/apply`}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-white rounded-xl text-lg font-bold hover:bg-secondary/90 transition-all hover:scale-105"
                >
                  <Users className="w-5 h-5" />
                  {isArabic ? "طلب عضوية" : "Apply for Membership"}
                </Link>
                <Link
                  href={`/${lang}/donations`}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white border-2 border-white/30 rounded-xl text-lg font-bold hover:bg-white/20 transition-all"
                >
                  <Heart className="w-5 h-5" />
                  {isArabic ? "تبرع الآن" : "Donate Now"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Quick Info */}
      <section className="py-16 bg-surface border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold text-text mb-2">{isArabic ? "العنوان" : "Address"}</h3>
              <p className="text-text-secondary text-sm">
                {isArabic ? "الخرطوم - السودان" : "Khartoum - Sudan"}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold text-text mb-2">{isArabic ? "الهاتف" : "Phone"}</h3>
              <a href="tel:+249114210853" className="text-text-secondary text-sm hover:text-primary">
                +249114210853
              </a>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold text-text mb-2">{isArabic ? "البريد الإلكتروني" : "Email"}</h3>
              <a href="mailto:aiuagho@gmail.com" className="text-text-secondary text-sm hover:text-primary">
                aiuagho@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
