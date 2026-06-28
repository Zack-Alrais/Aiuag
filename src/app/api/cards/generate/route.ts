import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TemplateEngine } from "@/services/templateEngine"
import { MemberCardData } from "@/templates/membership-card/types"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const body = await req.json()
    const memberId: string | undefined = body.memberId

    let user
    if (memberId) {
      const member = await prisma.member.findUnique({
        where: { id: memberId },
        include: { user: true },
      })
      if (!member) {
        return NextResponse.json({ error: "العضو غير موجود" }, { status: 404 })
      }
      user = member.user
    } else {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { member: true },
      })
    }

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })
    }

    const member = user.member
    const memberData: MemberCardData = {
      id: member?.id || user.id,
      nameAr: user.name,
      nameEn: member?.nameEn || user.name,
      membershipNumber: member?.membershipNumber || `AIUAG-${user.id.slice(-6)}`,
      memberType: member?.status || "pending",
      photo: member?.cardPhoto || user.image || undefined,
      specialization: member?.faculty || undefined,
      department: member?.specialization || undefined,
      graduationYear: member?.graduationYear || undefined,
      phone: member?.phone || undefined,
      email: user.email || undefined,
      joinDate: member?.createdAt ? new Date(member.createdAt).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB"),
      expiryDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB"),
    }

    const origin = req.headers.get("origin") || "http://localhost:9000"
    const lang = body.lang || "ar"

    const result = await TemplateEngine.render(memberData, {
      lang,
      origin,
      format: body.format || "html",
    })

    return NextResponse.json({
      success: true,
      member: {
        id: member?.id || user.id,
        name: user.name,
        membershipNumber: memberData.membershipNumber,
        status: member?.status || "pending",
      },
      card: {
        frontHtml: result.frontHtml,
        backHtml: result.backHtml,
      },
    })
  } catch (error) {
    console.error("Card generation error:", error)
    return NextResponse.json({ error: "فشل في إنشاء البطاقة" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const url = new URL(req.url)
    const memberId = url.searchParams.get("memberId")

    let user
    if (memberId) {
      const member = await prisma.member.findUnique({
        where: { id: memberId },
        include: { user: true },
      })
      if (!member) {
        return NextResponse.json({ error: "العضو غير موجود" }, { status: 404 })
      }
      user = member.user
    } else {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { member: true },
      })
    }

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })
    }

    const member = user.member
    const memberData = {
      id: member?.id || user.id,
      nameAr: user.name,
      nameEn: member?.nameEn || user.name,
      membershipNumber: member?.membershipNumber || `AIUAG-${user.id.slice(-6)}`,
      memberType: member?.status || "pending",
      photo: member?.cardPhoto || user.image || undefined,
      specialization: member?.faculty || undefined,
      department: member?.specialization || undefined,
      graduationYear: member?.graduationYear || undefined,
      phone: member?.phone || undefined,
      email: user.email || undefined,
      joinDate: member?.createdAt ? new Date(member.createdAt).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB"),
      expiryDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB"),
    }

    return NextResponse.json({ success: true, member: memberData })
  } catch (error) {
    console.error("Card data error:", error)
    return NextResponse.json({ error: "فشل في جلب بيانات البطاقة" }, { status: 500 })
  }
}
