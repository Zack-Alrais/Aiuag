import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireMember, memberToPublic } from "@/lib/social-auth";
import { notifyMember } from "@/lib/social-events";

// GET /api/friends/requests?direction=received|sent — list pending requests
// POST /api/friends/requests { addresseeId } — send a friend request
export async function GET(request: NextRequest) {
  const auth = await requireMember();
  if (auth.response) return auth.response;
  const { session } = auth;

  const { searchParams } = new URL(request.url);
  const direction = searchParams.get("direction") || "received";

  const where =
    direction === "sent"
      ? { requesterId: session.memberId, status: "pending" }
      : { addresseeId: session.memberId, status: "pending" };

  const requests = await prisma.friendship.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      requester: { select: { id: true, nameEn: true, faculty: true, graduationYear: true, city: true, country: true, user: { select: { name: true, image: true, email: true } } } },
      addressee: { select: { id: true, nameEn: true, faculty: true, graduationYear: true, city: true, country: true, user: { select: { name: true, image: true, email: true } } } },
    },
  });

  const data = requests.map((r) => {
    const other = r.requesterId === session.memberId ? r.addressee : r.requester;
    return {
      ...memberToPublic(other),
      friendshipId: r.id,
      requestedAt: r.createdAt.toISOString(),
      direction,
    };
  });

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const auth = await requireMember();
  if (auth.response) return auth.response;
  const { session } = auth;

  const body = await request.json();
  const addresseeId = body.addresseeId as string | undefined;
  const action = (body.action as string | undefined) ?? "send";
  if (!addresseeId) {
    return NextResponse.json({ error: "addresseeId is required" }, { status: 400 });
  }
  if (addresseeId === session.memberId) {
    return NextResponse.json({ error: "Cannot friend yourself" }, { status: 400 });
  }

  const target = await prisma.member.findUnique({ where: { id: addresseeId } });
  if (!target) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  if (action === "cancel" || action === "accept" || action === "decline") {
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: session.memberId, addresseeId },
          { requesterId: addresseeId, addresseeId: session.memberId },
        ],
      },
    });
    if (!existing) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    if (action === "cancel") {
      if (existing.requesterId !== session.memberId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      await prisma.friendship.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true });
    }
    if (existing.addresseeId !== session.memberId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (existing.status === "accepted") {
      return NextResponse.json({ success: true, status: "friends" });
    }
    if (action === "accept") {
      await prisma.friendship.update({
        where: { id: existing.id },
        data: { status: "accepted", respondedAt: new Date() },
      });
      await notifyMember({
        recipientId: existing.requesterId,
        actorId: session.memberId,
        type: "friend_accept",
        entityType: "friendship",
        entityId: existing.id,
        titleAr: "تم قبول طلبك",
        titleEn: "Request accepted",
        bodyAr: `${session.name} قبل طلب الصداقة`,
        bodyEn: `${session.name} accepted your friend request`,
      });
      return NextResponse.json({ success: true, status: "friends" });
    }
    await prisma.friendship.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true });
  }

  // Check existing relationship in either direction.
  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: session.memberId, addresseeId },
        { requesterId: addresseeId, addresseeId: session.memberId },
      ],
    },
  });

  if (existing?.status === "accepted") {
    return NextResponse.json({ error: "You are already friends" }, { status: 409 });
  }
  if (existing?.status === "pending" && existing.requesterId === session.memberId) {
    return NextResponse.json({ error: "Request already sent" }, { status: 409 });
  }
  if (existing?.status === "pending" && existing.addresseeId === session.memberId) {
    // Auto-accept when the recipient sends a request back.
    await prisma.friendship.update({
      where: { id: existing.id },
      data: { status: "accepted", respondedAt: new Date() },
    });
    return NextResponse.json({ friendshipId: existing.id, status: "friends" });
  }
  if (existing?.status === "blocked") {
    return NextResponse.json({ error: "Blocked" }, { status: 403 });
  }

  const friendship = await prisma.friendship.create({
    data: {
      requesterId: session.memberId,
      addresseeId,
      status: "pending",
    },
  });

  // Notify the target in realtime.
  await notifyMember({
    recipientId: addresseeId,
    actorId: session.memberId,
    type: "friend_request",
    entityType: "friendship",
    entityId: friendship.id,
    titleAr: "طلب صداقة جديد",
    titleEn: "New friend request",
    bodyAr: `${session.name} أرسل لك طلب صداقة`,
    bodyEn: `${session.name} sent you a friend request`,
  });

  return NextResponse.json({ friendshipId: friendship.id, status: "requested" }, { status: 201 });
}