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
        title: true,
        imageUrl: true,
        subtitle: true,
        pageSlug: true,
      },
    });

    setCache(cacheKey, images, CACHE_TTL.LONG);
    return NextResponse.json(images);
  } catch {
    return NextResponse.json({ error: "Failed to fetch hero images" }, { status: 500 });
  }
}
