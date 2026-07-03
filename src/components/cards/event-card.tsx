"use client"

import { motion } from "framer-motion"
import { Clock, MapPin, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { staggerItem } from "@/components/ui/motion"

interface EventCardProps {
  event: {
    id: string
    titleAr: string
    titleEn: string
    date: Date | string
    time?: string
    location?: string
    status: string
    attendees?: number
  }
  lang: string
  isArabic: boolean
  className?: string
}

export default function EventCard({ event, lang, isArabic, className }: EventCardProps) {
  const getMonthDay = (date: Date | string) => {
    const d = new Date(date)
    return {
      day: d.getDate().toString().padStart(2, "0"),
      month: d.toLocaleDateString(isArabic ? "ar" : "en", { month: "short" }),
    }
  }
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: isArabic ? "نشط" : "Active",
      completed: isArabic ? "مكتمل" : "Completed",
      upcoming: isArabic ? "قادم" : "Upcoming",
      ongoing: isArabic ? "جاري" : "Ongoing",
      cancelled: isArabic ? "ملغي" : "Cancelled",
    }
    return labels[status] || status
  }
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      upcoming: "bg-accent/10 text-accent dark:text-accent-light",
      ongoing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      completed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
      cancelled: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    }
    return colors[status] || "bg-accent/10 text-accent"
  }

  const { day, month } = getMonthDay(event.date)
  const isPast = event.status === "completed" || event.status === "cancelled"

  return (
    <motion.div
      variants={staggerItem}
      className={cn(
        "rounded-2xl p-6 border transition-all",
        isPast
          ? "bg-background dark:bg-dark-surface border-border dark:border-dark-border opacity-80"
          : "bg-background dark:bg-dark-surface border-border dark:border-dark-border hover:border-primary/30 dark:hover:border-primary/30",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <motion.div
          whileHover={{ scale: 1.1, rotate: -5 }}
          className={cn(
            "w-16 h-16 rounded-xl flex flex-col items-center justify-center text-white shrink-0",
            isPast ? "bg-gray-400 dark:bg-gray-600" : "bg-gradient-to-br from-primary to-primary-light"
          )}
        >
          <span className="text-xs font-bold">{day}</span>
          <span className="text-lg font-bold">{month}</span>
        </motion.div>
        <div className="flex-1 min-w-0">
          <span className={cn("inline-block px-2 py-0.5 text-xs font-bold rounded mb-2", getStatusColor(event.status))}>
            {getStatusLabel(event.status)}
          </span>
          <h3 className={cn("font-bold mb-2 line-clamp-2", isPast ? "text-text-secondary dark:text-gray-400" : "text-text dark:text-white")}>
            {isArabic ? event.titleAr : event.titleEn}
          </h3>
          {event.time && (
            <div className="flex items-center gap-2 text-text-secondary dark:text-gray-400 text-sm mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{event.time}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2 text-text-secondary dark:text-gray-400 text-sm mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
          {event.attendees !== undefined && (
            <div className="flex items-center gap-2 text-text-secondary dark:text-gray-400 text-sm">
              <Users className="w-3.5 h-3.5" />
              <span>{event.attendees} {isArabic ? "مشارك" : "attendees"}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
