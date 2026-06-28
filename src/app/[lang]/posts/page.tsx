"use client";

import { useState, useEffect } from "react";
import {
  Heart, MessageCircle, Share2, ChevronLeft, ChevronRight, X, Play,
  Image as ImageIcon, Send, Loader2, User, Calendar,
} from "lucide-react";
import Link from "next/link";
import CustomVideoPlayer from "@/components/ui/custom-video-player";
import { PostSkeleton } from "@/components/ui/skeleton";

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"] as const;
const REACTION_MAP: Record<string, string> = {
  like: "👍", love: "❤️", haha: "😂", wow: "😮", sad: "😢", angry: "😡",
};
const REVERSE_MAP: Record<string, string> = {
  "👍": "like", "❤️": "love", "😂": "haha", "😮": "wow", "😢": "sad", "😡": "angry",
};

interface Post {
  id: string;
  content: string;
  images: string | null;
  videos: string | null;
  authorId: string | null;
  likes: number;
  createdAt: string;
  _count?: { comments: number; reactions: number };
  reactions?: { type: string; count: number }[];
  author?: { name: string; nameEn?: string; image?: string };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  memberName?: string;
}

interface MemberData {
  id: string;
  name: string;
  email?: string;
}

function getMember(): MemberData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("memberData");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
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
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [member, setMember] = useState<MemberData | null>(null);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [reactionPopover, setReactionPopover] = useState<string | null>(null);

  const isArabic = lang === "ar";

  useEffect(() => { params.then((p) => setLang(p.lang)); }, [params]);
  useEffect(() => { setMember(getMember()); }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/posts?page=${page}`)
      .then((r) => r.json())
      .then((data) => {
        const list = data.data || [];
        setPosts((prev) => (page === 1 ? list : [...prev, ...list]));
        setHasMore(list.length === 10);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const toggleComments = async (postId: string) => {
    if (expandedComments.has(postId)) {
      setExpandedComments((s) => { const n = new Set(s); n.delete(postId); return n; });
      return;
    }
    setExpandedComments((s) => new Set(s).add(postId));
    if (!comments[postId]) {
      setCommentsLoading((s) => ({ ...s, [postId]: true }));
      try {
        const res = await fetch(`/api/posts/${postId}/comments`);
        const data = await res.json();
        setComments((s) => ({ ...s, [postId]: data.data || [] }));
      } catch {}
      setCommentsLoading((s) => ({ ...s, [postId]: false }));
    }
  };

  const submitComment = async (postId: string) => {
    const text = commentTexts[postId]?.trim();
    if (!text || !member) return;
    setSubmitting((s) => ({ ...s, [postId]: true }));
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id, content: text }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments((s) => ({ ...s, [postId]: [...(s[postId] || []), newComment] }));
        setCommentTexts((s) => ({ ...s, [postId]: "" }));
      }
    } catch {}
    setSubmitting((s) => ({ ...s, [postId]: false }));
  };

  const handleReaction = async (postId: string, type: string) => {
    if (!member) return;
    try {
      await fetch(`/api/posts/${postId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id, type }),
      });
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
            const reactionTypes = post.reactions || [];
            const myReaction = member ? reactionTypes.find((r) => r.type === "like") : null;

            return (
              <article key={post.id} className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
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
                        onClick={() => setLightbox({ images, index: i })}
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
                  <span>{reactionTypes.reduce((s, r) => s + r.count, 0)} {isArabic ? "تفاعل" : "reactions"}</span>
                  <button onClick={() => toggleComments(post.id)} className="hover:text-primary transition-colors">
                    {(post._count?.comments ?? 0)} {isArabic ? "تعليق" : "comments"}
                  </button>
                </div>

                {/* Action Bar */}
                <div className="flex items-center border-t border-border divide-x divide-border rtl:divide-x-reverse">
                  <div className="relative flex-1">
                    <button
                      onClick={() => member ? handleReaction(post.id, "like") : setReactionPopover(post.id)}
                      onMouseEnter={() => setReactionPopover(post.id)}
                      onMouseLeave={() => setReactionPopover(null)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${myReaction ? "fill-red-500 text-red-500" : ""}`} />
                      {isArabic ? "إعجاب" : "Like"}
                    </button>
                    {reactionPopover === post.id && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-surface border border-border rounded-xl shadow-lg p-2 flex gap-1 z-50" dir="ltr">
                        {REACTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => { handleReaction(post.id, REVERSE_MAP[emoji]); setReactionPopover(null); }}
                            className="w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-all hover:scale-125"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {isArabic ? "تعليق" : "Comment"}
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <Share2 className="w-4 h-4" />
                    {isArabic ? "مشاركة" : "Share"}
                  </button>
                </div>

                {/* Comments Section */}
                {expandedComments.has(post.id) && (
                  <div className="border-t border-border bg-black/[.02] dark:bg-white/[.02]">
                    {commentsLoading[post.id] ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                        {(comments[post.id] || []).length === 0 ? (
                          <p className="text-xs text-text-secondary text-center py-2">
                            {isArabic ? "لا توجد تعليقات" : "No comments yet"}
                          </p>
                        ) : (
                          (comments[post.id] || []).map((c) => (
                            <div key={c.id} className="flex gap-2">
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                <User className="w-3.5 h-3.5 text-primary" />
                              </div>
                              <div className="bg-surface rounded-xl px-3 py-2 flex-1">
                                <p className="text-xs font-semibold text-text">{c.memberName || (isArabic ? "عضو" : "Member")}</p>
                                <p className="text-xs text-text-secondary mt-0.5">{c.content}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Comment Form */}
                    {member ? (
                      <div className="flex items-center gap-2 px-4 pb-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 flex items-center gap-2 bg-background rounded-xl px-3 py-1.5 border border-border">
                          <input
                            value={commentTexts[post.id] || ""}
                            onChange={(e) => setCommentTexts((s) => ({ ...s, [post.id]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === "Enter") submitComment(post.id); }}
                            placeholder={isArabic ? "اكتب تعليقاً..." : "Write a comment..."}
                            className="flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-light"
                          />
                          <button
                            onClick={() => submitComment(post.id)}
                            disabled={submitting[post.id] || !commentTexts[post.id]?.trim()}
                            className="text-primary disabled:opacity-30"
                          >
                            {submitting[post.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 pb-4">
                        <Link href={`/${lang}/login`} className="block text-center text-xs text-primary hover:underline py-2">
                          {isArabic ? "سجل الدخول للتعليق" : "Log in to comment"}
                        </Link>
                      </div>
                    )}
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

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(null)}
          dir="ltr"
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox((l) => l ? { ...l, index: (l.index - 1 + l.images.length) % l.images.length } : null); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <img
            src={lightbox.images[lightbox.index]}
            alt=""
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox((l) => l ? { ...l, index: (l.index + 1) % l.images.length } : null); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            {lightbox.index + 1} / {lightbox.images.length}
          </div>
        </div>
      )}
    </div>
  );
}
