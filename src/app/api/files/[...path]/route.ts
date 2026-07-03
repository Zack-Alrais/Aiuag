import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"
import os from "os"

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path: pathSegments } = await params
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse("Not found", { status: 404 })
    }
    const filePath = path.join(os.tmpdir(), "aiuag-uploads", ...pathSegments)
    const buffer = await readFile(filePath)
    const ext = pathSegments[pathSegments.length - 1]?.split(".").pop()?.toLowerCase() || ""
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
      gif: "image/gif", webp: "image/webp", svg: "image/svg+xml",
      pdf: "application/pdf", mp4: "video/mp4", webm: "video/webm",
    }
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeTypes[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return new NextResponse("Not found", { status: 404 })
  }
}
