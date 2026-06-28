import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getCached, setCache, CACHE_TTL } from "@/lib/cache"

export async function GET() {
  try {
    const cacheKey = "settings:all"
    const cached = getCached(cacheKey, CACHE_TTL.MEDIUM)
    if (cached) return NextResponse.json({ success: true, data: cached })

    const settings = await prisma.settings.findMany({
      select: { group: true, key: true, value: true },
    })
    const grouped: Record<string, Record<string, string>> = {}
    for (const s of settings) {
      if (!grouped[s.group]) grouped[s.group] = {}
      grouped[s.group][s.key] = s.value
    }
    setCache(cacheKey, grouped, CACHE_TTL.MEDIUM)
    return NextResponse.json({ success: true, data: grouped })
  } catch {
    return NextResponse.json({ success: false, data: {} })
  }
}
