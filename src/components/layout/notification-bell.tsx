"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  MessageCircle,
  UserPlus,
  Heart,
  MessageSquare,
  BellOff,
  CheckCheck,
  Check,
  RefreshCw,
} from "lucide-react";
import { usePusher } from "@/components/chat/pusher-provider";

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

type LoadState = "idle" | "loading" | "success" | "error";

export function NotificationBell({ scrolled = true }: { scrolled?: boolean }) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { subscribe } = usePusher();
  const memberId = (session?.user as { memberId?: string | null } | undefined)
    ?.memberId;
  const lang = pathname.startsWith("/ar") ? "ar" : "en";
  const isAr = lang === "ar";

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(
    async (markRead = false) => {
      if (!memberId) return;
      setLoadState("loading");
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10000);
        const res = await fetch("/api/notifications?limit=30", {
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const d = await res.json();
        const data: NotificationItem[] = d?.data ?? [];
        setItems(data);
        setUnread(d?.unreadCount ?? 0);
        setLoadState("success");
        if (markRead && (d?.unreadCount ?? 0) > 0) {
          fetch("/api/notifications", { method: "POST" }).catch(() => {});
          setUnread(0);
          setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setLoadState("error");
        } else {
          setLoadState("error");
        }
      }
    },
    [memberId]
  );

  useEffect(() => {
    if (memberId) load();
  }, [memberId, load]);

  useEffect(() => {
    if (!memberId) return;
    const unsub = subscribe(`private-user-${memberId}`, "notification:new", () => {
      load();
    });
    return () => unsub();
  }, [memberId, subscribe, load]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const inside =
        (triggerRef.current && triggerRef.current.contains(e.target as Node)) ||
        (panelRef.current && panelRef.current.contains(e.target as Node));
      if (!inside) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!memberId) return null;

  const navigate = (n: NotificationItem) => {
    setOpen(false);
    if (n.type === "message") {
      router.push(`/${lang}/messages?conversation=${n.entityId ?? ""}`);
    } else if (n.type === "friend_request" || n.type === "friend_accept") {
      router.push(`/${lang}/friends`);
    } else {
      router.push(`/${lang}/posts/${n.entityId ?? ""}`);
    }
  };

  const typeIcon = (t: string) => {
    if (t === "message")
      return <MessageCircle className="w-4 h-4 text-primary" />;
    if (t === "friend_request" || t === "friend_accept")
      return <UserPlus className="w-4 h-4 text-secondary" />;
    if (t === "reaction")
      return <Heart className="w-4 h-4 text-red-500" />;
    if (t === "comment")
      return <MessageSquare className="w-4 h-4 text-blue-500" />;
    return <Check className="w-4 h-4" />;
  };

  const renderContent = () => {
    if (loadState === "loading") {
      return (
        <div className="py-10 flex justify-center">
          <div className="w-7 h-7 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      );
    }

    if (loadState === "error") {
      return (
        <div className="py-8 text-center px-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {isAr
              ? "تعذر تحميل الإشعارات"
              : "Could not load notifications"}
          </p>
          <button
            onClick={() => load()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            {isAr ? "إعادة المحاولة" : "Retry"}
          </button>
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="py-10 text-center">
          <BellOff className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isAr ? "لا توجد إشعارات حالياً" : "No notifications yet"}
          </p>
        </div>
      );
    }

    return (
      <>
        {items.map((n) => (
          <button
            key={n.id}
            onClick={() => navigate(n)}
            className={`w-full flex items-start gap-3 px-4 py-3 text-start hover:bg-gray-50 dark:hover:bg-dark-card transition-colors border-b border-gray-50 dark:border-dark-border ${
              !n.isRead ? "bg-primary/5 dark:bg-primary/10" : ""
            }`}
          >
            <div className="mt-0.5 shrink-0">{typeIcon(n.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {isAr ? n.titleAr : n.titleEn}
              </p>
              {n.bodyAr && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {isAr ? n.bodyAr : n.bodyEn}
                </p>
              )}
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                {new Date(n.createdAt).toLocaleString(
                  isAr ? "ar" : "en-US",
                  { dateStyle: "medium", timeStyle: "short" }
                )}
              </p>
            </div>
            {!n.isRead && (
              <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
            )}
          </button>
        ))}
      </>
    );
  };

  return (
    <div className="relative" ref={triggerRef}>
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open && loadState === "idle") load(true);
        }}
        className={`relative p-2.5 rounded-lg transition-colors ${
          open
            ? scrolled
              ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light"
              : "bg-white/15 text-white"
            : scrolled
              ? "text-text hover:bg-gray-100 dark:text-white dark:hover:bg-dark-card"
              : "text-white/80 hover:text-white hover:bg-white/10"
        }`}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -end-0.5 min-w-4.5 h-4.5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-dark-surface">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            dir={isAr ? "rtl" : "ltr"}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-[60] w-[min(360px,calc(100vw-2rem))] bg-white dark:bg-dark-surface dark:border dark:border-dark-border rounded-xl shadow-xl border border-border overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-dark-border">
              <p className="font-bold text-gray-900 dark:text-white text-sm">
                {isAr ? "الإشعارات" : "Notifications"}
              </p>
              {unread > 0 && (
                <button
                  onClick={() => load(true)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  {isAr ? "تحديد الكل كمقروء" : "Mark all read"}
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">{renderContent()}</div>
            <button
              onClick={() => {
                setOpen(false);
                router.push(`/${lang}/notifications`);
              }}
              className="w-full px-4 py-2.5 text-sm font-semibold bg-gray-50 dark:bg-dark-card text-primary hover:bg-gray-100 dark:hover:bg-dark-border transition-colors border-t border-gray-100 dark:border-dark-border"
            >
              {isAr ? "عرض الكل" : "View all"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
