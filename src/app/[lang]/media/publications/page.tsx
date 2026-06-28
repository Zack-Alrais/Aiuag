import { Suspense } from "react";
import prisma from "@/lib/prisma";
import HeroSection from "@/components/ui/hero-section";
import PublicationsClient from "./publications-client";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function PublicationsPage({ params }: Props) {
  const { lang } = await params;
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const publications = await prisma.publication.findMany({
    select: {
      id: true,
      title: true,
      titleEn: true,
      description: true,
      category: true,
      fileUrl: true,
      imageUrl: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const serialized = publications.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div dir={dir}>
      <Suspense fallback={<div className="py-20 bg-gradient-to-br from-primary via-primary-light to-primary min-h-[300px]" />}>
        <HeroSection
          pageSlug="publications"
          lang={lang}
          defaultTitle={isArabic ? "المنشورات" : "Publications"}
          defaultSubtitle={isArabic
            ? "تحميل المنشورات والتقارير والمجلات الصادرة عن الرابطة"
            : "Download publications, reports, and magazines issued by the association"}
          badge={
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm">
              <FileText className="w-4 h-4" />
              <span>{isArabic ? "منشوراتنا" : "Our Publications"}</span>
            </div>
          }
        />
      </Suspense>

      <PublicationsClient publications={serialized} isArabic={isArabic} />
    </div>
  );
}
