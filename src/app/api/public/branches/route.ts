import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const cacheKey = `branches:${limit}`;

    const cached = getCached(cacheKey, CACHE_TTL.MEDIUM);
    if (cached) return NextResponse.json(cached);

    const branches = await prisma.branch.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        nameEn: true,
        city: true,
        country: true,
        status: true,
        type: true,
        address: true,
        phone: true,
        email: true,
        headName: true,
        memberCount: true,
      },
    });

    setCache(cacheKey, branches, CACHE_TTL.MEDIUM);
    return NextResponse.json(branches);
  } catch {
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 });
  }
}
