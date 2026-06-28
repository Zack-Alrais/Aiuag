import prisma from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, address, studentId, graduationYear, faculty, department } = body;

    if (!name || !email || !phone || !studentId || !graduationYear || !faculty) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: "pending", // Will be set when account is activated
        role: "member",
      },
    });

    // Create member profile
    const member = await prisma.member.create({
      data: {
        userId: user.id,
        studentId,
        graduationYear: parseInt(graduationYear),
        faculty,
        department: department || null,
        phone,
        address: address || null,
        status: "pending",
      },
    });

    // Get total member count
    const totalMembers = await prisma.member.count();

    // Create notification
    await createNotification({
      titleAr: "طلب عضوية جديد",
      titleEn: "New Membership Application",
      messageAr: `طلب عضوية جديد من ${name} (${email}) - إجمالي الأعضاء: ${totalMembers}`,
      messageEn: `New membership application from ${name} (${email}) - Total members: ${totalMembers}`,
      type: "success",
      entityType: "member",
      entityId: member.id,
    });

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
      memberCount: totalMembers,
    }, { status: 201 });
  } catch (error) {
    console.error("Membership application error:", error);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
