import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const noStore = { "Cache-Control": "no-store, no-cache, must-revalidate" };
const DEV_ADMIN_ID = "dev-admin-id";
const DEV_ADMIN_NAME = "Admin (Dev)";
const DEV_ADMIN_EMAIL = process.env.DEV_ADMIN_EMAIL || "admin@aiuag.org";
const DEV_ADMIN_ROLE = "admin";

const allPages = [
  "dashboard","notifications","news","events","posts","comments","members","cards",
  "projects","gallery","board","committees","secretariat","partners","faqs",
  "contacts","donations","backup","settings","graduates","activity","permissions","publications","videos","branches",
];

export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401, headers: noStore });
  }

  try {
    const parsed = JSON.parse(token);

    // Handle dev admin mock user
    if (parsed.id === DEV_ADMIN_ID) {
      const response = NextResponse.json({
        authenticated: true,
        id: DEV_ADMIN_ID,
        name: DEV_ADMIN_NAME,
        email: DEV_ADMIN_EMAIL,
        image: null,
        role: DEV_ADMIN_ROLE,
        permissions: allPages,
        nameEn: "",
        memberSince: "",
        membershipNumber: "",
      });
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      return response;
    }

    // Always fetch fresh permissions from DB
    const user = await prisma.user.findUnique({
      where: { id: parsed.id },
      select: { id: true, name: true, email: true, image: true, role: true, permissions: true },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401, headers: noStore });
    }

    // Get member profile data for enhanced profile display
    const member = await prisma.member.findUnique({
      where: { userId: user.id },
      select: { nameEn: true, createdAt: true, membershipNumber: true },
    });

    // Pen@cube.com always gets full access
    const isSuper = user.email?.toLowerCase() === "pen@cube.com";
    const permissions = isSuper ? allPages : (user.permissions ? JSON.parse(user.permissions) : []);

    const response = NextResponse.json({
      authenticated: true,
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      permissions,
      nameEn: member?.nameEn || "",
      memberSince: member?.createdAt ? new Date(member.createdAt).toLocaleDateString("en-GB") : "",
      membershipNumber: member?.membershipNumber || "",
    });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401, headers: noStore });
  }
}
