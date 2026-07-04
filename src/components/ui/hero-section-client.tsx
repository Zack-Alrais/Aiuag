"use client"

import { useState, useEffect } from "react"
import HeroCarousel from "./hero-carousel"

interface HeroSectionClientProps {
  pageSlug: string
  lang: string
  defaultTitle?: string
  defaultSubtitle?: string
  gradient?: string
  children?: React.ReactNode
  badge?: React.ReactNode
}

export default function HeroSectionClient({
  pageSlug,
  lang,
  defaultTitle,
  defaultSubtitle,
  gradient,
  children,
  badge,
}: HeroSectionClientProps) {
  const [images, setImages] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/public/hero-images")
      .then((res) => res.json())
      .then((data) => {
        const filtered = (Array.isArray(data) ? data : [])
          .filter((img: any) => {
            const slugs = img.pageSlug || img.pageSlugs || []
            return slugs.includes(pageSlug)
          })
          .map((img: any) => ({
            id: img.id,
            imageUrl: img.imageUrl,
            titleAr: img.titleAr,
            titleEn: img.titleEn,
            subtitleAr: img.subtitleAr,
            subtitleEn: img.subtitleEn,
            linkUrl: img.linkUrl,
          }))
        setImages(filtered)
      })
      .catch(() => setImages([]))
  }, [pageSlug])

  return (
    <HeroCarousel
      images={images}
      pageSlug={pageSlug}
      lang={lang}
      defaultTitle={defaultTitle}
      defaultSubtitle={defaultSubtitle}
      gradient={gradient}
      badge={badge}
    >
      {children}
    </HeroCarousel>
  )
}
