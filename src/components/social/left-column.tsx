"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Wifi, Calendar, Newspaper, ChevronLeft } from "lucide-react";
import { usePusher, OnlineMember } from "@/components/chat/pusher-provider";
import { SocialAvatar, safeMemberUrl } from "@/components/social/social-ui";
import { useMember } from "@/hooks/use-member";

interface NewsItem {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
}

interface EventItem {
  slug: string;
  title: string;
  date: string | null;
  location: string | null;
}

export default function LeftColumn({ lang }: { lang: string }) {
  const isAr = lang === "ar";
  const { enabled, onlineMembers } = usePusher();
  const { member } = useMember();

  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/side-content?lang=${encodeURIComponent(lang)}`)
      .then((r) => r.json())
      .then((d) => {
        setNews(d?.news ?? []);
        setEvents(d?.events ?? []);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [lang]);

  const displayOnline: OnlineMember[] = member ? onlineMembers.filter((m) => m.id !== member.id) : onlineMembers;
  const active = enabled && member;

  const fmtDate = (iso: string | null) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString(isAr ? "ar" : "en", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Who's online */}
      <section className="bg-white dark:bg-[#111927] rounded-2xl border border-gray-100 dark:border-[#1e2d42] p-4">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-3">
          <Wifi className="w-4 h-4 text-green-500" />
          {isAr ? "أعضاء متصلون الآن" : "Members online now"}
        </h2>
        {!active ? (
          <div className="rounded-lg bg-gray-50 dark:bg-[#0d1525] border border-gray-100 dark:border-[#1e2d42] p-3 text-xs text-gray-500 dark:text-gray-400">
            {isAr
              ? "فعّل تسجيل الدخول وأضف مفاتيح Pusher ليظهر الزملاء المتصلون لحظياً."
              : "Sign in and add Pusher keys to see live who's online."}
          </div>
        ) : displayOnline.length ? (
          <div className="space-y-2">
            {displayOnline.slice(0, 8).map((m) => {
              const url = safeMemberUrl(lang, m.id);
              if (!url) return null;
              return (
                <Link
                  key={m.id}
                  href={url}
                  className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1e2d42]"
                >
                  <div className="relative shrink-0">
                    <SocialAvatar src={m.image} name={m.name} size={32} />
                    <span className="absolute bottom-0 start-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-[#111927]" />
                  </div>
                  <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{m.name}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isAr ? "لا يوجد أحد متصل حالياً" : "No one online right now"}
          </p>
        )}
      </section>

      {/* News */}
      <section className="bg-white dark:bg-[#111927] rounded-2xl border border-gray-100 dark:border-[#1e2d42] p-4">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-3">
          <Newspaper className="w-4 h-4 text-primary" />
          {isAr ? "أخبار الرابطة" : "Association news"}
        </h2>
        {!loaded ? (
          <div className="py-3 text-gray-400 dark:text-gray-500">{isAr ? "جارٍ التحميل..." : "Loading..."}</div>
        ) : news.length ? (
          <div className="space-y-3">
            {news.map((n) => (
              <Link key={n.slug} href={`/${lang}/news/${n.slug}`} className="group flex gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-[#1e2d42] shrink-0">
                  {n.coverImage && (
                    <img src={n.coverImage} alt={n.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-primary transition-colors">
                    {n.title}
                  </p>
                  {n.publishedAt && <p className="text-[10px] text-gray-400 mt-0.5">{fmtDate(n.publishedAt)}</p>}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? "لا توجد أخبار حالياً" : "No news yet"}</p>
        )}
      </section>

      {/* Events */}
      <section className="bg-white dark:bg-[#111927] rounded-2xl border border-gray-100 dark:border-[#1e2d42] p-4">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-accent" />
          {isAr ? "الأحداث القادمة" : "Upcoming events"}
        </h2>
        {!loaded ? (
          <div className="py-3 text-gray-400 dark:text-gray-500">{isAr ? "جارٍ التحميل..." : "Loading..."}</div>
        ) : events.length ? (
          <div className="space-y-3">
            {events.map((e) => (
              <Link key={e.slug} href={`/${lang}/events`} className="flex items-start gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-primary transition-colors">
                    {e.title}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{fmtDate(e.date)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? "لا توجد أحداث قادمة" : "No upcoming events"}</p>
        )}
        <Link
          href={`/${lang}/events`}
          className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-gray-100 dark:bg-[#1e2d42] text-gray-600 dark:text-gray-300 py-2 hover:bg-gray-200 dark:hover:bg-[#2a3f5f] transition-colors"
        >
          {isAr ? "كل الأحداث" : "All events"}
          <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
        </Link>
      </section>
    </div>
  );
}