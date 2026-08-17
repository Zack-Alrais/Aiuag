import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logAudit } from "@/lib/audit";
import { findUserByEmail, verifyStoredPassword } from "@/lib/password";
import { signAdminToken } from "@/lib/admin-token";

const DEV_ADMIN_EMAIL = process.env.DEV_ADMIN_EMAIL || "admin@aiuag.org";
const DEV_ADMIN_PASSWORD = process.env.DEV_ADMIN_PASSWORD || "admin123";
const DEV_ADMIN_ID = "dev-admin-id";
const DEV_ADMIN_NAME = "Admin (Dev)";
const DEV_ADMIN_ROLE = "admin";

const allPages = [
  "dashboard","notifications","news","events","posts","comments","videos","gallery","members","cards",
  "board","committees","secretariat","projects","publications","branches","partners","faqs",
  "contacts","donations","settings","backup","graduates","activity","permissions",
];

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

    // Development fallback: only allow when DB is completely unreachable
    const isDevCredentials = email.toLowerCase() === DEV_ADMIN_EMAIL.toLowerCase() && password === DEV_ADMIN_PASSWORD;

    let user = null;
    let isSuper = false;
    let dbError = null;

    try {
      user = await findUserByEmail(email);
    } catch (err) {
      dbError = err;
      console.warn("Database connection failed:", err);
    }

    // If DB is unreachable (not just user missing) with dev credentials, use mock user
    if (dbError && isDevCredentials) {
      user = {
        id: DEV_ADMIN_ID,
        name: DEV_ADMIN_NAME,
        email: DEV_ADMIN_EMAIL,
        role: DEV_ADMIN_ROLE,
        password: await bcrypt.hash(DEV_ADMIN_PASSWORD, 12),
        permissions: null,
        image: null,
        emailVerified: new Date(),
      };
    }

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

    if (passwordCheck.isPlainText && user.id !== DEV_ADMIN_ID) {
      const hashedPassword = await bcrypt.hash(password, 12);
      await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
    }

    // Pen@cube.com always has admin access
    isSuper = email.toLowerCase() === "pen@cube.com";
    if (!isSuper && user.role !== "admin" && user.role !== "moderator") {
      return NextResponse.json(
        { error: "ليس لديك صلاحية الوصول إلى لوحة التحكم" },
        { status: 403 }
      );
    }

    // Auto-grant admin role to Pen@cube.com if not already set
    if (isSuper && user.role !== "admin" && user.id !== DEV_ADMIN_ID) {
      await prisma.user.update({ where: { id: user.id }, data: { role: "admin" } });
      user.role = "admin";
    }

    const permissions = isSuper ? allPages : (user.permissions ? JSON.parse(user.permissions) : allPages);

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, permissions },
    });

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "";
    const ua = request.headers.get("user-agent") || "";
    
    // Only log audit if not using dev mock user
    if (user.id !== DEV_ADMIN_ID) {
      logAudit({ userId: user.id, userEmail: user.email, userName: user.name, action: "login", entity: "auth", ipAddress: ip, userAgent: ua });
    }

    const signedToken = await signAdminToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions,
    });

    response.cookies.set("admin_token", signedToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}
