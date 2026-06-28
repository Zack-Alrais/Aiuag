import crypto from "crypto"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { name, country, faculty, graduationYear } = await request.json()

    if (!name || !country || !faculty || !graduationYear) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 })
    }

    const graduate = await prisma.graduate.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        country: { equals: country, mode: "insensitive" },
        faculty: { equals: faculty, mode: "insensitive" },
        graduationYear: parseInt(graduationYear),
        isClaimed: false,
      },
    })

    if (!graduate) {
      return NextResponse.json({
        found: false,
        message: "لم يتم العثور على مطابقة. تأكد من صحة البيانات المدخلة.",
      })
    }

    const claimToken = crypto.randomBytes(32).toString("hex")

    await prisma.graduate.update({
      where: { id: graduate.id },
      data: { claimToken },
    })

    return NextResponse.json({
      found: true,
      graduateId: graduate.id,
      claimToken,
      graduate: {
        name: graduate.name,
        country: graduate.country,
        faculty: graduate.faculty,
        specialization: graduate.specialization,
        graduationYear: graduate.graduationYear,
        university: graduate.university,
      },
    })
  } catch (error: any) {
    console.error("Verify graduate error:", error)
    return NextResponse.json({ error: error.message || "حدث خطأ" }, { status: 500 })
  }
}
