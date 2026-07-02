import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";

export async function GET() {
  try {
    const cacheKey = "hero:images";
    const cached = getCached(cacheKey, CACHE_TTL.LONG);
    if (cached) return NextResponse.json(cached);

    const images = await prisma.heroImage.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        titleAr: true,
        titleEn: true,
        imageUrl: true,
        subtitleAr: true,
        subtitleEn: true,
        linkUrl: true,
        pageSlugs: true,
      },
    });

    // Map to camelCase for frontend compatibility
    const mapped = images.map((img) => ({
      ...img,
      pageSlug: img.pageSlugs,
    }));

    setCache(cacheKey, mapped, CACHE_TTL.LONG);
    return NextResponse.json(mapped);
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch hero images" }, { status: 500 });
  }
}
