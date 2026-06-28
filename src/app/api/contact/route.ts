import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { stripHtml, isValidEmail } from "@/lib/sanitize";

interface ContactBody {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactBody = await request.json();

    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(body.email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: stripHtml(body.name),
        email: body.email.trim().toLowerCase(),
        phone: body.phone || null,
        subject: stripHtml(body.subject),
        message: stripHtml(body.message),
        status: "unread",
      },
    });

    await createNotification({
      titleAr: "رسالة اتصال جديدة",
      titleEn: "New Contact Message",
      messageAr: `رسالة جديدة من ${body.name}: ${body.subject}`,
      messageEn: `New message from ${body.name}: ${body.subject}`,
      type: "info",
      entityType: "contact",
      entityId: contactMessage.id,
    });

    return NextResponse.json(
      { success: true, message: "Contact form submitted successfully", id: contactMessage.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}
