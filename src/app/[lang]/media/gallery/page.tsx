import { Suspense } from "react";
import HeroSection from "@/components/ui/hero-section";
import GalleryClient, { type GalleryItem } from "./gallery-client";
import { Image } from "lucide-react";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ lang: string }>;
}

function getYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?#]+)/
  )
  return match ? match[1] : null
}

function getYoutubeThumbnail(url: string): string | null {
  const id = getYoutubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null
}

export default async function GalleryPage({ params }: Props) {
  const { lang } = await params;
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  // Combine Gallery + Video models directly (same as /api/public/gallery)
  let items: GalleryItem[] = [];
  try {
    const [galleryItems, videoItems] = await Promise.all([
      prisma.gallery.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
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
      }),
      prisma.video.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          titleEn: true,
          url: true,
          description: true,
          category: true,
          thumbnail: true,
          createdAt: true,
        },
      }),
    ]);

    const transformedVideos: GalleryItem[] = videoItems.map((v) => {
      const ytId = getYoutubeId(v.url);
      const isYT = !!ytId;
      const thumb = v.thumbnail || (isYT ? getYoutubeThumbnail(v.url) : null);
      return {
        id: v.id,
        title: v.title,
        description: v.description ?? undefined,
        type: "video",
        imageUrl: thumb ?? undefined,
        fileUrl: v.url,
        thumbnailUrl: thumb ?? undefined,
        album: v.category || "videos",
        tags: undefined,
        createdAt: v.createdAt.toISOString(),
        titleEn: v.titleEn,
        isYT,
        isUpload: !isYT,
      };
    });

    const transformedGallery: GalleryItem[] = galleryItems.map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description ?? undefined,
      type: g.type,
      imageUrl: g.imageUrl,
      fileUrl: g.fileUrl,
      thumbnailUrl: g.thumbnailUrl ?? undefined,
      album: g.album,
      tags: g.tags ?? undefined,
      createdAt: g.createdAt.toISOString(),
    }));

    items = [...transformedGallery, ...transformedVideos].sort((a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime()
    );
  } catch {
    items = [];
  }

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

      <GalleryClient items={items} isArabic={isArabic} />
    </div>
  );
}
