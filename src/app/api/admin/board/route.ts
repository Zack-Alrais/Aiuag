import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const term = searchParams.get("term");

    const where: Record<string, string> = {};
    if (term) where.term = term;

    const [boardMembers, total] = await Promise.all([
      prisma.boardMember.findMany({
        where,
        orderBy: { order: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.boardMember.count({ where }),
    ]);

    return NextResponse.json({
      data: boardMembers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch board members" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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

    if (!nameAr || !nameEn || !positionAr || !positionEn) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const boardMember = await prisma.boardMember.create({
      data: {
        nameAr,
        nameEn,
        positionAr,
        positionEn,
        bioAr: bioAr || null,
        bioEn: bioEn || null,
        photo: photo || null,
        email: email || null,
        phone: phone || null,
        order: order ? parseInt(order) : 0,
        term: term || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(boardMember, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create board member" }, { status: 500 });
  }
}
