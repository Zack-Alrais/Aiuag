import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"
import os from "os"
import prisma from "@/lib/prisma"

const mimeTypes: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
  gif: "image/gif", webp: "image/webp", svg: "image/svg+xml",
  pdf: "application/pdf", mp4: "video/mp4", webm: "video/webm",
}

function mimeFor(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || ""
  return mimeTypes[ext] || "application/octet-stream"
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path: pathSegments } = await params
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse("Not found", { status: 404 })
    }

    // Priority 1: files stored in the database (default upload target)
    const filename = pathSegments.join("/")
    const stored = await prisma.storedFile.findUnique({ where: { filename } })
    if (stored) {
      return new NextResponse(stored.data, {
        headers: {
          "Content-Type": stored.mimeType || mimeFor(stored.filename),
          "Content-Length": String(stored.size),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      })
    }

    // Priority 2: temporary local files (exports / receipts)
    const filePath = path.join(os.tmpdir(), "aiuag-uploads", ...pathSegments)
    const buffer = await readFile(filePath)
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeFor(pathSegments[pathSegments.length - 1] || ""),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return new NextResponse("Not found", { status: 404 })
  }
}