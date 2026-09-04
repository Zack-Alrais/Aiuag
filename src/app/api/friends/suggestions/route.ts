import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireMember, memberToPublic, PublicMember } from "@/lib/social-auth";

interface SuggestionResult {
  member: PublicMember;
  sharedFriends: number;
  /** Ordered weight — higher means a stronger suggestion. */
  weight: number;
  reason: string[];
}

// Candidates are scored by how closely they match the viewer's alumni profile:
// same specialization+batch, same batch, neighboring batches, same specialization,
// same faculty, shared friends, same city. Already-connected members are excluded.
export async function GET(request: NextRequest) {
  const auth = await requireMember();
  if (auth.response) return auth.response;
  const { session } = auth;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  const me = await prisma.member.findUnique({
    where: { id: session.memberId },
    select: { faculty: true, specialization: true, graduationYear: true, city: true, country: true },
  });

  // Everyone already connected (any status) — exclude from suggestions.
  const connectedRows = await prisma.friendship.findMany({
    where: {
      OR: [{ requesterId: session.memberId }, { addresseeId: session.memberId }],
    },
    select: { requesterId: true, addresseeId: true },
  });
  const connected = new Set<string>([session.memberId]);
  connectedRows.forEach((r) => {
    connected.add(r.requesterId);
    connected.add(r.addresseeId);
  });
  const connectedList = [...connected];

  // My accepted friends.
  const myFriendRows = await prisma.friendship.findMany({
    where: {
      status: "accepted",
      OR: [{ requesterId: session.memberId }, { addresseeId: session.memberId }],
    },
    select: { requesterId: true, addresseeId: true },
  });
  const myFriendIds = new Set<string>();
  myFriendRows.forEach((r) => {
    if (r.requesterId === session.memberId) myFriendIds.add(r.addresseeId);
    if (r.addresseeId === session.memberId) myFriendIds.add(r.requesterId);
  });
  const myFriendList = [...myFriendIds];

  // Shared-friend score: friends of my friends.
  const sharedCount = new Map<string, { count: number }>();
  if (myFriendList.length) {
    const rows = await prisma.friendship.findMany({
      where: {
        status: "accepted",
        OR: [{ requesterId: { in: myFriendList } }, { addresseeId: { in: myFriendList } }],
        NOT: [
          { requesterId: session.memberId },
          { addresseeId: session.memberId },
        ],
      },
      select: { requesterId: true, addresseeId: true },
    });
    rows.forEach((r) => {
      const other = r.requesterId === session.memberId
        ? r.addresseeId
        : r.requesterId;
      if (connected.has(other) || other === session.memberId) return;
      const entry = sharedCount.get(other) || { count: 0 };
      entry.count += 1;
      sharedCount.set(other, entry);
    });
  }

  // ---- Profile-similarity candidates with weighted scoring ----
  const myFaculty = me?.faculty?.toLowerCase().trim();
  const mySpec = me?.specialization?.toLowerCase().trim();
  const myYear = me?.graduationYear;
  const myCity = me?.city?.toLowerCase().trim();
  const myCountry = me?.country?.toLowerCase().trim();
  const adjacentYears =
    myYear != null ? new Set([myYear - 2, myYear - 1, myYear + 1, myYear + 2]) : new Set<number>();

  const similarConditions: Record<string, unknown>[] = [
    myFaculty ? { faculty: { contains: me!.faculty!, mode: "insensitive" as const } } : null,
    myYear != null ? { graduationYear: { in: [...adjacentYears, myYear] } } : null,
    mySpec ? { specialization: { contains: me!.specialization!, mode: "insensitive" as const } } : null,
    myCity ? { city: { contains: me!.city!, mode: "insensitive" as const } } : null,
    myCountry ? { country: { contains: me!.country!, mode: "insensitive" as const } } : null,
    myFriendList.length ? { id: { in: myFriendList } } : null, // pull 2nd-degree profiles in
  ].filter(Boolean) as Record<string, unknown>[];

  const profileSimilar = similarConditions.length
    ? await prisma.member.findMany({
        where: {
          id: { notIn: connectedList },
          OR: similarConditions,
        },
        take: 200,
        select: {
          id: true,
          nameEn: true,
          faculty: true,
          specialization: true,
          graduationYear: true,
          country: true,
          city: true,
          user: { select: { name: true, image: true, email: true } },
        },
      })
    : [];

  const merged = new Map<string, SuggestionResult>();

  profileSimilar.forEach((m) => {
    const reasons: string[] = [];
    let weight = 0;

    const mFaculty = m.faculty?.toLowerCase().trim();
    const mSpec = m.specialization?.toLowerCase().trim();
    const mYear = m.graduationYear;

    const sameSpec = mSpec && mySpec && mSpec === mySpec;
    const sameYear = mYear != null && mYear === myYear;
    const neighborYear = mYear != null && adjacentYears.has(mYear);

    if (sameSpec && sameYear) {
      weight += 4;
      reasons.push("specialization_year");
    }
    if (sameYear) {
      weight += 3;
      reasons.push("year");
    }
    if (neighborYear) {
      weight += 2;
      reasons.push("adjacent_year");
    }
    if (mFaculty && myFaculty && mFaculty === myFaculty) {
      weight += 2;
      reasons.push("faculty");
    }
    if (sameSpec) {
      weight += 1;
      reasons.push("specialization");
    }
    const sc = sharedCount.get(m.id)?.count ?? 0;
    if (sc > 0) {
      weight += Math.min(1, sc) * 1;
      weight += sc * 0.5;
      reasons.push("shared");
    }
    if (m.city?.toLowerCase().trim() === myCity) {
      weight += 0.5;
      reasons.push("city");
    }

    merged.set(m.id, {
      member: memberToPublic(m),
      sharedFriends: sc,
      weight,
      reason: reasons,
    });
  });

  // 2nd-degree candidates (shared friends) not already caught above.
  const outstandingShared = [...sharedCount.entries()]
    .filter(([id]) => !merged.has(id))
    .slice(0, 200);
  if (outstandingShared.length) {
    const rows = await prisma.member.findMany({
      where: { id: { in: outstandingShared.map(([id]) => id) } },
      select: {
        id: true,
        nameEn: true,
        faculty: true,
        specialization: true,
        graduationYear: true,
        country: true,
        city: true,
        user: { select: { name: true, image: true, email: true } },
      },
    });
    rows.forEach((m) => {
      const sc = sharedCount.get(m.id)?.count ?? 0;
      merged.set(m.id, {
        member: memberToPublic(m),
        sharedFriends: sc,
        weight: 1 + sc * 0.5,
        reason: ["shared"],
      });
    });
  }

  const suggestions = [...merged.values()]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);

  return NextResponse.json({ data: suggestions });
}