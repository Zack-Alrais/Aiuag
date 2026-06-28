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

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    return NextResponse.json({
      data: events,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
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
      date,
      time,
      endTime,
      location,
      locationUrl,
      capacity,
      registrationDeadline,
      status,
      category,
    } = body;

    if (!titleAr || !titleEn || !descriptionAr || !descriptionEn || !date || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let finalSlug = slug || generateSlug(titleEn);
    const existingSlug = await prisma.event.findUnique({ where: { slug: finalSlug } });
    if (existingSlug) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    const event = await prisma.event.create({
      data: {
        titleAr,
        titleEn,
        slug: finalSlug,
        descriptionAr,
        descriptionEn,
        featuredImage: featuredImage || null,
        date: new Date(date),
        time: time || null,
        endTime: endTime || null,
        location,
        locationUrl: locationUrl || null,
        capacity: capacity ? parseInt(capacity) : null,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        status: status || "upcoming",
        category: category || null,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
