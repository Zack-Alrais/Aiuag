import prisma from "@/lib/prisma";
import HeroCarousel from "./hero-carousel";

interface HeroSectionProps {
  pageSlug: string;
  lang: string;
  defaultTitle?: string;
  defaultSubtitle?: string;
  gradient?: string;
  children?: React.ReactNode;
}

export default async function HeroSection({
  pageSlug,
  lang,
  defaultTitle,
  defaultSubtitle,
  gradient = "from-primary via-primary-light to-primary",
  children,
}: HeroSectionProps) {
  const images = await prisma.heroImage.findMany({
    where: { pageSlugs: { contains: pageSlug } },
    select: {
      id: true,
      imageUrl: true,
      titleAr: true,
      titleEn: true,
      subtitleAr: true,
      subtitleEn: true,
      linkUrl: true,
    },
    orderBy: { createdAt: "desc" },
  });

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
