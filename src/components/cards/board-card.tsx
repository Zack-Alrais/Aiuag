"use client"

import { motion } from "framer-motion"
import { Facebook, Twitter, Linkedin } from "lucide-react"
import { cn } from "@/lib/utils"
import { staggerItem } from "@/components/ui/motion"
import TiltCard from "@/components/ui/tilt-card"

interface BoardCardProps {
  member: {
    id: string
    name: string
    nameEn?: string
    position: string
    positionEn?: string
    image?: string
    bio?: string
    bioEn?: string
    social?: { facebook?: string; twitter?: string; linkedin?: string }
  }
  lang: string
  isArabic: boolean
  className?: string
}

export default function BoardCard({ member, lang, isArabic, className }: BoardCardProps) {
  return (
    <motion.div variants={staggerItem} className={className}>
      <TiltCard tiltDegree={5} scale={1.02} glare>
        <div className="bg-surface dark:bg-dark-card rounded-2xl overflow-hidden border border-gray-100 dark:border-dark-border shadow-soft hover:shadow-card-hover transition-all p-6 text-center">
          <div className="w-28 h-28 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary-light p-1 mb-4">
            {member.image ? (
              <img src={member.image} alt={member.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-white dark:bg-dark-card flex items-center justify-center text-3xl font-bold text-primary">
                {(isArabic ? member.name : (member.nameEn || member.name)).charAt(0)}
              </div>
            )}
          </div>
          <h3 className="font-bold text-text dark:text-white text-lg">
            {isArabic ? member.name : (member.nameEn || member.name)}
          </h3>
          <p className="text-sm text-primary dark:text-primary-light font-medium mt-0.5">
            {isArabic ? member.position : (member.positionEn || member.position)}
          </p>
          {(member.bio || member.bioEn) && (
            <p className="text-xs text-text-secondary dark:text-gray-400 mt-2 line-clamp-2">
              {isArabic ? member.bio : (member.bioEn || member.bio)}
            </p>
          )}
          {member.social && (member.social.facebook || member.social.twitter || member.social.linkedin) && (
            <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
              {member.social.facebook && (
                <a href={member.social.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 dark:bg-dark-card text-gray-500 dark:text-gray-400 hover:bg-primary hover:text-white transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {member.social.twitter && (
                <a href={member.social.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 dark:bg-dark-card text-gray-500 dark:text-gray-400 hover:bg-primary hover:text-white transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {member.social.linkedin && (
                <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 dark:bg-dark-card text-gray-500 dark:text-gray-400 hover:bg-primary hover:text-white transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </TiltCard>
    </motion.div>
  )
}
