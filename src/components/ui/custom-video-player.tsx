"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  SkipForward,
  SkipBack,
  Settings,
  PictureInPicture2,
} from "lucide-react";

interface CustomVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CustomVideoPlayer({
  src,
  poster,
  title,
  className = "",
}: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [isPiP, setIsPiP] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);

  const v = videoRef.current;

  const play = useCallback(() => {
    v?.play().catch(() => {});
  }, [v]);

  const pause = useCallback(() => {
    v?.pause();
  }, [v]);

  const togglePlay = useCallback(() => {
    if (!v) return;
    v.paused ? play() : pause();
  }, [v, play, pause]);

  const seek = useCallback(
    (time: number) => {
      if (!v) return;
      v.currentTime = Math.max(0, Math.min(time, duration));
    },
    [v, duration]
  );

  const toggleMute = useCallback(() => {
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, [v]);

  const changeVolume = useCallback(
    (val: number) => {
      if (!v) return;
      v.volume = val;
      v.muted = val === 0;
      setVolume(val);
      setMuted(val === 0);
    },
    [v]
  );

  const changeSpeed = useCallback(
    (val: number) => {
      if (!v) return;
      v.playbackRate = val;
      setSpeed(val);
      setShowSettings(false);
    },
    [v]
  );

  const skip = useCallback(
    (seconds: number) => {
      seek(currentTime + seconds);
    },
    [seek, currentTime]
  );

  const toggleFullscreen = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      c.requestFullscreen();
    }
  }, []);

  const togglePiP = useCallback(async () => {
    if (!v) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await v.requestPictureInPicture();
      }
    } catch {}
  }, [v]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTimeUpdate = () => {
      setCurrentTime(v.currentTime);
      if (v.buffered.length > 0) {
        setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
      }
    };
    const onLoadedMetadata = () => setDuration(v.duration);
    const onVolumeChange = () => {
      setVolume(v.volume);
      setMuted(v.muted);
    };
    const onRateChange = () => setSpeed(v.playbackRate);
    const onEnterPiP = () => setIsPiP(true);
    const onLeavePiP = () => setIsPiP(false);

    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("loadedmetadata", onLoadedMetadata);
    v.addEventListener("volumechange", onVolumeChange);
    v.addEventListener("ratechange", onRateChange);
    v.addEventListener("enterpictureinpicture", onEnterPiP);
    v.addEventListener("leavepictureinpicture", onLeavePiP);

    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("loadedmetadata", onLoadedMetadata);
      v.removeEventListener("volumechange", onVolumeChange);
      v.removeEventListener("ratechange", onRateChange);
      v.removeEventListener("enterpictureinpicture", onEnterPiP);
      v.removeEventListener("leavepictureinpicture", onLeavePiP);
    };
  }, []);

  useEffect(() => {
    const fsHandler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", fsHandler);
    return () => document.removeEventListener("fullscreenchange", fsHandler);
  }, []);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const show = () => {
      setShowControls(true);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (playing) {
        hideTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
      }
    };
    const hide = () => {
      if (playing && !showSettings) {
        hideTimeoutRef.current = setTimeout(() => setShowControls(false), 1000);
      }
    };
    c.addEventListener("mousemove", show);
    c.addEventListener("mouseleave", hide);
    return () => {
      c.removeEventListener("mousemove", show);
      c.removeEventListener("mouseleave", hide);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [playing, showSettings]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          changeVolume(Math.min(1, volume + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          changeVolume(Math.max(0, volume - 0.1));
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "Escape":
          setShowSettings(false);
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePlay, skip, changeVolume, volume, toggleFullscreen, toggleMute]);

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    setHoverTime(pct * duration);
    setHoverX(x);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      ref={containerRef}
      className={`relative group bg-black rounded-2xl overflow-hidden select-none ${className}`}
      onDoubleClick={toggleFullscreen}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full aspect-video object-contain cursor-pointer"
        onClick={togglePlay}
        playsInline
        preload="metadata"
      />

      {/* Center Play Button (when paused) */}
      {!playing && showControls && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 hover:bg-white/30 transition-all duration-300 hover:scale-110">
            <Play className="w-10 h-10 text-white ms-1" fill="white" />
          </div>
        </button>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-all duration-300 ${
          showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div
          ref={progressRef}
          className="relative h-1.5 bg-white/20 cursor-pointer group/progress mx-4 rounded-full overflow-visible"
          onMouseMove={handleProgressHover}
          onMouseLeave={() => setHoverTime(null)}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            seek(pct * duration);
          }}
        >
          {/* Buffered */}
          <div
            className="absolute top-0 h-full bg-white/20 rounded-full"
            style={{ width: `${buffered}%` }}
          />
          {/* Progress */}
          <div
            className="absolute top-0 h-full bg-secondary rounded-full transition-none"
            style={{ width: `${progress}%` }}
          />
          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-secondary rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
            style={{ left: `calc(${progress}% - 7px)` }}
          />
          {/* Hover Time Tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute -top-9 bg-black/80 text-white text-[11px] px-2 py-1 rounded pointer-events-none whitespace-nowrap"
              style={{ left: `${hoverX}px`, transform: "translateX(-50%)" }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>

        {/* Controls Row */}
        <div className="flex items-center gap-1 px-4 py-2.5">
          {/* Left Controls */}
          <button onClick={togglePlay} className="p-1.5 text-white hover:text-secondary transition-colors">
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" fill="white" />}
          </button>

          <button onClick={() => skip(-10)} className="p-1.5 text-white/70 hover:text-white transition-colors hidden sm:block" title="-10s">
            <SkipBack className="w-4 h-4" />
          </button>
          <button onClick={() => skip(10)} className="p-1.5 text-white/70 hover:text-white transition-colors hidden sm:block" title="+10s">
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Volume */}
          <div className="flex items-center gap-1 group/vol">
            <button onClick={toggleMute} className="p-1.5 text-white/70 hover:text-white transition-colors">
              <VolumeIcon className="w-4 h-4" />
            </button>
            <div className="w-0 group-hover/vol:w-20 overflow-hidden transition-all duration-300">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={muted ? 0 : volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                className="w-full h-1 accent-secondary cursor-pointer"
              />
            </div>
          </div>

          {/* Time */}
          <span className="text-white/70 text-xs font-mono mx-2 hidden sm:inline">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right Controls */}
          {/* Speed */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-2 py-1 text-white/70 hover:text-white text-xs font-bold rounded transition-colors"
            >
              {speed}x
            </button>
            {showSettings && (
              <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-md rounded-xl border border-white/10 p-2 min-w-[100px]">
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider px-2 mb-1">
                  Speed
                </p>
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    onClick={() => changeSpeed(s)}
                    className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      speed === s
                        ? "bg-secondary text-white font-bold"
                        : "text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PiP */}
          <button
            onClick={togglePiP}
            className={`p-1.5 transition-colors hidden sm:block ${isPiP ? "text-secondary" : "text-white/70 hover:text-white"}`}
            title="Picture in Picture"
          >
            <PictureInPicture2 className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} className="p-1.5 text-white/70 hover:text-white transition-colors">
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Title Overlay */}
      {title && showControls && (
        <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/60 to-transparent p-4 transition-all duration-300">
          <p className="text-white text-sm font-medium truncate">{title}</p>
        </div>
      )}
    </div>
  );
}
