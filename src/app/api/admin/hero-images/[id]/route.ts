import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const image = await prisma.heroImage.findUnique({ where: { id } });
    if (!image) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data: image });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch hero image" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.heroImage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const image = await prisma.heroImage.update({
      where: { id },
      data: {
        pageSlugs: body.pageSlugs ?? existing.pageSlugs,
        imageUrl: body.imageUrl ?? existing.imageUrl,
        titleAr: body.titleAr !== undefined ? body.titleAr : existing.titleAr,
        titleEn: body.titleEn !== undefined ? body.titleEn : existing.titleEn,
        subtitleAr: body.subtitleAr !== undefined ? body.subtitleAr : existing.subtitleAr,
        subtitleEn: body.subtitleEn !== undefined ? body.subtitleEn : existing.subtitleEn,
        linkUrl: body.linkUrl !== undefined ? body.linkUrl : existing.linkUrl,
        order: body.order !== undefined ? body.order : existing.order,
        isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
      },
    });

    return NextResponse.json({ data: image });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update hero image" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.heroImage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.heroImage.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete hero image" }, { status: 500 });
  }
}
