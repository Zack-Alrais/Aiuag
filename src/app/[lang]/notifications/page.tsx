"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  BellOff,
  MessageCircle,
  UserPlus,
  Heart,
  MessageSquare,
  Check,
  CheckCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useMember } from "@/hooks/use-member";

interface NotificationItem {
  id: string;
  type: string;
  entityType: string | null;
  entityId: string | null;
  titleAr: string;
  titleEn: string;
  bodyAr: string | null;
  bodyEn: string | null;
  isRead: boolean;
  actor?: { id: string; name: string; image: string | null } | null;
  createdAt: string;
}

type PageState = "loading" | "success" | "error" | "empty";

export default function NotificationsPage() {
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "ar";
  const isAr = lang === "ar";
  const router = useRouter();
  const { member, status } = useMember();

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [pageState, setPageState] = useState<PageState>("loading");
  const [marking, setMarking] = useState(false);

  const load = useCallback(async () => {
    setPageState("loading");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch("/api/notifications?limit=50", {
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const d = await res.json();
      const data: NotificationItem[] = d?.data ?? [];
      setItems(data);
      setPageState(data.length === 0 ? "empty" : "success");
    } catch {
      clearTimeout(timer);
      setPageState("error");
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (!member) {
      router.push(
        `/auth/login?callbackUrl=${encodeURIComponent(`/${lang}/notifications`)}`
      );
      return;
    }
    load();
  }, [status, member, lang, load, router]);

  useEffect(() => {
    // Fallback: if the session never resolves (e.g. legacy/anonymous),
    // stop the loading state from spinning forever.
    const t = setTimeout(() => {
      setPageState((s) => (s === "loading" ? "error" : s));
    }, 10000);
    return () => clearTimeout(t);
  }, []);

  const navigate = (n: NotificationItem) => {
    if (n.type === "message") {
      router.push(`/${lang}/messages?conversation=${n.entityId ?? ""}`);
    } else if (n.type === "friend_request" || n.type === "friend_accept") {
      router.push(`/${lang}/friends`);
    } else {
      router.push(`/${lang}/posts/${n.entityId ?? ""}`);
    }
  };

  const markAllRead = async () => {
    setMarking(true);
    try {
      const res = await fetch("/api/notifications", { method: "POST" });
      if (res.ok) {
        setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch {
      // silent
    } finally {
      setMarking(false);
    }
  };

  const typeIcon = (t: string) => {
    if (t === "message")
      return <MessageCircle className="w-5 h-5 text-primary" />;
    if (t === "friend_request" || t === "friend_accept")
      return <UserPlus className="w-5 h-5 text-secondary" />;
    if (t === "reaction")
      return <Heart className="w-5 h-5 text-red-500" />;
    if (t === "comment")
      return <MessageSquare className="w-5 h-5 text-blue-500" />;
    return <Check className="w-5 h-5" />;
  };

  const unread = items.filter((n) => !n.isRead).length;

  const renderBody = () => {
    if (pageState === "loading") {
      return (
        <div className="py-16 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {isAr ? "جاري تحميل الإشعارات..." : "Loading notifications..."}
          </p>
        </div>
      );
    }

    if (pageState === "error") {
      return (
        <div className="py-16 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <BellOff className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            {isAr
              ? "تعذر تحميل الإشعارات"
              : "Could not load notifications"}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
            {isAr
              ? "تحقق من اتصالك بالإنترنت وحاول مرة أخرى"
              : "Check your connection and try again"}
          </p>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {isAr ? "إعادة المحاولة" : "Retry"}
          </button>
        </div>
      );
    }

    if (pageState === "empty") {
      return (
        <div className="py-16 text-center">
          <BellOff className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isAr
              ? "لا توجد إشعارات حالياً"
              : "No notifications yet"}
          </p>
        </div>
      );
    }

    return (
      <ul className="divide-y divide-gray-50 dark:divide-[#1e2d42]">
        {items.map((n) => (
          <li key={n.id}>
            <button
              onClick={() => navigate(n)}
              className={`w-full flex items-start gap-3 px-4 py-4 text-start hover:bg-gray-50 dark:hover:bg-dark-card transition-colors ${
                !n.isRead ? "bg-primary/5 dark:bg-primary/10" : ""
              }`}
            >
              <div className="mt-0.5 p-1.5 rounded-lg bg-gray-100 dark:bg-[#1e2d42] shrink-0">
                {typeIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {isAr ? n.titleAr : n.titleEn}
                </p>
                {n.bodyAr && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {isAr ? n.bodyAr : n.bodyEn}
                  </p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                  {new Date(n.createdAt).toLocaleString(
                    isAr ? "ar" : "en-US",
                    { dateStyle: "full", timeStyle: "short" }
                  )}
                </p>
              </div>
              {!n.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 shrink-0" />
              )}
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-[#0a0f1a]"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href={`/${lang}`}
              className="p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-dark-card transition-colors"
              aria-label={isAr ? "رجوع" : "Back"}
            >
              <Bell className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {isAr ? "الإشعارات" : "Notifications"}
              </h1>
              {pageState === "success" && unread > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isAr
                    ? `${unread} إشعار غير مقروء`
                    : `${unread} unread`}
                </p>
              )}
            </div>
          </div>
          {pageState === "success" && unread > 0 && (
            <button
              onClick={markAllRead}
              disabled={marking}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-primary border border-primary/30 hover:bg-primary/5 disabled:opacity-60 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              {isAr ? "تحديد الكل كمقروء" : "Mark all read"}
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-[#111927] rounded-2xl shadow-sm border border-gray-100 dark:border-[#1e2d42] overflow-hidden">
          {renderBody()}
        </div>
      </div>
    </div>
  );
}
