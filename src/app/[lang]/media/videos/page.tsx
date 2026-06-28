import { Suspense } from "react";
import prisma from "@/lib/prisma";
import HeroSection from "@/components/ui/hero-section";
import VideosClient from "./videos-client";
import { Play } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function VideosPage({ params }: Props) {
  const { lang } = await params;
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const videos = await prisma.video.findMany({
    select: {
      id: true,
      title: true,
      titleEn: true,
      url: true,
      thumbnail: true,
      category: true,
      description: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const serialized = videos.map((v) => ({
    ...v,
    createdAt: v.createdAt.toISOString(),
  }));

  return (
    <div dir={dir}>
      <Suspense fallback={<div className="py-20 bg-gradient-to-br from-primary via-primary-light to-primary min-h-[300px]" />}>
        <HeroSection
          pageSlug="videos"
          lang={lang}
          defaultTitle={isArabic ? "مكتبة الفيديوهات" : "Video Library"}
          defaultSubtitle={isArabic
            ? "شاهد فيديوهات مؤتمراتنا ومحاضراتنا وفعالياتنا"
            : "Watch videos of our conferences, lectures, and events"}
          badge={
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm">
              <Play className="w-4 h-4" />
              <span>{isArabic ? "الفيديوهات" : "Videos"}</span>
            </div>
          }
        />
      </Suspense>

      <VideosClient videos={serialized} isArabic={isArabic} />
    </div>
  );
}
