import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const last = await prisma.member.findFirst({
      where: { membershipNumber: { startsWith: "AIUAG-" } },
      orderBy: { membershipNumber: "desc" },
      select: { membershipNumber: true },
    });
    let nextNum = 1;
    if (last?.membershipNumber) {
      const match = last.membershipNumber.match(/AIUAG-(\d+)/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    const number = `AIUAG-${String(nextNum).padStart(10, "0")}`;
    return NextResponse.json({ number });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate number" }, { status: 500 });
  }
}
