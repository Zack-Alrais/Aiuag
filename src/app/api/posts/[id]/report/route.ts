import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireMember } from "@/lib/social-auth";

// POST /api/posts/[id]/report { reason } — report a post for review.
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
  const reason = String(body.reason ?? "").trim().slice(0, 500) || null;

  const report = await prisma.postReport.create({
    data: {
      postId: id,
      reporterId: session.memberId,
      reason,
    },
  });

  return NextResponse.json({ reportId: report.id }, { status: 201 });
}