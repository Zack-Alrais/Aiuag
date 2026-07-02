import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const category = searchParams.get("category");
    const cacheKey = `news:${category || "all"}:${limit}`;

    const cached = getCached(cacheKey, CACHE_TTL.SHORT);
    if (cached) return NextResponse.json(cached);

    const where: Record<string, unknown> = { status: "published" };
    if (category && category !== "all") where.category = category;

    const news = await prisma.news.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        titleAr: true,
        titleEn: true,
        excerptAr: true,
        excerptEn: true,
        contentAr: true,
        contentEn: true,
        slug: true,
        category: true,
        featuredImage: true,
        publishedAt: true,
        createdAt: true,
      },
    });

    setCache(cacheKey, news, CACHE_TTL.SHORT);
    return NextResponse.json(news);
  } catch {
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
