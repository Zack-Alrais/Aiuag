import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    return NextResponse.json({
      hasSession: !!session,
      userId: (session?.user as any)?.id ?? null,
      email: session?.user?.email ?? null,
      role: (session?.user as any)?.role ?? null,
      name: session?.user?.name ?? null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
