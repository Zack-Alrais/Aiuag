import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const unreadOnly = searchParams.get("unread") === "true";

    const where: Record<string, unknown> = {};
    if (unreadOnly) where.isRead = false;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({ where: { isRead: false } }),
    ]);

    return NextResponse.json({ data: notifications, unreadCount });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { titleAr, titleEn, messageAr, messageEn, type, entityType, entityId, isGlobal, targetUserId } = body;

    if (!titleAr || !titleEn || !messageAr || !messageEn) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        titleAr,
        titleEn,
        messageAr,
        messageEn,
        type: type || "info",
        entityType: entityType || null,
        entityId: entityId || null,
        isGlobal: isGlobal ?? true,
        targetUserId: targetUserId || null,
      },
    });

    return NextResponse.json({ data: notification }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}
