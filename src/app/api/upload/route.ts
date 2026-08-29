import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "application/pdf",
  "video/mp4", "video/webm",
];
const MAX_SIZE = 50 * 1024 * 1024;
const MAX_FILES = 10;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const folder = (formData.get("folder") as string) || "general";

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

    const isVercel = !!process.env.VERCEL;

    if (isVercel) {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json(
          { error: "Blob storage is not configured (BLOB_READ_WRITE_TOKEN)" },
          { status: 503 }
        );
      }
      const { put } = await import("@vercel/blob");
      const results: { url: string; filename: string; name: string }[] = [];

      for (const file of files) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          return NextResponse.json({ error: `File type not allowed: ${file.type}` }, { status: 400 });
        }
        if (file.size > MAX_SIZE) {
          return NextResponse.json({ error: `File too large: ${file.name}` }, { status: 400 });
        }

        const ext = file.name.split(".").pop() || "jpg";
        const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const blob = await put(filename, file, {
          access: "public",
          addRandomSuffix: false,
        });

        results.push({ url: blob.url, filename, name: file.name });
      }

      return NextResponse.json({ urls: results.map(r => r.url), files: results }, { status: 201 });
    }

    const { writeFile, mkdir } = await import("fs/promises");
    const path = await import("path");
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadDir, { recursive: true });

    const results: { url: string; filename: string; name: string }[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: `File type not allowed: ${file.type}` }, { status: 400 });
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: `File too large: ${file.name}` }, { status: 400 });
      }

      const ext = file.name.split(".").pop() || "jpg";
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filepath = path.join(uploadDir, filename);

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filepath, buffer);

      const url = `/uploads/${folder}/${filename}`;
      results.push({ url, filename: `${folder}/${filename}`, name: file.name });
    }

    return NextResponse.json({ urls: results.map(r => r.url), files: results }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
