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
      where: { postId: id, isApproved: true, parentId: null },
      include: {
        replies: {
          where: { isApproved: true },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const memberIds = [...new Set(comments.flatMap((c) => [c.memberId, ...c.replies.map((r) => r.memberId)]))];
    const members = memberIds.length > 0
      ? await prisma.member.findMany({
          where: { id: { in: memberIds } },
          include: { user: { select: { name: true, email: true } } },
        })
      : [];

    const memberMap = Object.fromEntries(
      members.map((m) => [m.id, { id: m.id, name: m.user.name, email: m.user.email }])
    );

    const enrich = (c: any) => ({ ...c, memberName: memberMap[c.memberId]?.name ?? null, member: memberMap[c.memberId] ?? null });

    const enriched = comments.map((c) => ({
      ...enrich(c),
      replies: c.replies.map(enrich),
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
    const { memberId, content, parentId } = body;

    if (!memberId || !content) {
      return NextResponse.json({ error: "memberId and content are required" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (parentId) {
      const parent = await prisma.postComment.findUnique({ where: { id: parentId } });
      if (!parent || parent.postId !== id) {
        return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
      }
    }

    const comment = await prisma.postComment.create({
      data: { postId: id, memberId, content, parentId: parentId || null, isApproved: true },
    });

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: { select: { name: true } } },
    });

    return NextResponse.json({
      ...comment,
      memberName: member?.user?.name ?? null,
      member: member ? { id: member.id, name: member.user.name } : null,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
