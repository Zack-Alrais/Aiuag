import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const message = await prisma.contactMessage.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Contact message not found" }, { status: 404 });
    }

    if (message.status === "unread") {
      await prisma.contactMessage.update({
        where: { id },
        data: { status: "read" },
      });
      message.status = "read";
    }

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch contact message" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, response } = body;

    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Contact message not found" }, { status: 404 });
    }

    const validStatuses = ["unread", "read", "replied"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const message = await prisma.contactMessage.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(response !== undefined && { response }),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update contact message" },
      { status: 500 }
    );
  }
}
