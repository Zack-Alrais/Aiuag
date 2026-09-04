import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireMember } from "@/lib/social-auth";

// GET /api/notifications/unread-count — lightweight badge polling endpoint.
export async function GET() {
  const auth = await requireMember();
  if (auth.response) return auth.response;
  const { session } = auth;

  const unread = await prisma.userNotification.count({
    where: { recipientId: session.memberId, isRead: false },
  });

  return NextResponse.json({ unread });
}