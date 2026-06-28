import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const boardMember = await prisma.boardMember.findUnique({ where: { id } });

    if (!boardMember) {
      return NextResponse.json({ error: "Board member not found" }, { status: 404 });
    }

    return NextResponse.json(boardMember);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch board member" }, { status: 500 });
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
      positionAr,
      positionEn,
      bioAr,
      bioEn,
      photo,
      email,
      phone,
      order,
      term,
      isActive,
    } = body;

    const existing = await prisma.boardMember.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Board member not found" }, { status: 404 });
    }

    const boardMember = await prisma.boardMember.update({
      where: { id },
      data: {
        ...(nameAr && { nameAr }),
        ...(nameEn && { nameEn }),
        ...(positionAr && { positionAr }),
        ...(positionEn && { positionEn }),
        ...(bioAr !== undefined && { bioAr }),
        ...(bioEn !== undefined && { bioEn }),
        ...(photo !== undefined && { photo }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(order !== undefined && { order: parseInt(order) }),
        ...(term !== undefined && { term }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(boardMember);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update board member" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.boardMember.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Board member not found" }, { status: 404 });
    }

    await prisma.boardMember.delete({ where: { id } });
    return NextResponse.json({ message: "Board member deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete board member" }, { status: 500 });
  }
}
