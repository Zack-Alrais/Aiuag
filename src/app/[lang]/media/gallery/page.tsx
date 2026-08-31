import { Suspense } from "react";
import HeroSection from "@/components/ui/hero-section";
import GalleryClient, { type GalleryItem } from "./gallery-client";
import { Image } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function GalleryPage({ params }: Props) {
  const { lang } = await params;
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  // Fetch from API which combines Gallery + Video tables
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:9000`;
  let items: GalleryItem[] = [];
  try {
    const res = await fetch(`${baseUrl}/api/public/gallery`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      const data = (await res.json()) as unknown;
      if (Array.isArray(data)) items = data as GalleryItem[];
    }
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
