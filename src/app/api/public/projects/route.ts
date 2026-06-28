import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const cacheKey = `projects:${limit}`;

    const cached = getCached(cacheKey, CACHE_TTL.MEDIUM);
    if (cached) return NextResponse.json(cached);

    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        titleEn: true,
        description: true,
        status: true,
        imageUrl: true,
        category: true,
        createdAt: true,
      },
    });

    setCache(cacheKey, projects, CACHE_TTL.MEDIUM);
    return NextResponse.json(projects);
  } catch {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}
