"use client";

import { useState, useEffect } from "react";
import {
  MessageCircle, Share2, Image as ImageIcon, Loader2, Calendar,
} from "lucide-react";
import Link from "next/link";
import CustomVideoPlayer from "@/components/ui/custom-video-player";
import { PostSkeleton } from "@/components/ui/skeleton";
import ReactionButton from "@/components/posts/reaction-button";
import CommentsSection from "@/components/posts/comments-section";
import PhotoViewer from "@/components/posts/photo-viewer";
import { useMember } from "@/hooks/use-member";
import { toast } from "sonner";

const REACTION_LABELS_AR: Record<string, string> = {
  like: "إعجاب", love: "حب", haha: "هاها", wow: "واو", sad: "حزين", angry: "غاضب",
};
const REACTION_LABELS_EN: Record<string, string> = {
  like: "Like", love: "Love", haha: "Haha", wow: "Wow", sad: "Sad", angry: "Angry",
};

interface Post {
  id: string;
  content: string;
  images: string | null;
  videos: string | null;
  authorId: string | null;
  likes: number;
  sharesCount?: number;
  createdAt: string;
  _count?: { comments: number; reactions: number; shares: number };
  reactionSummary?: Record<string, number>;
  myReaction?: string | null;
  author?: { id?: string; name: string; nameEn?: string; image?: string };
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

function formatTime(iso: string, locale: string) {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return locale === "ar" ? "الآن" : "now";
  if (mins < 60) return `${mins} ${locale === "ar" ? "د" : "m"}`;
  if (hrs < 24) return `${hrs} ${locale === "ar" ? "س" : "h"}`;
  if (days < 7) return `${days} ${locale === "ar" ? "ي" : "d"}`;
  return d.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", { day: "numeric", month: "short", year: "numeric" });
}

export default function PostsFeedPage({ params }: { params: Promise<{ lang: string }> }) {
  const [lang, setLang] = useState("ar");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const { member } = useMember();
  const [lightbox, setLightbox] = useState<{ post: Post; images: string[]; index: number } | null>(null);

  const isArabic = lang === "ar";

  useEffect(() => { params.then((p) => setLang(p.lang)); }, [params]);

  useEffect(() => {
    setLoading(true);
    const memberParam = member?.id ? `&memberId=${encodeURIComponent(member.id)}` : "";
    fetch(`/api/posts?page=${page}${memberParam}`)
      .then((r) => r.json())
      .then((data) => {
        const list = data.data || [];
        setPosts((prev) => (page === 1 ? list : [...prev, ...list]));
        setHasMore(list.length === 10);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, member?.id]);

  const toggleComments = (postId: string) => {
    setExpandedComments((s) => {
      const n = new Set(s);
      if (n.has(postId)) n.delete(postId); else n.add(postId);
      return n;
    });
  };

  const handleShare = async (post: Post) => {
    if (!member) return;
    const url = `${window.location.origin}/${lang}/posts/${post.id}`;
    try {
      await fetch(`/api/posts/${post.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id }),
      });
    } catch {}
    try {
      if (navigator.share) {
        await navigator.share({ title: post.content, text: post.content, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success(isArabic ? "تم نسخ الرابط" : "Link copied");
      }
    } catch {}
    setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, sharesCount: (p.sharesCount ?? 0) + 1 } : p)));
  };

  const handleReaction = async (postId: string, type: string) => {
    if (!member) return;
    try {
      const res = await fetch(`/api/posts/${postId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id, type }),
      });
      const reactions = await res.json();
      if (Array.isArray(reactions)) {
        const summary: Record<string, number> = {};
        let myReaction: string | null = null;
        reactions.forEach((r: { type: string; memberId: string }) => {
          summary[r.type] = (summary[r.type] || 0) + 1;
          if (r.memberId === member.id) myReaction = r.type;
        });
        setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, reactionSummary: summary, myReaction } : p)));
      }
    } catch {}
  };

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary-light to-primary-dark py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isArabic ? "المنشورات" : "Posts"}
            </h1>
            <p className="text-white/70 text-sm">
              {isArabic ? "آخر المنشورات والتحديثات" : "Latest posts and updates"}
            </p>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-5">
          {posts.map((post) => {
            const images = parseImages(post.images);
            const videos = parseImages(post.videos);
            const totalReactions = Object.values(post.reactionSummary || {}).reduce((s, v) => s + v, 0);

            return (
              <article key={post.id} className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 p-4">
                  <Avatar src={post.author?.image} name={post.author?.name} size={40} />
                  <div className="flex-1 min-w-0">
                    <Link href={`/${lang}/posts/${post.id}`} className="font-semibold text-sm text-text hover:text-primary transition-colors">
                      {post.author?.name || (isArabic ? "عضو" : "Member")}
                    </Link>
                    <p className="text-xs text-text-secondary flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatTime(post.createdAt, lang)}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="px-4 pb-3">
                  <Link href={`/${lang}/posts/${post.id}`}>
                    <p className="text-sm text-text leading-relaxed whitespace-pre-line">{post.content}</p>
                  </Link>
                </div>

                {/* Image Gallery */}
                {images.length > 0 && (
                  <div className={`grid gap-0.5 ${images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : images.length === 3 ? "grid-cols-2" : "grid-cols-2"}`}>
                    {images.slice(0, 4).map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setLightbox({ post, images, index: i })}
                        className={`relative overflow-hidden bg-black/5 group ${images.length === 3 && i === 0 ? "row-span-2" : ""}`}
                      >
                        <img src={img} alt="" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                        {i === 3 && images.length > 4 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">+{images.length - 4}</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Video Player */}
                {videos.length > 0 && (
                  <div className="px-4 pb-3">
                    {videos.slice(0, 1).map((url, i) => (
                      <CustomVideoPlayer key={i} src={url} className="rounded-xl overflow-hidden" />
                    ))}
                  </div>
                )}

                {/* Stats bar */}
                <div className="flex items-center justify-between px-4 py-2 text-xs text-text-secondary border-t border-border">
                  <span>{totalReactions} {isArabic ? "تفاعل" : "reactions"}</span>
                  <button onClick={() => toggleComments(post.id)} className="hover:text-primary transition-colors">
                    {(commentCounts[post.id] ?? post._count?.comments ?? 0)} {isArabic ? "تعليق" : "comments"}
                  </button>
                </div>

                {/* Action Bar */}
                <div className="flex items-center border-t border-border divide-x divide-border rtl:divide-x-reverse">
                  <ReactionButton
                    postId={post.id}
                    myReaction={post.myReaction ?? null}
                    isArabic={isArabic}
                    labels={isArabic ? REACTION_LABELS_AR : REACTION_LABELS_EN}
                    onReact={handleReaction}
                    canReact={!!member}
                    onRequireLogin={() => window.location.assign("/auth/login")}
                    className="flex-1 py-2.5"
                  />
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {isArabic ? "تعليق" : "Comment"}
                  </button>
                  <button onClick={() => handleShare(post)} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <Share2 className="w-4 h-4" />
                    {isArabic ? "مشاركة" : "Share"}
                  </button>
                </div>

                {/* Comments Section */}
                {expandedComments.has(post.id) && (
                  <div className="border-t border-border bg-black/[.02] dark:bg-white/[.02]">
                    <div className="p-4 max-h-96 overflow-y-auto">
                      <CommentsSection
                        postId={post.id}
                        lang={lang}
                        member={member}
                        onCountChange={(n) => setCommentCounts((s) => ({ ...s, [post.id]: n }))}
                      />
                    </div>
                  </div>
                )}
              </article>
            );
          })}

          {/* Loading / Pagination */}
          {loading && page === 1 && (
            <div className="space-y-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          )}

          {loading && page > 1 && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="text-center py-16">
              <ImageIcon className="w-12 h-12 mx-auto text-text-light mb-3" />
              <p className="text-text-secondary">{isArabic ? "لا توجد منشورات بعد" : "No posts yet"}</p>
            </div>
          )}

          {!loading && hasMore && (
            <div className="flex justify-center py-4">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-6 py-2.5 bg-surface border border-border text-text rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all text-sm font-medium"
              >
                {isArabic ? "تحميل المزيد" : "Load more"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Photo Viewer */}
      {lightbox && (
        <PhotoViewer
          images={lightbox.images}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          caption={{
            authorName: lightbox.post.author?.name,
            authorImage: lightbox.post.author?.image ?? null,
            text: lightbox.post.content,
          }}
          isArabic={isArabic}
        />
      )}
    </div>
  );
}
