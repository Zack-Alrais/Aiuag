import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { verifyAdminToken } from "@/lib/admin-token";
import { NextResponse, NextRequest } from "next/server";

const ALL_PAGES = [
  "dashboard", "notifications", "news", "events", "posts", "comments",
  "videos", "gallery", "members", "cards", "board", "committees",
  "secretariat", "projects", "publications", "branches", "partners", "faqs",
  "contacts", "donations", "settings", "backup", "graduates",
  "activity", "permissions",
] as const;

export type PagePermission = typeof ALL_PAGES[number];

const SUPER_ADMIN_EMAIL = "pen@cube.com";

async function getAdminAuth(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)admin_token=([^;]+)/);
  if (!match) return null;
  return verifyAdminToken(decodeURIComponent(match[1]));
}

export async function GET(request: NextRequest) {
  try {
    const token = await getAdminAuth(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isSuper = token.email.toLowerCase() === SUPER_ADMIN_EMAIL;
    // Any admin can view the list (read-only); only super admin can manage it.
    if (!isSuper && token.role !== "admin" && token.role !== "moderator") {
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

export async function PATCH(request: NextRequest) {
  try {
    const token = await getAdminAuth(request);
    if (!token || token.email.toLowerCase() !== SUPER_ADMIN_EMAIL) {
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
    logAudit({ userId: token.id, userEmail: token.email, userName: token.name, action: "update", entity: "permissions", entityId: userId, details: { targetUser: targetUser?.email, permissions } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}