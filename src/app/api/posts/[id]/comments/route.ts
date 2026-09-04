import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { notifyMember } from "@/lib/social-events";

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

    const enrich = (c: any) => ({
      ...c,
      memberName: memberMap.get(c.memberId)?.name ?? null,
      memberImage: memberMap.get(c.memberId)?.image ?? null,
      member: memberMap.get(c.memberId) ?? null,
    });

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

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: { select: { name: true, image: true } } },
    });

    // Resolve legacy comments keyed by the User id instead of the Member id.
    let resolvedMemberId = memberId;
    let memberName: string | null = member?.user?.name ?? null;
    let memberImage: string | null = member?.user?.image ?? null;
    if (!member) {
      const user = await prisma.user.findUnique({
        where: { id: memberId },
        select: { id: true, name: true, image: true },
      });
      if (user) {
        memberName = user.name;
        memberImage = user.image;
      } else {
        return NextResponse.json({ error: "Member not found" }, { status: 404 });
      }
    }

    const comment = await prisma.postComment.create({
      data: { postId: id, memberId: resolvedMemberId, content, parentId: parentId || null, isApproved: true },
    });

    // Notify the post author (unless commenting on your own post).
    try {
      if (post.authorId && post.authorId !== resolvedMemberId) {
        await notifyMember({
          recipientId: post.authorId,
          actorId: resolvedMemberId,
          type: "comment",
          entityType: "post",
          entityId: post.id,
          titleAr: "تعليق جديد على منشورك",
          titleEn: "New comment on your post",
          bodyAr: `علق ${memberName ?? "عضو"}: ${content.slice(0, 120)}`,
          bodyEn: `${memberName ?? "A member"} commented: ${content.slice(0, 120)}`,
        });
      }
    } catch {}

    return NextResponse.json({
      ...comment,
      memberName,
      memberImage,
      member: {
        id: resolvedMemberId,
        name: memberName,
        image: memberImage,
      },
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
