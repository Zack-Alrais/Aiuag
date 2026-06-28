import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";

export async function GET() {
  try {
    const cacheKey = "gallery:all";
    const cached = getCached(cacheKey, CACHE_TTL.SHORT);
    if (cached) return NextResponse.json(cached);

    const items = await prisma.gallery.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        imageUrl: true,
        fileUrl: true,
        thumbnailUrl: true,
        album: true,
        tags: true,
        createdAt: true,
      },
    });

    setCache(cacheKey, items, CACHE_TTL.SHORT);
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}
