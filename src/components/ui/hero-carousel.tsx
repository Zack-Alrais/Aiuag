"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroImage {
  id: string;
  imageUrl: string;
  titleAr: string | null;
  titleEn: string | null;
  subtitleAr: string | null;
  subtitleEn: string | null;
  linkUrl: string | null;
}

interface HeroCarouselProps {
  images: HeroImage[];
  pageSlug: string;
  lang: string;
  defaultTitle?: string;
  defaultSubtitle?: string;
  gradient?: string;
  children?: React.ReactNode;
  badge?: React.ReactNode;
}

export default function HeroCarousel({
  images,
  lang,
  defaultTitle,
  defaultSubtitle,
  gradient = "from-primary via-primary-light to-primary",
  children,
  badge,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const isArabic = lang === "ar";

  const goNext = useCallback(() => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setProgress(0);
  }, [images.length]);

  const goPrev = useCallback(() => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setProgress(0);
  }, [images.length]);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;

    const totalDuration = 5000;
    const interval = 100;
    let elapsed = 0;

    progressRef.current = setInterval(() => {
      elapsed += interval;
      setProgress((elapsed / totalDuration) * 100);
    }, interval);

    timerRef.current = setInterval(() => {
      elapsed = 0;
      setProgress(0);
      goNext();
    }, totalDuration);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [images.length, goNext]);

  const hasImages = images.length > 0;
  const currentImage = hasImages ? images[currentIndex] : null;

  const getTitle = (img: HeroImage | null) =>
    img ? (isArabic ? img.titleAr : img.titleEn) || defaultTitle : defaultTitle;
  const getSubtitle = (img: HeroImage | null) =>
    img ? (isArabic ? img.subtitleAr : img.subtitleEn) || defaultSubtitle : defaultSubtitle;

  return (
    <section className="relative py-20 md:py-28 overflow-hidden" dir={isArabic ? "rtl" : "ltr"}>
      <div className="absolute inset-0">
        {hasImages ? (
          <>
            {images.map((img, i) => (
              <div
                key={img.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  i === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <Image
                  src={img.imageUrl}
                  alt={getTitle(img) || ""}
                  fill
                  className="object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                  priority={i === 0}
                  sizes="100vw"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />
              </div>
            ))}
          </>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
        )}

        <div className="absolute inset-0 opacity-10 z-20 pointer-events-none">
          <div className="absolute top-20 start-20 w-72 h-72 rounded-full bg-secondary blur-3xl" />
          <div className="absolute bottom-20 end-20 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-30">
        {children ? (
          <div>{children}</div>
        ) : (
          <div className="max-w-3xl mx-auto text-center">
            {badge && <div className="mb-4">{badge}</div>}
            <h1
              key={`title-${currentIndex}`}
              className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight animate-fade-in"
            >
              {getTitle(currentImage) || ""}
            </h1>
            {getSubtitle(currentImage) && (
              <p
                key={`sub-${currentIndex}`}
                className="text-xl text-white/80 animate-fade-in"
              >
                {getSubtitle(currentImage)}
              </p>
            )}
          </div>
        )}

        {hasImages && images.length > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={goPrev}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              {isArabic ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>

            <div className="flex gap-2 items-center">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="group relative"
                >
                  <div className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? "bg-white w-8"
                      : "bg-white/40 w-2 hover:bg-white/60"
                  }`} />
                  {i === currentIndex && (
                    <div className="absolute inset-0 overflow-hidden rounded-full">
                      <div
                        className="h-full bg-white/50 transition-all duration-100"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={goNext}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              {isArabic ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20" style={{ height: "80px" }}>
        <svg viewBox="0 0 1440 80" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <mask id="wave-mask">
              <rect width="1440" height="80" fill="black" />
              <path d="M0 80L60 70C120 60 240 40 360 30C480 20 600 20 720 25C840 30 960 40 1080 45C1200 50 1320 50 1380 50L1440 50V80H0Z" fill="white" />
            </mask>
            <filter id="blur-filter">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>
          {hasImages ? (
            <image
              href={images[currentIndex]?.imageUrl || ""}
              x="0"
              y="-520"
              width="1440"
              height="600"
              filter="url(#blur-filter)"
              mask="url(#wave-mask)"
              opacity="0.4"
              preserveAspectRatio="xMidYMid slice"
            />
          ) : (
            <rect
              width="1440"
              height="80"
              fill="var(--color-primary)"
              mask="url(#wave-mask)"
              opacity="0.4"
              filter="url(#blur-filter)"
            />
          )}
        </svg>
        <svg viewBox="0 0 1440 80" fill="none" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <path d="M0 80L60 70C120 60 240 40 360 30C480 20 600 20 720 25C840 30 960 40 1080 45C1200 50 1320 50 1380 50L1440 50V80H0Z" fill="var(--color-background)" opacity="0.6" />
        </svg>
      </div>
    </section>
  );
}
