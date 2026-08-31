import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const comments = await prisma.postComment.findMany({
      include: {
        post: {
          select: { id: true, content: true, images: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const memberIds = [...new Set(comments.map((c) => c.memberId))];
    const members = memberIds.length
      ? await prisma.member.findMany({
          where: { id: { in: memberIds } },
          include: { user: { select: { name: true, email: true, image: true } } },
        })
      : [];
    const memberMap = new Map(
      members.map((m) => [
        m.id,
        { id: m.id, name: m.user.name, email: m.user.email ?? undefined, image: m.user.image },
      ])
    );

    const data = comments.map((c) => ({
      ...c,
      member: memberMap.get(c.memberId) ?? null,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await request.json();
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ error: "Comment ID is required" }, { status: 400 });
    }

    const existing = await prisma.postComment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    await prisma.postComment.delete({ where: { id } });

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
