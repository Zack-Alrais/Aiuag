import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import HeroSection from "@/components/ui/hero-section";
import PublicationsFeedClient from "./feed-client";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function PublicationsPage({ params }: Props) {
  const { lang } = await params;
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const session = await auth();
  let currentMemberId: string | null = null;
  if (session?.user?.email) {
    const member = await prisma.member.findFirst({
      where: { user: { email: session.user.email } },
      select: { id: true },
    });
    if (member) currentMemberId = member.id;
  }

  const [posts, publications, news, events] = await Promise.all([
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        _count: {
          select: {
            comments: { where: { isApproved: true } },
            reactions: true,
            shares: true,
          },
        },
        reactions: { select: { type: true } },
      },
    }),
    prisma.publication.findMany({
      select: {
        id: true,
        title: true,
        titleEn: true,
        description: true,
        category: true,
        fileUrl: true,
        imageUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.news.findMany({
      where: { status: "published" },
      select: {
        id: true,
        titleAr: true,
        titleEn: true,
        excerptAr: true,
        excerptEn: true,
        featuredImage: true,
        category: true,
        publishedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.event.findMany({
      where: { status: { in: ["upcoming", "ongoing"] } },
      select: {
        id: true,
        titleAr: true,
        titleEn: true,
        descriptionAr: true,
        descriptionEn: true,
        featuredImage: true,
        date: true,
        time: true,
        location: true,
        status: true,
        category: true,
        capacity: true,
        registeredCount: true,
      },
      orderBy: { date: "asc" },
      take: 10,
    }),
  ]);

  const authorIds = [...new Set(posts.map((p) => p.authorId).filter(Boolean))] as string[];
  const authors = authorIds.length
    ? await prisma.member.findMany({
        where: { id: { in: authorIds } },
        select: { id: true, nameEn: true, user: { select: { name: true, image: true } } },
      })
    : [];
  const authorMap = new Map(authors.map((a) => [a.id, { name: a.user?.name, nameEn: a.nameEn, image: a.user?.image }]));

  const serializedPosts = posts.map((post) => {
    const author = post.authorId ? authorMap.get(post.authorId) : null;
    const reactionSummary: Record<string, number> = {};
    post.reactions.forEach((r) => {
      reactionSummary[r.type] = (reactionSummary[r.type] || 0) + 1;
    });
    return {
      id: post.id,
      content: post.content,
      images: post.images,
      videos: post.videos,
      authorId: post.authorId,
      likes: post.likes,
      sharesCount: post.sharesCount,
      createdAt: post.createdAt.toISOString(),
      _count: post._count,
      reactionSummary,
      author: author ? { name: author.name, nameEn: author.nameEn, image: author.image } : null,
    };
  });

  const reports = publications.filter((p) => {
    const cat = (p.category || "").toLowerCase();
    return cat.includes("تقرير") || cat.includes("report") || cat.includes("annual");
  });

  const otherPubs = publications.filter((p) => {
    const cat = (p.category || "").toLowerCase();
    return !(cat.includes("تقرير") || cat.includes("report") || cat.includes("annual"));
  });

  const serializedReports = reports.map((p) => ({
    ...p,
    id: String(p.id),
    createdAt: p.createdAt.toISOString(),
  }));

  const serializedOtherPubs = otherPubs.map((p) => ({
    ...p,
    id: String(p.id),
    createdAt: p.createdAt.toISOString(),
  }));

  const serializedNews = news.map((n) => ({
    id: n.id,
    title: isArabic ? n.titleAr : n.titleEn,
    excerpt: isArabic ? (n.excerptAr || n.titleAr) : (n.excerptEn || n.titleEn),
    featuredImage: n.featuredImage,
    category: n.category,
    date: (n.publishedAt || n.createdAt).toISOString(),
  }));

  const serializedEvents = events.map((e) => ({
    id: e.id,
    title: isArabic ? e.titleAr : e.titleEn,
    description: isArabic ? e.descriptionAr : e.descriptionEn,
    featuredImage: e.featuredImage,
    date: e.date.toISOString(),
    time: e.time,
    location: e.location,
    status: e.status,
    category: e.category,
    capacity: e.capacity,
    registeredCount: e.registeredCount,
  }));

  return (
    <div dir={dir}>
      <Suspense fallback={<div className="py-20 bg-gradient-to-br from-primary via-primary-light to-primary min-h-[300px]" />}>
        <HeroSection
          pageSlug="publications"
          lang={lang}
          defaultTitle={isArabic ? "المنشورات والتفاعل" : "Posts & Publications"}
          defaultSubtitle={isArabic
            ? "شارك أفكارك وشاهد التقارير والمنشورات الرسمية"
            : "Share your thoughts and view official reports and publications"}
          badge={
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm">
              <FileText className="w-4 h-4" />
              <span>{isArabic ? "المنشورات" : "Publications"}</span>
            </div>
          }
        />
      </Suspense>

      <PublicationsFeedClient
        initialPosts={serializedPosts}
        reports={serializedReports}
        publications={serializedOtherPubs}
        news={serializedNews}
        events={serializedEvents}
        isArabic={isArabic}
        lang={lang}
        currentMemberId={currentMemberId}
      />
    </div>
  );
}
