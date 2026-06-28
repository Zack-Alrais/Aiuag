import prisma from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { NextRequest, NextResponse } from "next/server";
import { stripHtml } from "@/lib/sanitize";
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const where: Record<string, string> = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        include: { author: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.news.count({ where }),
    ]);

    return NextResponse.json({
      data: news,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
      authorId,
    } = body;

    if (!titleAr || !titleEn || !contentAr || !contentEn) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let finalSlug = slug || generateSlug(titleEn);
    const existingSlug = await prisma.news.findUnique({ where: { slug: finalSlug } });
    if (existingSlug) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    let resolvedAuthorId = authorId;
    if (!resolvedAuthorId) {
      const admin = await prisma.user.findFirst({ where: { role: "admin" } });
      if (!admin) {
        return NextResponse.json({ error: "No admin user found" }, { status: 500 });
      }
      resolvedAuthorId = admin.id;
    }

    const news = await prisma.news.create({
      data: {
        titleAr: stripHtml(titleAr),
        titleEn: stripHtml(titleEn),
        slug: finalSlug,
        contentAr: stripHtml(contentAr),
        contentEn: stripHtml(contentEn),
        excerptAr: excerptAr ? stripHtml(excerptAr) : null,
        excerptEn: excerptEn ? stripHtml(excerptEn) : null,
        featuredImage: featuredImage || null,
        status: status || "draft",
        category: category || null,
        tags: tags || null,
        authorId: resolvedAuthorId,
        publishedAt: status === "published" ? new Date() : null,
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    if (status === "published") {
      await createNotification({
        titleAr: "خبر جديد منشور",
        titleEn: "New News Published",
        messageAr: `تم نشر خبر جديد: ${titleAr}`,
        messageEn: `New article published: ${titleEn}`,
        type: "info",
        entityType: "news",
        entityId: news.id,
      });
    }

    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create news" }, { status: 500 });
  }
}
