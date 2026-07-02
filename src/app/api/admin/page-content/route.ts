import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page");

    const where = page ? { page } : {};

    const contents = await prisma.pageContent.findMany({
      where,
      orderBy: [{ page: "asc" }, { section: "asc" }, { key: "asc" }],
    });

    return NextResponse.json(contents);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, valueAr, valueEn } = body;

    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const updated = await prisma.pageContent.update({
      where: { id },
      data: { valueAr, valueEn },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { page, section, key, valueAr, valueEn } = body;

    if (!page || !section || !key) {
      return NextResponse.json({ error: "page, section, key required" }, { status: 400 });
    }

    const created = await prisma.pageContent.create({
      data: { page, section, key, valueAr: valueAr || "", valueEn: valueEn || "" },
    });

    return NextResponse.json(created);
  } catch {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    await prisma.pageContent.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
