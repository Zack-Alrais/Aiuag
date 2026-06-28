import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail, getVerificationEmailHtml, getWelcomeEmailHtml } from "@/lib/email";
import { stripHtml, isValidEmail, isStrongPassword } from "@/lib/sanitize";

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, nameEn, email, password,
      dialCode, phone, gender, birthDate, country, state, city, address,
      university, faculty, specialization, degree, graduationYear,
      employer, jobTitle, jobSector, yearsOfExperience,
      graduationCertificate,
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "الاسم والبريد الإلكتروني وكلمة المرور مطلوبة" },
        { status: 400 }
      );
    }

    const cleanName = stripHtml(name);
    const cleanEmail = email.toLowerCase().trim();

    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json({ error: "البريد الإلكتروني غير صحيح" }, { status: 400 });
    }

    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.valid) {
      return NextResponse.json({ error: passwordCheck.message }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return NextResponse.json({ error: "البريد الإلكتروني مسجل مسبقاً" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        role: "member",
        emailVerified: null,
      },
    });

    // Generate 6-digit verification code
    const verificationCode = generateVerificationCode();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.deleteMany({ where: { identifier: cleanEmail } });
    await prisma.verificationToken.create({
      data: { identifier: cleanEmail, token: verificationCode, expires },
    });

    // Send verification email
    if (process.env.SMTP_USER || process.env.EMAIL_USER) {
      try {
        const verificationHtml = getVerificationEmailHtml(cleanName, verificationCode);
        await sendEmail({ to: cleanEmail, subject: "تأكيد حسابك في رابطة خريجي الجامعة", html: verificationHtml });
      } catch (emailError) {
        console.error("Verification email failed:", emailError);
      }
    }

    // Create member record
    const memberData: Record<string, any> = { userId: user.id, status: "pending" };
    if (nameEn) memberData.nameEn = stripHtml(nameEn);
    if (phone) memberData.phone = stripHtml(dialCode ? `${dialCode}${phone}` : phone);
    if (gender) memberData.gender = gender;
    if (birthDate) memberData.birthDate = birthDate;
    if (country) memberData.country = stripHtml(country);
    if (state) memberData.state = stripHtml(state);
    if (city) memberData.city = stripHtml(city);
    if (address) memberData.address = stripHtml(address);
    if (university) memberData.university = stripHtml(university);
    if (faculty) memberData.faculty = stripHtml(faculty);
    if (specialization) memberData.specialization = stripHtml(specialization);
    if (degree) memberData.degree = degree;
    if (graduationYear) memberData.graduationYear = parseInt(graduationYear);
    if (employer) memberData.employer = stripHtml(employer);
    if (jobTitle) memberData.jobTitle = stripHtml(jobTitle);
    if (jobSector) memberData.jobSector = jobSector;
    if (yearsOfExperience) memberData.yearsOfExperience = parseInt(yearsOfExperience);
    if (graduationCertificate) memberData.graduationCertificate = graduationCertificate;

    await prisma.member.create({ data: memberData });

    return NextResponse.json({
      success: true,
      message: "تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني.",
      userId: user.id,
      requiresVerification: true,
    });
  } catch (error: any) {
    console.error("Registration error:", error?.message || error);
    return NextResponse.json({ error: "حدث خطأ أثناء إنشاء الحساب" }, { status: 500 });
  }
}
