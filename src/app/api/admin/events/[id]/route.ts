import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: { registrations: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
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

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.event.findUnique({ where: { slug } });
      if (slugExists) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
      }
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(titleAr && { titleAr }),
        ...(titleEn && { titleEn }),
        ...(slug && { slug }),
        ...(descriptionAr && { descriptionAr }),
        ...(descriptionEn && { descriptionEn }),
        ...(featuredImage !== undefined && { featuredImage }),
        ...(date && { date: new Date(date) }),
        ...(time !== undefined && { time }),
        ...(endTime !== undefined && { endTime }),
        ...(location && { location }),
        ...(locationUrl !== undefined && { locationUrl }),
        ...(capacity !== undefined && { capacity: capacity ? parseInt(capacity) : null }),
        ...(registrationDeadline !== undefined && {
          registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        }),
        ...(status && { status }),
        ...(category !== undefined && { category }),
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
