import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logAudit } from "@/lib/audit";
import { findUserByEmail, verifyStoredPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "البريد الإلكتروني وكلمة المرور مطلوبان" },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    const passwordCheck = await verifyStoredPassword(password, user.password);
    if (!passwordCheck.isValid) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    if (passwordCheck.isPlainText) {
      const hashedPassword = await bcrypt.hash(password, 12);
      await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
    }

    // Pen@cube.com always has admin access
    const isSuper = email.toLowerCase() === "pen@cube.com";
    if (!isSuper && user.role !== "admin" && user.role !== "moderator") {
      return NextResponse.json(
        { error: "ليس لديك صلاحية الوصول إلى لوحة التحكم" },
        { status: 403 }
      );
    }

    // Auto-grant admin role to Pen@cube.com if not already set
    if (isSuper && user.role !== "admin") {
      await prisma.user.update({ where: { id: user.id }, data: { role: "admin" } });
      user.role = "admin";
    }

    const allPages = [
      "dashboard","notifications","news","events","posts","comments","videos","gallery","members","cards",
      "board","committees","secretariat","projects","publications","branches","partners","faqs",
      "contacts","donations","settings","backup","graduates","activity","permissions",
    ];
    const permissions = isSuper ? allPages : (user.permissions ? JSON.parse(user.permissions) : []);

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, permissions },
    });

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "";
    const ua = request.headers.get("user-agent") || "";
    logAudit({ userId: user.id, userEmail: user.email, userName: user.name, action: "login", entity: "auth", ipAddress: ip, userAgent: ua });

    const isProduction = process.env.NODE_ENV === "production";

    response.cookies.set("admin_token", JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions,
    }), {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}
