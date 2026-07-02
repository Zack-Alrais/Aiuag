"use client";

import { useState, useEffect } from "react";
import HeroCarousel from "./hero-carousel";

interface HeroImage {
  id: string;
  imageUrl: string;
  titleAr: string | null;
  titleEn: string | null;
  subtitleAr: string | null;
  subtitleEn: string | null;
  linkUrl: string | null;
}

interface HeroSectionProps {
  pageSlug: string;
  lang: string;
  defaultTitle?: string;
  defaultSubtitle?: string;
  gradient?: string;
  children?: React.ReactNode;
  badge?: React.ReactNode;
}

export default function HeroSection({
  pageSlug,
  lang,
  defaultTitle,
  defaultSubtitle,
  gradient = "from-primary via-primary-light to-primary",
  children,
}: HeroSectionProps) {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/hero-images")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const filtered = list.filter(
          (img: { pageSlug?: string }) =>
            img.pageSlug?.includes(pageSlug)
        );
        setImages(
          filtered.map((img: any) => ({
            id: img.id,
            imageUrl: img.imageUrl,
            titleAr: img.titleAr || null,
            titleEn: img.titleEn || null,
            subtitleAr: img.subtitleAr || null,
            subtitleEn: img.subtitleEn || null,
            linkUrl: img.linkUrl || null,
          }))
        );
      })
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, [pageSlug]);

  if (loading) {
    return (
      <section className="relative py-20 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
        <div className="container mx-auto px-4 relative z-30">
          <div className="max-w-3xl mx-auto text-center">
            <div className="h-12 w-64 bg-white/10 rounded-xl mx-auto animate-pulse mb-4" />
            <div className="h-6 w-96 bg-white/10 rounded-lg mx-auto animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <HeroCarousel
      images={images}
      pageSlug={pageSlug}
      lang={lang}
      defaultTitle={defaultTitle}
      defaultSubtitle={defaultSubtitle}
      gradient={gradient}
    >
      {children}
    </HeroCarousel>
  );
}
