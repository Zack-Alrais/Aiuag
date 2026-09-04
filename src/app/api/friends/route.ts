import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireMember, memberToPublic } from "@/lib/social-auth";

// GET /api/friends — list accepted friends
// GET /api/friends/status?with=<memberId> — relationship state
// DELETE /api/friends?memberId=<memberId> — unfriend
export async function GET(request: NextRequest) {
  const auth = await requireMember();
  if (auth.response) return auth.response;
  const { session } = auth;

  const { searchParams } = new URL(request.url);
  const withId = searchParams.get("with");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const skip = (page - 1) * limit;

  // Relationship status for a single target member.
  if (withId) {
    if (withId === session.memberId) {
      return NextResponse.json({ status: "self", friendshipId: null });
    }
    const both = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: session.memberId, addresseeId: withId },
          { requesterId: withId, addresseeId: session.memberId },
        ],
      },
      select: { id: true, status: true, requesterId: true },
    });
    if (!both) return NextResponse.json({ status: "none", friendshipId: null });
    const status = both.status === "accepted"
      ? "friends"
      : both.requesterId === session.memberId
        ? "requested" // pending out
        : "pending"; // pending in
    return NextResponse.json({ status, friendshipId: both.id });
  }

  const friendships = await prisma.friendship.findMany({
    where: {
      status: "accepted",
      OR: [{ requesterId: session.memberId }, { addresseeId: session.memberId }],
    },
    orderBy: { respondedAt: "desc" },
    skip,
    take: limit,
    include: {
      requester: { select: { id: true, nameEn: true, faculty: true, graduationYear: true, city: true, country: true, user: { select: { name: true, image: true, email: true } } } },
      addressee: { select: { id: true, nameEn: true, faculty: true, graduationYear: true, city: true, country: true, user: { select: { name: true, image: true, email: true } } } },
    },
  });

  const total = await prisma.friendship.count({
    where: {
      status: "accepted",
      OR: [{ requesterId: session.memberId }, { addresseeId: session.memberId }],
    },
  });

  const friends = friendships.map((f) => {
    const m = f.requesterId === session.memberId ? f.addressee : f.requester;
    return {
      ...memberToPublic(m),
      friendshipId: f.id,
      friendsSince: f.respondedAt?.toISOString() ?? f.createdAt.toISOString(),
    };
  });

  return NextResponse.json({
    data: friends,
    pagination: { page, limit, total, hasMore: skip + limit < total },
  });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireMember();
  if (auth.response) return auth.response;
  const { session } = auth;

  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("memberId");
  if (!memberId) {
    return NextResponse.json({ error: "memberId is required" }, { status: 400 });
  }

  const friendship = await prisma.friendship.findFirst({
    where: {
      status: "accepted",
      OR: [
        { requesterId: session.memberId, addresseeId: memberId },
        { requesterId: memberId, addresseeId: session.memberId },
      ],
    },
  });
  if (!friendship) {
    return NextResponse.json({ error: "Friendship not found" }, { status: 404 });
  }

  await prisma.friendship.delete({ where: { id: friendship.id } });
  return NextResponse.json({ success: true });
}