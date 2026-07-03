"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import Image from "next/image";
import ScrollReveal from "@/components/ui/scroll-reveal";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Download,
  Maximize2,
  Play,
  FileText,
  ExternalLink,
  Film,
  Camera,
  FolderOpen,
  Eye,
  Image as ImageIcon,
  Grid3X3,
  LayoutGrid,
  Search,
  Loader2,
} from "lucide-react";

interface GalleryItem {
  id: string | number;
  title?: string;
  description?: string;
  type?: string;
  imageUrl?: string;
  fileUrl?: string | null;
  thumbnailUrl?: string;
  album?: string;
  tags?: string;
  date?: string;
  createdAt?: string;
  [key: string]: unknown;
}

function isYouTube(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/.test(url);
}

function getYouTubeEmbed(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function isVimeo(url: string): boolean {
  return /vimeo\.com/.test(url);
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg)$/i.test(url) || isYouTube(url) || isVimeo(url);
}

function isPdf(url: string): boolean {
  return /\.pdf$/i.test(url);
}

function getMediaType(item: GalleryItem): "image" | "video" | "document" {
  if (item.type === "video" || (item.fileUrl && isVideoUrl(item.fileUrl)))
    return "video";
  if (item.type === "document") return "document";
  return "image";
}

export default function GalleryClient({
  items,
  isArabic,
}: {
  items: GalleryItem[];
  isArabic: boolean;
}) {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [activeAlbum, setActiveAlbum] = useState<string>("all");
  const [activeMedia, setActiveMedia] = useState<"all" | "image" | "video" | "document">("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [layout, setLayout] = useState<"masonry" | "grid">("masonry");
  const thumbScrollRef = useRef<HTMLDivElement>(null);

  const albums = useMemo(
    () => Array.from(new Set(items.map((i) => i.album).filter(Boolean))),
    [items]
  );

  const albumLabels: Record<string, string> = {
    general: isArabic ? "عام" : "General",
    conferences: isArabic ? "مؤتمرات" : "Conferences",
    events: isArabic ? "فعاليات" : "Events",
    campus: isArabic ? "الحرم الجامعي" : "Campus",
  };

  const getAlbumLabel = (album: string) => albumLabels[album] || album;

  const stats = useMemo(() => {
    const images = items.filter((i) => getMediaType(i) === "image").length;
    const videos = items.filter((i) => getMediaType(i) === "video").length;
    const docs = items.filter((i) => getMediaType(i) === "document").length;
    return { images, videos, docs, total: items.length };
  }, [items]);

  const albumCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    for (const item of items) {
      const album = item.album || "general";
      counts[album] = (counts[album] || 0) + 1;
    }
    return counts;
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = items;
    if (activeAlbum !== "all") {
      result = result.filter((i) => i.album === activeAlbum);
    }
    if (activeMedia !== "all") {
      result = result.filter((i) => getMediaType(i) === activeMedia);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q) ||
          i.tags?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, activeAlbum, activeMedia, searchQuery]);

  const openLightbox = (item: GalleryItem) => {
    const idx = filteredItems.findIndex((i) => i.id === item.id);
    setSelectedIndex(idx >= 0 ? idx : 0);
    setSelectedItem(item);
  };

  const navigate = useCallback(
    (dir: "next" | "prev") => {
      const len = filteredItems.length;
      if (len === 0) return;
      setSelectedIndex((prev) => {
        const next =
          dir === "next" ? (prev + 1) % len : (prev - 1 + len) % len;
        setSelectedItem(filteredItems[next]);
        return next;
      });
    },
    [filteredItems]
  );

  useEffect(() => {
    if (!selectedItem) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedItem(null);
      if (e.key === "ArrowLeft") navigate(isArabic ? "prev" : "next");
      if (e.key === "ArrowRight") navigate(isArabic ? "next" : "prev");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedItem, navigate, isArabic]);

  useEffect(() => {
    if (thumbScrollRef.current) {
      const active =
        thumbScrollRef.current.children[selectedIndex] as HTMLElement;
      if (active)
        active.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
    }
  }, [selectedIndex]);

  function renderLightboxContent(item: GalleryItem) {
    const mediaType = getMediaType(item);

    if (mediaType === "video") {
      const url = item.fileUrl || item.imageUrl || "";
      if (isYouTube(url)) {
        return (
          <div
            className="w-full max-w-4xl aspect-video mx-auto animate-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={getYouTubeEmbed(url)}
              className="w-full h-full rounded-2xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
      if (isVimeo(url)) {
        const vimeoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
        return (
          <div
            className="w-full max-w-4xl aspect-video mx-auto animate-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}`}
              className="w-full h-full rounded-2xl"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        );
      }
      return (
        <div
          className="w-full max-w-4xl mx-auto animate-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <video
            src={url}
            controls
            className="w-full rounded-2xl"
            poster={item.thumbnailUrl || item.imageUrl}
          />
        </div>
      );
    }

    if (mediaType === "document") {
      const url = item.fileUrl || item.imageUrl || "";
      if (isPdf(url)) {
        return (
          <div
            className="w-full max-w-4xl mx-auto animate-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={url}
              className="w-full h-[80vh] rounded-2xl border border-white/10"
            />
          </div>
        );
      }
      return (
        <div
          className="text-center py-12 animate-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-12 h-12 text-white/40" />
          </div>
          <p className="text-white text-xl font-bold mb-2">{item.title}</p>
          <p className="text-white/50 text-sm mb-8">
            {item.description || ""}
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-2xl transition-all duration-300 border border-white/10"
          >
            <ExternalLink className="w-5 h-5" />{" "}
            {isArabic ? "فتح المستند" : "Open Document"}
          </a>
        </div>
      );
    }

    const imgUrl = item.imageUrl || "";
    return (
      <div className="max-w-5xl max-h-full flex items-center justify-center mx-auto animate-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={item.title || ""}
            className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-2xl shadow-2xl"
            key={String(item.id)}
          />
        ) : (
          <div className="w-96 h-96 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
            <ImageIcon className="w-20 h-20 text-white/20" />
          </div>
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <section className="py-6 pb-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-surface rounded-3xl flex items-center justify-center mx-auto mb-6 border border-border">
              <ImageIcon className="w-12 h-12 text-text-light" />
            </div>
            <h3 className="text-xl font-bold text-text mb-2">
              {isArabic ? "لا توجد عناصر" : "No items found"}
            </h3>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Stats Bar */}
      <ScrollReveal direction="up">
      <section className="py-6 bg-white border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-black text-blue-700">{stats.images}</div>
                <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">{isArabic ? "صورة" : "Photos"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/50">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shrink-0">
                <Film className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-black text-purple-700">{stats.videos}</div>
                <div className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">{isArabic ? "فيديو" : "Videos"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-200/50">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-black text-amber-700">{stats.docs}</div>
                <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">{isArabic ? "مستند" : "Docs"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200/50">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-black text-emerald-700">{stats.total}</div>
                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{isArabic ? "الكل" : "Total"}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* Filters Bar */}
      <section className="py-4 bg-surface border-b border-border sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setActiveAlbum("all")}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeAlbum === "all"
                    ? "bg-primary text-white shadow-md"
                    : "bg-background text-text-secondary hover:bg-primary/5 border border-border"
                }`}
              >
                {isArabic ? "الكل" : "All"}
                <span className="ms-1 text-[10px] opacity-70">{albumCounts.all}</span>
              </button>
              {albums.map((album) => (
                <button
                  key={album}
                  onClick={() => setActiveAlbum(album || "all")}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    activeAlbum === album
                      ? "bg-primary text-white shadow-md"
                      : "bg-background text-text-secondary hover:bg-primary/5 border border-border"
                  }`}
                >
                  {getAlbumLabel(album)}
                  <span className="ms-1 text-[10px] opacity-70">{albumCounts[album] || 0}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                <input
                  type="text"
                  placeholder={isArabic ? "بحث..." : "Search..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm text-text placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex bg-background border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setLayout("masonry")}
                  className={`p-2 transition-colors ${layout === "masonry" ? "bg-primary text-white" : "text-text-light hover:text-text"}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLayout("grid")}
                  className={`p-2 transition-colors ${layout === "grid" ? "bg-primary text-white" : "text-text-light hover:text-text"}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {(["all", "image", "video", "document"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setActiveMedia(type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                  activeMedia === type
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-background text-text-secondary hover:bg-primary/5 border border-border"
                }`}
              >
                {type === "all" ? <Eye className="w-3 h-3" /> : type === "image" ? <Camera className="w-3 h-3" /> : type === "video" ? <Film className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                {type === "all" ? (isArabic ? "الكل" : "All") : type === "image" ? (isArabic ? "صور" : "Photos") : type === "video" ? (isArabic ? "فيديوهات" : "Videos") : (isArabic ? "مستندات" : "Documents")}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid - Pinterest Masonry */}
      <section className="py-6 pb-16 bg-background">
        <div className="container mx-auto px-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-24 h-24 bg-surface rounded-3xl flex items-center justify-center mx-auto mb-6 border border-border">
                <ImageIcon className="w-12 h-12 text-text-light" />
              </div>
              <h3 className="text-xl font-bold text-text mb-2">
                {isArabic ? "لا توجد نتائج" : "No results"}
              </h3>
              <p className="text-text-secondary text-sm">
                {isArabic ? "جرب تغيير الفلتر أو البحث" : "Try changing the filter or search"}
              </p>
            </div>
          ) : layout === "masonry" ? (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
              {filteredItems.map((item) => {
                const mediaType = getMediaType(item);
                const thumbSrc = item.thumbnailUrl || item.imageUrl || "";

                return (
                  <div
                    key={item.id}
                    onClick={() => openLightbox(item)}
                    className="break-inside-avoid group relative rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500"
                  >
                    {mediaType === "video" ? (
                      <>
                        {thumbSrc ? (
                          <img src={thumbSrc} alt={item.title || ""} className="w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" loading="lazy" />
                        ) : (
                          <div className="w-full aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                            <Play className="w-16 h-16 text-white/20" />
                          </div>
                        )}
                      </>
                    ) : thumbSrc ? (
                      <img src={thumbSrc} alt={item.title || ""} className="w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" loading="lazy" />
                    ) : (
                      <div className="w-full aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-primary/30" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold rounded-full border border-white/10">
                        {mediaType === "video" ? <Play className="w-3 h-3" fill="white" /> : mediaType === "document" ? <FileText className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                        {mediaType === "video" ? (isArabic ? "فيديو" : "Video") : mediaType === "document" ? (isArabic ? "مستند" : "Doc") : (isArabic ? "صورة" : "Photo")}
                      </span>
                      <div className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
                        <Maximize2 className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {mediaType === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-500 shadow-2xl">
                          <Play className="w-7 h-7 text-white ms-1" fill="white" />
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-0 inset-x-0 p-4 z-10 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      {item.title && (
                        <h3 className="font-bold text-white text-sm leading-tight mb-1">
                          {item.title}
                        </h3>
                      )}
                      <div className="flex items-center gap-2 text-white/60 text-[11px]">
                        {item.album && (
                          <span className="inline-flex items-center gap-1">
                            <FolderOpen className="w-3 h-3" />
                            {getAlbumLabel(item.album)}
                          </span>
                        )}
                        {item.createdAt && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.createdAt).toLocaleDateString(isArabic ? "ar-SA" : "en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => {
                const mediaType = getMediaType(item);
                const thumbSrc = item.thumbnailUrl || item.imageUrl || "";

                return (
                  <div
                    key={item.id}
                    onClick={() => openLightbox(item)}
                    className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500"
                  >
                    {mediaType === "video" ? (
                      <>
                        {thumbSrc ? (
                          <img src={thumbSrc} alt={item.title || ""} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" loading="lazy" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                            <Play className="w-16 h-16 text-white/20" />
                          </div>
                        )}
                      </>
                    ) : thumbSrc ? (
                      <img src={thumbSrc} alt={item.title || ""} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-primary/30" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

                    <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold rounded-full border border-white/10">
                        {mediaType === "video" ? <Play className="w-3 h-3" fill="white" /> : mediaType === "document" ? <FileText className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                        {mediaType === "video" ? (isArabic ? "فيديو" : "Video") : mediaType === "document" ? (isArabic ? "مستند" : "Doc") : (isArabic ? "صورة" : "Photo")}
                      </span>
                      <div className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                        <Maximize2 className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {mediaType === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-500 shadow-2xl">
                          <Play className="w-7 h-7 text-white ms-1" fill="white" />
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-0 inset-x-0 p-4 z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      {item.title && (
                        <h3 className="font-bold text-white text-sm leading-tight mb-1">
                          {item.title}
                        </h3>
                      )}
                      <div className="flex items-center gap-2 text-white/60 text-[11px]">
                        {item.album && (
                          <span className="inline-flex items-center gap-1">
                            <FolderOpen className="w-3 h-3" />
                            {getAlbumLabel(item.album)}
                          </span>
                        )}
                        {item.createdAt && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.createdAt).toLocaleDateString(isArabic ? "ar-SA" : "en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col animate-in fade-in duration-200"
          onClick={() => setSelectedItem(null)}
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-black/40 backdrop-blur-md shrink-0 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
                <span className="text-white font-black text-sm">{selectedIndex + 1}</span>
                <span className="text-white/40 text-sm">/</span>
                <span className="text-white/60 text-sm">{filteredItems.length}</span>
              </div>
              {selectedItem.title && (
                <span className="text-white/80 text-sm font-medium hidden sm:inline truncate max-w-[300px]">
                  {selectedItem.title}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {(selectedItem.imageUrl || selectedItem.fileUrl) && (
                <a
                  href={selectedItem.fileUrl || selectedItem.imageUrl}
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="p-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                >
                  <Download className="w-5 h-5" />
                </a>
              )}
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center relative min-h-0 px-4 py-4">
            <button
              onClick={(e) => { e.stopPropagation(); navigate("prev"); }}
              className="absolute start-2 sm:start-6 z-10 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all duration-300 border border-white/10 hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {renderLightboxContent(selectedItem)}

            <button
              onClick={(e) => { e.stopPropagation(); navigate("next"); }}
              className="absolute end-2 sm:end-6 z-10 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all duration-300 border border-white/10 hover:scale-110"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {selectedItem.description && (
            <div className="px-6 py-3 text-center shrink-0">
              <p className="text-white/60 text-sm">{selectedItem.description}</p>
            </div>
          )}

          {filteredItems.length > 1 && (
            <div
              ref={thumbScrollRef}
              className="flex gap-2 px-4 sm:px-6 py-4 overflow-x-auto shrink-0 bg-black/40 backdrop-blur-md justify-center border-t border-white/5 scroll-smooth no-scrollbar"
              style={{ scrollSnapType: "x mandatory" }}
              onClick={(e) => e.stopPropagation()}
            >
              {filteredItems.map((item, i) => {
                const mediaType = getMediaType(item);
                const isActive = i === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIndex(i);
                      setSelectedItem(filteredItems[i]);
                    }}
                    style={{ scrollSnapAlign: "center" }}
                    className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 relative ${
                      isActive ? "border-secondary scale-110 shadow-lg shadow-secondary/30" : "border-white/10 opacity-40 hover:opacity-80 hover:border-white/30"
                    }`}
                  >
                    {item.thumbnailUrl || item.imageUrl ? (
                      <img src={item.thumbnailUrl || item.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/10 flex items-center justify-center">
                        {mediaType === "video" ? <Play className="w-4 h-4 text-white" /> : <FileText className="w-4 h-4 text-white" />}
                      </div>
                    )}
                    {mediaType === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 bg-black/40 rounded-full flex items-center justify-center">
                          <Play className="w-3 h-3 text-white ms-0.5" fill="white" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}
