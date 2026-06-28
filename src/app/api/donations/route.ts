import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { isValidEmail, stripHtml } from "@/lib/sanitize";

interface DonationBody {
  amount: number;
  currency?: string;
  donorName: string;
  donorEmail: string;
  message?: string;
  anonymous?: boolean;
  method?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: DonationBody = await request.json();

    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: "A valid donation amount is required" },
        { status: 400 }
      );
    }

    if (!body.donorName || !body.donorEmail) {
      return NextResponse.json(
        { success: false, error: "Donor name and email are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(body.donorEmail)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    const donation = await prisma.donation.create({
      data: {
        donorName: body.anonymous ? "Anonymous" : stripHtml(body.donorName),
        donorEmail: body.donorEmail.trim().toLowerCase(),
        amount: body.amount,
        currency: body.currency || "USD",
        method: body.method || null,
        message: body.message ? stripHtml(body.message) : null,
        isAnonymous: body.anonymous ?? false,
        status: "completed",
      },
    });

    await createNotification({
      titleAr: "تبرع جديد",
      titleEn: "New Donation",
      messageAr: `تبرع جديد بقيمة ${body.amount} ${body.currency || "USD"} من ${body.anonymous ? "مجهول" : body.donorName}`,
      messageEn: `New donation of ${body.amount} ${body.currency || "USD"} from ${body.anonymous ? "Anonymous" : body.donorName}`,
      type: "success",
      entityType: "donation",
      entityId: donation.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Donation processed successfully",
        data: {
          id: donation.id,
          amount: donation.amount,
          currency: donation.currency,
          donorName: donation.donorName,
          status: donation.status,
          createdAt: donation.createdAt,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}
