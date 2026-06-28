import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isValidEmail } from "@/lib/sanitize";

interface NewsletterBody {
  email: string;
  name?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: NewsletterBody = await request.json();

    if (!body.email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(body.email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    const existing = await prisma.newsletter.findUnique({
      where: { email: body.email.trim().toLowerCase() },
    });

    if (existing) {
      if (existing.status === "active") {
        return NextResponse.json(
          { success: true, message: "Already subscribed" },
          { status: 200 }
        );
      }
      await prisma.newsletter.update({
        where: { email: body.email.trim().toLowerCase() },
        data: { status: "active", name: body.name || existing.name },
      });
    } else {
      await prisma.newsletter.create({
        data: {
          email: body.email.trim().toLowerCase(),
          name: body.name || null,
          status: "active",
        },
      });
    }

    return NextResponse.json(
      { success: true, message: "Successfully subscribed to newsletter" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}
