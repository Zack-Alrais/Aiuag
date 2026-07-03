"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Check, ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { staggerItem } from "@/components/ui/motion"
import TiltCard from "@/components/ui/tilt-card"
import MagneticButton from "@/components/ui/magnetic-button"

interface PricingCardProps {
  plan: {
    id: string
    titleAr: string
    titleEn: string
    price: string
    currency: string
    period?: string
    features: string[]
    highlighted?: boolean
    cta?: string
    href: string
  }
  lang: string
  isArabic: boolean
  className?: string
}

export default function PricingCard({ plan, lang, isArabic, className }: PricingCardProps) {
  return (
    <motion.div variants={staggerItem} className={cn("h-full", className)}>
      <TiltCard tiltDegree={4} scale={1.02} glare={plan.highlighted}>
        <div
          className={cn(
            "rounded-2xl overflow-hidden border-2 h-full flex flex-col transition-all",
            plan.highlighted
              ? "bg-surface dark:bg-dark-card border-secondary shadow-glow scale-105 relative z-10"
              : "bg-surface dark:bg-dark-card border-gray-100 dark:border-dark-border shadow-soft"
          )}
        >
          {plan.highlighted && (
            <div className="bg-secondary text-primary-dark text-center text-xs font-bold py-1.5">
              {isArabic ? "الأكثر طلباً" : "Most Popular"}
            </div>
          )}
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-xl font-bold text-text dark:text-white text-center">
              {isArabic ? plan.titleAr : plan.titleEn}
            </h3>
            <div className="text-center my-4">
              <span className="text-4xl font-bold text-primary dark:text-primary-light">{plan.price}</span>
              <span className="text-sm text-text-secondary dark:text-gray-400 me-1">{plan.currency}</span>
              {plan.period && (
                <span className="text-sm text-text-secondary dark:text-gray-400 block">/{plan.period}</span>
              )}
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-text-secondary dark:text-gray-300">
                  <Check className="w-4 h-4 text-accent dark:text-accent-light shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href={plan.href}
              className={cn(
                "block text-center py-3 rounded-xl font-bold text-sm transition-all",
                plan.highlighted
                  ? "bg-secondary text-primary-dark hover:bg-secondary-light"
                  : "bg-gray-100 dark:bg-dark-card text-text dark:text-white hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white border border-gray-200 dark:border-dark-border"
              )}
            >
              {plan.cta || (isArabic ? "اشترك الآن" : "Subscribe Now")}
            </Link>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  )
}
