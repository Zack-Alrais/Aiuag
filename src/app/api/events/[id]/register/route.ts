import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please log in to register for events" },
        { status: 401 }
      );
    }

    const { id: eventId } = await params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { registrations: { where: { userId: session.user.id } } },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status === "completed" || event.status === "cancelled") {
      return NextResponse.json(
        { error: "Registration is closed for this event" },
        { status: 400 }
      );
    }

    if (event.registrations.length > 0) {
      return NextResponse.json(
        { error: "Already registered for this event" },
        { status: 409 }
      );
    }

    if (event.capacity && event.registeredCount >= event.capacity) {
      return NextResponse.json(
        { error: "Event is full" },
        { status: 400 }
      );
    }

    if (event.registrationDeadline && new Date(event.registrationDeadline) < new Date()) {
      return NextResponse.json(
        { error: "Registration deadline has passed" },
        { status: 400 }
      );
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        userId: session.user.id,
        status: "registered",
      },
    });

    await prisma.event.update({
      where: { id: eventId },
      data: { registeredCount: { increment: 1 } },
    });

    return NextResponse.json(
      { success: true, message: "Successfully registered", registration },
      { status: 201 }
    );
  } catch (error) {
    console.error("Event registration failed:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
