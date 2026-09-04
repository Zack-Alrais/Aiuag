"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMember } from "@/hooks/use-member";
import PostsFeed from "@/app/[lang]/media/posts/feed";

export default function SavedPostsPage() {
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "ar";
  const isAr = lang === "ar";
  const router = useRouter();
  const { status } = useMember();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/auth/login?callbackUrl=${encodeURIComponent(`/${lang}/saved-posts`)}`);
    }
  }, [status, lang, router]);

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PostsFeed
      scope="saved"
      title={isAr ? "المنشورات المحفوظة" : "Saved Posts"}
      subtitle={isAr ? "منشوراتك المحفوظة — للرجوع إليها لاحقاً" : "Your saved posts — come back to them later"}
    />
  );
}