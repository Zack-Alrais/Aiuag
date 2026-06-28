import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            comments: { where: { isApproved: true } },
            reactions: true,
          },
        },
      },
    });

    return NextResponse.json({ data: posts });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
