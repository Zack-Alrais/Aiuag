import { NextRequest, NextResponse } from "next/server";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userEmail, userName, action, entity, entityId, details } = body;

    if (!userId || !userEmail || !userName || !action || !entity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "";
    const ua = request.headers.get("user-agent") || "";

    await logAudit({ userId, userEmail, userName, action, entity, entityId, details, ipAddress: ip, userAgent: ua });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to log audit" }, { status: 500 });
  }
}
