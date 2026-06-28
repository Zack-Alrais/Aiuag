import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { role } = body;

    if (!role || !["admin", "moderator", "member"].includes(role)) {
      return NextResponse.json(
        { error: "الصلاحية غير صالحة" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      );
    }

    // Check requester's role
    const token = req.cookies.get("admin_token")?.value;
    let requesterRole = "moderator";
    if (token) {
      try {
        const parsed = JSON.parse(token);
        const requester = await prisma.user.findUnique({ where: { id: parsed.id }, select: { role: true } });
        if (requester) requesterRole = requester.role;
      } catch {}
    }

    if (user.role === "admin" && requesterRole !== "admin") {
      return NextResponse.json(
        { error: "Cannot modify admin accounts" },
        { status: 403 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Update user role error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث الصلاحية" },
      { status: 500 }
    );
  }
}
