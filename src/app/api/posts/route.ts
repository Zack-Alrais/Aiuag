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

    // Enrich with author data
    const authorIds = [...new Set(posts.map((p) => p.authorId).filter(Boolean))] as string[];
    const authors = authorIds.length
      ? await prisma.member.findMany({
          where: { id: { in: authorIds } },
          select: { id: true, name: true, image: true, email: true },
        })
      : [];
    const authorMap = new Map(authors.map((a) => [a.id, a]));

    // Enrich with original post data for reposts
    const originalPostIds = posts.filter((p) => p.originalPostId).map((p) => p.originalPostId!);
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
              const origAuthor = orig.authorId ? authorMap.get(orig.authorId) : null;
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
  } catch (error) {
    console.error("Posts GET error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, images, videos, authorId, originalPostId } = body;

    if (!authorId) {
      return NextResponse.json({ error: "Author ID is required" }, { status: 400 });
    }

    const hasContent = content && content.trim().length > 0;
    const hasImages = images && images.length > 0;
    const hasVideos = videos && videos.length > 0;

    if (!hasContent && !hasImages && !hasVideos) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Verify member exists
    const member = await prisma.member.findUnique({ where: { id: authorId } });
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const post = await prisma.post.create({
      data: {
        content: (content || "").trim(),
        images: hasImages ? JSON.stringify(images) : null,
        videos: hasVideos ? JSON.stringify(videos) : null,
        authorId,
        originalPostId: originalPostId || null,
      },
    });

    // Handle repost tracking
    if (originalPostId) {
      try {
        await prisma.postShare.upsert({
          where: { postId_memberId: { postId: originalPostId, memberId: authorId } },
          update: {},
          create: { postId: originalPostId, memberId: authorId },
        });
        await prisma.post.update({
          where: { id: originalPostId },
          data: { sharesCount: { increment: 1 } },
        });
      } catch {}
    }

    // Return post with author data
    return NextResponse.json({
      ...post,
      author: { id: member.id, name: member.name, image: member.image },
      _count: { comments: 0, reactions: 0, shares: 0 },
      reactionSummary: {},
      originalPost: null,
    }, { status: 201 });
  } catch (error) {
    console.error("Posts POST error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
