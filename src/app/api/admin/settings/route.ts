import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.settings.findMany();
    const grouped: Record<string, Record<string, string>> = {};

    for (const s of settings) {
      if (!grouped[s.group]) grouped[s.group] = {};
      grouped[s.group][s.key] = s.value;
    }

    return NextResponse.json({ success: true, data: grouped });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { group, settings } = body;

    if (!group || !settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "Group and settings object are required" },
        { status: 400 }
      );
    }

    const operations = Object.entries(settings).map(([key, value]) =>
      prisma.settings.upsert({
        where: { key },
        update: { value: String(value), group },
        create: { key, value: String(value), group },
      })
    );

    await Promise.all(operations);

    return NextResponse.json({ success: true, message: "Settings saved" });
  } catch (error) {
    console.error("Failed to save settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
