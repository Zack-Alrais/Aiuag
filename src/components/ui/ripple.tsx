"use client"

import { useState, useCallback, type MouseEvent, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Ripple {
  id: number
  x: number
  y: number
}

interface RippleProps {
  children: ReactNode
  className?: string
  color?: string
  duration?: number
}

export default function Ripple({ children, className = "", color = "rgba(255,255,255,0.35)", duration = 0.6 }: RippleProps) {
  const [ripples, setRipples] = useState<Ripple[]>([])

  const handleClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()
    setRipples((prev) => [...prev, { id, x, y }])
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
    }, duration * 1000)
  }, [duration])

  return (
    <div className={`relative overflow-hidden ${className}`} onClick={handleClick}>
      {children}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: ripple.x,
              top: ripple.y,
              width: 20,
              height: 20,
              borderRadius: "50%",
              backgroundColor: color,
              pointerEvents: "none",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
