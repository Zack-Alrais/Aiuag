"use client"

import { motion } from "framer-motion"
import { FolderOpen, Calendar, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { staggerItem } from "@/components/ui/motion"

interface ProjectCardProps {
  project: {
    id: string
    titleAr: string
    titleEn: string
    descriptionAr?: string
    descriptionEn?: string
    status: string
    featuredImage?: string
    startDate?: Date | string
    endDate?: Date | string
    teamCount?: number
  }
  lang: string
  isArabic: boolean
  className?: string
}

export default function ProjectCard({ project, lang, isArabic, className }: ProjectCardProps) {
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: isArabic ? "نشط" : "Active",
      completed: isArabic ? "مكتمل" : "Completed",
      paused: isArabic ? "متوقف" : "Paused",
      planning: isArabic ? "تخطيط" : "Planning",
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-accent/10 text-accent dark:text-accent-light",
      completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      paused: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      planning: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    }
    return colors[status] || "bg-accent/10 text-accent"
  }

  return (
    <motion.div
      variants={staggerItem}
      className={cn(
        "bg-surface dark:bg-dark-card rounded-2xl overflow-hidden shadow-soft hover:shadow-card-hover transition-all duration-300 group border border-gray-100 dark:border-dark-border",
        className
      )}
    >
      <motion.div
        className="h-48 bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center relative overflow-hidden"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.4 }}
      >
        {project.featuredImage ? (
          <img src={project.featuredImage} alt={isArabic ? project.titleAr : project.titleEn} className="w-full h-full object-cover" />
        ) : (
          <FolderOpen className="w-16 h-16 text-secondary/40" />
        )}
        <div className="absolute top-3 end-3">
          <span className={cn("px-3 py-1 text-xs font-bold rounded-full", getStatusColor(project.status))}>
            {getStatusLabel(project.status)}
          </span>
        </div>
      </motion.div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-text dark:text-white mb-2 group-hover:text-primary dark:group-hover:text-primary-light transition-colors line-clamp-2">
          {isArabic ? project.titleAr : project.titleEn}
        </h3>
        <p className="text-text-secondary dark:text-gray-400 text-sm line-clamp-2 mb-3">
          {isArabic ? project.descriptionAr : project.descriptionEn}
        </p>
        {(project.startDate || project.teamCount) && (
          <div className="flex items-center gap-4 text-xs text-text-secondary dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-dark-border">
            {project.startDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(project.startDate).toLocaleDateString(isArabic ? "ar" : "en", { year: "numeric", month: "short" })}
              </span>
            )}
            {project.teamCount && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {project.teamCount} {isArabic ? "فريق" : "team"}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
