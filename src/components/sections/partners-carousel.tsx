"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import { Handshake, Building2, Globe, ExternalLink, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react"

interface Partner {
  id: string | number
  nameAr?: string
  nameEn?: string
  name?: string
  descriptionAr?: string
  descriptionEn?: string
  description?: string
  logo?: string
  website?: string
  type?: string
  [key: string]: unknown
}

interface PartnersCarouselProps {
  lang: string
  isArabic: boolean
}

function getDomain(url: string): string {
  try {
    const u = new URL(url)
    return u.hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

function LogoImage({ partner, name, className = "w-28 h-28" }: { partner: Partner; name: string; className?: string }) {
  const [error, setError] = useState(false)
  const showFallback = !!partner.logo && !error ? false : true

  if (!partner.logo || error) {
    return (
      <div
        className={`${className}rounded-2xl bg-surface dark:bg-dark-card border border-border dark:border-dark-border flex items-center justify-center`}
      >
        <Building2 className="w-12 h-12 text-text-light dark:text-gray-500" />
      </div>
    )
  }

  return (
    <div className={`${className} flex items-center justify-center`}>
      <img
        src={partner.logo as string}
        alt={name}
        className="max-h-full max-w-full object-contain"
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  )
}

export default function PartnersCarousel({ lang, isArabic }: PartnersCarouselProps) {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const options = useMemo(
    () => ({
      align: "start" as const,
      direction: isArabic ? ("rtl" as const) : ("ltr" as const),
      containScroll: "trimSnaps" as const,
    }),
    [isArabic]
  )
  const [emblaRef, emblaApi] = useEmblaCarousel(options)

  useEffect(() => {
    let active = true
    fetch("/api/public/partners")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (active) setPartners(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanPrev(emblaApi.canScrollPrev())
    setCanNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    emblaApi.on("slidesChanged", onSelect)
    onSelect()
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
      emblaApi.off("slidesChanged", onSelect)
    }
  }, [emblaApi, onSelect])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const getName = (p: Partner) => (isArabic ? p.nameAr || p.name || "" : p.nameEn || p.name || "")
  const getDescription = (p: Partner) =>
    isArabic ? p.descriptionAr || p.description || "" : p.descriptionEn || p.description || ""

  const renderSkeleton = () => (
    <div className="flex overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="min-w-0 flex-[0_0_88%] sm:flex-[0_0_48%] md:flex-[0_0_38%] lg:flex-[0_0_28%] pl-3 sm:pl-4 shrink-0">
          <div className="bg-surface dark:bg-dark-card rounded-2xl border border-border dark:border-dark-border p-7 space-y-4">
            <div className="w-28 h-28 mx-auto rounded-2xl animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light" />
            <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-4 w-2/3 mx-auto rounded" />
            <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-3 w-1/2 mx-auto rounded" />
            <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-3 w-full rounded" />
          </div>
        </div>
      ))}
    </div>
  )

  if (!loading && partners.length === 0) return null

  return (
    <section dir={isArabic ? "rtl" : "ltr"} className="py-20 bg-background dark:bg-dark overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-primary dark:text-primary-light text-sm font-bold uppercase tracking-wide mb-3">
            <Handshake className="w-5 h-5" />
            {isArabic ? "شركاؤنا" : "Our Partners"}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-text dark:text-white">
            {isArabic ? "شركاء يدعمون رسالتنا" : "Partners Supporting Our Mission"}
          </h2>
          <div className="w-20 h-1 bg-secondary mx-auto rounded-full mt-4" />
        </div>

        {loading ? (
          renderSkeleton()
        ) : (
          <>
            {/* Carousel */}
            <div className="relative max-w-full">
              <div ref={emblaRef} className="overflow-hidden -mx-1 px-1">
                <div className="flex">
                  {partners.map((partner) => {
                    const name = getName(partner)
                    const website = (partner.website || "").trim()
                    const description = getDescription(partner)
                    return (
                      <div
                        key={partner.id}
                        className="min-w-0 flex-[0_0_88%] sm:flex-[0_0_48%] md:flex-[0_0_38%] lg:flex-[0_0_28%] pl-3 sm:pl-4 last:pr-0 shrink-0"
                      >
                        <div className="h-full flex flex-col items-center text-center bg-surface dark:bg-dark-card rounded-2xl border border-border dark:border-dark-border p-6 sm:p-7 shadow-sm hover:shadow-card-hover transition-all duration-300">
                          {/* Transparent logo at top */}
                          <div className="w-28 h-28 shrink-0 mb-5 flex items-center justify-center">
                            <LogoImage partner={partner} name={name} />
                          </div>

                          <h3 className="text-lg font-bold text-text dark:text-white leading-snug mb-2">
                            {name}
                          </h3>

                          {website && (
                            <div className="flex items-center justify-center gap-1.5 text-sm text-text-light dark:text-gray-400 mb-3 w-full">
                              <Globe className="w-4 h-4 shrink-0 text-primary/60 dark:text-primary-light/60" />
                              <span className="truncate">{getDomain(website)}</span>
                            </div>
                          )}

                          {description && (
                            <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed mb-4 line-clamp-3 flex-1">
                              {description}
                            </p>
                          )}

                          {website && (
                            <a
                              href={website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-primary dark:text-primary-light bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              {isArabic ? "زيارة الموقع" : "Visit Website"}
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Navigation controls */}
            {partners.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={scrollPrev}
                  disabled={!canPrev}
                  aria-label={isArabic ? "السابق" : "Previous"}
                  className="w-12 h-12 flex items-center justify-center rounded-full border border-border dark:border-dark-border bg-surface dark:bg-dark-card text-text-secondary dark:text-gray-400 hover:text-primary hover:border-primary/40 hover:scale-105 transition-all disabled:opacity-30 disabled:hover:scale-100 disabled:pointer-events-none"
                >
                  {isArabic ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
                </button>
                <button
                  onClick={scrollNext}
                  disabled={!canNext}
                  aria-label={isArabic ? "التالي" : "Next"}
                  className="w-12 h-12 flex items-center justify-center rounded-full border border-border dark:border-dark-border bg-surface dark:bg-dark-card text-text-secondary dark:text-gray-400 hover:text-primary hover:border-primary/40 hover:scale-105 transition-all disabled:opacity-30 disabled:hover:scale-100 disabled:pointer-events-none"
                >
                  {isArabic ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                </button>
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href={`/${lang}/contact`}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
          >
            <Handshake className="w-5 h-5" />
            {isArabic ? "كن شريكاً معنا" : "Become a Partner"}
            {isArabic ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
          </Link>
        </div>
      </div>
    </section>
  )
}
