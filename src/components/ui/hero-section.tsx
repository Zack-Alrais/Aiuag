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

// Fallback slider images used when a page has no hero images configured in the
// database yet (e.g. "videos" and "posts"). DB-configured images always win.
const DEFAULT_HERO_IMAGES: Record<string, { imageUrl: string; titleAr: string; titleEn: string; subtitleAr: string; subtitleEn: string; linkUrl: string | null }[]> = {
  home: [
    { imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c8f1?w=1600&h=900&fit=crop", titleAr: "رابطة خريجي جامعة أفريقيا العالمية", titleEn: "AIUAG Alumni Association", subtitleAr: "نربط الخريجين.. نبني المستقبل", subtitleEn: "Connecting Alumni, Building the Future", linkUrl: null },
  ],
  about: [
    { imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?w=1600&h=900&fit=crop", titleAr: "عن الرابطة", titleEn: "About Us", subtitleAr: "تعرف على رؤيتنا ورسالتنا", subtitleEn: "Learn about our vision and mission", linkUrl: null },
  ],
  media: [
    { imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168d9c?w=1600&h=900&fit=crop", titleAr: "المركز الإعلامي", titleEn: "Media Center", subtitleAr: "تابع آخر أخبارنا وفعالياتنا", subtitleEn: "Follow our latest news and events", linkUrl: null },
  ],
  gallery: [
    { imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&h=900&fit=crop", titleAr: "المعرض", titleEn: "Gallery", subtitleAr: "لحظات لا تُنسى من فعالياتنا", subtitleEn: "Unforgettable moments from our events", linkUrl: null },
  ],
  videos: [
    { imageUrl: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=1600&h=900&fit=crop", titleAr: "مكتبة الفيديوهات", titleEn: "Video Library", subtitleAr: "شاهد فيديوهات مؤتمراتنا ومحاضراتنا", subtitleEn: "Watch videos of our conferences and lectures", linkUrl: null },
    { imageUrl: "https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=1600&h=900&fit=crop", titleAr: "الفيديوهات", titleEn: "Videos", subtitleAr: "فيديوهات متنوعة من فعالياتنا", subtitleEn: "Various videos from our events", linkUrl: null },
  ],
  posts: [
    { imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&h=900&fit=crop", titleAr: "منشورات المجتمع", titleEn: "Community Posts", subtitleAr: "منصة تفاعلية لمناقشات الخريجين", subtitleEn: "Interactive platform for alumni discussions", linkUrl: null },
    { imageUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&h=900&fit=crop", titleAr: "تفاعل ومشاركة", titleEn: "Discuss & Share", subtitleAr: "شارك وتفاعل مع مجتمع الخريجين", subtitleEn: "Share and interact with the alumni community", linkUrl: null },
  ],
  news: [
    { imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168d9c?w=1600&h=900&fit=crop", titleAr: "الأخبار والأحداث", titleEn: "News & Events", subtitleAr: "آخر المستجدات والأخبار", subtitleEn: "Latest updates and news", linkUrl: null },
  ],
  events: [
    { imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&h=900&fit=crop", titleAr: "الأحداث والفعاليات", titleEn: "Events & Activities", subtitleAr: "شارك في فعالياتنا المتنوعة", subtitleEn: "Participate in our diverse events", linkUrl: null },
  ],
  projects: [
    { imageUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1600&h=900&fit=crop", titleAr: "المشاريع", titleEn: "Projects", subtitleAr: "مشاريعنا التنموية والخدمية", subtitleEn: "Our development and service projects", linkUrl: null },
  ],
  publications: [
    { imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&h=900&fit=crop", titleAr: "المنشورات", titleEn: "Publications", subtitleAr: "مطبوعات وإصدارات الرابطة", subtitleEn: "Association publications and releases", linkUrl: null },
  ],
  partners: [
    { imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1600&h=900&fit=crop", titleAr: "الشركاء", titleEn: "Partners", subtitleAr: "شركاء النجاح والتنمية", subtitleEn: "Partners of success and development", linkUrl: null },
  ],
  services: [
    { imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1600&h=900&fit=crop", titleAr: "الخدمات", titleEn: "Services", subtitleAr: "خدمات متنوعة للخريجين", subtitleEn: "Various services for graduates", linkUrl: null },
  ],
};

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

    // Fallback so pages without configured hero images still get a slider.
    if (images.length === 0) {
      const defaults = DEFAULT_HERO_IMAGES[pageSlug] ?? [];
      images = defaults.map((img, i) => ({ ...img, id: `default-${pageSlug}-${i}` }));
    }
  } catch {
    images = [];
    const defaults = DEFAULT_HERO_IMAGES[pageSlug] ?? [];
    images = defaults.map((img, i) => ({ ...img, id: `default-${pageSlug}-${i}` }));
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
