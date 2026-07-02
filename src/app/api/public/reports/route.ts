import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const cacheKey = `reports:${limit}`;

    const cached = getCached(cacheKey, CACHE_TTL.MEDIUM);
    if (cached) return NextResponse.json(cached);

    const reports = await prisma.publication.findMany({
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

    // Enrich with year field from createdAt
    const enriched = reports.map((r) => ({
      ...r,
      year: r.createdAt.getFullYear(),
    }));

    setCache(cacheKey, enriched, CACHE_TTL.MEDIUM);
    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
