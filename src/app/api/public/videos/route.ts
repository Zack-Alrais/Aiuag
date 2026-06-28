import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const category = searchParams.get("category");
    const cacheKey = `videos:${category || "all"}:${limit}`;

    const cached = getCached(cacheKey, CACHE_TTL.MEDIUM);
    if (cached) return NextResponse.json(cached);

    const where: Record<string, unknown> = {};
    if (category && category !== "all") where.category = category;

    const videos = await prisma.video.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        titleEn: true,
        url: true,
        description: true,
        category: true,
        thumbnail: true,
        createdAt: true,
      },
    });

    setCache(cacheKey, videos, CACHE_TTL.MEDIUM);
    return NextResponse.json(videos);
  } catch {
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}
