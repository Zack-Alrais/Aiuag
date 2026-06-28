"use client"

import { useParams } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"

// Canvas size: 1750 × 863
const CANVAS_W = 1750
const CANVAS_H = 863

interface CardBackProps {
  member: {
    membershipNumber?: string
    qrValue?: string
    [key: string]: any
  }
}

export function CardBack({ member }: CardBackProps) {
  const params = useParams()
  const lang = (params?.lang as string) || "ar"

  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const verificationUrl =
    member.qrValue ||
    `${origin}/${lang}/verify?id=${member.membershipNumber}`

  return (
    <div
      className="card-back"
      style={{
        position: "relative",
        width: `${CANVAS_W}px`,
        height: `${CANVAS_H}px`,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* ── 1. Background template – NEVER modify ── */}
      <img
        src="/uploads/Back.svg"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          pointerEvents: "none",
        }}
      />

      {/* ── 2. QR Code – Container: X=365, Y=662, W=140, H=140 ──
           Keep perfectly square, centered inside container, transparent background */}
      <div
        style={{
          position: "absolute",
          left: "365px",
          top: "662px",
          width: "140px",
          height: "140px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <QRCodeSVG
          value={verificationUrl}
          size={140}
          level="M"
          includeMargin={false}
          bgColor="transparent"
          fgColor="#1A3A6B"
        />
      </div>
    </div>
  )
}
