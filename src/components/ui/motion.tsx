"use client"

import { motion, type Variants, type HTMLMotionProps } from "framer-motion"
import { forwardRef } from "react"

type MotionTag = "div" | "section" | "article" | "span" | "li" | "nav" | "header" | "footer" | "main" | "aside" | "ul" | "ol" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"

interface MotionProps extends HTMLMotionProps<"div"> {
  tag?: MotionTag
  dir?: "rtl" | "ltr"
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
}

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

export const motionVariants = {
  fadeInUp,
  fadeIn,
  scaleIn,
  slideInRight,
  slideInLeft,
  staggerContainer,
  staggerItem,
}

export function getDirectionalVariants(dir: "rtl" | "ltr" = "ltr") {
  return {
    slideIn: dir === "rtl" ? slideInLeft : slideInRight,
  }
}

const MotionComponent = forwardRef<HTMLElement, MotionProps>(
  ({ tag = "div", dir, ...props }, ref) => {
    const MotionTag = motion[tag as keyof typeof motion] as React.ComponentType<HTMLMotionProps<"div">>
    return <MotionTag ref={ref} {...props} />
  }
)
MotionComponent.displayName = "MotionComponent"

export {
  MotionComponent as Motion,
  fadeInUp,
  fadeIn,
  scaleIn,
  slideInRight,
  slideInLeft,
  staggerContainer,
  staggerItem,
}
