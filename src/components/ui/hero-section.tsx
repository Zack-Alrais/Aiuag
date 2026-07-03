import prisma from "@/lib/prisma";
import HeroCarousel from "./hero-carousel";

interface HeroSectionProps {
  pageSlug: string;
  lang: string;
  defaultTitle?: string;
  defaultSubtitle?: string;
  gradient?: string;
  children?: React.ReactNode;
  badge?: React.ReactNode;
}

export default async function HeroSection({
  pageSlug,
  lang,
  defaultTitle,
  defaultSubtitle,
  gradient = "from-primary via-primary-light to-primary",
  children,
  badge,
}: HeroSectionProps) {
  let images: {
    id: string;
    imageUrl: string;
    titleAr: string | null;
    titleEn: string | null;
    subtitleAr: string | null;
    subtitleEn: string | null;
    linkUrl: string | null;
  }[] = [];

  try {
    const dbImages = await prisma.heroImage.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        imageUrl: true,
        titleAr: true,
        titleEn: true,
        subtitleAr: true,
        subtitleEn: true,
        linkUrl: true,
        pageSlugs: true,
      },
    });

    images = dbImages
      .filter((img) => img.pageSlugs?.includes(pageSlug))
      .map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        titleAr: img.titleAr,
        titleEn: img.titleEn,
        subtitleAr: img.subtitleAr,
        subtitleEn: img.subtitleEn,
        linkUrl: img.linkUrl,
      }));
  } catch {
    images = [];
  }

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
  );
}
