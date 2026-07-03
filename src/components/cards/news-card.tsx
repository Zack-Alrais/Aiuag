"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { staggerItem } from "@/components/ui/motion"

interface NewsCardProps {
  item: {
    id: string
    titleAr: string
    titleEn: string
    slug?: string
    excerptAr?: string
    excerptEn?: string
    featuredImage?: string
    category?: string
    publishedAt?: Date | string | null
    createdAt: Date | string
  }
  lang: string
  isArabic: boolean
  formatDate: (d: Date | null | undefined) => string
  className?: string
  featured?: boolean
}

export default function NewsCard({ item, lang, isArabic, formatDate, className, featured }: NewsCardProps) {
  return (
    <motion.article
      variants={staggerItem}
      className={cn(
        "bg-surface dark:bg-dark-card rounded-2xl overflow-hidden shadow-soft hover:shadow-card-hover transition-all duration-300 group border border-gray-100 dark:border-dark-border",
        featured && "md:grid md:grid-cols-2",
        className
      )}
    >
      <motion.div
        className={cn("bg-gradient-to-br from-primary to-primary-light relative overflow-hidden", featured ? "h-full min-h-[200px]" : "h-48")}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.4 }}
      >
        {item.featuredImage && (
          <img src={item.featuredImage} alt={isArabic ? item.titleAr : item.titleEn} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        <span className="absolute top-4 start-4 px-3 py-1 bg-secondary text-primary-dark text-xs font-bold rounded-full z-10">
          {item.category || (isArabic ? "أخبار" : "News")}
        </span>
      </motion.div>
      <div className="p-6">
        <div className="flex items-center gap-2 text-text-secondary dark:text-gray-400 text-sm mb-3">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(item.publishedAt || item.createdAt)}</span>
        </div>
        <h3 className={cn("font-bold text-text dark:text-white mb-2 group-hover:text-primary dark:group-hover:text-primary-light transition-colors line-clamp-2", featured ? "text-xl" : "text-lg")}>
          {isArabic ? item.titleAr : item.titleEn}
        </h3>
        <p className="text-text-secondary dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {isArabic ? (item.excerptAr || "") : (item.excerptEn || "")}
        </p>
        <Link
          href={`/${lang}/news/${item.slug || item.id}`}
          className="inline-flex items-center gap-1 text-primary dark:text-primary-light font-medium text-sm hover:gap-2 transition-all"
        >
          {isArabic ? "اقرأ المزيد" : "Read More"}
          {isArabic ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </Link>
      </div>
    </motion.article>
  )
}
