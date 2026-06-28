import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { NextResponse } from "next/server";

const ALL_PAGES = [
  "dashboard", "notifications", "news", "events", "posts", "comments",
  "videos", "gallery", "members", "cards", "board", "committees",
  "secretariat", "projects", "publications", "branches", "partners", "faqs",
  "contacts", "donations", "settings", "backup", "graduates",
  "activity", "permissions",
] as const;

export type PagePermission = typeof ALL_PAGES[number];

const SUPER_ADMIN_EMAIL = "pen@cube.com";

function getAdminEmail(req: Request): string | null {
  const token = req.headers.get("cookie") || "";
  const match = token.match(/admin_token=([^;]+)/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1])).email?.toLowerCase() || null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const adminEmail = getAdminEmail(request);
    if (!adminEmail || adminEmail !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      where: { OR: [{ role: "admin" }, { role: "moderator" }] },
      select: { id: true, name: true, email: true, role: true, permissions: true },
      orderBy: { createdAt: "asc" },
    });

    const result = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      permissions: u.permissions ? JSON.parse(u.permissions) : ALL_PAGES,
    }));

    return NextResponse.json({ data: result, allPages: ALL_PAGES });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const adminEmail = getAdminEmail(request);
    if (!adminEmail || adminEmail !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: "Only Pen@cube.com can manage permissions" }, { status: 403 });
    }

    const { userId, permissions } = await request.json();
    if (!userId || !permissions) {
      return NextResponse.json({ error: "Missing userId or permissions" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { permissions: JSON.stringify(permissions) },
    });

    const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
    const token = request.headers.get("cookie") || "";
    const match = token.match(/admin_token=([^;]+)/);
    if (match) {
      try {
        const t = JSON.parse(decodeURIComponent(match[1]));
        logAudit({ userId: t.id, userEmail: t.email, userName: t.name, action: "update", entity: "permissions", entityId: userId, details: { targetUser: targetUser?.email, permissions } });
      } catch {}
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
