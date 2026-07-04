"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight, Users, Filter } from "lucide-react";
import Link from "next/link";
import ScrollReveal from "@/components/ui/scroll-reveal";
import HeroSection from "@/components/ui/hero-section-client";

export default function EventsPage({ params }: { params: Promise<{ lang: string }> }) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("ar");

  useEffect(() => {
    params.then(({ lang: l }) => setLang(l));
  }, [params]);

  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  useEffect(() => {
    fetch("/api/public/events")
      .then((res) => res.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const upcomingEvents = events.filter((e: any) => e.status === "upcoming" || e.status === "ongoing");
  const pastEvents = events.filter((e: any) => e.status === "completed" || e.status === "cancelled");

  const filterTabs = [
    { id: "upcoming", label: isArabic ? "القادمة" : "Upcoming" },
    { id: "past", label: isArabic ? "السابقة" : "Past" },
    { id: "all", label: isArabic ? "الكل" : "All" },
  ];

  const months = isArabic
    ? ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
          <div className="flex gap-2 mb-8 justify-center">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-10 w-24 rounded-full" />
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface rounded-2xl overflow-hidden border border-border flex">
                <div className="w-24 animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light" />
                <div className="flex-1 p-5 space-y-3">
                  <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-2 w-16 rounded-full" />
                  <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-5 w-3/4 rounded" />
                  <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-3 w-full rounded" />
                  <div className="flex gap-3">
                    <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-3 w-20 rounded" />
                    <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-3 w-16 rounded" />
                  </div>
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
        pageSlug="events"
        lang={lang}
        defaultTitle={isArabic ? "الأحداث" : "Events"}
        defaultSubtitle={isArabic
          ? "تابع فعالياتنا وأحداثنا القادمة والسابقة"
          : "Follow our upcoming and past events and activities"}
        badge={
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm">
            <Calendar className="w-4 h-4" />
            <span>{isArabic ? "فعالياتنا" : "Our Events"}</span>
          </div>
        }
      />

      {/* Filter & Calendar View */}
      <ScrollReveal direction="up"><section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                    tab.id === "upcoming"
                      ? "bg-primary text-white"
                      : "bg-surface text-text-secondary hover:bg-primary/10 hover:text-primary border border-border"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-text-secondary hover:text-primary hover:border-primary/30 transition-all text-sm">
              <Calendar className="w-4 h-4" />
              {isArabic ? "عرض التقويم" : "Calendar View"}
            </button>
          </div>
        </div>
      </section></ScrollReveal>

      {/* Calendar Placeholder */}
      <ScrollReveal direction="up"><section className="pb-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="bg-surface rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-text">
                {isArabic ? "يونيو 2026" : "June 2026"}
              </h3>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-text-secondary hover:text-primary transition-colors">
                  {isArabic ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
                <button className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-text-secondary hover:text-primary transition-colors">
                  {isArabic ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {(isArabic ? ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]).map((day) => (
                <div key={day} className="py-2 font-bold text-text-secondary">{day}</div>
              ))}
              {Array.from({ length: 30 }, (_, i) => (
                <div
                  key={i}
                  className={`py-2 rounded-lg cursor-pointer transition-colors ${
                    i + 1 === 22
                      ? "bg-primary text-white font-bold"
                      : "hover:bg-primary/10 text-text"
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section></ScrollReveal>

      {/* Upcoming Events */}
      <ScrollReveal direction="up"><section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-text mb-6">
            {isArabic ? "الأحداث القادمة" : "Upcoming Events"}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {upcomingEvents.map((event: any) => {
              const eventDate = new Date(event.date);
              const day = eventDate.getDate().toString().padStart(2, "0");
              const month = months[eventDate.getMonth()];
              const statusLabel = event.status === "ongoing"
                ? (isArabic ? "جاري" : "Ongoing")
                : (isArabic ? "قريباً" : "Coming Soon");
              return (
                <div
                  key={event.id}
                  className="bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group flex"
                >
                  <div className="w-24 bg-gradient-to-b from-primary to-primary-light flex flex-col items-center justify-center text-white shrink-0">
                    <span className="text-3xl font-bold">{day}</span>
                    <span className="text-sm">{month}</span>
                  </div>
                  <div className="p-5 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        event.status === "upcoming"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }`}>
                        {statusLabel}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-text mb-2 group-hover:text-primary transition-colors">
                      {isArabic ? (event.titleAr || event.title || "") : (event.titleEn || event.title || "")}
                    </h3>
                    <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                      {isArabic ? (event.descriptionAr || event.description || "") : (event.descriptionEn || event.description || "")}
                    </p>
                    <div className="flex flex-col gap-1 text-sm text-text-secondary">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{event.time || ""}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{event.location || ""}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{isArabic ? `${event.registeredCount || 0} مشارك` : `${event.registeredCount || 0} attendees`}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section></ScrollReveal>

      {/* Past Events */}
      <ScrollReveal direction="up"><section className="py-8 bg-surface">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-text mb-6">
            {isArabic ? "الأحداث السابقة" : "Past Events"}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {pastEvents.map((event: any) => {
              const eventDate = new Date(event.date);
              const day = eventDate.getDate().toString().padStart(2, "0");
              const month = months[eventDate.getMonth()];
              const statusLabel = event.status === "cancelled"
                ? (isArabic ? "ملغي" : "Cancelled")
                : (isArabic ? "منتهي" : "Completed");
              return (
                <div
                  key={event.id}
                  className="bg-background rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all group flex opacity-80 hover:opacity-100"
                >
                  <div className="w-24 bg-gradient-to-b from-text-secondary to-text-light flex flex-col items-center justify-center text-white shrink-0">
                    <span className="text-3xl font-bold">{day}</span>
                    <span className="text-sm">{month}</span>
                  </div>
                  <div className="p-5 flex-1">
                    <span className="inline-block px-2 py-0.5 bg-text-secondary/10 text-text-secondary text-xs font-bold rounded-full mb-2">
                      {statusLabel}
                    </span>
                    <h3 className="text-lg font-bold text-text mb-2">
                      {isArabic ? (event.titleAr || event.title || "") : (event.titleEn || event.title || "")}
                    </h3>
                    <div className="flex flex-col gap-1 text-sm text-text-secondary">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{event.time || ""}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{event.location || ""}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </section></ScrollReveal>
    </div>
  );
}
