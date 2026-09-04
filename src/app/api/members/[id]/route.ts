import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionMember, memberToPublic } from "@/lib/social-auth";

// GET /api/members/[id] — public member profile (only approved members).
// Includes the viewer's relationship status (none/pending/requested/friends/self)
// when the request is authenticated.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const member = await prisma.member.findUnique({
      where: { id },
      select: {
        id: true,
        nameEn: true,
        faculty: true,
        specialization: true,
        graduationYear: true,
        degree: true,
        university: true,
        country: true,
        state: true,
        city: true,
        status: true,
        membershipType: true,
        createdAt: true,
        bio: true,
        linkedin: true,
        cardPhoto: true,
        user: { select: { name: true, image: true, email: true } },
      },
    });

    if (!member || member.status !== "approved") {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const session = await getSessionMember();
    let relation: "none" | "pending" | "requested" | "friends" | "self" = "none";
    let friendshipId: string | null = null;

    if (session && member.id === session.memberId) {
      relation = "self";
    } else if (session) {
      const f = await prisma.friendship.findFirst({
        where: {
          OR: [
            { requesterId: session.memberId, addresseeId: member.id },
            { requesterId: member.id, addresseeId: session.memberId },
          ],
        },
        select: { id: true, status: true, requesterId: true },
      });
      if (f) {
        friendshipId = f.id;
        relation =
          f.status === "accepted"
            ? "friends"
            : f.requesterId === session.memberId
              ? "requested"
              : "pending";
      }
    }

    return NextResponse.json({
      data: {
        ...memberToPublic({
          id: member.id,
          nameEn: member.nameEn,
          faculty: member.faculty,
          specialization: member.specialization,
          graduationYear: member.graduationYear,
          country: member.country,
          city: member.city,
          user: member.user,
        }),
        cardPhoto: member.cardPhoto || null,
        degree: member.degree,
        university: member.university,
        state: member.state,
        membershipType: member.membershipType,
        joinedAt: member.createdAt.toISOString(),
        bio: member.bio,
        linkedin: member.linkedin,
      },
      relation,
      friendshipId,
    });
  } catch (error) {
    console.error("Member GET error:", error);
    return NextResponse.json({ error: "Failed to fetch member" }, { status: 500 });
  }
}
