import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              comments: { where: { isApproved: true } },
              reactions: true,
              shares: true,
            },
          },
          reactions: {
            select: { type: true },
          },
        },
      }),
      prisma.post.count(),
    ]);

    // Enrich with author data and reaction summaries
    const authorIds = [...new Set(posts.map((p) => p.authorId).filter(Boolean))] as string[];
    const authors = authorIds.length
      ? await prisma.member.findMany({
          where: { id: { in: authorIds } },
          select: { id: true, name: true, image: true, email: true },
        })
      : [];
    const authorMap = new Map(authors.map((a) => [a.id, a]));

    // Enrich with original post data for reposts
    const originalPostIds = posts.filter((p) => p.originalPostId).map((p) => p.originalPostId!) ;
    const originalPosts = originalPostIds.length
      ? await prisma.post.findMany({
          where: { id: { in: originalPostIds } },
          include: {
            _count: { select: { comments: true, reactions: true } },
          },
        })
      : [];
    const originalPostMap = new Map(originalPosts.map((p) => [p.id, p]));

    const enriched = posts.map((post) => {
      const author = post.authorId ? authorMap.get(post.authorId) : null;
      const reactionSummary: Record<string, number> = {};
      post.reactions.forEach((r) => {
        reactionSummary[r.type] = (reactionSummary[r.type] || 0) + 1;
      });
      return {
        ...post,
        author: author
          ? { id: author.id, name: author.name, image: author.image }
          : null,
        reactionSummary,
        reactions: undefined,
        originalPost: post.originalPostId
          ? (() => {
              const orig = originalPostMap.get(post.originalPostId);
              if (!orig) return null;
              const origAuthor = orig.authorId
                ? authorMap.get(orig.authorId)
                : null;
              return {
                ...orig,
                author: origAuthor
                  ? { id: origAuthor.id, name: origAuthor.name, image: origAuthor.image }
                  : null,
              };
            })()
          : null,
      };
    });

    return NextResponse.json({
      data: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, images, videos, authorId, originalPostId } = body;

    if (!content && !images && !videos) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    if (!authorId) {
      return NextResponse.json({ error: "Author ID is required" }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        content: content || "",
        images: images ? JSON.stringify(images) : null,
        videos: videos ? JSON.stringify(videos) : null,
        authorId,
        originalPostId: originalPostId || null,
      },
    });

    if (originalPostId) {
      await prisma.postShare.upsert({
        where: { postId_memberId: { postId: originalPostId, memberId: authorId } },
        update: {},
        create: { postId: originalPostId, memberId: authorId },
      });
      await prisma.post.update({
        where: { id: originalPostId },
        data: { sharesCount: { increment: 1 } },
      });
    }

    return NextResponse.json(post, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
