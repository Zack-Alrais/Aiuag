import prisma from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { logAudit } from "@/lib/audit";
import { generateMembershipNumber } from "@/lib/membership";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Check current user's role from cookie
    const token = request.cookies.get("admin_token")?.value;
    let currentUserRole = "moderator";
    if (token) {
      try {
        const parsed = JSON.parse(token);
        const user = await prisma.user.findUnique({ where: { id: parsed.id }, select: { role: true } });
        if (user) currentUserRole = user.role;
      } catch {}
    }

    // Get all users with optional member record
    // Only exclude admins for non-admin users
    const userWhere: Record<string, unknown> = {};
    if (currentUserRole !== "admin") {
      userWhere.role = { not: "admin" };
    }
    if (search) {
      userWhere.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { member: { studentId: { contains: search } } },
        { member: { membershipNumber: { contains: search } } },
        { member: { faculty: { contains: search } } },
        { member: { country: { contains: search } } },
        { member: { specialization: { contains: search } } },
      ];
    }

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where: userWhere,
        include: { member: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where: userWhere }),
    ]);

    // Transform to match the existing Member format
    const data = users.map((u) => {
      const hasMember = !!u.member;
      return {
        id: hasMember ? u.member!.id : `pending-${u.id}`,
        userId: u.id,
        user: { id: u.id, name: u.name, email: u.email, image: u.image, role: u.role },
        studentId: u.member?.studentId || null,
        membershipNumber: u.member?.membershipNumber || null,
        graduationYear: u.member?.graduationYear || null,
        faculty: u.member?.faculty || null,
        phone: u.member?.phone || null,
        address: u.member?.address || null,
        bio: u.member?.bio || null,
        linkedin: u.member?.linkedin || null,
        status: hasMember ? u.member!.status : "pending",
        createdAt: u.member?.createdAt?.toISOString() || u.createdAt.toISOString(),
        hasMember,
        nameEn: u.member?.nameEn || null,
        gender: u.member?.gender || null,
        birthDate: u.member?.birthDate || null,
        country: u.member?.country || null,
        state: u.member?.state || null,
        city: u.member?.city || null,
        university: u.member?.university || null,
        specialization: u.member?.specialization || null,
        degree: u.member?.degree || null,
        employer: u.member?.employer || null,
        jobTitle: u.member?.jobTitle || null,
        jobSector: u.member?.jobSector || null,
        yearsOfExperience: u.member?.yearsOfExperience || null,
        graduationCertificate: u.member?.graduationCertificate || null,
      };
    });

    return NextResponse.json({
      data,
      pagination: { page, limit, total: totalUsers, pages: Math.ceil(totalUsers / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      role,
      userId,
      studentId,
      membershipNumber,
      graduationYear,
      faculty,
      phone,
      address,
      status,
      bio,
      linkedin,
      nameEn,
      gender,
      birthDate,
      country,
      state,
      city,
      university,
      specialization,
      degree,
      employer,
      jobTitle,
      jobSector,
      yearsOfExperience,
      graduationCertificate,
    } = body;

    let finalUserId = userId;

    if (!finalUserId) {
      if (!name || !email) {
        return NextResponse.json({ error: "name and email are required" }, { status: 400 });
      }
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        finalUserId = existingUser.id;
      } else {
        const hashedPassword = password ? await (await import("bcryptjs")).default.hash(password, 12) : await (await import("bcryptjs")).default.hash("Temp1234!", 12);
        const userRole = (role === "admin" || role === "moderator") ? role : "member";
        const newUser = await prisma.user.create({
          data: { name, email, password: hashedPassword, role: userRole, emailVerified: new Date() },
        });
        finalUserId = newUser.id;
      }
    }

    const existingMember = await prisma.member.findUnique({ where: { userId: finalUserId } });
    if (existingMember) {
      return NextResponse.json({ error: "User already has a member profile" }, { status: 409 });
    }

    const member = await prisma.member.create({
      data: {
        userId: finalUserId,
        studentId: studentId || null,
        membershipNumber: membershipNumber || await generateMembershipNumber(),
        graduationYear: graduationYear ? parseInt(String(graduationYear)) : null,
        faculty: faculty || null,
        phone: phone || null,
        address: address || null,
        status: status || "pending",
        bio: bio || null,
        linkedin: linkedin || null,
        nameEn: nameEn || null,
        gender: gender || null,
        birthDate: birthDate || null,
        country: country || null,
        state: state || null,
        city: city || null,
        university: university || null,
        specialization: specialization || null,
        degree: degree || null,
        employer: employer || null,
        jobTitle: jobTitle || null,
        jobSector: jobSector || null,
        yearsOfExperience: yearsOfExperience ? parseInt(String(yearsOfExperience)) : null,
        graduationCertificate: graduationCertificate || null,
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true, role: true } },
      },
    });

    await createNotification({
      titleAr: "عضو جديد مسجل",
      titleEn: "New Member Registered",
      messageAr: `عضو جديد: ${member.user.name} (${member.user.email})`,
      messageEn: `New member: ${member.user.name} (${member.user.email})`,
      type: "success",
      entityType: "member",
      entityId: member.id,
    });

    const token = request.cookies.get("admin_token")?.value;
    let actor = { userId: finalUserId, userEmail: email || "", userName: name || "" };
    if (token) { try { const t = JSON.parse(token); actor = { userId: t.id, userEmail: t.email, userName: t.name }; } catch {} }
    logAudit({ ...actor, action: "create", entity: "member", entityId: member.id, details: { membershipNumber: member.membershipNumber } });

    return NextResponse.json(member, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/members error:", error);
    return NextResponse.json({ error: "Failed to create member", details: error.message, code: error.code }, { status: 500 });
  }
}
