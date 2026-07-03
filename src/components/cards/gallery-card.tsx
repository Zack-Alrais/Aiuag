"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { staggerItem } from "@/components/ui/motion"

interface GalleryCardProps {
  image: {
    id: string
    imageUrl: string
    title?: string
    createdAt?: Date | string
  }
  isArabic: boolean
  formatDate?: (d: Date | null | undefined) => string
  className?: string
  aspectRatio?: "square" | "video" | "portrait"
}

const aspectMap = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
}

export default function GalleryCard({ image, isArabic, formatDate, className, aspectRatio = "square" }: GalleryCardProps) {
  return (
    <motion.div
      variants={staggerItem}
      className={cn(
        "rounded-xl overflow-hidden relative group cursor-pointer bg-gradient-to-br from-primary/10 to-secondary/10",
        aspectMap[aspectRatio],
        className
      )}
    >
      <img
        src={image.imageUrl}
        alt={image.title || ""}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 inset-x-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
        {image.title && (
          <p className="text-sm font-bold truncate">{image.title}</p>
        )}
        {formatDate && image.createdAt && (
          <p className="text-[10px] text-white/70">{formatDate(new Date(image.createdAt))}</p>
        )}
      </div>
    </motion.div>
  )
}
