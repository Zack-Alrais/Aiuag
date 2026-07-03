"use client"

import { motion } from "framer-motion"
import { Mail, Phone, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { staggerItem } from "@/components/ui/motion"
import TiltCard from "@/components/ui/tilt-card"

interface MemberCardProps {
  member: {
    id: string
    name: string
    nameEn?: string
    role: string
    roleEn?: string
    image?: string
    phone?: string
    email?: string
    bio?: string
    bioEn?: string
  }
  lang: string
  isArabic: boolean
  className?: string
}

export default function MemberCard({ member, lang, isArabic, className }: MemberCardProps) {
  return (
    <motion.div variants={staggerItem} className={className}>
      <TiltCard tiltDegree={6} scale={1.03} glare>
        <div className="bg-surface dark:bg-dark-card rounded-2xl overflow-hidden border border-gray-100 dark:border-dark-border shadow-soft hover:shadow-card-hover transition-shadow">
          <div className="bg-gradient-to-br from-primary to-primary-light h-24 relative">
            <div className="absolute -bottom-12 inset-x-0 flex justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-white dark:border-dark-card overflow-hidden bg-white dark:bg-dark-card">
                {member.image ? (
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-bold">
                    {isArabic ? member.name.charAt(0) : (member.nameEn || member.name).charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="pt-14 pb-5 px-5 text-center">
            <h3 className="font-bold text-text dark:text-white">{isArabic ? member.name : (member.nameEn || member.name)}</h3>
            <p className="text-sm text-primary dark:text-primary-light font-medium mt-0.5">
              {isArabic ? member.role : (member.roleEn || member.role)}
            </p>
            {(member.bio || member.bioEn) && (
              <p className="text-xs text-text-secondary dark:text-gray-400 mt-2 line-clamp-2">
                {isArabic ? member.bio : (member.bioEn || member.bio)}
              </p>
            )}
            {(member.phone || member.email) && (
              <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-dark-border">
                {member.email && (
                  <a href={`mailto:${member.email}`} className="p-2 rounded-lg bg-gray-100 dark:bg-dark-card text-gray-500 dark:text-gray-400 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors">
                    <Mail className="w-4 h-4" />
                  </a>
                )}
                {member.phone && (
                  <a href={`tel:${member.phone}`} className="p-2 rounded-lg bg-gray-100 dark:bg-dark-card text-gray-500 dark:text-gray-400 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors">
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </TiltCard>
    </motion.div>
  )
}
