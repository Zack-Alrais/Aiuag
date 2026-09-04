import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireMember, memberToPublic } from "@/lib/social-auth";
import { notifyConversationParticipants } from "@/lib/social-events";

// GET /api/conversations/[id] — conversation details (participants, name, avatar)
// DELETE /api/conversations/[id] — leave the conversation
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireMember();
  if (auth.response) return auth.response;
  const { session } = auth;

  const { id } = await params;
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      participants: {
        include: {
          member: {
            select: {
              id: true, nameEn: true, faculty: true, graduationYear: true,
              city: true, country: true,
              user: { select: { name: true, image: true, email: true } },
            },
          },
        },
      },
    },
  });
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }
  const me = conversation.participants.find((p) => p.memberId === session.memberId);
  if (!me) {
    return NextResponse.json({ error: "Not a participant" }, { status: 403 });
  }

  return NextResponse.json({
    id: conversation.id,
    type: conversation.type,
    name: conversation.name,
    avatar: conversation.avatar,
    participants: conversation.participants.map((p) => ({
      ...memberToPublic(p.member),
      lastReadAt: p.lastReadAt ? p.lastReadAt.toISOString() : null,
      role: p.role,
    })),
    createdAt: conversation.createdAt.toISOString(),
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireMember();
  if (auth.response) return auth.response;
  const { session } = auth;

  const { id } = await params;
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: { participants: true },
  });
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }
  if (!conversation.participants.some((p) => p.memberId === session.memberId)) {
    return NextResponse.json({ error: "Not a participant" }, { status: 403 });
  }

  await prisma.conversationParticipant.deleteMany({
    where: { conversationId: id, memberId: session.memberId },
  });

  const remaining = await prisma.conversationParticipant.count({ where: { conversationId: id } });
  if (remaining === 0) {
    await prisma.conversation.delete({ where: { id } });
  } else {
    await notifyConversationParticipants(
      id,
      conversation.participants.map((p) => p.memberId),
      { event: "participants", conversationName: conversation.name ?? undefined }
    );
  }

  return NextResponse.json({ success: true });
}