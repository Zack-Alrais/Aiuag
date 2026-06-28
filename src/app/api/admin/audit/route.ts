import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs, getAllUserSummaries } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");

    if (mode === "users") {
      const users = await getAllUserSummaries();
      return NextResponse.json({ users });
    }

    const userId = searchParams.get("userId") || undefined;
    const action = searchParams.get("action") || undefined;
    const entity = searchParams.get("entity") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const fromStr = searchParams.get("from");
    const toStr = searchParams.get("to");

    const result = await getAuditLogs({
      userId,
      action,
      entity,
      from: fromStr ? new Date(fromStr) : undefined,
      to: toStr ? new Date(toStr) : undefined,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
