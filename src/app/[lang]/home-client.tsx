"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import CountUp from "react-countup"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Users, Calendar, FolderOpen, Award, ArrowLeft, ArrowRight, Heart, ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react"
import ScrollReveal from "@/components/ui/scroll-reveal"
import { staggerContainer, staggerItem } from "@/components/ui/motion"

interface HomeClientProps {
  lang: string
  isArabic: boolean
  stats: { icon: React.ElementType; value: number; label: string; suffix?: string }[]
  sections: {
    key: string
    title: string
    items: any[]
    href: string
  }[]
  galleryImages: any[]
  formatDate: (d: Date | null | undefined) => string
}

function StatCard({ icon: Icon, value, label, suffix = "+", index }: { icon: React.ElementType; value: number; label: string; suffix?: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="text-center p-6 bg-surface dark:bg-dark-card rounded-2xl shadow-soft hover:shadow-card-hover transition-all duration-300 border border-gray-100 dark:border-dark-border group"
    >
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
        className="w-16 h-16 mx-auto mb-4 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center"
      >
        <Icon className="w-8 h-8 text-primary dark:text-primary-light" />
      </motion.div>
      <div className="text-3xl md:text-4xl font-bold text-primary dark:text-primary-light mb-2">
        {isInView ? (
          <CountUp end={value} duration={2} separator="," suffix={suffix} />
        ) : (
          "0"
        )}
      </div>
      <div className="text-text-secondary dark:text-gray-400 text-sm">{label}</div>
    </motion.div>
  )
}

function NewsCard({ item, lang, isArabic, formatDate }: { item: any; lang: string; isArabic: boolean; formatDate: (d: Date | null | undefined) => string }) {
  return (
    <motion.article variants={staggerItem} className="bg-surface dark:bg-dark-card rounded-2xl overflow-hidden shadow-soft hover:shadow-card-hover transition-all duration-300 group border border-gray-100 dark:border-dark-border">
      <motion.div className="h-48 bg-gradient-to-br from-primary to-primary-light relative overflow-hidden" whileHover={{ scale: 1.05 }} transition={{ duration: 0.4 }}>
        {item.featuredImage && (
          <img src={item.featuredImage} alt={isArabic ? item.titleAr : item.titleEn} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        <span className="absolute top-4 start-4 px-3 py-1 bg-secondary text-primary-dark text-xs font-bold rounded-full">
          {item.category || (isArabic ? "أخبار" : "News")}
        </span>
      </motion.div>
      <div className="p-6">
        <div className="flex items-center gap-2 text-text-secondary dark:text-gray-400 text-sm mb-3">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(item.publishedAt || item.createdAt)}</span>
        </div>
        <h3 className="text-lg font-bold text-text dark:text-white mb-2 group-hover:text-primary dark:group-hover:text-primary-light transition-colors line-clamp-2">
          {isArabic ? item.titleAr : item.titleEn}
        </h3>
        <p className="text-text-secondary dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {isArabic ? (item.excerptAr || "") : (item.excerptEn || "")}
        </p>
        <Link
          href={`/${lang}/news/${item.slug || item.id}`}
          className="inline-flex items-center gap-1 text-primary dark:text-primary-light font-medium text-sm hover:gap-2 transition-all"
        >
          {isArabic ? "اقرأ المزيد" : "Read More"}
          {isArabic ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </Link>
      </div>
    </motion.article>
  )
}

function EventCard({ event, lang, isArabic }: { event: any; lang: string; isArabic: boolean }) {
  const getMonthDay = (date: Date) => {
    const d = date.getDate().toString().padStart(2, "0")
    const m = date.toLocaleDateString(isArabic ? "ar" : "en", { month: "short" })
    return { day: d, month: m }
  }
  const getStatusLabel = (status: string) => {
    if (status === "active") return isArabic ? "نشط" : "Active"
    if (status === "completed") return isArabic ? "مكتمل" : "Completed"
    if (status === "upcoming") return isArabic ? "قادم" : "Upcoming"
    if (status === "ongoing") return isArabic ? "جاري" : "Ongoing"
    return status
  }
  const { day, month } = getMonthDay(event.date)

  return (
    <motion.div variants={staggerItem} className="bg-background dark:bg-dark-surface rounded-2xl p-6 border border-border dark:border-dark-border hover:border-primary/30 dark:hover:border-primary/30 transition-all">
      <div className="flex items-start gap-4">
        <motion.div whileHover={{ scale: 1.1, rotate: -5 }} className="w-16 h-16 bg-gradient-to-br from-primary to-primary-light rounded-xl flex flex-col items-center justify-center text-white shrink-0">
          <span className="text-xs font-bold">{day}</span>
          <span className="text-lg font-bold">{month}</span>
        </motion.div>
        <div className="flex-1">
          <span className="inline-block px-2 py-0.5 bg-accent/10 text-accent dark:text-accent-light text-xs font-bold rounded mb-2">
            {getStatusLabel(event.status)}
          </span>
          <h3 className="font-bold text-text dark:text-white mb-2">
            {isArabic ? event.titleAr : event.titleEn}
          </h3>
          {event.time && (
            <div className="flex items-center gap-2 text-text-secondary dark:text-gray-400 text-sm mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{event.time}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-text-secondary dark:text-gray-400 text-sm">
            <MapPin className="w-3.5 h-3.5" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function ProjectCard({ project, lang, isArabic }: { project: any; lang: string; isArabic: boolean }) {
  const getStatusLabel = (status: string) => {
    if (status === "active") return isArabic ? "نشط" : "Active"
    if (status === "completed") return isArabic ? "مكتمل" : "Completed"
    return status
  }

  return (
    <motion.div variants={staggerItem} className="bg-surface dark:bg-dark-card rounded-2xl overflow-hidden shadow-soft hover:shadow-card-hover transition-all duration-300 group border border-gray-100 dark:border-dark-border">
      <motion.div className="h-48 bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center relative overflow-hidden" whileHover={{ scale: 1.05 }}>
        {project.featuredImage ? (
          <img src={project.featuredImage} alt={isArabic ? project.titleAr : project.titleEn} className="w-full h-full object-cover" />
        ) : (
          <FolderOpen className="w-16 h-16 text-secondary/40" />
        )}
      </motion.div>
      <div className="p-6">
        <span className="inline-block px-3 py-1 bg-accent/10 text-accent dark:text-accent-light text-xs font-bold rounded-full mb-3">
          {getStatusLabel(project.status)}
        </span>
        <h3 className="text-lg font-bold text-text dark:text-white mb-2 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
          {isArabic ? project.titleAr : project.titleEn}
        </h3>
        <p className="text-text-secondary dark:text-gray-400 text-sm line-clamp-2">
          {isArabic ? project.descriptionAr : project.descriptionEn}
        </p>
      </div>
    </motion.div>
  )
}

export default function HomeClient({ lang, isArabic, stats, sections, galleryImages, formatDate }: HomeClientProps) {
  return (
    <>
      {/* Statistics Section */}
      <ScrollReveal direction="up">
        <section className="py-16 bg-background dark:bg-dark">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} index={index} />
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Dynamic Content Sections */}
      {sections.map((section, sectionIndex) => (
        <ScrollReveal key={section.key} direction="up" delay={0.1}>
          <section className={`py-20 ${sectionIndex % 2 === 0 ? "bg-background dark:bg-dark" : "bg-surface dark:bg-dark-surface"}`}>
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-text dark:text-white mb-4">
                  {section.title}
                </h2>
                <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
              </div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`grid ${
                  section.key === "events"
                    ? "sm:grid-cols-2 md:grid-cols-3 gap-6"
                    : "sm:grid-cols-2 md:grid-cols-3 gap-8"
                }`}
              >
                {section.key === "news" && section.items.map((item: any) => (
                  <NewsCard key={item.id} item={item} lang={lang} isArabic={isArabic} formatDate={formatDate} />
                ))}
                {section.key === "events" && section.items.map((event: any) => (
                  <EventCard key={event.id} event={event} lang={lang} isArabic={isArabic} />
                ))}
                {section.key === "projects" && section.items.map((project: any) => (
                  <ProjectCard key={project.id} project={project} lang={lang} isArabic={isArabic} />
                ))}
              </motion.div>

              <div className="text-center mt-8">
                <Link
                  href={section.href}
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary dark:text-primary-light dark:border-primary-light rounded-xl font-bold hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all"
                >
                  {isArabic ? "عرض الكل" : "View All"}
                  {isArabic ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </Link>
              </div>
            </div>
          </section>
        </ScrollReveal>
      ))}

      {/* Gallery Section */}
      {galleryImages.length > 0 && (
        <ScrollReveal direction="up">
          <section className="py-16 bg-surface dark:bg-dark-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-text dark:text-white mb-4">
                  {isArabic ? "معرض الصور" : "Photo Gallery"}
                </h2>
                <p className="text-text-secondary dark:text-gray-400 text-lg max-w-2xl mx-auto">
                  {isArabic ? "لحظات لا تُنسى من فعالياتنا وأنشطةنا" : "Unforgettable moments from our events and activities"}
                </p>
              </div>
              <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {galleryImages.slice(0, 8).map((image: any) => (
                  <motion.div key={image.id} variants={staggerItem} className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl overflow-hidden relative group cursor-pointer">
                    <img
                      src={image.imageUrl}
                      alt={image.title || ""}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 inset-x-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 transition-all">
                      <p className="text-xs font-bold truncate">{image.title}</p>
                      <p className="text-[10px] text-white/70">{formatDate(image.createdAt)}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              <div className="text-center mt-8">
                <Link
                  href={`/${lang}/media/gallery`}
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary dark:text-primary-light dark:border-primary-light rounded-xl font-bold hover:bg-primary hover:text-white transition-all"
                >
                  {isArabic ? "عرض المعرض كاملاً" : "View Full Gallery"}
                  {isArabic ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </Link>
              </div>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* CTA Section */}
      <ScrollReveal direction="up">
        <section className="py-20 bg-background dark:bg-dark">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-primary to-primary-light rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 opacity-10"
              >
                <div className="absolute top-10 start-10 w-40 h-40 rounded-full bg-secondary blur-3xl" />
                <div className="absolute bottom-10 end-10 w-60 h-60 rounded-full bg-accent blur-3xl" />
              </motion.div>
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
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-primary-dark rounded-xl text-lg font-bold hover:bg-secondary-light transition-all hover:scale-105"
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
      </ScrollReveal>

      {/* Contact Quick Info */}
      <ScrollReveal direction="up">
        <section className="py-16 bg-surface dark:bg-dark-surface border-t border-border dark:border-dark-border">
          <div className="container mx-auto px-4">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 text-center">
              {[
                { icon: MapPin, title: isArabic ? "العنوان" : "Address", content: isArabic ? "الخرطوم - السودان" : "Khartoum - Sudan" },
                { icon: Phone, title: isArabic ? "الهاتف" : "Phone", content: "+249114210853", href: "tel:+249114210853" },
                { icon: Mail, title: isArabic ? "البريد الإلكتروني" : "Email", content: "aiuagho@gmail.com", href: "mailto:aiuagho@gmail.com" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-14 h-14 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-4">
                    <item.icon className="w-7 h-7 text-primary dark:text-primary-light" />
                  </div>
                  <h3 className="font-bold text-text dark:text-white mb-2">{item.title}</h3>
                  {item.href ? (
                    <a href={item.href} className="text-text-secondary dark:text-gray-400 text-sm hover:text-primary dark:hover:text-primary-light">
                      {item.content}
                    </a>
                  ) : (
                    <p className="text-text-secondary dark:text-gray-400 text-sm">{item.content}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>
    </>
  )
}
