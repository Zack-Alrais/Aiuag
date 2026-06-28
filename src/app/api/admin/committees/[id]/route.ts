import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const committee = await prisma.committee.findUnique({ where: { id } });

    if (!committee) {
      return NextResponse.json({ error: "Committee not found" }, { status: 404 });
    }

    return NextResponse.json(committee);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch committee" }, { status: 500 });
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

    const existing = await prisma.committee.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Committee not found" }, { status: 404 });
    }

    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.committee.findUnique({ where: { slug } });
      if (slugExists) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
      }
    }

    const committee = await prisma.committee.update({
      where: { id },
      data: {
        ...(nameAr && { nameAr }),
        ...(nameEn && { nameEn }),
        ...(slug && { slug }),
        ...(descriptionAr && { descriptionAr }),
        ...(descriptionEn && { descriptionEn }),
        ...(type && { type }),
        ...(chairNameAr !== undefined && { chairNameAr }),
        ...(chairNameEn !== undefined && { chairNameEn }),
        ...(chairPhoto !== undefined && { chairPhoto }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(order !== undefined && { order: parseInt(order) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(committee);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update committee" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.committee.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Committee not found" }, { status: 404 });
    }

    await prisma.committee.delete({ where: { id } });
    return NextResponse.json({ message: "Committee deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete committee" }, { status: 500 });
  }
}
