import { NextRequest, NextResponse } from "next/server";

const MAX_CHUNK = 4500;

async function translateChunk(text: string, sl: string, tl: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error("translate upstream error");
  const data = await res.json();
  const segments: unknown[] = Array.isArray(data) && Array.isArray(data[0]) ? data[0] : [];
  return segments
    .map((seg) => (Array.isArray(seg) && typeof seg[0] === "string" ? seg[0] : ""))
    .join("");
}

export async function POST(request: NextRequest) {
  try {
    const { text } = (await request.json()) as { text?: unknown };

    if (typeof text !== "string") {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return NextResponse.json({ translated: "" });
    }

    if (!/[\u0600-\u06FF]/.test(trimmed)) {
      return NextResponse.json({ translated: text });
    }

    const chunks: string[] = [];
    for (let i = 0; i < trimmed.length; i += MAX_CHUNK) {
      chunks.push(trimmed.slice(i, i + MAX_CHUNK));
    }

    const translatedChunks = await Promise.all(
      chunks.map((chunk) => translateChunk(chunk, "ar", "en"))
    );

    return NextResponse.json({ translated: translatedChunks.join("") });
  } catch {
    return NextResponse.json({ error: "Translation failed" }, { status: 502 });
  }
}