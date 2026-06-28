import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const partner = await prisma.partner.findUnique({ where: { id } });

    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    return NextResponse.json(partner);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch partner" }, { status: 500 });
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
      logo,
      website,
      descriptionAr,
      descriptionEn,
      type,
      order,
      isActive,
    } = body;

    const existing = await prisma.partner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    const partner = await prisma.partner.update({
      where: { id },
      data: {
        ...(nameAr && { nameAr }),
        ...(nameEn && { nameEn }),
        ...(logo !== undefined && { logo }),
        ...(website !== undefined && { website }),
        ...(descriptionAr !== undefined && { descriptionAr }),
        ...(descriptionEn !== undefined && { descriptionEn }),
        ...(type && { type }),
        ...(order !== undefined && { order: parseInt(order) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(partner);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update partner" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.partner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    await prisma.partner.delete({ where: { id } });
    return NextResponse.json({ message: "Partner deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete partner" }, { status: 500 });
  }
}
