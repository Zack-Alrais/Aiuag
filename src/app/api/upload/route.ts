import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "application/pdf",
  "video/mp4", "video/webm",
];
const MAX_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 10;

function sanitizeFolder(folder: string): string {
  const clean = folder.replace(/[^a-z0-9-_]/gi, "").toLowerCase();
  return clean || "general";
}

function randomSuffix(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const folder = sanitizeFolder((formData.get("folder") as string) || "general");

    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key === "file" && value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Max ${MAX_FILES} files allowed` }, { status: 400 });
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: `File type not allowed: ${file.type}` }, { status: 400 });
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: `File too large: ${file.name}` }, { status: 400 });
      }
    }

    const isVercel = !!process.env.VERCEL;

    if (isVercel && process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import("@vercel/blob");
      const results: { url: string; filename: string; name: string }[] = [];

      for (const file of files) {
        const ext = file.name.split(".").pop() || "jpg";
        const filename = `${folder}/${randomSuffix()}.${ext}`;

        const blob = await put(filename, file, {
          access: "public",
          addRandomSuffix: false,
        });

        results.push({ url: blob.url, filename, name: file.name });
      }

      return NextResponse.json({ urls: results.map(r => r.url), files: results }, { status: 201 });
    }

    // DB-backed storage fallback (works on Vercel without Blob token and locally)
    const records = await Promise.all(
      files.map(async (file) => {
        const ext = file.name.split(".").pop() || "jpg";
        const filename = `${folder}/${randomSuffix()}.${ext}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        await prisma.storedFile.create({
          data: {
            filename,
            folder,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            data: buffer,
          },
        });

        return { url: `/api/files/${filename}`, filename, name: file.name };
      })
    );

    return NextResponse.json({ urls: records.map(r => r.url), files: records }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}