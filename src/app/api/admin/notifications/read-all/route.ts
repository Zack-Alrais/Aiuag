import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT() {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to mark all as read" }, { status: 500 });
  }
}
