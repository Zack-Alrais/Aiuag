import { NextResponse } from "next/server"
import { getBackup, restoreFromBackup } from "@/services/backup"

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

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const result = await restoreFromBackup(id)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Restore failed" }, { status: 500 })
  }
}
