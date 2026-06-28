import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, image: true, role: true } },
        donations: true,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch member" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      email,
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

    const existing = await prisma.member.findUnique({ where: { id }, include: { user: true } });
    if (!existing) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Check if requester is admin (from cookie)
    const token = request.cookies.get("admin_token")?.value;
    let requesterRole = "moderator";
    if (token) {
      try {
        const parsed = JSON.parse(token);
        const requester = await prisma.user.findUnique({ where: { id: parsed.id }, select: { role: true } });
        if (requester) requesterRole = requester.role;
      } catch {}
    }

    // Only admins can modify other admins
    if (existing.user.role === "admin" && requesterRole !== "admin") {
      return NextResponse.json({ error: "Cannot modify admin accounts" }, { status: 403 });
    }

    if (name || email) {
      await prisma.user.update({
        where: { id: existing.userId },
        data: {
          ...(name && { name }),
          ...(email && { email }),
        },
      });
    }

    const member = await prisma.member.update({
      where: { id },
      data: {
        ...(studentId !== undefined && { studentId }),
        ...(membershipNumber !== undefined && { membershipNumber }),
        ...(graduationYear !== undefined && { graduationYear: graduationYear !== null ? parseInt(String(graduationYear)) : null }),
        ...(faculty !== undefined && { faculty }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(status && { status }),
        ...(bio !== undefined && { bio }),
        ...(linkedin !== undefined && { linkedin }),
        ...(nameEn !== undefined && { nameEn }),
        ...(gender !== undefined && { gender }),
        ...(birthDate !== undefined && { birthDate }),
        ...(country !== undefined && { country }),
        ...(state !== undefined && { state }),
        ...(city !== undefined && { city }),
        ...(university !== undefined && { university }),
        ...(specialization !== undefined && { specialization }),
        ...(degree !== undefined && { degree }),
        ...(employer !== undefined && { employer }),
        ...(jobTitle !== undefined && { jobTitle }),
        ...(jobSector !== undefined && { jobSector }),
        ...(yearsOfExperience !== undefined && { yearsOfExperience: yearsOfExperience !== null ? parseInt(String(yearsOfExperience)) : null }),
        ...(graduationCertificate !== undefined && { graduationCertificate }),
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true, role: true } },
      },
    });

    const auditToken = request.cookies.get("admin_token")?.value;
    if (auditToken) {
      try {
        const t = JSON.parse(auditToken);
        logAudit({ userId: t.id, userEmail: t.email, userName: t.name, action: "update", entity: "member", entityId: id, details: { updatedFields: Object.keys(body).filter((k) => body[k] !== undefined) } });
      } catch {}
    }

    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check requester's role
    const token = request.cookies.get("admin_token")?.value;
    let requesterRole = "moderator";
    if (token) {
      try {
        const parsed = JSON.parse(token);
        const requester = await prisma.user.findUnique({ where: { id: parsed.id }, select: { role: true } });
        if (requester) requesterRole = requester.role;
      } catch {}
    }

    if (id.startsWith("pending-")) {
      const userId = id.replace("pending-", "");
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.role === "admin" && requesterRole !== "admin") {
        return NextResponse.json({ error: "Cannot delete admin accounts" }, { status: 403 });
      }
      await prisma.news.deleteMany({ where: { authorId: userId } });
      await prisma.gallery.deleteMany({ where: { authorId: userId } });
      await prisma.eventRegistration.deleteMany({ where: { userId } });
      await prisma.contactMessage.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } });
      return NextResponse.json({ message: "User deleted successfully" });
    }

    const existing = await prisma.member.findUnique({ where: { id }, include: { user: true } });
    if (!existing) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (existing.user.role === "admin" && requesterRole !== "admin") {
      return NextResponse.json({ error: "Cannot delete admin accounts" }, { status: 403 });
    }

    const userId = existing.userId;

    await prisma.donation.deleteMany({ where: { memberId: id } });
    await prisma.member.delete({ where: { id } });

    await prisma.news.deleteMany({ where: { authorId: userId } });
    await prisma.gallery.deleteMany({ where: { authorId: userId } });
    await prisma.eventRegistration.deleteMany({ where: { userId } });
    await prisma.contactMessage.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });

    const auditToken = request.cookies.get("admin_token")?.value;
    if (auditToken) {
      try {
        const t = JSON.parse(auditToken);
        logAudit({ userId: t.id, userEmail: t.email, userName: t.name, action: "delete", entity: "member", entityId: id });
      } catch {}
    }

    return NextResponse.json({ message: "Member deleted successfully" });
  } catch (error: any) {
    console.error("DELETE member error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete" }, { status: 500 });
  }
}
