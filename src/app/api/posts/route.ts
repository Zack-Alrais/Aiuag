import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const memberId = searchParams.get("memberId");
    const authorId = searchParams.get("authorId");
    const scope = searchParams.get("scope"); // "friends" | null

    const where: Record<string, unknown> = {};
    if (authorId) where.authorId = authorId;

    // Friends-only feed: posts authored by my accepted friends.
    if (scope === "friends") {
      if (!memberId) {
        return NextResponse.json({ error: "Authentication required for friends feed" }, { status: 401 });
      }
      const friendRows = await prisma.friendship.findMany({
        where: {
          status: "accepted",
          OR: [{ requesterId: memberId }, { addresseeId: memberId }],
        },
        select: { requesterId: true, addresseeId: true },
      });
      const friendIds = friendRows.map((r) =>
        r.requesterId === memberId ? r.addresseeId : r.requesterId
      );
      where.authorId = { in: friendIds };
    } else if (scope === "saved") {
      if (!memberId) {
        return NextResponse.json({ error: "Authentication required for saved posts" }, { status: 401 });
      }
      const savedRows = await prisma.savedPost.findMany({
        where: { memberId },
        select: { postId: true },
        orderBy: { createdAt: "desc" },
      });
      where.id = { in: savedRows.map((s) => s.postId) };
    }

    const savedIds = memberId
      ? new Set(
          (await prisma.savedPost.findMany({
            where: { memberId },
            select: { postId: true },
          })).map((s) => s.postId)
        )
      : new Set<string>();

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
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
            select: { type: true, memberId: true },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    // Enrich with author data (name/image live on the User model, keyed by Member.id)
    const authorIds = [...new Set(posts.map((p) => p.authorId).filter(Boolean))] as string[];
    const authorMap = new Map<string, { id: string; name: string; image: string | null }>();

    if (authorIds.length) {
      const members = await prisma.member.findMany({
        where: { id: { in: authorIds } },
        select: { id: true, user: { select: { name: true, image: true, email: true } } },
      });
      for (const m of members) {
        authorMap.set(m.id, { id: m.id, name: m.user.name, image: m.user.image });
      }

      // Fallback: some posts may reference the User id instead of the Member id
      const unresolvedIds = authorIds.filter((id) => !authorMap.has(id));
      if (unresolvedIds.length) {
        const users = await prisma.user.findMany({
          where: { id: { in: unresolvedIds } },
          select: { id: true, name: true, image: true },
        });
        for (const u of users) {
          authorMap.set(u.id, { id: u.id, name: u.name, image: u.image });
        }
      }
    }

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
      let myReaction: string | null = null;
      post.reactions.forEach((r) => {
        reactionSummary[r.type] = (reactionSummary[r.type] || 0) + 1;
        if (memberId && r.memberId === memberId) myReaction = r.type;
      });
      return {
        ...post,
        author: author
          ? { id: author.id, name: author.name, image: author.image }
          : null,
        reactionSummary,
        myReaction,
        saved: savedIds.has(post.id),
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

    // Verify member exists and get user data
    const member = await prisma.member.findUnique({
      where: { id: authorId },
      include: { user: { select: { name: true, image: true } } },
    });
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

    // Handle repost tracking (only increment on new share, not update)
    if (originalPostId) {
      try {
        const existingShare = await prisma.postShare.findUnique({
          where: { postId_memberId: { postId: originalPostId, memberId: authorId } },
        });
        if (!existingShare) {
          await prisma.postShare.create({
            data: { postId: originalPostId, memberId: authorId },
          });
          await prisma.post.update({
            where: { id: originalPostId },
            data: { sharesCount: { increment: 1 } },
          });
        }
      } catch {}
    }

    // Return post with author data
    return NextResponse.json({
      ...post,
      author: { id: member.id, name: member.user.name, image: member.user.image },
      _count: { comments: 0, reactions: 0, shares: 0 },
      reactionSummary: {},
      myReaction: null,
      originalPost: null,
    }, { status: 201 });
  } catch (error) {
    console.error("Posts POST error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
