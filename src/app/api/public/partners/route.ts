import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";

export async function GET() {
  try {
    const cacheKey = "partners:all";
    const cached = getCached(cacheKey, CACHE_TTL.LONG);
    if (cached) return NextResponse.json(cached);

    const partners = await prisma.partner.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        logo: true,
        website: true,
        descriptionAr: true,
        descriptionEn: true,
        type: true,
        isActive: true,
      },
    });

    setCache(cacheKey, partners, CACHE_TTL.LONG);
    return NextResponse.json(partners);
  } catch {
    return NextResponse.json({ error: "Failed to fetch partners" }, { status: 500 });
  }
}
