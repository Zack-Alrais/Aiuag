import { NextRequest, NextResponse } from "next/server";
import { getUserStats } from "@/lib/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const stats = await getUserStats(userId);
    if (!stats) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user stats" }, { status: 500 });
  }
}
