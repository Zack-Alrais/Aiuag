import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { sendEmail, getVerificationEmailHtml } from "@/lib/email"
import { stripHtml, isValidEmail, isStrongPassword } from "@/lib/sanitize"
import { generateMembershipNumber } from "@/lib/membership"

export async function POST(request: Request) {
  try {
    const { claimToken, email, password, image, photo, graduationCertificate, birthDate, state, city, address, phone } = await request.json()

    if (!claimToken || !email || !password) {
      return NextResponse.json({ error: "الرمز، البريد الإلكتروني وكلمة المرور مطلوبة" }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "البريد الإلكتروني غير صحيح" }, { status: 400 })
    }

    const pwCheck = isStrongPassword(password)
    if (!pwCheck.valid) {
      return NextResponse.json({ error: pwCheck.message }, { status: 400 })
    }

    // Find graduate by claim token
    const graduate = await prisma.graduate.findUnique({ where: { claimToken } })
    if (!graduate) {
      return NextResponse.json({ error: "الرمز غير صحيح أو منتهي الصلاحية" }, { status: 400 })
    }
    if (graduate.isClaimed) {
      return NextResponse.json({ error: "هذا الحساب مستخدم بالفعل" }, { status: 400 })
    }

    // Check email not already registered
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (existingUser) {
      return NextResponse.json({ error: "البريد الإلكتروني مسجل مسبقاً" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const cleanEmail = email.toLowerCase().trim()
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // Generate membership number
    const membershipNumber = await generateMembershipNumber()

    // Create user (unverified)
    const user = await prisma.user.create({
      data: {
        name: graduate.name,
        email: cleanEmail,
        password: hashedPassword,
        role: "member",
        image: image || null,
        emailVerified: null,
      },
    })

    // Create member record
    await prisma.member.create({
      data: {
        userId: user.id,
        nameEn: "",
        membershipNumber,
        phone: phone || "",
        country: graduate.country,
        state: state || null,
        city: city || null,
        address: address || null,
        birthDate: birthDate || null,
        faculty: graduate.faculty,
        specialization: graduate.specialization || "",
        graduationYear: graduate.graduationYear,
        university: graduate.university,
        status: "approved",
        cardPhoto: photo || null,
        graduationCertificate: graduationCertificate || null,
      },
    })

    // Mark graduate as claimed
    await prisma.graduate.update({
      where: { id: graduate.id },
      data: { isClaimed: true, userId: user.id, claimToken: null, claimedAt: new Date() },
    })

    // Create verification token
    await prisma.verificationToken.deleteMany({ where: { identifier: cleanEmail } })
    await prisma.verificationToken.create({
      data: { identifier: cleanEmail, token: verificationCode, expires },
    })

    // Send verification email
    if (process.env.SMTP_USER || process.env.EMAIL_USER) {
      try {
        const html = getVerificationEmailHtml(graduate.name, verificationCode)
        await sendEmail({ to: cleanEmail, subject: "تأكيد حسابك في رابطة الخريجين", html })
      } catch (e) {
        console.error("Verification email failed:", e)
      }
    }

    return NextResponse.json({
      success: true,
      message: "تم إنشاء الحساب. يرجى التحقق من بريدك الإلكتروني.",
      email: cleanEmail,
    })
  } catch (error: any) {
    console.error("Claim graduate error:", error)
    return NextResponse.json({ error: error.message || "حدث خطأ" }, { status: 500 })
  }
}
