import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireMember } from "@/lib/social-auth";

// POST /api/posts/[id]/save { saved?: boolean } — toggle save (bookmark).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireMember();
  if (auth.response) return auth.response;
  const { session } = auth;

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id }, select: { id: true } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const wantSaved = body.saved;

  const existing = await prisma.savedPost.findUnique({
    where: { memberId_postId: { memberId: session.memberId, postId: id } },
  });

  let saved: boolean;
  if (existing) {
    if (wantSaved === false) {
      await prisma.savedPost.delete({ where: { id: existing.id } });
      saved = false;
    } else {
      saved = true;
    }
  } else {
    await prisma.savedPost.create({
      data: { memberId: session.memberId, postId: id },
    });
    saved = true;
  }

  return NextResponse.json({ saved });
}