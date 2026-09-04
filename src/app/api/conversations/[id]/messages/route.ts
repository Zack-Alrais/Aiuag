import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireMember } from "@/lib/social-auth";
import { triggerEvent } from "@/lib/pusher";
import { notifyConversationParticipants } from "@/lib/social-events";

// GET /api/conversations/[id]/messages?before=<id>&limit=30 — history (newest first)
// POST /api/conversations/[id]/messages — send a message
export async function GET(
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

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "40"), 100);
  const before = searchParams.get("before"); // cursor: message id

  const cursorMessage = before
    ? await prisma.conversationMessage.findUnique({ where: { id: before }, select: { createdAt: true } })
    : null;

  const messages = await prisma.conversationMessage.findMany({
    where: {
      conversationId: id,
      deletedAt: null,
      ...(cursorMessage ? { createdAt: { lt: cursorMessage.createdAt } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      sender: { select: { id: true, user: { select: { name: true, image: true } } } },
    },
  });

  const senders = await prisma.member.findMany({
    where: { id: { in: [...new Set(messages.map((m) => m.senderId))] } },
    select: { id: true, user: { select: { name: true, image: true } } },
  });
  const senderMap = new Map(senders.map((s) => [s.id, s]));

  const data = messages.map((m) => {
    const sender = senderMap.get(m.senderId);
    return {
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      senderName: sender?.user.name ?? null,
      senderImage: sender?.user.image ?? null,
      content: m.content,
      attachmentUrl: m.attachmentUrl,
      attachmentType: m.attachmentType,
      replyToId: m.replyToId,
      editedAt: m.editedAt?.toISOString() ?? null,
      createdAt: m.createdAt.toISOString(),
    };
  });

  return NextResponse.json({
    data, // newest first; client reverses for rendering
    hasMore: messages.length === limit,
    cursor: messages.length ? messages[messages.length - 1].id : null,
  });
}

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

  const body = await request.json();
  const content = String(body.content ?? "").trim().slice(0, 4000);
  const attachmentUrl = body.attachmentUrl ? String(body.attachmentUrl) : null;
  const attachmentType = body.attachmentType ? String(body.attachmentType) : null;
  const replyToId = body.replyToId ? String(body.replyToId) : null;

  if (!content && !attachmentUrl) {
    return NextResponse.json({ error: "Message content is required" }, { status: 400 });
  }

  const [message, members] = await Promise.all([
    prisma.conversationMessage.create({
      data: {
        conversationId: id,
        senderId: session.memberId,
        content,
        attachmentUrl,
        attachmentType,
        replyToId,
      },
      include: { sender: { select: { id: true, user: { select: { name: true, image: true } } } } },
    }),
    prisma.conversationParticipant.findMany({
      where: { conversationId: id },
      select: { memberId: true },
    }),
  ]);

  await prisma.conversation.update({
    where: { id },
    data: { lastMessageAt: message.createdAt },
  });

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    select: { name: true, type: true },
  });

  const participantIds = members.map((m) => m.memberId);
  const payload = {
    id: message.id,
    conversationId: id,
    senderId: message.senderId,
    senderName: message.sender.user.name,
    senderImage: message.sender.user.image,
    content: message.content,
    attachmentUrl: message.attachmentUrl,
    attachmentType: message.attachmentType,
    replyToId: message.replyToId,
    editedAt: null as string | null,
    createdAt: message.createdAt.toISOString(),
  };

  // Deliver to every participant on the conversation channel.
  await Promise.all(
    participantIds.map((memberId) =>
      triggerEvent(`private-conversation-${id}`, "message:new", { message: payload })
    )
  );

  // Alert each participant's user channel so conversation lists/badges update.
  await notifyConversationParticipants(id, participantIds, {
    event: "new-message",
    preview: content || (attachmentType ? attachmentType : null) || undefined,
    senderName: message.sender.user.name,
    senderId: message.senderId,
    conversationName: conversation?.name ?? undefined,
  });

  return NextResponse.json({ message: payload }, { status: 201 });
}