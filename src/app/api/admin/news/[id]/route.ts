import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const news = await prisma.news.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    if (!news) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      titleAr,
      titleEn,
      slug,
      contentAr,
      contentEn,
      excerptAr,
      excerptEn,
      featuredImage,
      status,
      category,
      tags,
    } = body;

    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.news.findUnique({ where: { slug } });
      if (slugExists) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
      }
    }

    const news = await prisma.news.update({
      where: { id },
      data: {
        ...(titleAr && { titleAr }),
        ...(titleEn && { titleEn }),
        ...(slug && { slug }),
        ...(contentAr && { contentAr }),
        ...(contentEn && { contentEn }),
        ...(excerptAr !== undefined && { excerptAr }),
        ...(excerptEn !== undefined && { excerptEn }),
        ...(featuredImage !== undefined && { featuredImage }),
        ...(status && { status }),
        ...(category !== undefined && { category }),
        ...(tags !== undefined && { tags }),
        ...(status === "published" && !existing.publishedAt
          ? { publishedAt: new Date() }
          : {}),
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update news" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    await prisma.news.delete({ where: { id } });
    return NextResponse.json({ message: "News deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete news" }, { status: 500 });
  }
}
