import { Suspense } from "react";
import HeroSection from "@/components/ui/hero-section";
import PostsHub from "@/components/social/posts-hub";
import { MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function PostsPage({ params }: Props) {
  const { lang } = await params;
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  return (
    <div dir={dir}>
      <Suspense fallback={<div className="py-20 bg-gradient-to-br from-primary via-primary-light to-primary min-h-[300px]" />}>
        <HeroSection
          pageSlug="posts"
          lang={lang}
          defaultTitle={isArabic ? "منشورات المجتمع" : "Community Posts"}
          defaultSubtitle={isArabic ? "شارك وتفاعل مع مجتمع الخريجين" : "Share and interact with the alumni community"}
          badge={
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm">
              <MessageSquare className="w-4 h-4" />
              <span>{isArabic ? "المنشورات" : "Posts"}</span>
            </div>
          }
        />
      </Suspense>
      <PostsHub lang={lang} />
    </div>
  );
}