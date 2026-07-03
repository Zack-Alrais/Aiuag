"use client"

import { motion, useInView } from "framer-motion"
import { useRef, type ReactNode } from "react"
import { motionVariants } from "./motion"

interface ScrollRevealProps {
  children: ReactNode
  direction?: "up" | "down" | "left" | "right" | "scale" | "fade"
  delay?: number
  duration?: number
  className?: string
  once?: boolean
  distance?: number
}

const variantMap = {
  up: { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } },
  down: { hidden: { opacity: 0, y: -30 }, visible: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } },
  fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
}

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.5,
  className = "",
  once = true,
  distance = 30,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, margin: "-50px" })

  const variant = variantMap[direction]
  const hidden = { ...variant.hidden, y: direction === "up" ? distance : direction === "down" ? -distance : variant.hidden.y, x: direction === "left" ? -distance : direction === "right" ? distance : variant.hidden.x }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden,
        visible: {
          ...variant.visible,
          transition: {
            duration,
            ease: [0.25, 0.4, 0.25, 1],
            delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
