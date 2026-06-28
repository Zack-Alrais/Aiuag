import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const cacheKey = `events:${limit}`;

    const cached = getCached(cacheKey, CACHE_TTL.SHORT);
    if (cached) return NextResponse.json(cached);

    const events = await prisma.event.findMany({
      orderBy: { date: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        titleEn: true,
        description: true,
        date: true,
        location: true,
        imageUrl: true,
        category: true,
      },
    });

    setCache(cacheKey, events, CACHE_TTL.SHORT);
    return NextResponse.json(events);
  } catch {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
