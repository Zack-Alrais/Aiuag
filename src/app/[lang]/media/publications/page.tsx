import { Suspense } from "react";
import prisma from "@/lib/prisma";
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

  const [posts, publications] = await Promise.all([
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
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
      take: 20,
    }),
  ]);

  const authorIds = [...new Set(posts.map((p) => p.authorId).filter(Boolean))] as string[];
  const authors = authorIds.length
    ? await prisma.member.findMany({
        where: { id: { in: authorIds } },
        select: { id: true, user: { select: { name: true, nameEn: true, image: true } } },
      })
    : [];
  const authorMap = new Map(authors.map((a) => [a.id, a.user]));

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

  const serializedPubs = publications.map((p) => ({
    ...p,
    id: String(p.id),
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div dir={dir}>
      <Suspense fallback={<div className="py-20 bg-gradient-to-br from-primary via-primary-light to-primary min-h-[300px]" />}>
        <HeroSection
          pageSlug="publications"
          lang={lang}
          defaultTitle={isArabic ? "المنشورات والتفاعل" : "Posts & Publications"}
          defaultSubtitle={isArabic
            ? "شارك أفكارك ومنشوراتك وتفاعل مع أعضاء الرابطة"
            : "Share your thoughts and interact with association members"}
          badge={
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm">
              <FileText className="w-4 h-4" />
              <span>{isArabic ? "المنشورات" : "Posts"}</span>
            </div>
          }
        />
      </Suspense>

      <PublicationsFeedClient
        initialPosts={serializedPosts}
        publications={serializedPubs}
        isArabic={isArabic}
        lang={lang}
      />
    </div>
  );
}
