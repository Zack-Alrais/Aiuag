import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";

export async function GET() {
  try {
    const cacheKey = "faqs:all";
    const cached = getCached(cacheKey, CACHE_TTL.LONG);
    if (cached) return NextResponse.json(cached);

    const faqs = await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        questionAr: true,
        questionEn: true,
        answerAr: true,
        answerEn: true,
        category: true,
        order: true,
      },
    });

    setCache(cacheKey, faqs, CACHE_TTL.LONG);
    return NextResponse.json(faqs);
  } catch {
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 });
  }
}
