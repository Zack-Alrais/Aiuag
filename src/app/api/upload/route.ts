import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import os from "os";

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "application/pdf",
  "video/mp4", "video/webm",
];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const UPLOAD_DIR = path.join(os.tmpdir(), "aiuag-uploads");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max 50MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(UPLOAD_DIR, folder);
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    const url = `/api/files/${folder}/${filename}`;

    return NextResponse.json({ url, filename }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
