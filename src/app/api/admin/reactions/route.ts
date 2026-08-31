import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const reactions = await prisma.postReaction.findMany({
      include: {
        post: { select: { id: true, content: true, images: true } },
      },
    });

    const memberIds = [...new Set(reactions.map((r) => r.memberId))];
    const members = memberIds.length
      ? await prisma.member.findMany({
          where: { id: { in: memberIds } },
          include: { user: { select: { name: true, email: true, image: true } } },
        })
      : [];
    const memberMap = new Map(
      members.map((m) => [
        m.id,
        { id: m.id, name: m.user.name, email: m.user.email ?? undefined, image: m.user.image },
      ])
    );

    const byPost = new Map<
      string,
      {
        postId: string;
        postContent: string;
        postImage: string | null;
        total: number;
        breakdown: Record<string, { count: number; members: { id: string; name: string; email?: string; image?: string | null }[] }>;
      }
    >();

    for (const r of reactions) {
      let entry = byPost.get(r.postId);
      if (!entry) {
        let image: string | null = null;
        try {
          const arr = JSON.parse(r.post.images || "[]");
          image = Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
        } catch {
          image = null;
        }
        entry = {
          postId: r.postId,
          postContent: r.post.content,
          postImage: image,
          total: 0,
          breakdown: {},
        };
        byPost.set(r.postId, entry);
      }
      entry.total += 1;
      if (!entry.breakdown[r.type]) {
        entry.breakdown[r.type] = { count: 0, members: [] };
      }
      entry.breakdown[r.type].count += 1;
      const memberInfo = memberMap.get(r.memberId);
      entry.breakdown[r.type].members.push({
        id: r.memberId,
        name: memberInfo?.name ?? r.memberId,
        email: memberInfo?.email ?? undefined,
        image: memberInfo?.image ?? null,
      });
    }

    const data = Array.from(byPost.values()).sort((a, b) => b.total - a.total);

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reactions" }, { status: 500 });
  }
}