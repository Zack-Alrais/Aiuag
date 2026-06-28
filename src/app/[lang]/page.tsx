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

  let galleryImages: any[] = [];
  try {
    galleryImages = await prisma.gallery.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
  } catch {}

  const stats = [
    { icon: Users, value: "2,500+", label: isArabic ? "عضو مسجل" : "Registered Members" },
    { icon: Calendar, value: "50+", label: isArabic ? "حدث وفعالية" : "Events & Activities" },
    { icon: FolderOpen, value: "100+", label: isArabic ? "مشروع تنفيذي" : "Implemented Projects" },
    { icon: Award, value: "10+", label: isArabic ? "سنوات من العطاء" : "Years of Giving" },
  ];

  const latestNews = [
    {
      id: 1,
      title: isArabic ? "المؤتمر الخامس لرابطة الخريجين" : "5th Alumni Association Conference",
      excerpt: isArabic ? "عقد المؤتمر الخامس لرابطة خريجي جامعة أفريقيا العالمية بحضور كبير من أعضاء الرابطة والخريجين" : "The 5th conference of the Alumni Association was held with great attendance",
      date: isArabic ? "15 فبراير 2023" : "February 15, 2023",
      category: isArabic ? "مؤتمرات" : "Conferences",
      image: "/images/news-1.jpg",
    },
    {
      id: 2,
      title: isArabic ? "ملتقى أفريقيا الأول للتنمية" : "First Africa Development Forum",
      excerpt: isArabic ? "إطلاق ملتقى أفريقيا الأول للتنمية بالتعاون مع جامعة أفريقيا العالمية" : "Launch of the First Africa Development Forum in collaboration with Africa International University",
      date: isArabic ? "1 يونيو 2025" : "June 1, 2025",
      category: isArabic ? "مهرجانات" : "Forums",
      image: "/images/news-2.jpg",
    },
    {
      id: 3,
      title: isArabic ? "خطة الإعمار الجامعة" : "University Reconstruction Plan",
      excerpt: isArabic ? "المصادقة على خطة الإعمار الشاملة لجامعة أفريقيا العالمية لتطوير البنية التحتية" : "Approval of the comprehensive reconstruction plan for Africa International University",
      date: isArabic ? "مارس 2024" : "March 2024",
      category: isArabic ? "مشاريع" : "Projects",
      image: "/images/news-3.jpg",
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: isArabic ? "ورشة عمل المهارات المهنية" : "Professional Skills Workshop",
      date: isArabic ? "10 يوليو 2026" : "July 10, 2026",
      time: "09:00 AM",
      location: isArabic ? "قاعة المؤتمرات - جامعة أفريقيا العالمية" : "Conference Hall - Africa International University",
      status: isArabic ? "قادم" : "Upcoming",
    },
    {
      id: 2,
      title: isArabic ? "يوم التوظيف والتوظيف" : "Career Day",
      date: isArabic ? "25 يوليو 2026" : "July 25, 2026",
      time: "10:00 AM",
      location: isArabic ? "المكتبة المركزية" : "Central Library",
      status: isArabic ? "قادم" : "Upcoming",
    },
    {
      id: 3,
      title: isArabic ? "حلقة نقاش حول التنمية المستدامة" : "Sustainable Development Panel",
      date: isArabic ? "5 أغسطس 2026" : "August 5, 2026",
      time: "02:00 PM",
      location: isArabic ? "صالة الندوات" : "Seminar Hall",
      status: isArabic ? "قادم" : "Upcoming",
    },
  ];

  const projects = [
    {
      id: 1,
      title: isArabic ? "إعمار الجامعة" : "University Reconstruction",
      description: isArabic ? "مشروع تطوير البنية التحتية لجامعة أفريقيا العالمية" : "Infrastructure development project for Africa International University",
      status: isArabic ? "جاري التنفيذ" : "In Progress",
    },
    {
      id: 2,
      title: isArabic ? "برنامج الإرشاد الأكاديمي" : "Academic Mentoring Program",
      description: isArabic ? "برنامج لتوجيه الطلاب الحاليين من قبل الخريجين ذوي الخبرة" : "Program for mentoring current students by experienced graduates",
      status: isArabic ? "نشط" : "Active",
    },
    {
      id: 3,
      title: isArabic ? "صندوق المنح الدراسية" : "Scholarship Fund",
      description: isArabic ? "صندوق لدعم الطلاب المحتاجين من خلال المنح الدراسية" : "Fund to support needy students through scholarships",
      status: isArabic ? "نشط" : "Active",
    },
  ];

  const testimonials = [
    {
      name: isArabic ? "أ. أحمد محمد" : "Ahmed Mohammed",
      role: isArabic ? "خريج 2020" : "Class of 2020",
      quote: isArabic ? "لقد غيرت الرابطة حياتي المهنية بشكل كبير من خلال التواصل مع الخريجين" : "The association has greatly changed my professional life through networking with alumni",
    },
    {
      name: isArabic ? "د. فاطمة علي" : "Dr. Fatima Ali",
      role: isArabic ? "خريجة 2018" : "Class of 2018",
      quote: isArabic ? "البرامج التي تقدمها الرابطة مفيدة جداً وتساعد في التطوير المهني" : "The programs offered by the association are very helpful for professional development",
    },
  ];

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
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <span className="absolute top-4 start-4 px-3 py-1 bg-secondary text-white text-xs font-bold rounded-full">
                    {news.category}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-text-secondary text-sm mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>{news.date}</span>
                  </div>
                  <h3 className="text-lg font-bold text-text mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {news.title}
                  </h3>
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                    {news.excerpt}
                  </p>
                  <Link
                    href={`/${lang}/news`}
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
                    <p className="text-[10px] text-white/70">{image.date}</p>
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
      <section className="py-20 bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
              {isArabic ? "الأحداث القادمة" : "Upcoming Events"}
            </h2>
            <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="bg-background rounded-2xl p-6 border border-border hover:border-primary/30 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary rounded-xl flex flex-col items-center justify-center text-white shrink-0">
                    <span className="text-xs font-bold">{event.date.split(" ")[0]}</span>
                    <span className="text-lg font-bold">{event.date.split(" ")[1]}</span>
                  </div>
                  <div className="flex-1">
                    <span className="inline-block px-2 py-0.5 bg-accent/10 text-accent text-xs font-bold rounded mb-2">
                      {event.status}
                    </span>
                    <h3 className="font-bold text-text mb-2">{event.title}</h3>
                    <div className="flex items-center gap-2 text-text-secondary text-sm mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-secondary text-sm">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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

      {/* Featured Projects Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
              {isArabic ? "المشاريع المميزة" : "Featured Projects"}
            </h2>
            <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div key={project.id} className="bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group">
                <div className="h-48 bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center">
                  <FolderOpen className="w-16 h-16 text-secondary/40" />
                </div>
                <div className="p-6">
                  <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full mb-3">
                    {project.status}
                  </span>
                  <h3 className="text-lg font-bold text-text mb-2 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-text-secondary text-sm line-clamp-2">
                    {project.description}
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

      {/* Testimonials Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {isArabic ? "شهادات الخريجين" : "Alumni Testimonials"}
            </h2>
            <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 text-secondary fill-secondary" />
                  ))}
                </div>
                <p className="text-white/90 text-lg mb-6 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div>
                  <div className="font-bold">{testimonial.name}</div>
                  <div className="text-white/60 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
