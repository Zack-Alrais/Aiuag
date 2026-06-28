import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

function excelSerialToDate(serial: number): Date {
  return new Date((serial - 25569) * 86400000)
}

function fixGraduationYear(year: number): number {
  if (year > 30 && year < 2958465) {
    const d = excelSerialToDate(year)
    const y = d.getFullYear()
    if (y >= 1900 && y <= 2100) return y
  }
  return Math.round(year)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "100")
    const search = searchParams.get("search") || ""
    const claimed = searchParams.get("claimed")
    const faculty = searchParams.get("faculty") || ""
    const country = searchParams.get("country") || ""
    const year = searchParams.get("year") || ""
    const spec = searchParams.get("spec") || ""
    const filtersOnly = searchParams.get("filtersOnly") === "true"

    if (filtersOnly) {
      const [faculties, countries, years, specs] = await Promise.all([
        prisma.graduate.findMany({ select: { faculty: true }, distinct: ["faculty"], where: { faculty: { not: "" } } }),
        prisma.graduate.findMany({ select: { country: true }, distinct: ["country"], where: { country: { not: "" } } }),
        prisma.graduate.findMany({ select: { graduationYear: true }, distinct: ["graduationYear"], orderBy: { graduationYear: "desc" } }),
        prisma.graduate.findMany({ select: { specialization: true }, distinct: ["specialization"], where: { specialization: { not: "" } } }),
      ])
      return NextResponse.json({
        faculties: faculties.map(f => f.faculty).sort(),
        countries: countries.map(c => c.country).sort(),
        years: years.map(y => y.graduationYear).sort((a, b) => b - a),
        specs: specs.map(s => s.specialization).sort(),
      })
    }

    const where: Record<string, any> = {}
    if (claimed === "true") where.isClaimed = true
    else if (claimed === "false") where.isClaimed = false

    const andConditions: any[] = []

    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
          { studentId: { contains: search, mode: "insensitive" } },
        ],
      })
    }
    if (faculty) andConditions.push({ faculty: { contains: faculty, mode: "insensitive" } })
    if (country) andConditions.push({ country: { contains: country, mode: "insensitive" } })
    if (year) andConditions.push({ graduationYear: parseInt(year) })
    if (spec) andConditions.push({ specialization: { contains: spec, mode: "insensitive" } })

    if (andConditions.length > 0) where.AND = andConditions

    const [graduates, total] = await Promise.all([
      prisma.graduate.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.graduate.count({ where }),
    ])

    return NextResponse.json({
      data: graduates,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH() {
  try {
    const badRecords = await prisma.graduate.findMany({
      where: {
        OR: [
          { graduationYear: { gt: 2100 } },
          { graduationYear: { lt: 1900 } },
        ],
      },
      select: { id: true, graduationYear: true },
    })

    let fixed = 0
    for (const rec of badRecords) {
      const newYear = fixGraduationYear(rec.graduationYear)
      if (newYear !== rec.graduationYear && newYear >= 1900 && newYear <= 2100) {
        await prisma.graduate.update({
          where: { id: rec.id },
          data: { graduationYear: Math.round(newYear) },
        })
        fixed++
      }
    }

    return NextResponse.json({ fixed, total: badRecords.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
