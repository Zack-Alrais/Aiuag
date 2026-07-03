import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q")?.trim()
    const lang = request.nextUrl.searchParams.get("lang") || "ar"
    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const isArabic = lang === "ar"
    const titleField = isArabic ? "titleAr" : "titleEn"
    const contentField = isArabic ? "contentAr" : "contentEn"
    const excerptField = isArabic ? "excerptAr" : "excerptEn"
    const descriptionField = isArabic ? "descriptionAr" : "descriptionEn"
    const nameField = isArabic ? "nameAr" : "nameEn"

    const [news, events, projects, pages, members] = await Promise.all([
      prisma.news.findMany({
        where: {
          OR: [
            { titleAr: { contains: q, mode: "insensitive" } },
            { titleEn: { contains: q, mode: "insensitive" } },
            { contentAr: { contains: q, mode: "insensitive" } },
            { contentEn: { contains: q, mode: "insensitive" } },
          ],
          status: "published",
        },
        select: { slug: true, [titleField]: true, [excerptField]: true },
        take: 5,
      }),
      prisma.event.findMany({
        where: {
          OR: [
            { titleAr: { contains: q, mode: "insensitive" } },
            { titleEn: { contains: q, mode: "insensitive" } },
            { descriptionAr: { contains: q, mode: "insensitive" } },
            { descriptionEn: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { slug: true, [titleField]: true, [descriptionField]: true },
        take: 5,
      }),
      prisma.project.findMany({
        where: {
          OR: [
            { titleAr: { contains: q, mode: "insensitive" } },
            { titleEn: { contains: q, mode: "insensitive" } },
            { descriptionAr: { contains: q, mode: "insensitive" } },
            { descriptionEn: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { slug: true, [titleField]: true, [descriptionField]: true },
        take: 5,
      }),
      prisma.pageContent.findMany({
        where: {
          OR: [
            { valueAr: { contains: q, mode: "insensitive" } },
            { valueEn: { contains: q, mode: "insensitive" } },
            { key: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { page: true, key: true, valueAr: true, valueEn: true },
        take: 8,
      }),
      prisma.member.findMany({
        where: {
          OR: [
            { nameEn: { contains: q, mode: "insensitive" } },
            { bio: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, nameEn: true, bio: true },
        take: 5,
      }),
    ])

    const results: any[] = []

    news.forEach((item) => {
      results.push({
        title: (item as any)[titleField] || "",
        description: (item as any)[excerptField] || "",
        url: `/${lang}/news/${item.slug}`,
        type: "news",
      })
    })

    events.forEach((item) => {
      results.push({
        title: (item as any)[titleField] || "",
        description: (item as any)[descriptionField] || "",
        url: `/${lang}/events`,
        type: "event",
      })
    })

    projects.forEach((item) => {
      results.push({
        title: (item as any)[titleField] || "",
        description: (item as any)[descriptionField] || "",
        url: `/${lang}/projects`,
        type: "project",
      })
    })

    pages.forEach((item) => {
      const value = isArabic ? item.valueAr : item.valueEn
      if (value) {
        results.push({
          title: item.key,
          description: value.substring(0, 120),
          url: `/${lang}/${item.page === "home" ? "" : item.page}`,
          type: "page",
        })
      }
    })

    members.forEach((item) => {
      results.push({
        title: item.nameEn || "",
        description: item.bio || "",
        url: `/${lang}/organization/secretariat`,
        type: "member",
      })
    })

    return NextResponse.json({ results: results.slice(0, 20) })
  } catch (error: any) {
    console.error("Search error:", error)
    return NextResponse.json({ results: [] })
  }
}
