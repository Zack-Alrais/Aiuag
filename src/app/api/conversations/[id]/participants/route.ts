import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireMember } from "@/lib/social-auth";
import { notifyConversationParticipants } from "@/lib/social-events";

// POST /api/conversations/[id]/participants { memberIds } — add to a group (admin)
// DELETE /api/conversations/[id]/participants?memberId=<id> — remove participant (admin)
export async function POST(
  request: NextRequest,
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
  if (conversation.type !== "group") {
    return NextResponse.json({ error: "Only group conversations support adding members" }, { status: 400 });
  }

  const me = conversation.participants.find((p) => p.memberId === session.memberId);
  if (!me || me.role !== "admin") {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const body = await request.json();
  const memberIds = [...new Set((body.memberIds as string[] | undefined) ?? [])];
  if (!memberIds.length) {
    return NextResponse.json({ error: "memberIds is required" }, { status: 400 });
  }

  const existingIds = new Set(conversation.participants.map((p) => p.memberId));
  const toAdd = memberIds.filter((id) => !existingIds.has(id));
  if (!toAdd.length) {
    return NextResponse.json({ conversationId: id });
  }

  const members = await prisma.member.findMany({
    where: { id: { in: toAdd } },
    select: { id: true },
  });
  if (members.length !== toAdd.length) {
    return NextResponse.json({ error: "Some members do not exist" }, { status: 400 });
  }

  await prisma.conversationParticipant.createMany({
    data: toAdd.map((memberId) => ({ conversationId: id, memberId, role: "member" })),
  });

  const participantIds = conversation.participants.map((p) => p.memberId);
  await notifyConversationParticipants(id, [...participantIds, ...toAdd], {
    event: "participants",
    conversationName: conversation.name ?? undefined,
  });

  return NextResponse.json({ conversationId: id, added: toAdd });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireMember();
  if (auth.response) return auth.response;
  const { session } = auth;

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const targetMemberId = searchParams.get("memberId");

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: { participants: true },
  });
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const me = conversation.participants.find((p) => p.memberId === session.memberId);
  if (!me) {
    return NextResponse.json({ error: "Not a participant" }, { status: 403 });
  }

  // Remove a specific participant (admins only) or resolve self.
  const removeId = targetMemberId ?? session.memberId;
  if (targetMemberId && targetMemberId !== session.memberId && me.role !== "admin") {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  await prisma.conversationParticipant.deleteMany({
    where: { conversationId: id, memberId: removeId },
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