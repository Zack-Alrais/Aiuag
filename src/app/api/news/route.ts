import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const category = searchParams.get("category");

    const where: Record<string, unknown> = { status: "published" };
    if (category) where.category = category;

    const news = await prisma.news.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: limit,
      include: { author: { select: { id: true, name: true, image: true } } },
    });

    return NextResponse.json({ success: true, data: news });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
