import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comments = await prisma.postComment.findMany({
      where: { postId: id, isApproved: true },
      orderBy: { createdAt: "asc" },
    });

    const memberIds = [...new Set(comments.map((c) => c.memberId))];
    const members = memberIds.length > 0
      ? await prisma.member.findMany({
          where: { id: { in: memberIds } },
          include: { user: { select: { name: true, email: true } } },
        })
      : [];

    const memberMap = Object.fromEntries(
      members.map((m) => [m.id, { id: m.id, name: m.user.name, email: m.user.email }])
    );

    const enriched = comments.map((c) => ({
      ...c,
      memberName: memberMap[c.memberId]?.name ?? null,
      member: memberMap[c.memberId] ?? null,
    }));

    return NextResponse.json({ data: enriched });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { memberId, content } = body;

    if (!memberId || !content) {
      return NextResponse.json(
        { error: "memberId and content are required" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comment = await prisma.postComment.create({
      data: {
        postId: id,
        memberId,
        content,
        isApproved: false,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
