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

    const author = post.authorId
      ? await prisma.member.findUnique({
          where: { id: post.authorId },
          include: { user: { select: { name: true, email: true, image: true } } },
        })
      : null;

    const members = memberIds.length > 0
      ? await prisma.member.findMany({
          where: { id: { in: memberIds } },
          include: { user: { select: { name: true, email: true, image: true } } },
        })
      : [];
    const memberMap = new Map(
      members.map((m) => [
        m.id,
        { id: m.id, name: m.user.name, email: m.user.email, image: m.user.image },
      ])
    );

    // Fallback: legacy data may be keyed by the User id instead of the Member id.
    const unresolvedIds = memberIds.filter((id) => !memberMap.has(id));
    if (unresolvedIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: unresolvedIds } },
        select: { id: true, name: true, email: true, image: true },
      });
      for (const u of users) {
        memberMap.set(u.id, { id: u.id, name: u.name, email: u.email, image: u.image });
      }
    }

    const enriched = {
      ...post,
      author: author
        ? { id: author.id, name: author.user.name, email: author.user.email, image: author.user.image }
        : null,
      comments: post.comments.map((c) => ({
        ...c,
        memberName: memberMap.get(c.memberId)?.name ?? null,
        memberImage: memberMap.get(c.memberId)?.image ?? null,
        member: memberMap.get(c.memberId) ?? null,
      })),
      reactions: post.reactions.map((r) => ({
        ...r,
        member: memberMap.get(r.memberId) ?? null,
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
