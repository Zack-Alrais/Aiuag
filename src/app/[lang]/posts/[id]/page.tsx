"use client";

import { useState, useEffect } from "react";
import {
  Heart, MessageCircle, Share2, ChevronLeft, ChevronRight, X, Play,
  Send, Loader2, User, Calendar, ArrowRight, ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import CustomVideoPlayer from "@/components/ui/custom-video-player";
import { SkeletonLine, SkeletonCircle } from "@/components/ui/skeleton";

const REACTIONS = [
  { type: "like", emoji: "👍", labelAr: "إعجاب", labelEn: "Like" },
  { type: "love", emoji: "❤️", labelAr: "حب", labelEn: "Love" },
  { type: "haha", emoji: "😂", labelAr: "هاها", labelEn: "Haha" },
  { type: "wow", emoji: "😮", labelAr: "واو", labelEn: "Wow" },
  { type: "sad", emoji: "😢", labelAr: "حزين", labelEn: "Sad" },
  { type: "angry", emoji: "😡", labelAr: "غاضب", labelEn: "Angry" },
] as const;

interface Post {
  id: string;
  content: string;
  images: string | null;
  videos: string | null;
  authorId: string | null;
  likes: number;
  createdAt: string;
  updatedAt: string;
  _count?: { comments: number; reactions: number };
  reactions?: { type: string; count: number }[];
  author?: { name: string; nameEn?: string; image?: string };
  comments?: Comment[];
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  memberId: string;
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

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function PostDetailPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const [lang, setLang] = useState("ar");
  const [id, setId] = useState("");
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<MemberData | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [currentReaction, setCurrentReaction] = useState<string | null>(null);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});

  const isArabic = lang === "ar";

  useEffect(() => {
    params.then((p) => { setLang(p.lang); setId(p.id); });
  }, [params]);

  useEffect(() => { setMember(getMember()); }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/posts/${id}`).then((r) => r.json()),
      fetch(`/api/posts/${id}/comments`).then((r) => r.json()),
    ])
      .then(([postData, commentsData]) => {
        setPost(postData);
        setComments(commentsData.data || []);
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

  const handleReact = async (type: string) => {
    if (!member || !post) return;
    try {
      await fetch(`/api/posts/${post.id}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id, type }),
      });
      const wasSame = currentReaction === type;
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

  const submitComment = async () => {
    const text = commentText.trim();
    if (!text || !member || !post) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id, content: text }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [...prev, newComment]);
        setCommentText("");
      }
    } catch {}
    setSubmitting(false);
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
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-primary" />
              </div>
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
                        <span key={r.type} className="text-base">{r.emoji}</span>
                      ))}
                    </div>
                    <span>{totalReactions}</span>
                  </>
                )}
              </div>
              <button className="hover:text-primary transition-colors">
                {comments.length} {isArabic ? "تعليق" : "comments"}
              </button>
            </div>

            {/* Reactions Bar */}
            <div className="flex items-center border-t border-border">
              {REACTIONS.map((r) => {
                const isActive = currentReaction === r.type;
                return (
                  <button
                    key={r.type}
                    onClick={() => member ? handleReact(r.type) : null}
                    disabled={!member}
                    className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs transition-all ${
                      isActive
                        ? "text-primary bg-primary/5"
                        : "text-text-secondary hover:bg-black/5 dark:hover:bg-white/5"
                    } ${!member ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span className="text-xl">{r.emoji}</span>
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
              <button className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
                <Share2 className="w-4 h-4" />
                {isArabic ? "مشاركة" : "Share"}
              </button>
            </div>
          </article>

          {/* Comment Form */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-5 mt-5">
            <h3 className="font-semibold text-text mb-4 text-sm">
              {isArabic ? "أضف تعليقاً" : "Add a comment"}
            </h3>
            {member ? (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={isArabic ? "اكتب تعليقاً..." : "Write a comment..."}
                    rows={3}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-text outline-none focus:border-primary resize-none placeholder:text-text-light"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-text-light">{member.name}</p>
                    <button
                      onClick={submitComment}
                      disabled={submitting || !commentText.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {isArabic ? "إرسال" : "Send"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-text-secondary text-sm mb-2">
                  {isArabic ? "يجب تسجيل الدخول للتعليق" : "You must log in to comment"}
                </p>
                <Link
                  href={`/${lang}/login`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
                >
                  {isArabic ? "تسجيل الدخول" : "Log in"}
                </Link>
              </div>
            )}
          </div>

          {/* Comments Thread */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-5 mt-5">
            <h3 className="font-semibold text-text mb-4 text-sm flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              {isArabic ? "التعليقات" : "Comments"}
              <span className="text-text-light font-normal text-xs">({comments.length})</span>
            </h3>

            {comments.length === 0 ? (
              <p className="text-text-secondary text-sm text-center py-6">
                {isArabic ? "لا توجد تعليقات بعد. كن أول من يعلق!" : "No comments yet. Be the first!"}
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4 text-primary/60" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-background rounded-2xl px-4 py-2.5">
                        <p className="text-xs font-semibold text-text">
                          {c.memberName || (isArabic ? "عضو" : "Member")}
                        </p>
                        <p className="text-sm text-text-secondary mt-1">{c.content}</p>
                      </div>
                      <p className="text-[10px] text-text-light mt-1 px-1">
                        {new Date(c.createdAt).toLocaleDateString(isArabic ? "ar-SA" : "en-US", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
