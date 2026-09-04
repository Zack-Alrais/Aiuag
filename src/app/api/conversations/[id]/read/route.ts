import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireMember } from "@/lib/social-auth";
import { triggerEvent } from "@/lib/pusher";

// POST /api/conversations/[id]/read — mark the conversation as read by me and
// notify other participants (read receipts).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireMember();
  if (auth.response) return auth.response;
  const { session } = auth;

  const { id } = await params;
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_memberId: { conversationId: id, memberId: session.memberId } },
  });
  if (!participant) {
    return NextResponse.json({ error: "Not a participant" }, { status: 403 });
  }

  const now = new Date();
  await prisma.conversationParticipant.update({
    where: { id: participant.id },
    data: { lastReadAt: now },
  });

  // Notify others that I read up to now.
  const others = await prisma.conversationParticipant.findMany({
    where: { conversationId: id, memberId: { not: session.memberId } },
    select: { memberId: true },
  });
  await Promise.all(
    others.map((o) =>
      triggerEvent(`private-conversation-${id}`, "message:read", {
        readerId: session.memberId,
        readerName: session.name,
        lastReadAt: now.toISOString(),
        conversationId: id,
      })
    )
  );

  return NextResponse.json({ success: true, lastReadAt: now.toISOString() });
}