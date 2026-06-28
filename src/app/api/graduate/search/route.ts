import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim()

    if (!q || q.length < 2) {
      return NextResponse.json({ data: [] })
    }

    const graduates = await prisma.graduate.findMany({
      where: {
        isClaimed: false,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { name: { contains: q } },
        ],
      },
      select: {
        id: true,
        name: true,
        country: true,
        faculty: true,
        specialization: true,
        graduationYear: true,
        university: true,
      },
      take: 10,
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ data: graduates })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "حدث خطأ" }, { status: 500 })
  }
}
