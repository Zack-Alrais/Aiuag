"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Volume2, VolumeX, Maximize, Share2, Copy, Check, ChevronLeft, ChevronRight } from "lucide-react"

function getYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?#]+)/)
  return match ? match[1] : null
}

function isVideoFile(url: string): boolean {
  return /\.(mp4|webm|ogg)$/i.test(url) || /^data:video\//.test(url);
}

export interface VideoItem {
  id: string
  title: string
  titleEn: string | null
  url: string
  description: string | null
  category: string | null
  thumbnail: string | null
  createdAt: string
}

interface VideoPlayerProps {
  video: VideoItem
  queue: VideoItem[]
  currentIndex: number
  onNavigate: (index: number) => void
  isArabic: boolean
  categoryLabels: Record<string, string>
}

export default function VideoPlayer({ video, queue, currentIndex, onNavigate, isArabic, categoryLabels }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showShare, setShowShare] = useState(false)
  const [copied, setCopied] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const shareRef = useRef<HTMLDivElement>(null)

  const ytId = getYoutubeId(video.url)
  const isUploaded = isVideoFile(video.url)
  const currentUrl = typeof window !== "undefined" ? window.location.href : ""

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(video.title + "\n" + currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(video.title)}&url=${encodeURIComponent(currentUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
  }

  const copyLink = () => {
    navigator.clipboard.writeText(currentUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFullscreen = () => {
    const container = document.getElementById("video-player-container")
    if (container) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        container.requestFullscreen()
      }
    }
  }

  useEffect(() => {
    setPlaying(false)
    setProgress(0)
    setShowShare(false)
  }, [video.id])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShowShare(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const prevVideo = currentIndex > 0 ? queue[currentIndex - 1] : null
  const nextVideo = currentIndex < queue.length - 1 ? queue[currentIndex + 1] : null

  return (
    <div id="video-player-container" className="relative">
      {/* Main Player */}
      <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video">
        {ytId ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=0&rel=0`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title}
          />
        ) : isUploaded ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              src={video.url}
              poster={video.thumbnail || undefined}
              className="w-full h-full object-contain"
              controls
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100)
                }
              }}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 min-h-[300px]">
            <Play className="w-20 h-20 text-white/30" />
          </div>
        )}
      </div>

      {/* Video Info + Actions */}
      <div className="mt-4 flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl lg:text-2xl font-bold text-text leading-tight">
            {isArabic ? video.title : video.titleEn || video.title}
          </h2>
          <div className="flex items-center gap-3 mt-2 text-sm text-text-secondary flex-wrap">
            {video.category && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                {categoryLabels[video.category] || video.category}
              </span>
            )}
            <span>{new Date(video.createdAt).toLocaleDateString(isArabic ? "ar-EG" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
          {video.description && (
            <p className="mt-3 text-text-secondary text-sm leading-relaxed">{video.description}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative" ref={shareRef}>
            <button
              onClick={() => setShowShare(!showShare)}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium text-text hover:bg-primary/5 hover:border-primary/30 transition-all"
            >
              <Share2 className="w-4 h-4" />
              {isArabic ? "مشاركة" : "Share"}
            </button>

            {showShare && (
              <div className="absolute top-full mt-2 end-0 bg-surface border border-border rounded-xl shadow-xl p-2 min-w-[180px] z-50 animate-fade-in">
                <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-sm">
                  <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">W</span>
                  WhatsApp
                </a>
                <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm">
                  <span className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white text-xs font-bold">X</span>
                  Twitter / X
                </a>
                <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm">
                  <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">f</span>
                  Facebook
                </a>
                <button onClick={copyLink}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm">
                  <span className="w-8 h-8 bg-gray-200 dark:bg-white/10 rounded-full flex items-center justify-center">
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </span>
                  {copied ? (isArabic ? "تم النسخ!" : "Copied!") : (isArabic ? "نسخ الرابط" : "Copy Link")}
                </button>
              </div>
            )}
          </div>

          <button onClick={handleFullscreen}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium text-text hover:bg-primary/5 hover:border-primary/30 transition-all">
            <Maximize className="w-4 h-4" />
            {isArabic ? "شاشة كاملة" : "Fullscreen"}
          </button>
        </div>
      </div>

      {/* Prev / Next Navigation */}
      {(prevVideo || nextVideo) && (
        <div className="flex items-center gap-3 mt-4">
          {prevVideo ? (
            <button onClick={() => onNavigate(currentIndex - 1)}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium text-text hover:bg-primary/5 hover:border-primary/30 transition-all">
              <ChevronRight className="w-4 h-4" />
              {isArabic ? "السابق" : "Previous"}
            </button>
          ) : <div />}
          <div className="flex-1 text-center text-xs text-text-light font-medium">
            {currentIndex + 1} / {queue.length}
          </div>
          {nextVideo ? (
            <button onClick={() => onNavigate(currentIndex + 1)}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium text-text hover:bg-primary/5 hover:border-primary/30 transition-all">
              {isArabic ? "التالي" : "Next"}
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : <div />}
        </div>
      )}
    </div>
  )
}
