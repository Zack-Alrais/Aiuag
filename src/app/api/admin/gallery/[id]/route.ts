import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.gallery.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch gallery item" }, { status: 500 });
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
      title,
      description,
      type,
      imageUrl,
      fileUrl,
      thumbnailUrl,
      album,
      tags,
      authorId,
      isActive,
    } = body;

    const existing = await prisma.gallery.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
    }

    const item = await prisma.gallery.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(imageUrl && { imageUrl }),
        ...(fileUrl !== undefined && { fileUrl }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(album && { album }),
        ...(tags !== undefined && { tags }),
        ...(authorId !== undefined && { authorId }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update gallery item" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.gallery.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
    }

    await prisma.gallery.delete({ where: { id } });
    return NextResponse.json({ message: "Gallery item deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete gallery item" }, { status: 500 });
  }
}
