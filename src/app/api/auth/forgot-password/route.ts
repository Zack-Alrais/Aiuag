import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail, getPasswordResetEmailHtml } from "@/lib/email";

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
      return NextResponse.json({
        success: true,
        message: "إذا كان البريد الإلكتروني مسجلاً، ستتلقى رسالة لإعادة تعيين كلمة المرور.",
      });
    }

    await prisma.passwordReset.deleteMany({
      where: { email },
    });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordReset.create({
      data: {
        email,
        token: resetToken,
        expires,
      },
    });

    if (process.env.SMTP_USER || process.env.EMAIL_USER) {
      try {
        const emailHtml = getPasswordResetEmailHtml(user.name, resetToken);
        await sendEmail({
          to: email,
          subject: "إعادة تعيين كلمة المرور - رابطة خريجي الجامعة",
          html: emailHtml,
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "إذا كان البريد الإلكتروني مسجلاً، ستتلقى رسالة لإعادة تعيين كلمة المرور.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إرسال الطلب" },
      { status: 500 }
    );
  }
}
