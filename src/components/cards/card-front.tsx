"use client"

import { useParams } from "next/navigation"

// Canvas size: 1750 × 863 as specified
const CANVAS_W = 1750
const CANVAS_H = 863

interface CardFrontProps {
  member: {
    nameAr?: string
    nameEn?: string
    membershipNumber?: string
    memberType?: string
    title?: string
    photo?: string
    joinDate?: string
    issueDate?: string
    [key: string]: any
  }
}

/**
 * Automatically reduces font size if text exceeds the allowed width.
 * Uses a character-width estimate (~0.6x font size per char for Arabic/Latin).
 */
function fitText(
  text: string,
  maxWidthPx: number,
  baseSize: number,
  minSize = 10
): number {
  if (!text) return baseSize
  const estimatedWidth = text.length * baseSize * 0.6
  if (estimatedWidth <= maxWidthPx) return baseSize
  const adjusted = Math.floor((maxWidthPx / (text.length * 0.6)) * 10) / 10
  return Math.max(adjusted, minSize)
}

export function CardFront({ member }: CardFrontProps) {
  const params = useParams()
  const lang = (params?.lang as string) || "ar"
  const isRtl = lang === "ar"

  const nameValue = isRtl ? member.nameAr : member.nameEn
  const positionText =
    member.title || member.memberType || (isRtl ? "عضو" : "Member")
  const joinDate =
    member.joinDate ||
    member.issueDate ||
    new Date().toLocaleDateString("en-GB")

  return (
    <div
      className="card-front"
      style={{
        position: "relative",
        width: `${CANVAS_W}px`,
        height: `${CANVAS_H}px`,
        overflow: "hidden",
        flexShrink: 0,
        direction: isRtl ? "rtl" : "ltr",
      }}
    >
      {/* ── 1. Background template – NEVER modify ── */}
      <img
        src="/uploads/Front.svg"
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

      {/* ── 2. Member Photo – X=1343, Y=157, W=273, H=414, border-radius: 18px ── */}
      {member.photo && (
        <img
          src={member.photo}
          alt=""
          style={{
            position: "absolute",
            left: "1343px",
            top: "157px",
            width: "273px",
            height: "414px",
            objectFit: "cover",
            borderRadius: "18px",
          }}
        />
      )}

      {/* ── 3. Member Name – X=1110, Y=276, W=200, H=50 ──
           Arabic · Bold · 32px · Right-aligned · Vertical centered */}
      <div
        style={{
          position: "absolute",
          left: "1110px",
          top: "276px",
          width: "200px",
          height: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: isRtl ? "flex-end" : "flex-start",
          fontWeight: 700,
          fontSize: `${fitText(nameValue, 200, 32)}px`,
          color: "#FFFFFF",
          fontFamily: "'Noto Sans Arabic', 'Arial', sans-serif",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        {nameValue}
      </div>

      {/* ── 4. Member Position / Status – X=1110, Y=389, W=250, H=50 ──
           Bold · 30px · Right-aligned */}
      <div
        style={{
          position: "absolute",
          left: "1110px",
          top: "389px",
          width: "250px",
          height: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: isRtl ? "flex-end" : "flex-start",
          fontWeight: 700,
          fontSize: `${fitText(positionText, 250, 30)}px`,
          color: "#FFFFFF",
          fontFamily: "'Noto Sans Arabic', 'Arial', sans-serif",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        {positionText}
      </div>

      {/* ── 5. Membership Number – X=1110, Y=508, W=260, H=45 ──
           Bold · 30px · Letter-spacing: 1px */}
      <div
        style={{
          position: "absolute",
          left: "1110px",
          top: "508px",
          width: "260px",
          height: "45px",
          display: "flex",
          alignItems: "center",
          justifyContent: isRtl ? "flex-end" : "flex-start",
          fontWeight: 700,
          fontSize: `${fitText(member.membershipNumber || "", 260, 30)}px`,
          letterSpacing: "1px",
          color: "#D4A843",
          fontFamily: "'Arial', sans-serif",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        {member.membershipNumber}
      </div>

      {/* ── 6. Join Date – X=1110, Y=625, W=250, H=40 ──
           28px · Right-aligned */}
      <div
        style={{
          position: "absolute",
          left: "1110px",
          top: "625px",
          width: "250px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: isRtl ? "flex-end" : "flex-start",
          fontSize: `${fitText(joinDate, 250, 28)}px`,
          color: "#FFFFFF",
          fontFamily: "'Noto Sans Arabic', 'Arial', sans-serif",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        {joinDate}
      </div>
    </div>
  )
}
