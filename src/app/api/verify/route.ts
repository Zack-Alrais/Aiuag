import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 })
    }

    const member = await prisma.member.findUnique({
      where: { membershipNumber: id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    if (!member) {
      return NextResponse.json({
        valid: false,
        error: "Member not found",
      })
    }

    const now = new Date()
    const isApproved = member.status === "approved"

    return NextResponse.json({
      valid: isApproved,
      member: {
        name: member.user.name,
        membershipNumber: member.membershipNumber,
        status: member.status,
        faculty: member.faculty,
        specialization: member.specialization,
        graduationYear: member.graduationYear,
        photo: member.cardPhoto || member.user.image,
        joinDate: member.createdAt,
      },
    })
  } catch (error) {
    console.error("Verify error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
