import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        comments: {
          where: { isApproved: true },
          orderBy: { createdAt: "asc" },
        },
        reactions: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const memberIds = [
      ...new Set([
        ...post.comments.map((c) => c.memberId),
        ...post.reactions.map((r) => r.memberId),
      ]),
    ];

    const members = memberIds.length > 0
      ? await prisma.member.findMany({
          where: { id: { in: memberIds } },
          include: { user: { select: { name: true, email: true } } },
        })
      : [];

    const memberMap = Object.fromEntries(
      members.map((m) => [m.id, { id: m.id, name: m.user.name, email: m.user.email }])
    );

    const enriched = {
      ...post,
      comments: post.comments.map((c) => ({
        ...c,
        member: memberMap[c.memberId] ?? null,
      })),
      reactions: post.reactions.map((r) => ({
        ...r,
        member: memberMap[r.memberId] ?? null,
      })),
    };

    return NextResponse.json(enriched);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, images, videos, authorId } = body;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (post.authorId !== authorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updated = await prisma.post.update({
      where: { id },
      data: {
        content: content !== undefined ? content : post.content,
        images: images !== undefined ? JSON.stringify(images) : post.images,
        videos: videos !== undefined ? JSON.stringify(videos) : post.videos,
        editedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
