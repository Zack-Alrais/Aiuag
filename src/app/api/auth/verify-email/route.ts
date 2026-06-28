import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Verify via link (token in URL)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/auth/error?error=invalid-token", req.url)
      );
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.redirect(
        new URL("/auth/error?error=invalid-token", req.url)
      );
    }

    if (new Date() > verificationToken.expires) {
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.redirect(
        new URL("/auth/error?error=token-expired", req.url)
      );
    }

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.redirect(
      new URL("/auth/login?verified=true", req.url)
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(
      new URL("/auth/error?error=verification-failed", req.url)
    );
  }
}

// POST: Verify via 6-digit code
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "البريد الإلكتروني ورمز التأكيد مطلوبان" },
        { status: 400 }
      );
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email,
          token: code,
        },
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "رمز التأكيد غير صحيح" },
        { status: 400 }
      );
    }

    if (new Date() > verificationToken.expires) {
      await prisma.verificationToken.delete({
        where: { token: code },
      });
      return NextResponse.json(
        { error: "انتهت صلاحية رمز التأكيد. يرجى طلب رمز جديد." },
        { status: 400 }
      );
    }

    // Verify the user
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    // Delete the token
    await prisma.verificationToken.delete({
      where: { token: code },
    });

    return NextResponse.json({
      success: true,
      message: "تم التحقق من البريد الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول.",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء التحقق" },
      { status: 500 }
    );
  }
}
