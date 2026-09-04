"use client";

import { useState } from "react";
import { Globe, Users } from "lucide-react";
import PostsFeed from "@/app/[lang]/media/posts/feed";
import SocialColumn from "@/components/social/social-column";
import LeftColumn from "@/components/social/left-column";
import { useMember } from "@/hooks/use-member";
import { useRouter } from "next/navigation";

function RightColumnSkeleton({ isAr }: { isAr: boolean }) {
  return (
    <div className="bg-white dark:bg-[#111927] rounded-2xl border border-gray-100 dark:border-[#1e2d42] p-5 space-y-3 animate-pulse">
      <div className="h-4 w-1/2 bg-gray-200 dark:bg-[#1e2d42] rounded" />
      <div className="h-3 w-3/4 bg-gray-100 dark:bg-[#0d1525] rounded" />
      <div className="h-9 w-full bg-gray-100 dark:bg-[#0d1525] rounded-lg" />
    </div>
  );
}

export default function PostsHub({ lang }: { lang: string }) {
  const isAr = lang === "ar";
  const { status, isAuthenticated } = useMember();
  const router = useRouter();

  const [scope, setScope] = useState<"" | "friends">("");

  const chips: { key: "" | "friends"; label: string }[] = [
    { key: "", label: isAr ? "الكل" : "All" },
    { key: "friends", label: isAr ? "أصدقائي" : "Friends" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_280px] gap-6 max-w-7xl mx-auto px-4 py-6">
      {/* Right (social) — first in DOM => far right in RTL */}
      <div className="order-2 lg:order-1">
        {status === "loading" ? (
          <RightColumnSkeleton isAr={isAr} />
        ) : isAuthenticated ? (
          <SocialColumn lang={lang} />
        ) : (
          <div className="bg-white dark:bg-[#111927] rounded-2xl border border-gray-100 dark:border-[#1e2d42] p-5">
            <p className="font-semibold text-gray-800 dark:text-gray-200">{isAr ? "انضم إلى المجتمع" : "Join the community"}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {isAr ? "سجّل دخولك لإدارة أصدقائك وطلبات الصداقة والاقتراحات والرسائل." : "Sign in to manage friends, requests, suggestions and messages."}
            </p>
            <button
              onClick={() => router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/${lang}/posts`)}`)}
              className="w-full mt-4 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-dark text-sm font-medium"
            >
              {isAr ? "تسجيل الدخول" : "Sign in"}
            </button>
          </div>
        )}
      </div>

      {/* Center — the feed */}
      <div className="order-first lg:order-2 min-w-0">
        <div className="flex items-center gap-2 mb-4">
          {chips.map((c) => (
            <button
              key={c.key}
              onClick={() => setScope(c.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                scope === c.key ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#1e2d42] dark:text-gray-300"
              }`}
            >
              {c.key === "friends" ? <Users className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
              {c.label}
            </button>
          ))}
        </div>
        <PostsFeed scope={scope} embedded showComposer title={isAr ? "منشورات المجتمع" : "Community Posts"} />
      </div>

      {/* Left (info) — far left in RTL */}
      <div className="order-3 lg:order-3">
        <LeftColumn lang={lang} />
      </div>
    </div>
  );
}