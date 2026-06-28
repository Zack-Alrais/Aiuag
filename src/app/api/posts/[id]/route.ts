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
