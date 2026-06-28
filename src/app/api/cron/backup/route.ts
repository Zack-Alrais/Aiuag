import { NextResponse } from "next/server"
import { createBackup } from "@/services/backup"

export async function GET() {
  try {
    await createBackup("auto")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Auto backup failed:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
