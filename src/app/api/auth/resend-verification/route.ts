import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail, getVerificationEmailHtml } from "@/lib/email";

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مطلوب" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return NextResponse.json({
        success: true,
        message: "إذا كان البريد الإلكتروني مسجلاً، ستتلقى رمز التأكيد.",
      });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مؤكد مسبقاً" },
        { status: 400 }
      );
    }

    // Delete existing tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Generate new 6-digit code
    const verificationCode = generateVerificationCode();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationCode,
        expires,
      },
    });

    // Send verification email
    if (process.env.SMTP_USER || process.env.EMAIL_USER) {
      try {
        const verificationHtml = getVerificationEmailHtml(user.name, verificationCode);
        await sendEmail({
          to: email,
          subject: "تأكيد حسابك في رابطة خريجي الجامعة",
          html: verificationHtml,
        });
      } catch (emailError) {
        console.error("Verification email sending failed:", emailError);
        return NextResponse.json(
          { error: "فشل إرسال البريد الإلكتروني" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "تم إرسال رمز التأكيد إلى بريدك الإلكتروني",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إرسال الرمز" },
      { status: 500 }
    );
  }
}
