"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import ScrollReveal from "@/components/ui/scroll-reveal";
import { useMember } from "@/hooks/use-member";
import {
  MessageCircle,
  Share2,
  Send,
  Image as ImageIcon,
  Video,
  X,
  Smile,
  Repeat2,
  MoreHorizontal,
  User,
  Globe,
  Link2,
  ExternalLink,
  Bookmark,
  Flag,
  Trash2,
  Pencil,
  EyeOff,
} from "lucide-react";
import ReactionButton from "@/components/posts/reaction-button";
import CommentsSection from "@/components/posts/comments-section";
import MediaViewer from "@/components/posts/media-viewer";

interface Author {
  id: string;
  name: string;
  image?: string | null;
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
  editedAt?: string | null;
  _count?: { comments: number; reactions: number; shares: number };
  reactionSummary?: Record<string, number>;
  myReaction?: string | null;
  author?: Author | null;
  originalPost?: OriginalPost | null;
}

interface MemberData {
  id: string;
  name: string;
  email?: string;
  image?: string;
}

const REACTION_EMOJIS: Record<string, string> = {
  like: "👍", love: "❤️", haha: "😂", wow: "😮", sad: "😢", angry: "😡",
};

function timeAgo(dateStr: string, isAr: boolean): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return isAr ? "الآن" : "Just now";
  if (diff < 3600) { const m = Math.floor(diff / 60); return isAr ? `منذ ${m} د` : `${m}m ago`; }
  if (diff < 86400) { const h = Math.floor(diff / 3600); return isAr ? `منذ ${h} س` : `${h}h ago`; }
  if (diff < 604800) { const d = Math.floor(diff / 86400); return isAr ? `منذ ${d} ي` : `${d}d ago`; }
  return date.toLocaleDateString(isAr ? "ar" : "en", { month: "short", day: "numeric" });
}

function parseMedia(jsonStr: string | null | undefined): string[] {
  if (!jsonStr) return [];
  try { const p = JSON.parse(jsonStr); return Array.isArray(p) ? p : []; } catch { return []; }
}

function highlightMentions(text: string) {
  return text.replace(/@(\w+)/g, '<span class="text-blue-500 font-semibold">@$1</span>');
}

function Avatar({ src, name, size = 40 }: { src?: string | null | undefined; name?: string; size?: number }) {
  const [error, setError] = useState(false);
  const showFallback = !src || error;
  const initials = name ? name.charAt(0) : "?";
  if (showFallback) {
    return (
      <div className="rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0" style={{ width: size, height: size, fontSize: size * 0.4 }}>
        {initials}
      </div>
    );
  }
  return (
    <div className="relative flex-shrink-0 rounded-full overflow-hidden" style={{ width: size, height: size }}>
      <Image
        src={src}
        alt={name || ""}
        width={size}
        height={size}
        className="rounded-full object-cover w-full h-full"
        unoptimized
        onError={() => setError(true)}
      />
    </div>
  );
}

// ========== PROGRESSIVE BLUR-UP IMAGE ==========
function ProgressiveImage({ src, alt, className, aspectClass }: { src: string; alt: string; className?: string; aspectClass: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-gray-200 dark:bg-[#0d1525] ${aspectClass} ${className || ""}`}>
      <div
        className={`absolute inset-0 bg-gradient-to-br from-transparent via-black/5 to-transparent animate-pulse transition-opacity ${loaded ? "opacity-0" : "opacity-100"}`}
        style={{ backgroundSize: "200% 200%" }}
      />
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        draggable={false}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`object-cover transition-all duration-500 ${loaded ? "blur-0 scale-100 opacity-100" : "blur-2xl scale-105 opacity-60"}`}
      />
    </div>
  );
}

// ========== POST CARD SKELETON ==========
function PostCardSkeleton({ isAr }: { isAr: boolean }) {
  const shimmer = "animate-pulse bg-gray-200 dark:bg-[#1e2d42] rounded";
  return (
    <div className="bg-white dark:bg-[#111927] rounded-2xl shadow-sm border border-gray-100 dark:border-[#1e2d42] overflow-hidden" aria-hidden="true">
      <div className="p-4 flex items-center gap-3">
        <div className={`w-11 h-11 rounded-full ${shimmer}`} />
        <div className="space-y-2 flex-1">
          <div className={`h-3 w-32 ${shimmer}`} />
          <div className={`h-2.5 w-20 ${shimmer}`} />
        </div>
      </div>
      <div className="px-4 pb-3 space-y-2">
        <div className={`h-3 w-full ${shimmer}`} />
        <div className={`h-3 w-2/3 ${shimmer}`} />
      </div>
      <div className={`h-56 mx-4 mb-3 ${shimmer}`} />
      <div className="px-4 pb-3 flex justify-between">
        <div className={`h-8 w-1/3 ${shimmer}`} />
        <div className={`h-8 w-1/4 ${shimmer}`} />
      </div>
    </div>
  );
}

// ========== CREATE POST BOX ==========
function CreatePostBox({ member, onPost, lang }: { member: MemberData | null; onPost: (post: Post) => void; lang: string }) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [cropIndex, setCropIndex] = useState<number>(-1);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const isAr = lang === "ar";

  const handleFileUpload = async (files: FileList, type: "image" | "video") => {
    setUploading(true);
    setError("");
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        setError(isAr ? "لا يُسمح برفع ملفات أكبر من 10 ميجا بايت" : "Maximum file size is 10MB");
        continue;
      }
      if (type === "image" && file.type.startsWith("image/")) {
        // Show cropper for images
        const url = URL.createObjectURL(file);
        setCropImage(url);
        setCropIndex(-1); // -1 means new upload
        continue;
      }
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) { setError(isAr ? "فشل الرفع" : "Upload failed"); continue; }
        const data = await res.json();
        const url = data.files?.[0]?.url || data.urls?.[0];
        if (url) {
          if (type === "video") setVideos((prev) => [...prev, url]);
          else setImages((prev) => [...prev, url]);
        }
      } catch { setError(isAr ? "خطأ في الاتصال" : "Connection error"); }
    }
    setUploading(false);
  };

  const handleCropSave = (croppedUrl: string) => {
    setImages((prev) => [...prev, croppedUrl]);
    setCropImage(null);
  };

  const handlePost = async () => {
    if ((!content.trim() && images.length === 0 && videos.length === 0) || !member) return;
    setPosting(true);
    setError("");
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
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to post");
        return;
      }
      const post = await res.json();
      onPost(post);
      setContent("");
      setImages([]);
      setVideos([]);
      setExpanded(false);
    } catch { setError(isAr ? "خطأ في الاتصال" : "Connection error"); }
    finally { setPosting(false); }
  };

  return (
    <>
      <div className="bg-white dark:bg-[#111927] rounded-2xl shadow-sm border border-gray-100 dark:border-[#1e2d42] overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <Avatar src={member?.image} name={member?.name} size={40} />
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => setExpanded(true)}
                placeholder={isAr ? "بماذا تفكر؟ شاركنا..." : "What's on your mind?"}
                className="w-full bg-gray-100 dark:bg-[#0d1525] rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-[#f1f5f9] placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 border-0 min-h-[48px]"
                rows={expanded ? 3 : 1}
                dir="rtl"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="px-4 pb-2 text-sm text-red-500">{error}</div>
        )}

        {images.length > 0 && (
          <div className="px-4 pb-3">
            <div className="flex gap-2 flex-wrap">
              {images.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                  <Image src={url} alt="" width={80} height={80} className="w-full h-full object-cover" unoptimized />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <button onClick={() => { setCropImage(url); setCropIndex(i); }} className="p-1 bg-white/80 rounded-full"><ImageIcon className="w-3 h-3 text-gray-800" /></button>
                    <button onClick={() => setImages((p) => p.filter((_, j) => j !== i))} className="p-1 bg-white/80 rounded-full"><X className="w-3 h-3 text-red-600" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {videos.length > 0 && (
          <div className="px-4 pb-3">
            <div className="flex gap-2 flex-wrap">
              {videos.map((url, i) => (
                <div key={i} className="relative w-32 h-20 rounded-xl overflow-hidden bg-black group">
                  <video src={url} className="w-full h-full object-cover" />
                  <button onClick={() => setVideos((p) => p.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
              <button onClick={() => fileRef.current?.click()} disabled={uploading} className="p-2 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" title={isAr ? "صورة" : "Photo"}>
                <ImageIcon className="w-5 h-5 text-green-500" />
              </button>
              <button onClick={() => videoRef.current?.click()} disabled={uploading} className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title={isAr ? "فيديو" : "Video"}>
                <Video className="w-5 h-5 text-red-500" />
              </button>
            </div>
            <button
              onClick={handlePost}
              disabled={posting || uploading || (!content.trim() && images.length === 0 && videos.length === 0)}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-full text-sm font-semibold transition-colors flex items-center gap-2"
            >
              {posting ? (isAr ? "جاري النشر..." : "Posting...") : (isAr ? "نشر" : "Post")}
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleFileUpload(e.target.files, "image")} />
        <input ref={videoRef} type="file" accept="video/*" multiple className="hidden" onChange={(e) => e.target.files && handleFileUpload(e.target.files, "video")} />
      </div>

      {/* Image Cropper Modal */}
      {cropImage && (
        <ImageCropper
          src={cropImage}
          onSave={handleCropSave}
          onCancel={() => { setCropImage(null); setCropIndex(-1); }}
          lang={lang}
        />
      )}
    </>
  );
}

// ========== IMAGE CROPPER ==========
function ImageCropper({ src, onSave, onCancel, lang }: { src: string; onSave: (url: string) => void; onCancel: () => void; lang: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [aspect, setAspect] = useState<"free" | "1:1" | "4:3" | "16:9">("free");
  const isAr = lang === "ar";

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setLoaded(true);
    };
    img.src = src;
  }, [src]);

  useEffect(() => {
    if (!loaded || !imgRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = imgRef.current;

    let w = img.naturalWidth;
    let h = img.naturalHeight;

    if (aspect === "1:1") { const s = Math.min(w, h); w = s; h = s; }
    else if (aspect === "4:3") { if (w / h > 4 / 3) { w = h * 4 / 3; } else { h = w * 3 / 4; } }
    else if (aspect === "16:9") { if (w / h > 16 / 9) { w = h * 16 / 9; } else { h = w * 9 / 16; } }

    const maxW = 800;
    const scale = w > maxW ? maxW / w : 1;
    canvas.width = w * scale;
    canvas.height = h * scale;
    ctx.drawImage(img, (img.naturalWidth - w) / 2, (img.naturalHeight - h) / 2, w, h, 0, 0, canvas.width, canvas.height);
  }, [loaded, aspect]);

  const handleSave = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/jpeg", 0.85);
    onSave(url);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div
        className="bg-white dark:bg-[#111927] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 dark:border-[#3b4f6b] flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white">{isAr ? "قص الصورة" : "Crop Image"}</h3>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 dark:hover:bg-[#1e2d42] rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 pb-0">
          <div className="flex gap-2 mb-3 justify-center flex-wrap">
            {(["free", "1:1", "4:3", "16:9"] as const).map((a) => (
              <button key={a} onClick={() => setAspect(a)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${aspect === a ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-[#1e2d42] text-gray-700 dark:text-gray-300"}`}>
                {a === "free" ? (isAr ? "حر" : "Free") : a}
              </button>
            ))}
          </div>
        </div>
        {/* Cropper viewport: fixed height, overflow hidden, never sized by the image */}
        <div className="relative flex-1 min-h-0 h-60 sm:h-72 md:h-80 mx-4 my-3 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-[#0d1525] rounded-xl">
          {!loaded ? (
            <div className="w-8 h-8 border-2 border-gray-300 dark:border-[#3b4f6b] border-t-blue-600 rounded-full animate-spin" />
          ) : (
            <canvas
              ref={canvasRef}
              className="block"
              style={{ maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto" }}
            />
          )}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-[#3b4f6b] flex justify-end gap-2 mt-auto">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e2d42] rounded-xl">{isAr ? "إلغاء" : "Cancel"}</button>
          <button onClick={handleSave} disabled={!loaded} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm rounded-xl font-semibold">{isAr ? "حفظ" : "Save"}</button>
        </div>
      </div>
    </div>
  );
}

// ========== POST CARD ==========
function PostCard({
  post, member, lang, onReact, onShare, onRepost,
}: {
  post: Post; member: MemberData | null; lang: string;
  onReact: (postId: string, type: string) => void;
  onShare: (post: Post) => void;
  onRepost: (post: Post) => void;
}) {
  const isAr = lang === "ar";
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const images = parseMedia(post.images);
  const videos = parseMedia(post.videos);
  const totalReactions = Object.values(post.reactionSummary || {}).reduce((a, b) => a + b, 0);
  const shownComments = commentCount || post._count?.comments || 0;
  const isOwner = !!member && post.authorId === member.id;
  const needsCollapse = (post.content?.length || 0) > 220;

  const labels = isAr
    ? { like: "أعجبني", love: "أحببته", haha: "ضحك", wow: "مدهش", sad: "محزن", angry: "غاضب" }
    : { like: "Like", love: "Love", haha: "Haha", wow: "Wow", sad: "Sad", angry: "Angry" };

  const author = post.author || { id: "", name: isAr ? "عضو" : "Member", image: null };
  const postUrl = `${location.origin}/${lang}/posts/${post.id}`;

  const handleLikeDoubleTap = useCallback(() => {
    // Double-tap on media should like (never unlike)
    if (!member) {
      window.location.assign(`/auth/login?callbackUrl=${encodeURIComponent(`/${lang}/posts/${post.id}`)}`);
      return;
    }
    if (post.myReaction !== "like") onReact(post.id, "like");
    toast.success(isAr ? "أعجبك هذا المنشور" : "You liked this post");
  }, [member, post.id, post.myReaction, onReact, isAr, lang]);

  // close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(postUrl); toast.success(isAr ? "تم نسخ الرابط" : "Link copied"); }
    catch { window.prompt(isAr ? "انسخ الرابط" : "Copy link", postUrl); }
    setMenuOpen(false);
  };

  const handleDelete = async () => {
    if (!member) return;
    setDeleting(true);
    try {
      await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      toast.success(isAr ? "تم حذف المنشور" : "Post deleted");
      window.location.reload();
    } catch {
      toast.error(isAr ? "فشل حذف المنشور" : "Failed to delete post");
    } finally { setDeleting(false); }
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.35 }}
        className="bg-white dark:bg-[#111927] rounded-2xl shadow-sm border border-gray-100 dark:border-[#1e2d42]"
      >
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar src={author.image} name={author.name} size={44} />
              <div className="min-w-0">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-[#f1f5f9] truncate">
                  {author.name}
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>{timeAgo(post.createdAt, isAr)}</span>
                  {post.editedAt && <span aria-hidden>·</span>}
                  {post.editedAt && <span>{isAr ? "معدل" : "edited"}</span>}
                  <span aria-hidden>·</span>
                  <Globe className="w-3 h-3" aria-label={isAr ? "عام" : "Public"} />
                </div>
              </div>
            </div>
            {/* More menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1e2d42] transition-colors"
                aria-label={isAr ? "المزيد من الخيارات" : "More options"}
                aria-expanded={menuOpen}
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-11 z-30 w-52 bg-white dark:bg-[#1a2440] rounded-xl shadow-xl border border-gray-100 dark:border-[#2a3f5f] overflow-hidden"
                    role="menu"
                  >
                    <button role="menuitem" onClick={copyLink} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2a3f5f] transition-colors">
                      <Link2 className="w-4 h-4 text-gray-400" /> {isAr ? "نسخ الرابط" : "Copy link"}
                    </button>
                    {member && (
                      <button role="menuitem" onClick={() => { toast.success(isAr ? "تم الحفظ" : "Saved"); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2a3f5f] transition-colors">
                        <Bookmark className="w-4 h-4 text-gray-400" /> {isAr ? "حفظ المنشور" : "Save post"}
                      </button>
                    )}
                    <button role="menuitem" onClick={() => { toast.message(isAr ? "تم إخفاء المنشور" : "Post hidden"); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2a3f5f] transition-colors">
                      <EyeOff className="w-4 h-4 text-gray-400" /> {isAr ? "إخفاء المنشور" : "Hide post"}
                    </button>
                    <button role="menuitem" onClick={() => { toast.message(isAr ? "تم إرسال البلاغ" : "Report sent"); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Flag className="w-4 h-4" /> {isAr ? "الإبلاغ" : "Report"}
                    </button>
                    {isOwner && <div className="h-px bg-gray-100 dark:bg-[#2a3f5f]" />}
                    {isOwner && (
                      <button role="menuitem" onClick={async () => {
                        setMenuOpen(false);
                        const newContent = window.prompt(isAr ? "عدّل نص المنشور" : "Edit post text", post.content || "");
                        if (newContent === null || !member) return;
                        try {
                          const res = await fetch(`/api/posts/${post.id}`, {
                            method: "PUT", headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ content: newContent, authorId: member.id }),
                          });
                          if (res.ok) { toast.success(isAr ? "تم التعديل" : "Post updated"); window.location.reload(); }
                          else { const d = await res.json().catch(() => null); toast.error(d?.error || (isAr ? "فشل التعديل" : "Failed to update")); }
                        } catch { toast.error(isAr ? "فشل التعديل" : "Failed to update"); }
                      }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2a3f5f] transition-colors">
                        <Pencil className="w-4 h-4 text-gray-400" /> {isAr ? "تعديل" : "Edit"}
                      </button>
                    )}
                    {isOwner && (
                      <button role="menuitem" onClick={() => { setConfirmDelete(true); setMenuOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <Trash2 className="w-4 h-4" /> {isAr ? "حذف" : "Delete"}
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Content with long-text collapse */}
        {post.content && (
          <div className="px-4 pb-3">
            <p
              className={`text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed ${!expanded && needsCollapse ? "line-clamp-5" : ""}`}
              dir="rtl"
              dangerouslySetInnerHTML={{ __html: highlightMentions(post.content) }}
            />
            {needsCollapse && (
              <button onClick={() => setExpanded((e) => !e)} className="mt-1 text-blue-600 dark:text-blue-400 font-medium text-sm hover:underline">
                {expanded ? (isAr ? "عرض أقل" : "Show less") : (isAr ? "عرض المزيد" : "Show more")}
              </button>
            )}
          </div>
        )}

        {/* Repost */}
        {post.originalPost && (
          <div className="mx-4 mb-3 bg-gray-50 dark:bg-[#0d1525] rounded-xl border border-gray-200 dark:border-[#1e2d42] p-3">
            <div className="flex items-center gap-2 mb-2">
              <Repeat2 className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">{isAr ? "أعاد نشر" : "Reposted from"} {post.originalPost.author?.name || (isAr ? "عضو" : "Member")}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3" dir="rtl">{post.originalPost.content}</p>
          </div>
        )}

        {/* Image Grid */}
        {images.length > 0 && (
          <div className={`grid gap-0.5 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
            {images.slice(0, 4).map((url, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.99 }}
                onClick={() => setLightbox({ images, index: i })}
                type="button"
                aria-label={isAr ? "فتح الصورة" : "Open image"}
                className={`relative cursor-pointer overflow-hidden group ${images.length === 1 ? "aspect-video" : "aspect-square"}`}
              >
                <ProgressiveImage src={url} alt="" aspectClass={images.length === 1 ? "aspect-video" : "aspect-square"} className="group-hover:scale-105 transition-transform duration-300" />
                {i === 3 && images.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">{isAr ? `+${images.length - 4} صور` : `+${images.length - 4}`}</span>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        )}

        {/* Videos */}
        {videos.length > 0 && (
          <div className="space-y-2">
            {videos.map((url, i) => (
              <video key={i} src={url} controls preload="metadata" className="w-full rounded-xl max-h-[400px] object-cover bg-black" />
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-[#1e2d42]">
          <div className="flex items-center gap-1">
            {totalReactions > 0 ? (
              <>
                <div className="flex -space-x-1">
                  {Object.entries(post.reactionSummary || {}).sort(([, a], [, b]) => b - a).slice(0, 3).map(([type]) => (
                    <motion.span key={type} initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="text-sm">{REACTION_EMOJIS[type] || "👍"}</motion.span>
                  ))}
                </div>
                <span>{totalReactions}</span>
              </>
            ) : (
              <span>{isAr ? "كن أول من يتفاعل" : "Be the first to react"}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {shownComments ? <span>{shownComments} {isAr ? "تعليق" : "comments"}</span> : null}
            {post.sharesCount ? <span>{post.sharesCount} {isAr ? "مشاركة" : "shares"}</span> : null}
          </div>
        </div>

        {/* Actions */}
        <div className="px-2 py-1 flex items-stretch border-t border-gray-100 dark:border-[#1e2d42]">
          <ReactionButton
            postId={post.id}
            myReaction={post.myReaction ?? null}
            isArabic={isAr}
            labels={labels}
            onReact={onReact}
            canReact={!!member}
            onRequireLogin={() => window.location.assign(`/auth/login?callbackUrl=${encodeURIComponent(`/${lang}/posts/${post.id}`)}`)}
            className="flex-1"
          />
          <button onClick={() => setShowComments((s) => !s)} className="flex-1 py-2.5 flex items-center justify-center gap-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e2d42] transition-colors active:scale-95">
            <MessageCircle className="w-5 h-5" />
            {isAr ? "تعليق" : "Comment"}
          </button>
          <button onClick={() => onShare(post)} className="flex-1 py-2.5 flex items-center justify-center gap-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e2d42] transition-colors active:scale-95">
            <Share2 className="w-5 h-5" />
            {isAr ? "مشاركة" : "Share"}
          </button>
        </div>

        {/* Comments */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="border-t border-gray-100 dark:border-[#1e2d42] overflow-hidden"
            >
              <div className="px-4 py-3 max-h-96 overflow-y-auto">
                <CommentsSection
                  postId={post.id}
                  lang={lang}
                  member={member}
                  onCountChange={(n) => setCommentCount(n)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete confirm */}
        <AnimatePresence>
          {confirmDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4"
              onClick={() => setConfirmDelete(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="bg-white dark:bg-[#1a2440] rounded-2xl w-full max-w-sm p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{isAr ? "حذف المنشور؟" : "Delete post?"}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{isAr ? "لا يمكن التراجع عن هذا الإجراء." : "This action cannot be undone."}</p>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a3f5f] rounded-xl">{isAr ? "إلغاء" : "Cancel"}</button>
                  <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold disabled:opacity-50">
                    {deleting ? (isAr ? "جاري..." : "Deleting...") : (isAr ? "حذف" : "Delete")}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>

      {/* Media Viewer */}
      {lightbox && (
        <MediaViewer
          images={lightbox.images}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onLike={handleLikeDoubleTap}
          liked={post.myReaction === "like"}
          isArabic={isAr}
          caption={{ authorName: author.name, authorImage: author.image, text: post.content }}
        />
      )}
    </>
  );
}

// ========== REPOST MODAL ==========
function RepostModal({ post, member, lang, onClose, onPost }: { post: Post; member: MemberData; lang: string; onClose: () => void; onPost: (p: Post) => void }) {
  const isAr = lang === "ar";
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
      if (res.ok) {
        const newPost = await res.json();
        onPost(newPost);
        onClose();
      }
    } finally { setPosting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#111927] rounded-2xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 dark:border-[#3b4f6b] flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white">{isAr ? "إعادة نشر" : "Repost"}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-[#1e2d42] rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={isAr ? "أضف تعليقاً..." : "Add a comment..."}
            className="w-full bg-gray-50 dark:bg-[#0d1525] rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-[#f1f5f9] placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[80px]" dir="rtl" />
          <div className="mt-3 bg-gray-50 dark:bg-[#0d1525] rounded-xl p-3 border border-gray-200 dark:border-[#1e2d42]">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{isAr ? "المشاركة الأصلية" : "Original post"}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3" dir="rtl">{post.content}</p>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-[#3b4f6b] flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e2d42] rounded-xl">{isAr ? "إلغاء" : "Cancel"}</button>
          <button onClick={handleRepost} disabled={posting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl font-semibold disabled:opacity-50">
            {posting ? (isAr ? "جاري النشر..." : "Posting...") : (isAr ? "نشر" : "Post")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== SHARE MODAL ==========
function ShareModal({ post, member, lang, onClose, onRepost, onShared }: {
  post: Post; member: MemberData; lang: string; onClose: () => void;
  onRepost: (post: Post) => void; onShared: (postId: string) => void;
}) {
  const isAr = lang === "ar";
  const [sharing, setSharing] = useState(false);

  const postUrl = typeof window !== "undefined"
    ? `${window.location.origin}/${lang}/posts/${post.id}`
    : "";

  const recordShare = async (): Promise<boolean> => {
    try {
      const res = await fetch(`/api/posts/${post.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && (data?.shared !== undefined ? data.shared : true)) {
        onShared(post.id);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleShare = async () => {
    setSharing(true);
    const recorded = await recordShare();
    try {
      // Prefer the native Web Share API when available
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ url: postUrl });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(postUrl);
        toast.success(isAr ? "تم نسخ رابط المشاركة" : "Share link copied");
      }
      if (recorded) {
        toast.success(isAr ? "تمت مشاركة المنشور" : "Post shared");
      }
    } catch {
      // User dismissed the native share sheet or clipboard failed
      if (recorded) {
        toast.success(isAr ? "تمت مشاركة المنشور" : "Post shared");
      }
    } finally {
      setSharing(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#111927] rounded-2xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 dark:border-[#3b4f6b] flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white">{isAr ? "مشاركة المنشور" : "Share Post"}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-[#1e2d42] rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-3">
          <button
            onClick={handleShare}
            disabled={sharing}
            className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div className="text-start flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{isAr ? "مشاركة عبر رابط" : "Share via link"}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? "نسخ الرابط أو مشاركته عبر التطبيقات" : "Copy the link or share it with other apps"}</p>
            </div>
          </button>
          <button
            onClick={() => { onClose(); onRepost(post); }}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-[#1e2d42] hover:bg-gray-100 dark:hover:bg-[#2a3f5f] rounded-xl transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0">
              <Repeat2 className="w-5 h-5" />
            </div>
            <div className="text-start flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{isAr ? "إعادة نشر" : "Repost"}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? "نشر المنشور على ملفك الشخصي" : "Publish this post on your profile"}</p>
            </div>
          </button>
          <div className="bg-gray-50 dark:bg-[#0d1525] rounded-xl p-3 border border-gray-200 dark:border-[#1e2d42]">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{isAr ? "المشاركة الأصلية" : "Original post"}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3" dir="rtl">{post.content}</p>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-[#3b4f6b] flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e2d42] rounded-xl">{isAr ? "إلغاء" : "Cancel"}</button>
        </div>
      </div>
    </div>
  );
}

// ========== MAIN PAGE ==========
export default function PostsFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { member } = useMember();
  const [lang, setLang] = useState("ar");
  const [repostPost, setRepostPost] = useState<Post | null>(null);
  const [sharePost, setSharePost] = useState<Post | null>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") || "ar";
    setLang(savedLang);
  }, []);

  const fetchPosts = useCallback(async (pageNum: number, append = false) => {
    setLoading(true);
    try {
      const memberParam = member?.id ? `&memberId=${encodeURIComponent(member.id)}` : "";
      const res = await fetch(`/api/posts?page=${pageNum}&limit=10${memberParam}`);
      if (!res.ok) return;
      const data = await res.json();
      const list = data.data || [];
      if (append) setPosts((prev) => [...prev, ...list]);
      else setPosts(list);
      setHasMore(data.pagination?.hasMore ?? false);
    } catch {} finally { setLoading(false); }
  }, [member?.id]);

  useEffect(() => { fetchPosts(1); }, [fetchPosts]);

  const isAr = lang === "ar";

  const handleReact = async (postId: string, type: string) => {
    if (!member) return;
    // Optimistic update with rollback
    const prevState = posts.find((p) => p.id === postId);
    const optimisticSummary = { ...(prevState?.reactionSummary || {}) };
    let prevCount = 0;
    Object.values(optimisticSummary).forEach((n) => (prevCount += n));
    const prevReaction = prevState?.myReaction ?? null;
    if (prevReaction && prevReaction === type) {
      // Removing reaction
      optimisticSummary[type] = (optimisticSummary[type] || 1) - 1;
      if (optimisticSummary[type] <= 0) delete optimisticSummary[type];
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, reactionSummary: { ...optimisticSummary }, myReaction: null } : p)));
    } else {
      // Adding or switching reaction
      if (prevReaction && optimisticSummary[prevReaction]) {
        optimisticSummary[prevReaction] -= 1;
        if (optimisticSummary[prevReaction] <= 0) delete optimisticSummary[prevReaction];
      }
      optimisticSummary[type] = (optimisticSummary[type] || 0) + 1;
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, reactionSummary: { ...optimisticSummary }, myReaction: type } : p)));
    }
    try {
      const res = await fetch(`/api/posts/${postId}/react`, {
        method: "POST", headers: { "Content-Type": "application/json" },
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
    } catch {
      // Rollback
      setPosts((prev) => prev.map((p) => (p.id === postId && prevState ? { ...p, reactionSummary: prevState.reactionSummary, myReaction: prevReaction } : p)));
    }
  };

  const handleShared = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, sharesCount: (p._count?.shares ?? p.sharesCount ?? 0) + 1 } : p))
    );
  };

  const handleNewPost = (post: Post) => {
    setPosts((prev) => [post, ...prev]);
  };

  return (
    <div className={`min-h-screen ${isAr ? "" : ""} bg-gray-50 dark:bg-[#0a0f1a]`} dir={isAr ? "rtl" : "ltr"}>
      <ScrollReveal direction="up"><div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isAr ? "المنشورات" : "Posts"}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{isAr ? "شارك وأتفاعل مع مجتمع الخريجين" : "Share and interact with the alumni community"}</p>
        </div>

        <CreatePostBox member={member} onPost={handleNewPost} lang={lang} />

        {loading && posts.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <PostCardSkeleton key={i} isAr={isAr} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} member={member} lang={lang} onReact={handleReact} onShare={setSharePost} onRepost={setRepostPost} />
            ))}
          </div>
        )}

        {hasMore && (
          <div className="text-center py-4">
            <button onClick={() => { setPage((p) => p + 1); fetchPosts(page + 1, true); }} disabled={loading}
              className="px-6 py-2.5 bg-white dark:bg-[#111927] border border-gray-200 dark:border-[#1e2d42] rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1e2d42] transition-colors disabled:opacity-50">
              {loading ? (isAr ? "جاري التحميل..." : "Loading...") : (isAr ? "تحميل المزيد" : "Load More")}
            </button>
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-[#1e2d42] rounded-full flex items-center justify-center"><MessageCircle className="w-10 h-10 text-gray-400" /></div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{isAr ? "لا توجد منشورات بعد" : "No posts yet"}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{isAr ? "كن أول من ينشر!" : "Be the first to post!"}</p>
          </div>
        )}
      </div>

      </ScrollReveal>
      {repostPost && member && (
        <RepostModal post={repostPost} member={member} lang={lang} onClose={() => setRepostPost(null)} onPost={handleNewPost} />
      )}
      {sharePost && member && (
        <ShareModal post={sharePost} member={member} lang={lang} onClose={() => setSharePost(null)} onRepost={setRepostPost} onShared={handleShared} />
      )}

      <style jsx global>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
