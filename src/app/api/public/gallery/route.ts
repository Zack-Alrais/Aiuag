import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";

function getYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?#]+)/
  )
  return match ? match[1] : null
}

function getYoutubeThumbnail(url: string): string | null {
  const id = getYoutubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null
}

function isVideoFile(url: string): boolean {
  return /\.(mp4|webm|ogg)$/i.test(url)
}

export async function GET() {
  try {
    const cacheKey = "gallery:all";
    const cached = getCached(cacheKey, CACHE_TTL.SHORT);
    if (cached) return NextResponse.json(cached);

    // Fetch from Gallery model
    const galleryItems = await prisma.gallery.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        imageUrl: true,
        fileUrl: true,
        thumbnailUrl: true,
        album: true,
        tags: true,
        createdAt: true,
      },
    });

    // Fetch videos from Video model and transform to gallery format
    const videoItems = await prisma.video.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        titleEn: true,
        url: true,
        description: true,
        category: true,
        thumbnail: true,
        createdAt: true,
      },
    });

    const transformedVideos = videoItems.map((v) => {
      const ytId = getYoutubeId(v.url);
      const isYT = !!ytId;
      return {
        id: v.id,
        title: v.title,
        description: v.description,
        type: "video",
        imageUrl: v.thumbnail || (isYT ? getYoutubeThumbnail(v.url) : null),
        fileUrl: v.url,
        thumbnailUrl: v.thumbnail || (isYT ? getYoutubeThumbnail(v.url) : null),
        album: v.category || "videos",
        tags: null,
        createdAt: v.createdAt,
        // extra fields for client
        titleEn: v.titleEn,
        isYT,
        isUpload: !isYT,
      };
    });

    // Combine and sort by createdAt desc
    const allItems = [...galleryItems, ...transformedVideos].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setCache(cacheKey, allItems, CACHE_TTL.SHORT);
    return NextResponse.json(allItems);
  } catch {
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}
