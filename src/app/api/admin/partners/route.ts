import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const type = searchParams.get("type");

    const where: Record<string, string> = {};
    if (type) where.type = type;

    const [partners, total] = await Promise.all([
      prisma.partner.findMany({
        where,
        orderBy: { order: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.partner.count({ where }),
    ]);

    return NextResponse.json({
      data: partners,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch partners" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nameAr,
      nameEn,
      logo,
      website,
      descriptionAr,
      descriptionEn,
      type,
      order,
      isActive,
    } = body;

    if (!nameAr || !nameEn) {
      return NextResponse.json(
        { error: "nameAr and nameEn are required" },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.create({
      data: {
        nameAr,
        nameEn,
        logo: logo || null,
        website: website || null,
        descriptionAr: descriptionAr || null,
        descriptionEn: descriptionEn || null,
        type: type || "partner",
        order: order ? parseInt(order) : 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create partner" }, { status: 500 });
  }
}
