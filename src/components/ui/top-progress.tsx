"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useEffect } from "react"
import { usePathname } from "next/navigation"

export default function TopProgress() {
  const pathname = usePathname()
  const scaleX = useMotionValue(0)
  const smoothScaleX = useSpring(scaleX, { stiffness: 100, damping: 30 })
  const opacity = useTransform(smoothScaleX, [0, 0.01, 1], [0, 1, 1])

  useEffect(() => {
    scaleX.set(0.3)
    const timer = setTimeout(() => scaleX.set(1), 200)
    const finish = setTimeout(() => scaleX.set(1), 400)
    const hide = setTimeout(() => scaleX.set(0), 600)
    return () => {
      clearTimeout(timer)
      clearTimeout(finish)
      clearTimeout(hide)
    }
  }, [pathname, scaleX])

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-gradient-to-r from-secondary via-secondary-light to-secondary origin-left"
      style={{ scaleX: smoothScaleX, opacity }}
    />
  )
}
