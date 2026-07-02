import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";

export async function GET() {
  try {
    const cacheKey = "board:all";
    const cached = getCached(cacheKey, CACHE_TTL.LONG);
    if (cached) return NextResponse.json(cached);

    const members = await prisma.boardMember.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        positionAr: true,
        positionEn: true,
        photo: true,
        email: true,
        phone: true,
        bioAr: true,
        bioEn: true,
      },
    });

    setCache(cacheKey, members, CACHE_TTL.LONG);
    return NextResponse.json(members);
  } catch {
    return NextResponse.json({ error: "Failed to fetch board" }, { status: 500 });
  }
}
