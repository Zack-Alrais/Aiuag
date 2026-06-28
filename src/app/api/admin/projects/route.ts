import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
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

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({
      data: projects,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      titleAr,
      titleEn,
      slug,
      descriptionAr,
      descriptionEn,
      featuredImage,
      gallery,
      startDate,
      endDate,
      status,
      category,
      budget,
      partnerId,
    } = body;

    if (!titleAr || !titleEn || !descriptionAr || !descriptionEn) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let finalSlug = slug || generateSlug(titleEn);
    const existingSlug = await prisma.project.findUnique({ where: { slug: finalSlug } });
    if (existingSlug) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    const project = await prisma.project.create({
      data: {
        titleAr,
        titleEn,
        slug: finalSlug,
        descriptionAr,
        descriptionEn,
        featuredImage: featuredImage || null,
        gallery: gallery || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: status || "active",
        category: category || null,
        budget: budget ? parseFloat(budget) : null,
        partnerId: partnerId || null,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
