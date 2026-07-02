import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await _request.json();
    const { memberId } = body;

    if (!memberId) {
      return NextResponse.json({ error: "memberId required" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const existing = await prisma.postShare.findUnique({
      where: { postId_memberId: { postId: id, memberId } },
    });

    if (existing) {
      await prisma.postShare.delete({
        where: { postId_memberId: { postId: id, memberId } },
      });
      await prisma.post.update({
        where: { id },
        data: { sharesCount: { decrement: 1 } },
      });
      return NextResponse.json({ shared: false });
    }

    await prisma.postShare.create({
      data: { postId: id, memberId },
    });
    await prisma.post.update({
      where: { id },
      data: { sharesCount: { increment: 1 } },
    });

    return NextResponse.json({ shared: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const shares = await prisma.postShare.findMany({
      where: { postId: id },
      include: { post: true },
    });
    return NextResponse.json({ data: shares });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
