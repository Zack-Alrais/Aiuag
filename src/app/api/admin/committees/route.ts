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
    const type = searchParams.get("type");

    const where: Record<string, string> = {};
    if (type) where.type = type;

    const [committees, total] = await Promise.all([
      prisma.committee.findMany({
        where,
        orderBy: { order: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.committee.count({ where }),
    ]);

    return NextResponse.json({
      data: committees,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch committees" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nameAr,
      nameEn,
      slug,
      descriptionAr,
      descriptionEn,
      type,
      chairNameAr,
      chairNameEn,
      chairPhoto,
      email,
      phone,
      order,
      isActive,
    } = body;

    if (!nameAr || !nameEn || !descriptionAr || !descriptionEn) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let finalSlug = slug || generateSlug(nameEn);
    const existingSlug = await prisma.committee.findUnique({ where: { slug: finalSlug } });
    if (existingSlug) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    const committee = await prisma.committee.create({
      data: {
        nameAr,
        nameEn,
        slug: finalSlug,
        descriptionAr,
        descriptionEn,
        type: type || "standing",
        chairNameAr: chairNameAr || null,
        chairNameEn: chairNameEn || null,
        chairPhoto: chairPhoto || null,
        email: email || null,
        phone: phone || null,
        order: order ? parseInt(order) : 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(committee, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create committee" }, { status: 500 });
  }
}
