import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSlug = searchParams.get("pageSlug");

    let where: Record<string, unknown> = {};
    if (pageSlug) {
      where = {
        OR: [
          { pageSlugs: pageSlug },
          { pageSlugs: { contains: `${pageSlug},` } },
          { pageSlugs: { contains: `,${pageSlug}` } },
          { pageSlugs: { contains: `,${pageSlug},` } },
        ],
      };
    }

    const images = await prisma.heroImage.findMany({
      where,
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ data: images });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch hero images" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageSlugs, imageUrl, titleAr, titleEn, subtitleAr, subtitleEn, linkUrl, order, isActive } = body;

    if (!pageSlugs || !imageUrl) {
      return NextResponse.json({ error: "pageSlugs and imageUrl are required" }, { status: 400 });
    }

    const image = await prisma.heroImage.create({
      data: {
        pageSlugs,
        imageUrl,
        titleAr: titleAr || null,
        titleEn: titleEn || null,
        subtitleAr: subtitleAr || null,
        subtitleEn: subtitleEn || null,
        linkUrl: linkUrl || null,
        order: order ?? 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ data: image }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create hero image" }, { status: 500 });
  }
}
