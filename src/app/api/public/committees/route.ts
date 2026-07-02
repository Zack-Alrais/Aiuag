import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";

export async function GET() {
  try {
    const cacheKey = "committees:all";
    const cached = getCached(cacheKey, CACHE_TTL.LONG);
    if (cached) return NextResponse.json(cached);

    const committees = await prisma.committee.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        descriptionAr: true,
        descriptionEn: true,
        chairNameAr: true,
        chairNameEn: true,
        type: true,
        email: true,
        phone: true,
        isActive: true,
      },
    });

    setCache(cacheKey, committees, CACHE_TTL.LONG);
    return NextResponse.json(committees);
  } catch {
    return NextResponse.json({ error: "Failed to fetch committees" }, { status: 500 });
  }
}
