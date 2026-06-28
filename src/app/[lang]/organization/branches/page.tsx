import { Suspense } from "react";
import prisma from "@/lib/prisma";
import HeroSection from "@/components/ui/hero-section";
import BranchesClient from "./branches-client";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function BranchesPage({ params }: Props) {
  const { lang } = await params;
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const branches = await prisma.branch.findMany({
    select: {
      id: true,
      name: true,
      nameEn: true,
      city: true,
      country: true,
      status: true,
      type: true,
      address: true,
      phone: true,
      email: true,
      headName: true,
      memberCount: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const serialized = branches.map((b) => ({
    ...b,
    id: String(b.id),
  }));

  return (
    <div dir={dir}>
      <Suspense fallback={<div className="py-20 bg-gradient-to-br from-primary via-primary-light to-primary min-h-[300px]" />}>
        <HeroSection
          pageSlug="branches"
          lang={lang}
          defaultTitle={isArabic ? "فروع الرابطة" : "Association Branches"}
          defaultSubtitle={isArabic
            ? "شبكة واسعة من الفروع تغطي السودان وأفريقيا والعالم"
            : "A wide network of branches covering Sudan, Africa, and beyond"}
        >
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
              {isArabic ? "فروع الرابطة" : "Association Branches"}
            </h1>
            <p className="text-xl text-white/80 mb-8 animate-fade-in">
              {isArabic
                ? "شبكة واسعة من الفروع تغطي السودان وأفريقيا والعالم"
                : "A wide network of branches covering Sudan, Africa, and beyond"}
            </p>
          </div>
        </HeroSection>
      </Suspense>

      <BranchesClient branches={serialized} isArabic={isArabic} />
    </div>
  );
}
