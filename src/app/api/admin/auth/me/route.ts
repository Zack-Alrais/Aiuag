import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const noStore = { "Cache-Control": "no-store, no-cache, must-revalidate" };

export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401, headers: noStore });
  }

  try {
    const parsed = JSON.parse(token);
    // Always fetch fresh permissions from DB
    const user = await prisma.user.findUnique({
      where: { id: parsed.id },
      select: { id: true, name: true, email: true, image: true, role: true, permissions: true },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401, headers: noStore });
    }

    // Pen@cube.com always gets full access
    const isSuper = user.email?.toLowerCase() === "pen@cube.com";
    const allPages = [
      "dashboard","notifications","news","events","posts","comments","members","cards",
      "projects","gallery","board","committees","secretariat","partners","faqs",
      "contacts","donations","backup","settings","graduates","activity","permissions","publications","videos","branches",
    ];
    const permissions = isSuper ? allPages : (user.permissions ? JSON.parse(user.permissions) : []);

    const response = NextResponse.json({
      authenticated: true,
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      permissions,
    });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401, headers: noStore });
  }
}
