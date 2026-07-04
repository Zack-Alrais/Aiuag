import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "200", 10);
    const status = searchParams.get("status") || "approved";

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const members = await prisma.member.findMany({
      where,
      take: Math.min(limit, 500),
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: members, total: members.length });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}
