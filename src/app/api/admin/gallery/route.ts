import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const album = searchParams.get("album");

    const where: Record<string, unknown> = {};
    if (album) where.album = album;

    const [items, total] = await Promise.all([
      prisma.gallery.findMany({
        where,
        include: {
          author: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.gallery.count({ where }),
    ]);

    return NextResponse.json({
      data: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: "title and imageUrl are required" },
        { status: 400 }
      );
    }

    const item = await prisma.gallery.create({
      data: {
        title,
        description: description || null,
        type: type || "image",
        imageUrl,
        fileUrl: fileUrl || null,
        thumbnailUrl: thumbnailUrl || null,
        album: album || "general",
        tags: tags || null,
        authorId: authorId || null,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create gallery item" }, { status: 500 });
  }
}
