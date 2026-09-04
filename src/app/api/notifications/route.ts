import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireMember } from "@/lib/social-auth";

function isConnError(e: unknown): boolean {
  return (
    e instanceof Error &&
    ("code" in e) &&
    (e as { code?: string }).code === "P1017"
  );
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (firstErr) {
    if (isConnError(firstErr)) {
      await new Promise((r) => setTimeout(r, 300));
      return fn();
    }
    throw firstErr;
  }
}

async function loadNotifications(recipientId: string, limit: number) {
  return withRetry(() =>
    prisma.userNotification.findMany({
      where: { recipientId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        actor: {
          select: { id: true, user: { select: { name: true, image: true } } },
        },
      },
    })
  );
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireMember();
    if (auth.response) return auth.response;
    const { session } = auth;

    const { searchParams } = new URL(request.url);
    const limitParam = parseInt(searchParams.get("limit") || "30", 10);
    const limit = Math.min(Number.isFinite(limitParam) ? limitParam : 30, 50);

    const notifications = await loadNotifications(session.memberId, limit);
    const unreadCount = await withRetry(() =>
      prisma.userNotification.count({
        where: { recipientId: session.memberId, isRead: false },
      })
    );

    return NextResponse.json({
      data: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        entityType: n.entityType,
        entityId: n.entityId,
        titleAr: n.titleAr,
        titleEn: n.titleEn,
        bodyAr: n.bodyAr,
        bodyEn: n.bodyEn,
        isRead: n.isRead,
        actor: n.actor
          ? { id: n.actor.id, name: n.actor.user.name, image: n.actor.user.image }
          : null,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    });
  } catch (error) {
    console.error("[notifications] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load notifications", data: [], unreadCount: 0 },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const auth = await requireMember();
    if (auth.response) return auth.response;
    const { session } = auth;

    await withRetry(() =>
      prisma.userNotification.updateMany({
        where: { recipientId: session.memberId, isRead: false },
        data: { isRead: true },
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[notifications] POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to mark notifications" },
      { status: 500 }
    );
  }
}
