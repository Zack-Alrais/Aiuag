import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    const where: Record<string, unknown> = {}

    if (status && status !== "all") {
      where.status = status
    }

    if (search) {
      where.OR = [
        { donorName: { contains: search, mode: "insensitive" } },
        { donorEmail: { contains: search, mode: "insensitive" } },
        { donationNumber: { contains: search, mode: "insensitive" } },
      ]
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom)
      if (dateTo) (where.createdAt as Record<string, unknown>).lte = new Date(dateTo + "T23:59:59Z")
    }

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          donationNumber: true,
          donorName: true,
          donorEmail: true,
          amount: true,
          currency: true,
          gateway: true,
          status: true,
          isAnonymous: true,
          createdAt: true,
        },
      }),
      prisma.donation.count({ where }),
    ])

    // ── Compute stats ──
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const yearStart = new Date(now.getFullYear(), 0, 1)

    const [todayStats, monthStats, yearStats, successful, failed, pending, refunded] = await Promise.all([
      prisma.donation.aggregate({
        where: { createdAt: { gte: todayStart }, status: "completed" },
        _count: true,
        _sum: { amount: true },
      }),
      prisma.donation.aggregate({
        where: { createdAt: { gte: monthStart }, status: "completed" },
        _count: true,
        _sum: { amount: true },
      }),
      prisma.donation.aggregate({
        where: { createdAt: { gte: yearStart }, status: "completed" },
        _count: true,
        _sum: { amount: true },
      }),
      prisma.donation.count({ where: { status: "completed" } }),
      prisma.donation.count({ where: { status: "failed" } }),
      prisma.donation.count({ where: { status: "pending" } }),
      prisma.donation.count({ where: { status: "refunded" } }),
    ])

    return NextResponse.json({
      donations,
      totalPages: Math.ceil(total / limit),
      total,
      stats: {
        today: { count: todayStats._count, total: todayStats._sum.amount || 0 },
        month: { count: monthStats._count, total: monthStats._sum.amount || 0 },
        year: { count: yearStats._count, total: yearStats._sum.amount || 0 },
        successful,
        failed,
        pending,
        refunded,
      },
    })
  } catch (error) {
    console.error("Admin donations error:", error)
    return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 })
  }
}
