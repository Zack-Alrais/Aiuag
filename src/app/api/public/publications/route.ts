import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const category = searchParams.get("category");
    const cacheKey = `publications:${category || "all"}:${limit}`;

    const cached = getCached(cacheKey, CACHE_TTL.MEDIUM);
    if (cached) return NextResponse.json(cached);

    const where: Record<string, unknown> = {};
    if (category && category !== "all") where.category = category;

    const publications = await prisma.publication.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
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
    });

    setCache(cacheKey, publications, CACHE_TTL.MEDIUM);
    return NextResponse.json(publications);
  } catch {
    return NextResponse.json({ error: "Failed to fetch publications" }, { status: 500 });
  }
}
