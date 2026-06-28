import { NextResponse } from "next/server"
import { createBackup, listBackups, deleteBackup } from "@/services/backup"
import { logAudit } from "@/lib/audit"

export async function POST(request: Request) {
  try {
    const backup = await createBackup("manual")
    const token = request.headers.get("cookie") || ""
    const match = token.match(/admin_token=([^;]+)/)
    if (match) {
      try {
        const t = JSON.parse(decodeURIComponent(match[1]))
        logAudit({ userId: t.id, userEmail: t.email, userName: t.name, action: "create", entity: "backup", entityId: backup.id })
      } catch {}
    }
    return NextResponse.json({ success: true, backup })
  } catch (error: any) {
    console.error("Backup failed:", error)
    return NextResponse.json({ success: false, error: error.message || "Backup failed" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")
    const result = await listBackups(limit, offset)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Missing backup id" }, { status: 400 })
    const ok = await deleteBackup(id)
    return NextResponse.json({ success: ok })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
