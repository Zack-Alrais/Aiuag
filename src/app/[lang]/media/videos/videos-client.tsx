"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"
import { Play, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import VideoPlayer, { VideoItem } from "@/components/ui/video-player"

function getYoutubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?#]+)/)
  return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null
}

export default function VideosClient({
  videos,
  isArabic,
}: {
  videos: VideoItem[]
  isArabic: boolean
}) {
  const [activeCategory, setActiveCategory] = useState("all")
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(videos[0] || null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const categoryLabels: Record<string, string> = {
    conferences: isArabic ? "مؤتمرات" : "Conferences",
    lectures: isArabic ? "محاضرات" : "Lectures",
    events: isArabic ? "فعاليات" : "Events",
  }

  const categories = [
    { id: "all", label: isArabic ? "الكل" : "All" },
    { id: "conferences", label: isArabic ? "مؤتمرات" : "Conferences" },
    { id: "lectures", label: isArabic ? "محاضرات" : "Lectures" },
    { id: "events", label: isArabic ? "فعاليات" : "Events" },
  ]

  const filteredVideos = activeCategory === "all" ? videos : videos.filter((v) => v.category === activeCategory)

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId)
    const newFiltered = catId === "all" ? videos : videos.filter((v) => v.category === catId)
    if (newFiltered.length > 0) {
      setSelectedVideo(newFiltered[0])
      setSelectedIndex(0)
    }
  }

  const handleVideoSelect = useCallback((video: VideoItem) => {
    const idx = filteredVideos.findIndex((v) => v.id === video.id)
    setSelectedVideo(video)
    setSelectedIndex(idx >= 0 ? idx : 0)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [filteredVideos])

  const handleNavigate = useCallback((index: number) => {
    if (filteredVideos[index]) {
      setSelectedVideo(filteredVideos[index])
      setSelectedIndex(index)
      const thumbEl = scrollRef.current?.children[index] as HTMLElement
      if (thumbEl) thumbEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
    }
  }, [filteredVideos])

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 5)
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5)
    }
  }

  useEffect(() => { checkScroll() }, [filteredVideos])

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.7
      scrollRef.current.scrollBy({ left: dir === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" })
      setTimeout(checkScroll, 400)
    }
  }

  if (videos.length === 0) {
    return (
      <section className="py-6 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center py-20 text-text-secondary">
            <Play className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">{isArabic ? "لا توجد فيديوهات حالياً" : "No videos available yet"}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="sticky top-20 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 py-3 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "bg-surface text-text-secondary hover:bg-primary/10 hover:text-primary border border-border"
                }`}
              >
                {cat.label}
                {cat.id !== "all" && (
                  <span className="ms-1.5 text-xs opacity-60">
                    {videos.filter((v) => v.category === cat.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-6 bg-background">
        <div className="container mx-auto px-4">
          {selectedVideo && (
            <VideoPlayer
              video={selectedVideo}
              queue={filteredVideos}
              currentIndex={selectedIndex}
              onNavigate={handleNavigate}
              isArabic={isArabic}
              categoryLabels={categoryLabels}
            />
          )}

          <div className="mt-8 relative group/scroll">
            <h3 className="text-lg font-bold text-text mb-4">
              {isArabic ? "جميع الفيديوهات" : "All Videos"}
              <span className="ms-2 text-sm font-normal text-text-secondary">({filteredVideos.length})</span>
            </h3>

            {canScrollLeft && (
              <button onClick={() => scroll("left")}
                className="absolute start-0 top-10 z-10 w-10 h-10 bg-surface/90 backdrop-blur-sm border border-border rounded-full flex items-center justify-center shadow-lg hover:bg-primary hover:text-white hover:border-primary transition-all opacity-0 group-hover/scroll:opacity-100">
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
            {canScrollRight && (
              <button onClick={() => scroll("right")}
                className="absolute end-0 top-10 z-10 w-10 h-10 bg-surface/90 backdrop-blur-sm border border-border rounded-full flex items-center justify-center shadow-lg hover:bg-primary hover:text-white hover:border-primary transition-all opacity-0 group-hover/scroll:opacity-100">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <div ref={scrollRef} onScroll={checkScroll}
              className="flex gap-4 overflow-x-auto pb-4 scroll-smooth no-scrollbar">
              {filteredVideos.map((video, idx) => {
                const thumb = video.thumbnail || getYoutubeThumbnail(video.url)
                const isActive = selectedVideo?.id === video.id

                return (
                  <button
                    key={video.id}
                    onClick={() => handleVideoSelect(video)}
                    className={`shrink-0 w-56 lg:w-64 text-start rounded-xl overflow-hidden transition-all duration-300 ${
                      isActive
                        ? "ring-2 ring-primary shadow-lg shadow-primary/20 scale-[1.02]"
                        : "hover:shadow-md border border-border"
                    }`}
                  >
                    <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
                      {thumb ? (
                        <Image src={thumb} alt={video.title} className="w-full h-full object-cover" width={256} height={144} loading="lazy" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-10 h-10 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                      {isActive && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg animate-pulse">
                            <Play className="w-5 h-5 text-white fill-white ms-0.5" />
                          </div>
                        </div>
                      )}
                      {!isActive && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <div className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Play className="w-4 h-4 text-white fill-white ms-0.5" />
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-1.5 end-1.5 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                        {video.category ? (categoryLabels[video.category] || video.category) : ""}
                      </div>
                    </div>
                    <div className={`p-3 ${isActive ? "bg-primary/5" : "bg-surface"}`}>
                      <h4 className="text-sm font-bold text-text line-clamp-2 leading-snug">
                        {isArabic ? video.title : video.titleEn || video.title}
                      </h4>
                      <div className="flex items-center gap-1 mt-1.5 text-text-light text-[11px]">
                        <Calendar className="w-3 h-3" />
                        {new Date(video.createdAt).toLocaleDateString(isArabic ? "ar-EG" : "en-US", { year: "numeric", month: "short" })}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
