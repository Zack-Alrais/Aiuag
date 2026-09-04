import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export interface SessionMember {
  memberId: string;
  userId: string;
  email: string;
  name: string;
}

// Resolve the authenticated Member from the session. Returns null if the
// request is unauthenticated or the member record is missing.
export async function getSessionMember(): Promise<SessionMember | null> {
  const session = await auth();
  const user = session?.user as
    | ({
        name?: string | null;
        email?: string | null;
        image?: string | null;
      } & { id?: string; memberId?: string | null })
    | undefined;

  if (!user) return null;
  const hasUserId = !!user.id || !!user.email;

  // Prefer the memberId already present on the session (fast path).
  const memberInclude = {
    user: { select: { name: true, image: true, email: true } },
  } as const;
  let member: {
    id: string;
    userId: string;
    user: { name: string; image: string | null; email: string };
  } | null = null;
  try {
    member = user.memberId
      ? await prisma.member.findUnique({
          where: { id: user.memberId },
          include: memberInclude,
        })
      : null;
  } catch {
    return null;
  }

  // Fallback: resolve the member by user id/email when memberId is missing
  // from the session (e.g. sessions created before memberId was introduced).
  if (!member && hasUserId) {
    try {
      member = user.id
        ? await prisma.member.findFirst({
            where: { userId: user.id },
            include: memberInclude,
          })
        : null;
      if (!member && user.email) {
        member = await prisma.member.findFirst({
          where: { user: { email: user.email } },
          include: memberInclude,
        });
      }
    } catch {
      return null;
    }
  }

  if (!member) return null;

  return {
    memberId: member.id,
    userId: member.userId,
    email: member.user.email,
    name: member.user.name,
  };
}

export async function requireMember(): Promise<
  { session: SessionMember; response?: never } | { session?: never; response: NextResponse }
> {
  const session = await getSessionMember();
  if (!session) {
    return { response: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
  }
  return { session };
}

export interface PublicMember {
  id: string;
  name: string;
  email: string;
  image: string | null;
  nameEn: string | null;
  faculty: string | null;
  graduationYear: number | null;
  city: string | null;
  country: string | null;
}

// Selection that supplies everything memberToPublic() needs, reused by all
// social list endpoints to keep the public shape consistent.
export const memberPublicSelect = {
  id: true,
  nameEn: true,
  faculty: true,
  specialization: true,
  graduationYear: true,
  country: true,
  city: true,
  user: { select: { name: true, image: true, email: true } },
} as const;

// Normalize a Member query result into the public shape used by social UIs.
export function memberToPublic(m: {
  id: string;
  nameEn: string | null;
  faculty: string | null;
  specialization?: string | null;
  graduationYear: number | null;
  country: string | null;
  city: string | null;
  user: { name: string; image: string | null; email: string };
}): PublicMember {
  return {
    id: m.id,
    name: m.user.name,
    email: m.user.email,
    image: m.user.image,
    nameEn: m.nameEn,
    faculty: m.faculty,
    graduationYear: m.graduationYear,
    city: m.city,
    country: m.country,
  };
}

export async function getMemberBrief(memberId: string) {
  return prisma.member.findUnique({
    where: { id: memberId },
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
}