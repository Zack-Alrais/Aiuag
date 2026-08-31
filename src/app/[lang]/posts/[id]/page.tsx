"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageCircle, Share2, Calendar, ArrowRight, ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import CustomVideoPlayer from "@/components/ui/custom-video-player";
import { SkeletonLine, SkeletonCircle } from "@/components/ui/skeleton";
import CommentsSection from "@/components/posts/comments-section";
import PhotoViewer from "@/components/posts/photo-viewer";
import { useMember } from "@/hooks/use-member";
import { toast } from "sonner";

const REACTIONS = [
  { type: "like", labelAr: "إعجاب", labelEn: "Like", emoji: "👍" },
  { type: "love", labelAr: "حب", labelEn: "Love", emoji: "❤️" },
  { type: "haha", labelAr: "هاها", labelEn: "Haha", emoji: "😂" },
  { type: "wow", labelAr: "واو", labelEn: "Wow", emoji: "😮" },
  { type: "sad", labelAr: "حزين", labelEn: "Sad", emoji: "😢" },
  { type: "angry", labelAr: "غاضب", labelEn: "Angry", emoji: "😡" },
] as const;

interface Post {
  id: string;
  content: string;
  images: string | null;
  videos: string | null;
  authorId: string | null;
  likes: number;
  sharesCount?: number;
  createdAt: string;
  updatedAt: string;
  _count?: { comments: number; reactions: number; shares: number };
  reactions?: { type: string; count?: number; memberId?: string }[];
  author?: { id?: string; name: string; nameEn?: string; image?: string };
  comments?: Comment[];
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  memberId: string;
  memberName?: string;
  memberImage?: string;
}

function parseImages(raw: string | null): string[] {
  if (!raw) return [];
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; }
  catch { return []; }
}

function parseVideos(raw: string | null): string[] {
  if (!raw) return [];
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; }
  catch { return []; }
}

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function Avatar({ src, name, size = 40 }: { src?: string | null; name?: string; size?: number }) {
  const [error, setError] = useState(false);
  const initials = name ? name.charAt(0) : "?";
  if (src && !error) {
    return (
      <div className="relative flex-shrink-0 rounded-full overflow-hidden ring-2 ring-primary/20" style={{ width: size, height: size }}>
        <img src={src} alt={name || ""} loading="lazy"
          className="rounded-full object-cover w-full h-full"
          onError={() => setError(true)} />
      </div>
    );
  }
  return (
    <div className="rounded-full bg-primary/10 flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <span className="font-semibold text-primary" style={{ fontSize: size * 0.4 }}>{initials}</span>
    </div>
  );
}

export default function PostDetailPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const [lang, setLang] = useState("ar");
  const [id, setId] = useState("");
  const [post, setPost] = useState<Post | null>(null);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { member } = useMember();
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [currentReaction, setCurrentReaction] = useState<string | null>(null);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});

  const isArabic = lang === "ar";

  const requireLogin = useCallback(() => {
    const cb = `/${lang}/posts/${id}`
    window.location.assign(`/auth/login?callbackUrl=${encodeURIComponent(cb)}`)
  }, [lang, id])

  useEffect(() => {
    params.then((p) => { setLang(p.lang); setId(p.id); });
  }, [params]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/posts/${id}`)
      .then((r) => r.json())
      .then((postData) => {
        setPost(postData);
        if (postData.myReaction) setCurrentReaction(postData.myReaction);
        // Aggregate reactions from raw reaction records
        if (postData.reactions && Array.isArray(postData.reactions)) {
          const counts: Record<string, number> = {};
          postData.reactions.forEach((r: any) => {
            counts[r.type] = (counts[r.type] || 0) + 1;
          });
          setReactionCounts(counts);
        } else if (postData.reactionSummary) {
          setReactionCounts(postData.reactionSummary);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (member && post?.reactions?.length) {
      const mine = post.reactions.find((r: any) => r.memberId === member.id);
      setCurrentReaction(mine?.type ?? null);
    }
  }, [member, post]);

  const handleReact = async (type: string) => {
    if (!member || !post) return;
    try {
      const wasSame = currentReaction === type;
      await fetch(`/api/posts/${post.id}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id, type: wasSame ? "" : type }),
      });
      setReactionCounts((prev) => {
        const next = { ...prev };
        if (wasSame) {
          next[type] = Math.max(0, (next[type] || 0) - 1);
          setCurrentReaction(null);
        } else {
          if (currentReaction) next[currentReaction] = Math.max(0, (next[currentReaction] || 0) - 1);
          next[type] = (next[type] || 0) + 1;
          setCurrentReaction(type);
        }
        return next;
      });
    } catch {}
  };

  const handleShare = async () => {
    if (!post) return;
    const url = `${window.location.origin}/${lang}/posts/${post.id}`;
    if (member) {
      try {
        await fetch(`/api/posts/${post.id}/share`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId: member.id }),
        });
      } catch {}
    }
    try {
      if (navigator.share) {
        await navigator.share({ url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success(isArabic ? "تم نسخ الرابط" : "Link copied");
      }
    } catch {}
  };

  if (loading) {
    return (
      <div dir={isArabic ? "rtl" : "ltr"} className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <SkeletonLine className="h-4 w-24 mb-6" />
            <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="flex items-center gap-3 p-5">
                <SkeletonCircle className="w-12 h-12" />
                <div className="flex-1 space-y-2">
                  <SkeletonLine className="h-4 w-1/3" />
                  <SkeletonLine className="h-3 w-1/5" />
                </div>
              </div>
              <div className="px-5 pb-4 space-y-2">
                <SkeletonLine className="h-3.5 w-full" />
                <SkeletonLine className="h-3.5 w-5/6" />
                <SkeletonLine className="h-3.5 w-3/4" />
              </div>
              <div className="px-5 pb-4">
                <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-64 rounded-xl" />
              </div>
              <div className="flex items-center border-t border-border px-5 py-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex-1 flex items-center justify-center py-2">
                    <SkeletonLine className="h-8 w-8" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div dir={isArabic ? "rtl" : "ltr"} className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-text-secondary">{isArabic ? "المنشور غير موجود" : "Post not found"}</p>
        <Link href={`/${lang}/posts`} className="text-primary hover:underline text-sm">
          {isArabic ? "العودة للمنشورات" : "Back to posts"}
        </Link>
      </div>
    );
  }

  const images = parseImages(post.images);
  const videos = parseImages(post.videos);
  const totalReactions = Object.values(reactionCounts).reduce((s, c) => s + c, 0);

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="min-h-screen bg-background">
      {/* Back link */}
      <div className="container mx-auto px-4 pt-6">
        <Link
          href={`/${lang}/posts`}
          className="inline-flex items-center gap-1 text-primary font-medium text-sm hover:gap-2 transition-all"
        >
          {isArabic ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          {isArabic ? "المنشورات" : "Posts"}
        </Link>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Post Card */}
          <article className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-5">
              <Avatar src={post.author?.image} name={post.author?.name} size={48} />
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-text">
                  {post.author?.name || (isArabic ? "عضو" : "Member")}
                </h2>
                <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3" />
                  {formatDate(post.createdAt, lang)}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="px-5 pb-4">
              <p className="text-text leading-relaxed whitespace-pre-line">{post.content}</p>
            </div>

            {/* Image Gallery */}
            {images.length > 0 && (
              <div className={`grid gap-0.5 ${images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : "grid-cols-2"}`}>
                {images.slice(0, 4).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setLightbox({ images, index: i })}
                    className={`relative overflow-hidden bg-black/5 group ${images.length === 3 && i === 0 ? "row-span-2" : ""}`}
                  >
                    <img src={img} alt="" className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    {i === 3 && images.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-3xl font-bold">+{images.length - 4}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Video Player */}
            {videos.length > 0 && (
              <div className="px-5 pb-4">
                {videos.map((url, i) => (
                  <div key={i} className="mb-4 last:mb-0">
                    <CustomVideoPlayer src={url} className="rounded-xl overflow-hidden" />
                  </div>
                ))}
              </div>
            )}

            {/* Reactions Summary */}
            <div className="flex items-center justify-between px-5 py-3 text-sm text-text-secondary border-t border-border">
              <div className="flex items-center gap-1.5">
                {totalReactions > 0 && (
                  <>
                    <div className="flex -space-x-1 rtl:space-x-reverse">
                    {REACTIONS.filter((r) => (reactionCounts[r.type] || 0) > 0).slice(0, 5).map((r) => (
                      <span key={r.type} className="inline-flex text-base">{r.emoji}</span>
                    ))}
                    </div>
                    <span>{totalReactions}</span>
                  </>
                )}
              </div>
              <button className="hover:text-primary transition-colors">
                {commentCount} {isArabic ? "تعليق" : "comments"}
              </button>
            </div>

            {/* Reactions Bar */}
            <div className="flex items-center border-t border-border">
              {REACTIONS.map((r, i) => {
                const isActive = currentReaction === r.type;
                return (
                  <button
                    key={r.type}
                    onClick={() => member ? handleReact(r.type) : requireLogin()}
                    className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs transition-all hover:scale-105 active:scale-95 ${
                      isActive
                        ? "text-primary bg-primary/5"
                        : "text-text-secondary hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                    style={{ animation: `bounce-in 0.3s ease-out ${i * 60}ms both` }}
                  >
                    <span className="text-2xl transition-transform hover:scale-110">{r.emoji}</span>
                    <span>{isArabic ? r.labelAr : r.labelEn}</span>
                    {reactionCounts[r.type] > 0 && (
                      <span className="text-[10px] font-bold">{reactionCounts[r.type]}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Share */}
            <div className="flex items-center justify-center border-t border-border py-2.5">
              <button onClick={handleShare} className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
                <Share2 className="w-4 h-4" />
                {isArabic ? "مشاركة" : "Share"}
              </button>
            </div>
          </article>

          {/* Comments */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-5 mt-5">
            <h3 className="font-semibold text-text mb-4 text-sm flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              {isArabic ? "التعليقات" : "Comments"}
              <span className="text-text-light font-normal text-xs">({commentCount})</span>
            </h3>
            <CommentsSection
              postId={id}
              lang={lang}
              member={member}
              onCountChange={(n) => setCommentCount(n)}
              loginHref={`/auth/login?callbackUrl=${encodeURIComponent(`/${lang}/posts/${id}`)}`}
            />
          </div>
        </div>
      </div>

      {/* Photo Viewer */}
      {lightbox && (
        <PhotoViewer
          images={lightbox.images}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          caption={{
            authorName: post.author?.name,
            authorImage: post.author?.image ?? null,
            text: post.content,
          }}
          isArabic={isArabic}
        />
      )}
    </div>
  );
}
