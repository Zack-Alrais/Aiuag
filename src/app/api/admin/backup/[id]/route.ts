import { NextResponse } from "next/server"
import { getBackup } from "@/services/backup"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const backup = await getBackup(id)
    if (!backup) return NextResponse.json({ error: "Backup not found" }, { status: 404 })
    return NextResponse.json(backup)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
