import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/side-content — lightweight digest for sidebar columns:
// latest 3 published news + the next 2 upcoming events.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") || "ar";
    const isAr = lang === "ar";

    const [news, events] = await Promise.all([
      prisma.news.findMany({
        where: { status: "published" },
        orderBy: { publishedAt: "desc" },
        take: 3,
        select: {
          slug: true,
          titleAr: true,
          titleEn: true,
          excerptAr: true,
          excerptEn: true,
          featuredImage: true,
          publishedAt: true,
        },
      }),
      prisma.event.findMany({
        where: {
          status: "upcoming",
          date: { gte: new Date() },
        },
        orderBy: { date: "asc" },
        take: 2,
        select: {
          slug: true,
          titleAr: true,
          titleEn: true,
          date: true,
          location: true,
        },
      }),
    ]);

    return NextResponse.json({
      news: news.map((n) => ({
        slug: n.slug,
        title: isAr ? n.titleAr : n.titleEn,
        excerpt: isAr ? n.excerptAr : n.excerptEn,
        coverImage: n.featuredImage,
        publishedAt: n.publishedAt?.toISOString() ?? null,
      })),
      events: events.map((e) => ({
        slug: e.slug,
        title: isAr ? e.titleAr : e.titleEn,
        date: e.date?.toISOString() ?? null,
        location: e.location,
      })),
    });
  } catch (error) {
    console.error("side-content error:", error);
    return NextResponse.json({ news: [], events: [] });
  }
}
