import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireMember, memberToPublic } from "@/lib/social-auth";

// GET /api/conversations — list my conversations (badge + last message)
// POST /api/conversations — create a direct or group conversation
export async function GET(request: NextRequest) {
  const auth = await requireMember();
  if (auth.response) return auth.response;
  const { session } = auth;

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { memberId: session.memberId } } },
    orderBy: { lastMessageAt: "desc" },
    take: 60,
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
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const data = await Promise.all(
    conversations.map(async (c) => {
      const myParticipant = c.participants.find((p) => p.memberId === session.memberId);
      const others = c.participants.filter((p) => p.memberId !== session.memberId);
      const lastMessage = c.messages[0] ?? null;
      const unread = myParticipant
        ? await prisma.conversationMessage.count({
            where: {
              conversationId: c.id,
              senderId: { not: session.memberId },
              createdAt: myParticipant.lastReadAt
                ? { gt: myParticipant.lastReadAt }
                : undefined,
            },
          })
        : 0;

      const otherBriefs = others.map((p) => ({
        ...memberToPublic(p.member),
        lastReadAt: p.lastReadAt ? p.lastReadAt.toISOString() : null,
        role: p.role,
      }));

      return {
        id: c.id,
        type: c.type,
        name: c.name,
        avatar: c.avatar,
        otherParticipants: otherBriefs,
        participantCount: c.participants.length,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              senderId: lastMessage.senderId,
              attachmentType: lastMessage.attachmentType,
              createdAt: lastMessage.createdAt.toISOString(),
            }
          : null,
        unread,
        lastMessageAt: c.lastMessageAt?.toISOString() ?? null,
        updatedAt: c.updatedAt.toISOString(),
      };
    })
  );

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const auth = await requireMember();
  if (auth.response) return auth.response;
  const { session } = auth;

  const body = await request.json();
  const participantIds = (body.participantIds as string[] | undefined) ?? [];
  const type = body.type === "group" ? "group" : "direct";
  const name = body.name ? String(body.name).trim().slice(0, 80) : null;

  const cleanIds = [...new Set(participantIds)].filter(
    (id) => typeof id === "string" && id !== session.memberId
  );
  if (cleanIds.length === 0) {
    return NextResponse.json({ error: "At least one participant is required" }, { status: 400 });
  }

  if (type === "direct") {
    // Reuse an existing 1:1 conversation between the two members.
    const existing = await prisma.conversation.findFirst({
      where: {
        type: "direct",
        AND: [
          { participants: { some: { memberId: session.memberId } } },
          { participants: { some: { memberId: cleanIds[0] } } },
        ],
      },
      include: { participants: true },
    });
    if (existing && existing.participants.length === 2) {
      return NextResponse.json({ conversationId: existing.id, reused: true });
    }
  }

  // Verify all participants are members and (for direct) are friends.
  const members = await prisma.member.findMany({
    where: { id: { in: cleanIds } },
    select: { id: true, user: { select: { name: true } } },
  });
  if (members.length !== cleanIds.length) {
    return NextResponse.json({ error: "Some participants do not exist" }, { status: 400 });
  }

  if (type === "direct") {
    // Friends-only messaging: validate the friendship before opening a chat.
    const friendship = await prisma.friendship.findFirst({
      where: {
        status: "accepted",
        OR: [
          { requesterId: session.memberId, addresseeId: cleanIds[0] },
          { requesterId: cleanIds[0], addresseeId: session.memberId },
        ],
      },
      select: { id: true },
    });
    if (!friendship) {
      return NextResponse.json(
        { error: "Messaging is available between friends only" },
        { status: 403 }
      );
    }
  }

  const conversation = await prisma.conversation.create({
    data: {
      type,
      name: type === "group" ? name || "Group" : null,
      createdBy: session.memberId,
      participants: {
        create: [
          { memberId: session.memberId, role: "admin" },
          ...cleanIds.map((memberId) => ({ memberId, role: "member" as const })),
        ],
      },
    },
    include: { participants: true },
  });

  return NextResponse.json({ conversationId: conversation.id }, { status: 201 });
}