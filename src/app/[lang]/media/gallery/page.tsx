import { Suspense } from "react";
import prisma from "@/lib/prisma";
import HeroSection from "@/components/ui/hero-section";
import GalleryClient from "./gallery-client";
import { Image } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function GalleryPage({ params }: Props) {
  const { lang } = await params;
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const items = await prisma.gallery.findMany({
    where: { isActive: true },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      imageUrl: true,
      fileUrl: true,
      thumbnailUrl: true,
      album: true,
      tags: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const serialized = items.map((item) => ({
    ...item,
    id: String(item.id),
    createdAt: item.createdAt?.toISOString() || null,
  }));

  return (
    <div dir={dir}>
      <Suspense fallback={<div className="py-20 bg-gradient-to-br from-primary via-primary-light to-primary min-h-[300px]" />}>
        <HeroSection
          pageSlug="gallery"
          lang={lang}
          defaultTitle={isArabic ? "المعرض" : "Gallery"}
          defaultSubtitle={
            isArabic
              ? "تصفح صور وفيديوهات ومستندات فعالياتنا"
              : "Browse photos, videos and documents of our events"
          }
          badge={
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm">
              <Image className="w-4 h-4" />
              <span>{isArabic ? "المعرض" : "Gallery"}</span>
            </div>
          }
        />
      </Suspense>

      <GalleryClient items={serialized} isArabic={isArabic} />
    </div>
  );
}
