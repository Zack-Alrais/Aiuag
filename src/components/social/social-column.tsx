"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Users, Unlock, Clock, Sparkles, UserCheck, X, ArrowRight } from "lucide-react";
import { FriendButton } from "@/components/social/friend-button";
import { SocialAvatar, safeMemberUrl } from "@/components/social/social-ui";

interface Person {
  id: string;
  name: string;
  email?: string;
  image: string | null;
  nameEn: string | null;
  faculty?: string | null;
  graduationYear?: number | null;
  city?: string | null;
  country?: string | null;
  sharedFriends?: number;
  reason?: string[];
}

export default function SocialColumn({ lang }: { lang: string }) {
  const isAr = lang === "ar";
  const [friends, setFriends] = useState<Person[]>([]);
  const [requests, setRequests] = useState<Person[]>([]);
  const [suggestions, setSuggestions] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [f, r, s] = await Promise.all([
        fetch("/api/friends?limit=5").then((res) => res.json()),
        fetch("/api/friends/requests?direction=received&limit=5").then((res) => res.json()),
        fetch("/api/friends/suggestions?limit=5").then((res) => res.json()),
      ]);
      setFriends(f?.data ?? []);
      setRequests(r?.data ?? []);
      // Suggestions arrive as { member, weight, reason, sharedFriends } — flatten
      // the nested member into the flat Person shape the UI expects.
      const rawS = s?.data ?? [];
      setSuggestions(
        rawS.map((item: { member?: Person; reason?: string[]; weight?: number; sharedFriends?: number }) =>
          item && typeof item === "object" && item.member
            ? { ...item.member, reason: item.reason }
            : item
        )
      );
    } catch {
      setFriends([]);
      setRequests([]);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const reply = async (memberId: string, action: "accept" | "decline") => {
    try {
      const res = await fetch("/api/friends/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresseeId: memberId, action }),
      });
      if (!res.ok) throw new Error();
      setRequests((prev) => prev.filter((x) => x.id !== memberId));
      setFriends((prev) =>
        action === "accept" ? [...prev, requests.find((x) => x.id === memberId)!] : prev
      );
      toast.success(
        isAr
          ? (action === "accept" ? "تمت إضافة الصديق" : "تم رفض الطلب")
          : action === "accept" ? "Friend added" : "Request declined"
      );
    } catch {
      toast.error(isAr ? "تعذر إتمام العملية" : "Action failed");
    }
  };

  const reasonLabel = (key: string): string => {
    const map: Record<string, string> = {
      specialization_year: isAr ? "نفس دفعتك ومجالك" : "Same batch + field",
      year: isAr ? "نفس دفعتك" : "Same batch",
      adjacent_year: isAr ? "دفعات مجاورة" : "Nearby batch",
      faculty: isAr ? "نفس الكلية" : "Same faculty",
      specialization: isAr ? "نفس المجال" : "Same field",
      shared: isAr ? "أصدقاء مشتركون" : "Mutual friends",
      city: isAr ? "نفس المدينة" : "Same city",
    };
    return map[key] || "";
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Who's online / friends */}
      <section className="bg-white dark:bg-[#111927] rounded-2xl border border-gray-100 dark:border-[#1e2d42] p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            {isAr ? "أصدقاؤك" : "Your friends"}
          </h2>
          <Link href={`/${lang}/friends?tab=friends`} className="text-xs text-primary hover:underline">
            {isAr ? "عرض الكل" : "See all"}
          </Link>
        </div>
        {loading ? (
          <div className="py-3 text-gray-400 dark:text-gray-500">{isAr ? "جارٍ التحميل..." : "Loading..."}</div>
        ) : friends.length ? (
          <div className="space-y-2">
            {friends.map((m) => {
              const url = safeMemberUrl(lang, m.id);
              if (!url) return null;
              return (
                <Link key={m.id} href={url} className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1e2d42]">
                  <SocialAvatar src={m.image} name={m.name} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{m.name}</p>
                    {m.faculty && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {m.faculty}{m.graduationYear ? ` · ${m.graduationYear}` : ""}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isAr ? "لم تضف أصدقاء بعد. استكشف الاقتراحات أدناه." : "No friends yet — explore suggestions below."}
          </p>
        )}
      </section>

      {/* Incoming requests */}
      {requests.length > 0 && (
        <section className="bg-white dark:bg-[#111927] rounded-2xl border border-gray-100 dark:border-[#1e2d42] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Unlock className="w-4 h-4 text-accent" />
              {isAr ? "طلبات الصداقة" : "Friend requests"}
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-accent/10 text-accent">{requests.length}</span>
            </h2>
            <Link href={`/${lang}/friends?tab=received`} className="text-xs text-primary hover:underline">
              {isAr ? "عرض الكل" : "See all"}
            </Link>
          </div>
          <div className="space-y-2">
            {requests.map((m) => {
              const url = safeMemberUrl(lang, m.id);
              if (!url) return null;
              return (
                <div key={m.id} className="flex items-center gap-2">
                  <Link href={url} className="flex items-center gap-2 min-w-0 flex-1">
                    <SocialAvatar src={m.image} name={m.name} size={32} />
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{m.name}</span>
                  </Link>
                  <button
                    onClick={() => reply(m.id, "accept")}
                    className="px-2 py-1 text-xs rounded-lg bg-primary text-white hover:bg-primary-dark"
                    title={isAr ? "قبول" : "Accept"}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => reply(m.id, "decline")}
                    className="px-2 py-1 text-xs rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#1e2d42] dark:text-gray-300"
                    title={isAr ? "رفض" : "Decline"}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Suggestions */}
      <section className="bg-white dark:bg-[#111927] rounded-2xl border border-gray-100 dark:border-[#1e2d42] p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            {isAr ? "اقترح أصدقاء" : "People you may know"}
          </h2>
          <Link href={`/${lang}/friends?tab=suggestions`} className="text-xs text-primary hover:underline">
            {isAr ? "عرض الكل" : "See all"}
          </Link>
        </div>
        {loading ? (
          <div className="py-3 text-gray-400 dark:text-gray-500">{isAr ? "جارٍ التحميل..." : "Loading..."}</div>
        ) : suggestions.length ? (
          <div className="space-y-3">
            {suggestions.map((m) => {
              const url = safeMemberUrl(lang, m.id);
              if (!url) return null;
              return (
                <div key={m.id} className="flex items-center gap-2">
                  <Link href={url} className="flex items-center gap-2 min-w-0 flex-1">
                    <SocialAvatar src={m.image} name={m.name} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{m.name}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                        {(m.reason || []).map(reasonLabel).filter(Boolean).join(" · ") || (m.faculty || "")}
                      </p>
                    </div>
                  </Link>
                  <FriendButton memberId={m.id} lang={lang} compact />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isAr ? "لا توجد اقتراحات حالياً" : "No suggestions right now"}
          </p>
        )}
      </section>

      <Link
        href={`/${lang}/friends`}
        className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 text-primary py-2.5 hover:bg-primary/20 transition-colors"
      >
        {isAr ? "إدارة الأصدقاء" : "Manage friends"}
        <ArrowRight className="w-4 h-4 rtl:rotate-180" />
      </Link>
    </div>
  );
}