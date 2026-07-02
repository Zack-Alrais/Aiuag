"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useTheme } from "@/components/admin/theme-provider";
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  Image as ImageIcon,
  Video,
  X,
  ChevronLeft,
  ChevronRight,
  Smile,
  Repeat2,
  MoreHorizontal,
  User,
  Search,
  Bookmark,
  Globe,
  Lock,
} from "lucide-react";

interface Author {
  id: string;
  name: string;
  image?: string;
}

interface OriginalPost {
  id: string;
  content: string;
  images?: string | null;
  author?: Author | null;
  createdAt: string;
}

interface Post {
  id: string;
  content: string;
  images?: string | null;
  videos?: string | null;
  authorId?: string | null;
  likes: number;
  sharesCount: number;
  originalPostId?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { comments: number; reactions: number; shares: number };
  reactionSummary?: Record<string, number>;
  author?: Author | null;
  originalPost?: OriginalPost | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  memberId: string;
  memberName?: string;
  memberImage?: string;
}

interface MemberData {
  id: string;
  name: string;
  email?: string;
  image?: string;
}

const REACTIONS = [
  { type: "like", emoji: "👍", label: "أعجبني" },
  { type: "love", emoji: "❤️", label: "أحببته" },
  { type: "haha", emoji: "😂", label: "ضحك" },
  { type: "wow", emoji: "😮", label: "مدهش" },
  { type: "sad", emoji: "😢", label: "محزن" },
  { type: "angry", emoji: "😡", label: "غاضب" },
];

const REACTION_EMOJIS: Record<string, string> = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

function timeAgo(dateStr: string, isArabic: boolean): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return isArabic ? "الآن" : "Just now";
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return isArabic ? `منذ ${m} د` : `${m}m ago`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return isArabic ? `منذ ${h} س` : `${h}h ago`;
  }
  if (diff < 604800) {
    const d = Math.floor(diff / 86400);
    return isArabic ? `منذ ${d} ي` : `${d}d ago`;
  }
  return date.toLocaleDateString(isArabic ? "ar" : "en", { month: "short", day: "numeric" });
}

function parseMedia(jsonStr: string | null): string[] {
  if (!jsonStr) return [];
  try {
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function highlightMentions(text: string) {
  return text.replace(/@(\w+)/g, '<span class="text-blue-500 font-semibold">@$1</span>');
}

// ========== CREATE POST BOX ==========
function CreatePostBox({ member, onPost }: { member: MemberData | null; onPost: (post: Post) => void }) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList, type: "image" | "video") => {
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) {
          if (type === "image") setImages((prev) => [...prev, data.url]);
          else setVideos((prev) => [...prev, data.url]);
        }
      } catch {}
    }
  };

  const handlePost = async () => {
    if (!content.trim() && images.length === 0 && videos.length === 0) return;
    if (!member) return;
    setPosting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          images: images.length > 0 ? images : undefined,
          videos: videos.length > 0 ? videos : undefined,
          authorId: member.id,
        }),
      });
      const post = await res.json();
      onPost(post);
      setContent("");
      setImages([]);
      setVideos([]);
      setExpanded(false);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111927] rounded-2xl shadow-sm border border-gray-100 dark:border-[#1e2d42] overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {member?.image ? (
              <Image src={member.image} alt="" width={40} height={40} className="rounded-full object-cover" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setExpanded(true)}
              placeholder="بماذا تفكر؟ شاركنا..."
              className="w-full bg-gray-100 dark:bg-[#0d1525] rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-[#f1f5f9] placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 border-0 min-h-[48px]"
              rows={expanded ? 3 : 1}
              dir="rtl"
            />
          </div>
        </div>
      </div>

      {images.length > 0 && (
        <div className="px-4 pb-3">
          <div className="flex gap-2 flex-wrap">
            {images.map((url, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden">
                <Image src={url} alt="" fill className="object-cover" />
                <button onClick={() => setImages((p) => p.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div className="px-4 pb-3">
          <div className="flex gap-2 flex-wrap">
            {videos.map((url, i) => (
              <div key={i} className="relative w-32 h-20 rounded-xl overflow-hidden bg-black">
                <video src={url} className="w-full h-full object-cover" />
                <button onClick={() => setVideos((p) => p.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {expanded && (
        <div className="px-4 pb-3 flex items-center justify-between border-t border-gray-100 dark:border-[#1e2d42] pt-3">
          <div className="flex items-center gap-1">
            <button onClick={() => fileRef.current?.click()} className="p-2 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" title="صورة">
              <ImageIcon className="w-5 h-5 text-green-500" />
            </button>
            <button onClick={() => videoRef.current?.click()} className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="فيديو">
              <Video className="w-5 h-5 text-red-500" />
            </button>
            <button className="p-2 rounded-full hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors" title="شعور">
              <Smile className="w-5 h-5 text-yellow-500" />
            </button>
          </div>
          <button
            onClick={handlePost}
            disabled={posting || (!content.trim() && images.length === 0 && videos.length === 0)}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-full text-sm font-semibold transition-colors flex items-center gap-2"
          >
            {posting ? "جاري النشر..." : "نشر"}
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleFileUpload(e.target.files, "image")} />
      <input ref={videoRef} type="file" accept="video/*" multiple className="hidden" onChange={(e) => e.target.files && handleFileUpload(e.target.files, "video")} />
    </div>
  );
}

// ========== REACTIONS POPOVER ==========
function ReactionsPopover({ onReact, currentReaction }: { onReact: (type: string) => void; currentReaction?: string }) {
  return (
    <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-[#1e2d42] rounded-full shadow-xl border border-gray-200 dark:border-[#3b4f6b] px-2 py-1 flex gap-1 animate-in fade-in slide-in-from-bottom-2 z-50">
      {REACTIONS.map((r) => (
        <button
          key={r.type}
          onClick={() => onReact(r.type)}
          className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-[#2a3f5f] transition-all hover:scale-125 text-xl ${currentReaction === r.type ? "bg-blue-50 dark:bg-blue-900/30 scale-110" : ""}`}
          title={r.label}
        >
          {r.emoji}
        </button>
      ))}
    </div>
  );
}

// ========== POST CARD ==========
function PostCard({
  post,
  member,
  isArabic,
  onReact,
  onComment,
  onShare,
  onRepost,
}: {
  post: Post;
  member: MemberData | null;
  isArabic: boolean;
  onReact: (postId: string, type: string) => void;
  onComment: (postId: string, content: string) => void;
  onShare: (postId: string) => void;
  onRepost: (post: Post) => void;
}) {
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [currentReaction, setCurrentReaction] = useState<string | undefined>(undefined);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [commentAuthorMap, setCommentAuthorMap] = useState<Record<string, { name: string; image?: string }>>({});
  const reactionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const images = parseMedia(post.images);
  const videos = parseMedia(post.videos);
  const totalReactions = Object.values(post.reactionSummary || {}).reduce((a, b) => a + b, 0);

  const loadComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    setShowComments(true);
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`);
      const data = await res.json();
      const list = data.data || data || [];
      setComments(list);

      const memberIds = [...new Set(list.map((c: Comment) => c.memberId))];
      if (memberIds.length > 0) {
        const memberRes = await fetch(`/api/members?ids=${memberIds.join(",")}`);
        if (memberRes.ok) {
          const memberData = await memberRes.json();
          const map: Record<string, { name: string; image?: string }> = {};
          (memberData.data || memberData || []).forEach((m: any) => {
            map[m.id] = { name: m.name, image: m.image };
          });
          setCommentAuthorMap(map);
        }
      }
    } catch {} finally {
      setLoadingComments(false);
    }
  };

  const handleComment = () => {
    if (!commentText.trim() || !member) return;
    onComment(post.id, commentText.trim());
    setComments((prev) => [
      ...prev,
      { id: Date.now().toString(), content: commentText.trim(), createdAt: new Date().toISOString(), memberId: member.id, memberName: member.name, memberImage: member.image },
    ]);
    setCommentText("");
  };

  const getAuthor = (p: Post) => p.author || { id: "", name: "عضو", image: undefined };

  return (
    <>
      <div className="bg-white dark:bg-[#111927] rounded-2xl shadow-sm border border-gray-100 dark:border-[#1e2d42] overflow-hidden">
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white overflow-hidden flex-shrink-0">
                {getAuthor(post).image ? (
                  <Image src={getAuthor(post).image!} alt="" width={44} height={44} className="rounded-full object-cover" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-[#f1f5f9]">{getAuthor(post).name}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>{timeAgo(post.createdAt, isArabic)}</span>
                  <span>·</span>
                  <Globe className="w-3 h-3" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setShareMenuOpen(!shareMenuOpen)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1e2d42] transition-colors">
                <MoreHorizontal className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed" dir="rtl" dangerouslySetInnerHTML={{ __html: highlightMentions(post.content) }} />
        </div>

        {/* Repost indicator */}
        {post.originalPost && (
          <div className="mx-4 mb-3 bg-gray-50 dark:bg-[#0d1525] rounded-xl border border-gray-200 dark:border-[#1e2d42] p-3">
            <div className="flex items-center gap-2 mb-2">
              <Repeat2 className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">{isArabic ? "أعاد نشر" : "Reposted from"} {post.originalPost.author?.name || "عضو"}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3" dir="rtl">{post.originalPost.content}</p>
          </div>
        )}

        {/* Image Grid */}
        {images.length > 0 && (
          <div className={`grid ${images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : "grid-cols-2"} gap-1`}>
            {images.slice(0, 4).map((url, i) => (
              <div key={i} className={`relative cursor-pointer overflow-hidden ${images.length === 1 ? "aspect-video" : "aspect-square"} ${i === 3 && images.length > 4 ? "relative" : ""}`} onClick={() => setLightboxImg(url)}>
                <Image src={url} alt="" fill className="object-cover hover:scale-105 transition-transform duration-300" />
                {i === 3 && images.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">+{images.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Videos */}
        {videos.length > 0 && (
          <div className="px-4 pb-3 space-y-2">
            {videos.map((url, i) => (
              <video key={i} src={url} controls className="w-full rounded-xl max-h-[400px] object-cover bg-black" />
            ))}
          </div>
        )}

        {/* Stats Bar */}
        <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-[#1e2d42]">
          <div className="flex items-center gap-1">
            {totalReactions > 0 && (
              <>
                <div className="flex -space-x-1">
                  {Object.entries(post.reactionSummary || {})
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([type]) => (
                      <span key={type} className="text-sm">{REACTION_EMOJIS[type] || "👍"}</span>
                    ))}
                </div>
                <span>{totalReactions}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {post._count?.comments ? <span>{post._count.comments} {isArabic ? "تعليق" : "comments"}</span> : null}
            {post.sharesCount ? <span>{post.sharesCount} {isArabic ? "مشاركة" : "shares"}</span> : null}
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-2 py-1 flex items-center">
          <div
            className="relative flex-1"
            onMouseEnter={() => { reactionTimerRef.current = setTimeout(() => setShowReactions(true), 500); }}
            onMouseLeave={() => { if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current); setShowReactions(false); }}
          >
            {showReactions && member && (
              <ReactionsPopover
                onReact={(type) => { onReact(post.id, type); setCurrentReaction(type); setShowReactions(false); }}
                currentReaction={currentReaction}
              />
            )}
            <button
              onClick={() => { if (member) { const newType = currentReaction || "like"; onReact(post.id, currentReaction ? "" : newType); setCurrentReaction(currentReaction ? undefined : newType); } }}
              className={`w-full py-2.5 flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors ${currentReaction ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e2d42]"}`}
            >
              {currentReaction ? <span className="text-lg">{REACTION_EMOJIS[currentReaction]}</span> : <Heart className="w-5 h-5" />}
              {currentReaction ? REACTIONS.find((r) => r.type === currentReaction)?.label || "أعجبني" : (isArabic ? "أعجبني" : "Like")}
            </button>
          </div>
          <button onClick={loadComments} className="flex-1 py-2.5 flex items-center justify-center gap-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e2d42] transition-colors">
            <MessageCircle className="w-5 h-5" />
            {isArabic ? "تعليق" : "Comment"}
          </button>
          <button onClick={() => onShare(post.id)} className="flex-1 py-2.5 flex items-center justify-center gap-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e2d42] transition-colors">
            <Share2 className="w-5 h-5" />
            {isArabic ? "مشاركة" : "Share"}
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="border-t border-gray-100 dark:border-[#1e2d42] px-4 py-3 space-y-3">
            {loadingComments ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-10 bg-gray-100 dark:bg-[#1e2d42] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {comments.map((c) => {
                  const author = commentAuthorMap[c.memberId] || { name: c.memberName || "عضو", image: c.memberImage };
                  return (
                    <div key={c.id} className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white overflow-hidden flex-shrink-0">
                        {author.image ? (
                          <Image src={author.image} alt="" width={32} height={32} className="rounded-full object-cover" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-100 dark:bg-[#0d1525] rounded-2xl px-3 py-2">
                          <span className="font-semibold text-xs text-gray-900 dark:text-[#f1f5f9]">{author.name}</span>
                          <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5" dangerouslySetInnerHTML={{ __html: highlightMentions(c.content) }} />
                        </div>
                        <div className="flex items-center gap-3 mt-1 px-2">
                          <button className="text-xs font-semibold text-gray-500 hover:text-blue-600">{isArabic ? "إعجاب" : "Like"}</button>
                          <button className="text-xs font-semibold text-gray-500 hover:text-blue-600">{isArabic ? "رد" : "Reply"}</button>
                          <span className="text-xs text-gray-400">{timeAgo(c.createdAt, isArabic)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Comment Input */}
            {member ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white overflow-hidden flex-shrink-0">
                  {member.image ? (
                    <Image src={member.image} alt="" width={32} height={32} className="rounded-full object-cover" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 flex items-center bg-gray-100 dark:bg-[#0d1525] rounded-full px-3 py-1.5">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleComment()}
                    placeholder={isArabic ? "اكتب تعليقاً... استخدم @ للمنشن" : "Write a comment... use @ to mention"}
                    className="flex-1 bg-transparent text-sm text-gray-900 dark:text-[#f1f5f9] placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
                    dir="rtl"
                  />
                  <button onClick={handleComment} disabled={!commentText.trim()} className="p-1 text-blue-500 hover:text-blue-600 disabled:text-gray-300">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                {isArabic ? "سجل الدخول للتعليق" : "Log in to comment"}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={() => setLightboxImg(null)}>
          <button className="absolute top-4 right-4 text-white"><X className="w-8 h-8" /></button>
          <Image src={lightboxImg} alt="" width={1200} height={800} className="max-h-[90vh] max-w-[90vw] object-contain" />
        </div>
      )}
    </>
  );
}

// ========== REPOST MODAL ==========
function RepostModal({ post, member, onClose, onPost }: { post: Post; member: MemberData; onClose: () => void; onPost: (p: Post) => void }) {
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);

  const handleRepost = async () => {
    setPosting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment, authorId: member.id, originalPostId: post.id }),
      });
      const newPost = await res.json();
      onPost(newPost);
      onClose();
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#111927] rounded-2xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 dark:border-[#3b4f6b] flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white">{"إعادة نشر"}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-[#1e2d42] rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="أضف تعليقاً..." className="w-full bg-gray-50 dark:bg-[#0d1525] rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-[#f1f5f9] placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[80px]" dir="rtl" />
          <div className="mt-3 bg-gray-50 dark:bg-[#0d1525] rounded-xl p-3 border border-gray-200 dark:border-[#1e2d42]">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{isArabic("المشاركة الأصلية")}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3" dir="rtl">{post.content}</p>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-[#3b4f6b] flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e2d42] rounded-xl">{"إلغاء"}</button>
          <button onClick={handleRepost} disabled={posting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl font-semibold disabled:opacity-50">
            {posting ? "جاري النشر..." : "نشر"}
          </button>
        </div>
      </div>
    </div>
  );
}

function isArabic(text: string) {
  return text;
}

// ========== MAIN PAGE ==========
export default function MediaPostsPage() {
  const { theme } = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [member, setMember] = useState<MemberData | null>(null);
  const [lang, setLang] = useState("ar");
  const [repostPost, setRepostPost] = useState<Post | null>(null);

  useEffect(() => {
    const savedLang = typeof window !== "undefined" ? localStorage.getItem("lang") || "ar" : "ar";
    setLang(savedLang);
    const savedMember = localStorage.getItem("memberData");
    if (savedMember) {
      try { setMember(JSON.parse(savedMember)); } catch {}
    }
  }, []);

  const fetchPosts = useCallback(async (pageNum: number, append = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?page=${pageNum}&limit=10`);
      const data = await res.json();
      const list = data.data || [];
      if (append) {
        setPosts((prev) => [...prev, ...list]);
      } else {
        setPosts(list);
      }
      setHasMore(data.pagination?.hasMore ?? false);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const isAr = lang === "ar";

  const handleReact = async (postId: string, type: string) => {
    if (!member) return;
    try {
      await fetch(`/api/posts/${postId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id, type }),
      });
    } catch {}
  };

  const handleComment = async (postId: string, content: string) => {
    if (!member) return;
    try {
      await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id, content }),
      });
    } catch {}
  };

  const handleShare = async (postId: string) => {
    if (!member) return;
    try {
      await fetch(`/api/posts/${postId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id }),
      });
    } catch {}
  };

  const handleNewPost = (post: Post) => {
    setPosts((prev) => [{ ...post, _count: { comments: 0, reactions: 0, shares: 0 }, reactionSummary: {} }, ...prev]);
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-[#0a0f1a]" : "bg-gray-100"}`} dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isAr ? "المنشورات" : "Posts"}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{isAr ? "شارك وأتفاعل مع مجتمع الخريجين" : "Share and interact with the alumni community"}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder={isAr ? "بحث..." : "Search..."} className="pl-9 pr-3 py-2 bg-gray-100 dark:bg-[#1e2d42] rounded-full text-sm text-gray-900 dark:text-[#f1f5f9] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-48" />
            </div>
          </div>
        </div>

        {/* Create Post */}
        <CreatePostBox member={member} onPost={handleNewPost} />

        {/* Posts Feed */}
        {loading && posts.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-[#111927] rounded-2xl p-4 space-y-3 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-11 h-11 bg-gray-200 dark:bg-[#1e2d42] rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-[#1e2d42] rounded w-1/3" />
                    <div className="h-3 bg-gray-200 dark:bg-[#1e2d42] rounded w-1/4" />
                  </div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-[#1e2d42] rounded w-full" />
                <div className="h-4 bg-gray-200 dark:bg-[#1e2d42] rounded w-2/3" />
                <div className="h-48 bg-gray-200 dark:bg-[#1e2d42] rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                member={member}
                isArabic={isAr}
                onReact={handleReact}
                onComment={handleComment}
                onShare={handleShare}
                onRepost={setRepostPost}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="text-center py-4">
            <button
              onClick={() => { setPage((p) => p + 1); fetchPosts(page + 1, true); }}
              disabled={loading}
              className="px-6 py-2.5 bg-white dark:bg-[#111927] border border-gray-200 dark:border-[#1e2d42] rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1e2d42] transition-colors disabled:opacity-50"
            >
              {loading ? (isAr ? "جاري التحميل..." : "Loading...") : (isAr ? "تحميل المزيد" : "Load More")}
            </button>
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-[#1e2d42] rounded-full flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{isAr ? "لا توجد منشورات بعد" : "No posts yet"}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{isAr ? "كن أول من ينشر!" : "Be the first to post!"}</p>
          </div>
        )}
      </div>

      {/* Repost Modal */}
      {repostPost && member && (
        <RepostModal post={repostPost} member={member} onClose={() => setRepostPost(null)} onPost={handleNewPost} />
      )}
    </div>
  );
}
