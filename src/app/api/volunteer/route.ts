import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { isValidEmail, stripHtml } from "@/lib/sanitize";

interface VolunteerBody {
  name: string;
  email: string;
  phone?: string;
  skills?: string;
  availability?: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VolunteerBody = await request.json();

    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(body.email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    const application = await prisma.volunteerApplication.create({
      data: {
        name: stripHtml(body.name),
        email: body.email.trim().toLowerCase(),
        phone: body.phone || null,
        skills: body.skills ? stripHtml(body.skills) : null,
        availability: body.availability || null,
        message: body.message ? stripHtml(body.message) : null,
        status: "pending",
      },
    });

    await createNotification({
      titleAr: "طلب تطوع جديد",
      titleEn: "New Volunteer Application",
      messageAr: `طلب تطوع جديد من ${body.name}`,
      messageEn: `New volunteer application from ${body.name}`,
      type: "info",
      entityType: "volunteer",
      entityId: application.id,
    });

    return NextResponse.json(
      { success: true, message: "Application submitted successfully" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}
