import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { stripHtml } from "@/lib/sanitize";
import { generateMembershipNumber } from "@/lib/membership";

export async function GET() {
  try {
    let session;
    try {
      session = await auth();
    } catch (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json({ error: "Auth failed", detail: String(authError) }, { status: 401 });
    }
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized", detail: "No user id or email in session" }, { status: 401 });
    }

    let user;
    try {
      // Try by ID first, fallback to email if ID lookup fails (stale JWT)
      if (session.user.id) {
        user = await prisma.user.findUnique({
          where: { id: session.user.id },
          include: { member: true },
        });
      }
      if (!user && session.user.email) {
        user = await prisma.user.findUnique({
          where: { email: session.user.email },
          include: { member: true },
        });
      }
    } catch (dbError) {
      console.error("DB error:", dbError);
      return NextResponse.json({ error: "Database error", detail: String(dbError) }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const m = user.member;
    const today = new Date();

    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      // Personal
      nameEn: m?.nameEn || "",
      phone: m?.phone || "",
      gender: m?.gender || "",
      birthDate: m?.birthDate || "",
      country: m?.country || "",
      state: m?.state || "",
      city: m?.city || "",
      address: m?.address || "",
      // Academic
      university: m?.university || "",
      faculty: m?.faculty || "",
      specialization: m?.specialization || "",
      degree: m?.degree || "",
      graduationYear: m?.graduationYear ? String(m.graduationYear) : "",
      // Work
      employer: m?.employer || "",
      jobTitle: m?.jobTitle || "",
      jobSector: m?.jobSector || "",
      yearsOfExperience: m?.yearsOfExperience || 0,
      // Membership
      membershipType: m?.membershipType || "عضو عامل",
      membershipNumber: m?.membershipNumber || "",
      memberStatus: m?.status || "pending",
      memberSince: m?.createdAt ? new Date(m.createdAt).toLocaleDateString("en-GB") : "",
      membershipEndDate: m?.membershipEndDate ? new Date(m.membershipEndDate).toLocaleDateString("en-GB") : "",
      // Media
      cardPhoto: m?.cardPhoto || "",
      graduationCertificate: m?.graduationCertificate || "",
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    let session;
    try {
      session = await auth();
    } catch (authError) {
      console.error("Auth error (PATCH):", authError);
      return NextResponse.json({ error: "Auth failed" }, { status: 401 });
    }
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where = session.user?.id
      ? { id: session.user.id }
      : { email: session.user.email! };

    const body = await request.json();

    // Fields that go to User model
    const { name, image } = body;
    const userUpdate: Record<string, unknown> = {};
    if (name !== undefined) userUpdate.name = stripHtml(name);
    if (image !== undefined) userUpdate.image = image;
    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({ where, data: userUpdate });
    }

    // Fields that go to Member model
    const memberFields = [
      "nameEn", "phone", "gender", "birthDate", "country", "state", "city", "address",
      "university", "faculty", "specialization", "degree", "graduationYear",
      "employer", "jobTitle", "jobSector", "yearsOfExperience",
      "membershipType",
      "cardPhoto", "graduationCertificate",
    ] as const;

    const memberUpdate: Record<string, unknown> = {};
    for (const field of memberFields) {
      if (body[field] !== undefined) {
        const val = typeof body[field] === "string" ? stripHtml(body[field]) : body[field];
        memberUpdate[field] = field === "graduationYear" ? (val ? parseInt(String(val)) || null : null) : val;
      }
    }

    if (Object.keys(memberUpdate).length > 0) {
      const resolvedUser = await prisma.user.findUnique({ where, select: { id: true } });
      if (resolvedUser) {
        const existing = await prisma.member.findUnique({ where: { userId: resolvedUser.id } });
        if (existing) {
          await prisma.member.update({ where: { userId: resolvedUser.id }, data: memberUpdate });
        } else {
          await prisma.member.create({
            data: {
              userId: resolvedUser.id,
              membershipNumber: await generateMembershipNumber(),
              ...memberUpdate as any,
            },
          });
        }
      }
    }

    // Return updated profile
    const updatedUser = await prisma.user.findUnique({
      where,
      include: { member: true },
    });

    if (!updatedUser) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const m = updatedUser.member;
    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
      nameEn: m?.nameEn || "",
      phone: m?.phone || "",
      gender: m?.gender || "",
      birthDate: m?.birthDate || "",
      country: m?.country || "",
      state: m?.state || "",
      city: m?.city || "",
      address: m?.address || "",
      university: m?.university || "",
      faculty: m?.faculty || "",
      specialization: m?.specialization || "",
      degree: m?.degree || "",
      graduationYear: m?.graduationYear ? String(m.graduationYear) : "",
      employer: m?.employer || "",
      jobTitle: m?.jobTitle || "",
      jobSector: m?.jobSector || "",
      yearsOfExperience: m?.yearsOfExperience || 0,
      membershipType: m?.membershipType || "عضو عامل",
      membershipNumber: m?.membershipNumber || "",
      memberStatus: m?.status || "pending",
      memberSince: m?.createdAt ? new Date(m.createdAt).toLocaleDateString("en-GB") : "",
      membershipEndDate: m?.membershipEndDate ? new Date(m.membershipEndDate).toLocaleDateString("en-GB") : "",
      cardPhoto: m?.cardPhoto || "",
      graduationCertificate: m?.graduationCertificate || "",
    });
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
