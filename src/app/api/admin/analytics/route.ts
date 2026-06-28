import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      memberGrowth,
      membersByCountry,
      membersByFaculty,
      membersByStatus,
      recentActivity,
      contentStats,
      contactsByMonth,
      donationsByMonth,
      totalMembers,
      activeMembers,
      newThisMonth,
      newThisWeek,
      pendingMembers,
      totalNews,
      totalEvents,
      totalGallery,
      totalContacts,
      unreadContacts,
    ] = await Promise.all([
      // Member growth by month (last 6 months)
      prisma.$queryRaw`
        SELECT 
          TO_CHAR("createdAt", 'YYYY-MM') as month,
          COUNT(*) as count
        FROM "Member"
        WHERE "createdAt" >= ${sixMonthsAgo}
        GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
        ORDER BY month ASC
      `,

      // Members by country
      prisma.$queryRaw`
        SELECT 
          COALESCE("country", 'غير محدد') as country,
          COUNT(*) as count
        FROM "Member"
        GROUP BY "country"
        ORDER BY count DESC
        LIMIT 10
      `,

      // Members by faculty
      prisma.$queryRaw`
        SELECT 
          COALESCE("faculty", 'غير محدد') as faculty,
          COUNT(*) as count
        FROM "Member"
        GROUP BY "faculty"
        ORDER BY count DESC
        LIMIT 10
      `,

      // Members by status
      prisma.$queryRaw`
        SELECT 
          "status",
          COUNT(*) as count
        FROM "Member"
        GROUP BY "status"
      `,

      // Recent activity (last 20 actions)
      prisma.auditLog.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          userName: true,
          userEmail: true,
          action: true,
          entity: true,
          entityId: true,
          createdAt: true,
        },
      }),

      // Content stats
      Promise.all([
        prisma.news.count(),
        prisma.event.count(),
        prisma.project.count(),
        prisma.gallery.count(),
        prisma.video.count(),
        prisma.publication.count(),
        prisma.fAQ.count(),
        prisma.contactMessage.count(),
      ]),

      // Contacts by month
      prisma.$queryRaw`
        SELECT 
          TO_CHAR("createdAt", 'YYYY-MM') as month,
          COUNT(*) as count
        FROM "ContactMessage"
        WHERE "createdAt" >= ${sixMonthsAgo}
        GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
        ORDER BY month ASC
      `,

      // Donations by month
      prisma.$queryRaw`
        SELECT 
          TO_CHAR("createdAt", 'YYYY-MM') as month,
          COALESCE(SUM("amount"), 0) as total
        FROM "Donation"
        WHERE "status" = 'completed' AND "createdAt" >= ${sixMonthsAgo}
        GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
        ORDER BY month ASC
      `,

      prisma.member.count(),
      prisma.member.count({ where: { status: "approved" } }),
      prisma.member.count({ where: { createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } } }),
      prisma.member.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.member.count({ where: { status: "pending" } }),
      prisma.news.count(),
      prisma.event.count(),
      prisma.gallery.count(),
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    ])

    const contentBreakdown = [
      { name: "أخبار", nameEn: "News", count: contentStats[0], color: "#1A3A6B" },
      { name: "أحداث", nameEn: "Events", count: contentStats[1], color: "#7B1FA2" },
      { name: "مشاريع", nameEn: "Projects", count: contentStats[2], color: "#0277BD" },
      { name: "معرض", nameEn: "Gallery", count: contentStats[3], color: "#C2185B" },
      { name: "فيديوهات", nameEn: "Videos", count: contentStats[4], color: "#E65100" },
      { name: "منشورات", nameEn: "Publications", count: contentStats[5], color: "#4E342E" },
      { name: "أسئلة", nameEn: "FAQs", count: contentStats[6], color: "#2E7D32" },
      { name: "رسائل", nameEn: "Contacts", count: contentStats[7], color: "#D84315" },
    ]

    const actionLabels: Record<string, string> = {
      login: "تسجيل دخول",
      logout: "تسجيل خروج",
      create: "إنشاء",
      update: "تعديل",
      delete: "حذف",
      view: "عرض",
      export: "تصدير",
    }

    const entityLabels: Record<string, string> = {
      member: "عضو",
      news: "خبر",
      event: "حدث",
      graduate: "خريج",
      settings: "إعدادات",
      permissions: "صلاحيات",
      backup: "نسخ احتياطي",
      auth: "مصادقة",
      card: "بطاقة",
      donation: "تبرع",
      project: "مشروع",
      gallery: "معرض",
      video: "فيديو",
      publication: "منشور",
      report: "تقرير",
      contact: "اتصال",
      committee: "لجنة",
      board: "مجلس",
      partner: "شريك",
      faq: "سؤال",
      branch: "فرع",
    }

    const formattedActivity = recentActivity.map((a) => ({
      id: a.id,
      userName: a.userName,
      action: actionLabels[a.action] || a.action,
      entity: entityLabels[a.entity] || a.entity,
      entityId: a.entityId,
      createdAt: a.createdAt.toISOString(),
    }))

    return NextResponse.json({
      overview: {
        totalMembers,
        activeMembers,
        pendingMembers,
        newThisMonth,
        newThisWeek,
        totalNews,
        totalEvents,
        totalGallery,
        totalContacts,
        unreadContacts,
      },
      memberGrowth: (memberGrowth as any[]).map((r) => ({ month: r.month, count: Number(r.count) })),
      membersByCountry: (membersByCountry as any[]).map((r) => ({ country: r.country, count: Number(r.count) })),
      membersByFaculty: (membersByFaculty as any[]).map((r) => ({ faculty: r.faculty, count: Number(r.count) })),
      membersByStatus: (membersByStatus as any[]).map((r) => ({ status: r.status, count: Number(r.count) })),
      contentBreakdown,
      contactsByMonth: (contactsByMonth as any[]).map((r) => ({ month: r.month, count: Number(r.count) })),
      donationsByMonth: (donationsByMonth as any[]).map((r) => ({ month: r.month, total: Number(r.total) })),
      recentActivity: formattedActivity,
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
