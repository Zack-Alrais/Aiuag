"use client"

import { useParams } from "next/navigation"

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

function fitText(text: string, maxWidthPx: number, baseSize: number, minSize = 10): number {
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
  const positionText = member.title || member.memberType || (isRtl ? "عضو" : "Member")
  const joinDate = member.joinDate || member.issueDate || new Date().toLocaleDateString("en-GB")

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
        fontFamily: "'Noto Sans Arabic', 'Arial', sans-serif",
        borderRadius: "24px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, #0f1f3d 0%, #1A3A6B 40%, #2B5EA7 70%, #1A3A6B 100%)",
        }}
      />

      {/* Decorative gold border */}
      <div
        style={{
          position: "absolute",
          inset: "6px",
          borderRadius: "18px",
          border: "3px solid #D4A843",
          pointerEvents: "none",
        }}
      />

      {/* Top gold accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "12px",
          background: "linear-gradient(90deg, #D4A843, #f0d68a, #D4A843)",
        }}
      />

      {/* Bottom gold accent bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "12px",
          background: "linear-gradient(90deg, #D4A843, #f0d68a, #D4A843)",
        }}
      />

      {/* Decorative geometric pattern */}
      <div
        style={{
          position: "absolute",
          right: "-80px",
          top: "-60px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,168,67,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "-120px",
          bottom: "-100px",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,168,67,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Association logo / emblem placeholder */}
      <div
        style={{
          position: "absolute",
          top: "50px",
          [isRtl ? "right" : "left"]: "60px",
          width: "110px",
          height: "110px",
          borderRadius: "50%",
          overflow: "hidden",
          border: "3px solid #D4A843",
          background: "rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {member.photo ? (
          <img
            src={member.photo}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              fontSize: "36px",
              fontWeight: 700,
              color: "#D4A843",
              textAlign: "center",
              lineHeight: "110px",
            }}
          >
            {nameValue?.charAt(0) || "A"}
          </div>
        )}
      </div>

      {/* Association name */}
      <div
        style={{
          position: "absolute",
          top: "55px",
          [isRtl ? "right" : "left"]: "200px",
          right: isRtl ? undefined : "auto",
          left: isRtl ? "auto" : "200px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#D4A843",
            letterSpacing: "1px",
          }}
        >
          AIUAG
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {isRtl ? "رابطة خريجي جامعة أفريقيا العالمية" : "Association of IUA Graduates"}
        </div>
      </div>

      {/* Membership type badge */}
      <div
        style={{
          position: "absolute",
          top: "60px",
          [isRtl ? "left" : "right"]: "60px",
          padding: "10px 24px",
          borderRadius: "30px",
          background: "linear-gradient(135deg, #D4A843, #e6c25d)",
          color: "#0f1f3d",
          fontSize: "16px",
          fontWeight: 700,
          letterSpacing: "0.5px",
        }}
      >
        {positionText}
      </div>

      {/* Membership label */}
      <div
        style={{
          position: "absolute",
          [isRtl ? "right" : "left"]: "60px",
          bottom: "200px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            color: "rgba(212,168,67,0.8)",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          {isRtl ? "بطاقة عضوية" : "MEMBERSHIP CARD"}
        </div>
        <div
          style={{
            fontSize: "38px",
            fontWeight: 700,
            color: "#FFFFFF",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "500px",
          }}
        >
          {nameValue}
        </div>
      </div>

      {/* Details row */}
      <div
        style={{
          position: "absolute",
          [isRtl ? "right" : "left"]: "60px",
          bottom: "80px",
          display: "flex",
          gap: "80px",
          alignItems: "center",
        }}
      >
        {/* Member number */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <div style={{ fontSize: "11px", color: "rgba(212,168,67,0.7)", textTransform: "uppercase" }}>
            {isRtl ? "رقم العضوية" : "MEMBERSHIP NO."}
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#D4A843", letterSpacing: "2px" }}>
            {member.membershipNumber || "------"}
          </div>
        </div>

        {/* Issue date */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <div style={{ fontSize: "11px", color: "rgba(212,168,67,0.7)", textTransform: "uppercase" }}>
            {isRtl ? "تاريخ الإصدار" : "ISSUE DATE"}
          </div>
          <div style={{ fontSize: "22px", fontWeight: 600, color: "#FFFFFF" }}>
            {joinDate}
          </div>
        </div>
      </div>

      {/* Bottom watermark */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: "10px",
          color: "rgba(255,255,255,0.2)",
          letterSpacing: "3px",
        }}
      >
        AIUAG {new Date().getFullYear()}
      </div>
    </div>
  )
}
