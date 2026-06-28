import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { memberId, type } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: "memberId is required" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const existing = await prisma.postReaction.findUnique({
      where: { postId_memberId: { postId: id, memberId } },
    });

    if (existing) {
      if (type === "") {
        await prisma.postReaction.delete({ where: { id: existing.id } });
      } else {
        await prisma.postReaction.update({
          where: { id: existing.id },
          data: { type },
        });
      }
    } else if (type !== "") {
      await prisma.postReaction.create({
        data: { postId: id, memberId, type },
      });
    }

    const reactions = await prisma.postReaction.findMany({
      where: { postId: id },
    });

    return NextResponse.json(reactions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to toggle reaction" }, { status: 500 });
  }
}
