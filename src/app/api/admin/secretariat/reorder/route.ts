import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const orders: { id: string; order: number }[] = body.orders

    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json({ error: "orders must be a non-empty array" }, { status: 400 })
    }

    const tx = orders.map((o) =>
      prisma.secretariatMember.update({
        where: { id: o.id },
        data: { order: o.order },
      })
    )

    await prisma.$transaction(tx)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
