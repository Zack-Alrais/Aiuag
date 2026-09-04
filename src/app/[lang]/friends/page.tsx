"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Users,
  Unlock,
  UserCheck,
  UserMinus,
  Clock,
  Mail,
  MapPin,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { useMember } from "@/hooks/use-member";
import { FriendButton } from "@/components/social/friend-button";

interface MemberCard {
  id: string;
  name: string;
  email: string;
  image: string | null;
  nameEn: string | null;
  faculty: string | null;
  graduationYear: number | null;
  city: string | null;
  country: string | null;
  friendshipId?: string;
  requestedAt?: string;
  friendsSince?: string;
  sharedFriends?: number;
}

interface FriendRequest extends MemberCard {
  direction: "received" | "sent";
}

type Tab = "received" | "sent" | "friends" | "suggestions";

export default function FriendsPage() {
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "ar";
  const isAr = lang === "ar";
  const router = useRouter();
  const { member, status } = useMember();

  const [tab, setTab] = useState<Tab>("received");
  const [received, setReceived] = useState<FriendRequest[]>([]);
  const [sent, setSent] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<MemberCard[]>([]);
  const [suggestions, setSuggestions] = useState<MemberCard[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReceived = useCallback(async () => {
    const res = await fetch("/api/friends/requests?direction=received");
    const d = await res.json();
    setReceived(d?.data ?? []);
  }, []);

  const loadSent = useCallback(async () => {
    const res = await fetch("/api/friends/requests?direction=sent");
    const d = await res.json();
    setSent(d?.data ?? []);
  }, []);

  const loadFriends = useCallback(async () => {
    const res = await fetch("/api/friends?limit=100");
    const d = await res.json();
    setFriends(d?.data ?? []);
  }, []);

  const loadSuggestions = useCallback(async () => {
    const res = await fetch("/api/friends/suggestions?limit=24");
    const d = await res.json();
    setSuggestions(d?.data ?? []);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/auth/login?callbackUrl=${encodeURIComponent(`/${lang}/friends`)}`);
      return;
    }
    if (status === "loading") return;
    setLoading(true);
    Promise.all([loadReceived(), loadSent(), loadFriends(), loadSuggestions()])
      .catch(() => toast.error(isAr ? "تعذر تحميل البيانات" : "Failed to load data"))
      .finally(() => setLoading(false));
  }, [status, loadReceived, loadSent, loadFriends, loadSuggestions, lang, router, isAr]);

  const messageFriend = (memberId: string) => {
    fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "direct", participantIds: [memberId] }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.conversationId) router.push(`/${lang}/messages?conversation=${d.conversationId}`);
        else toast.error(d?.error || (isAr ? "تعذر بدء المحادثة" : "Could not start chat"));
      })
      .catch(() => toast.error(isAr ? "تعذر بدء المحادثة" : "Could not start chat"));
  };

  const tabs: { key: Tab; label: string; count: number; icon: typeof Users }[] = [
    { key: "received", label: isAr ? "الطلبات الواردة" : "Requests", count: received.length, icon: Unlock },
    { key: "sent", label: isAr ? "الطلبات المرسلة" : "Sent", count: sent.length, icon: Clock },
    { key: "friends", label: isAr ? "الأصدقاء" : "Friends", count: friends.length, icon: Users },
    { key: "suggestions", label: isAr ? "اقتراحات" : "Suggestions", count: 0, icon: Sparkles },
  ];

  if (status !== "authenticated" || !member) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 pt-24">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">{isAr ? "جارٍ التحميل..." : "Loading..."}</p>
      </div>
    );
  }

  const renderMember = (m: MemberCard, opts?: { messageable?: boolean; showShared?: boolean }) => {
    return (
      <div key={m.id} className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-[#16212f] border border-gray-100 dark:border-[#1e2d42] rounded-xl">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-[#1e2d42] shrink-0">
            {m.image ? (
              <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold">
                {m.name?.charAt(0) || "U"}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">{m.name}</p>
            {m.nameEn && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{m.nameEn}</p>}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-500 dark:text-gray-400">
              {m.faculty && (
                <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />{m.faculty}{m.graduationYear ? ` ${m.graduationYear}` : ""}</span>
              )}
              {(m.city || m.country) && (
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{[m.city, m.country].filter(Boolean).join(", ")}</span>
              )}
              {opts?.showShared && typeof m.sharedFriends === "number" && m.sharedFriends > 0 && (
                <span className="flex items-center gap-1 text-primary"><Users className="w-3 h-3" />{isAr ? `${m.sharedFriends} أصدقاء مشتركين` : `${m.sharedFriends} mutual`}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!opts?.messageable && (
            <FriendButton memberId={m.id} lang={lang} />
          )}
          {opts?.messageable && m.id !== member.id && (
            <>
              <button
                onClick={() => messageFriend(m.id)}
                className="px-3 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#1e2d42] dark:text-gray-300"
              >
                <Mail className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  fetch(`/api/friends?memberId=${encodeURIComponent(m.id)}`, { method: "DELETE" })
                    .then((r) => r.json())
                    .then(() => {
                      setFriends((f) => f.filter((x) => x.id !== m.id));
                      toast.success(isAr ? "تمت إزالة الصديق" : "Friend removed");
                    })
                    .catch(() => toast.error(isAr ? "فشل الحذف" : "Failed to remove"));
                }}
                className="px-3 py-2 text-sm rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <UserMinus className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-28 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          {isAr ? "الأصدقاء" : "Friends"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {isAr ? "تواصل مع زملائك الخريجين، وأرسل طلبات صداقة، وابدأ محادثات فورية." : "Connect with fellow alumni, send friend requests, and chat in real time."}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100 dark:border-[#1e2d42] pb-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              tab === t.key
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#1e2d42]"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-white/20" : "bg-primary/10 text-primary"}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">{isAr ? "جارٍ التحميل..." : "Loading..."}</p>
        </div>
      ) : tab === "received" ? (
        received.length ? (
          <div className="space-y-2">
            {received.map((m) => renderMember(m))}
          </div>
        ) : (
          <EmptyState icon={Unlock} title={isAr ? "لا توجد طلبات صداقة" : "No friend requests"} subtitle={isAr ? "عندما يرسل لك أحدهم طلب صداقة ستجده هنا" : "When someone sends you a request it will show up here"} />
        )
      ) : tab === "sent" ? (
        sent.length ? (
          <div className="space-y-2">
            {sent.map((m) => renderMember(m))}
          </div>
        ) : (
          <EmptyState icon={Clock} title={isAr ? "لم ترسل أي طلبات" : "No outgoing requests"} subtitle={isAr ? "الطلبات التي أرسلتها ستظهر هنا" : "Requests you sent will appear here"} />
        )
      ) : tab === "friends" ? (
        friends.length ? (
          <div className="space-y-2">
            {friends.map((m) => renderMember(m, { messageable: true }))}
          </div>
        ) : (
          <EmptyState icon={UserCheck} title={isAr ? "لا يوجد أصدقاء بعد" : "No friends yet"} subtitle={isAr ? "استكشف الاقتراحات وأضف زملاءك" : "Explore suggestions and add your classmates"} />
        )
      ) : suggestions.length ? (
        <div className="space-y-2">
          {suggestions.map((m) => renderMember(m, { showShared: true }))}
        </div>
      ) : (
        <EmptyState icon={Sparkles} title={isAr ? "لا توجد اقتراحات حالياً" : "No suggestions right now"} subtitle={isAr ? "ستظهر لك اقتراحات عند توفر بيانات مشتركة" : "Suggestions will appear when shared data is available"} />
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }: { icon: typeof Users; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-gray-100 dark:bg-[#1e2d42] rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <p className="font-medium text-gray-700 dark:text-gray-200">{title}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
    </div>
  );
}