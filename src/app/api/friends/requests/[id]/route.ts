import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireMember } from "@/lib/social-auth";
import { notifyMember } from "@/lib/social-events";

// POST /api/friends/requests/[id] { action: "accept" | "decline" }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireMember();
  if (auth.response) return auth.response;
  const { session } = auth;

  const { id } = await params;
  const body = await request.json();
  const action = body.action as "accept" | "decline" | undefined;
  if (action !== "accept" && action !== "decline") {
    return NextResponse.json({ error: "action must be accept or decline" }, { status: 400 });
  }

  const friendship = await prisma.friendship.findUnique({ where: { id } });
  if (!friendship) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }
  // Only the addressee may accept/decline the request.
  if (friendship.addresseeId !== session.memberId) {
    return NextResponse.json({ error: "Not your request" }, { status: 403 });
  }

  if (action === "accept") {
    await prisma.friendship.update({
      where: { id },
      data: { status: "accepted", respondedAt: new Date() },
    });
    await notifyMember({
      recipientId: friendship.requesterId,
      actorId: session.memberId,
      type: "friend_accept",
      entityType: "friendship",
      entityId: id,
      titleAr: "تم قبول طلب الصداقة",
      titleEn: "Friend request accepted",
      bodyAr: `${session.name} قبل طلب الصداقة`,
      bodyEn: `${session.name} accepted your friend request`,
    });
    return NextResponse.json({ status: "friends", friendshipId: id });
  }

  await prisma.friendship.update({
    where: { id },
    data: { status: "declined", respondedAt: new Date() },
  });
  return NextResponse.json({ status: "declined", friendshipId: id });
}