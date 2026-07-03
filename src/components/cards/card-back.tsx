"use client"

import { useParams } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"

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
  const isRtl = lang === "ar"

  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const verificationUrl = member.qrValue || `${origin}/${lang}/verify?id=${member.membershipNumber}`

  return (
    <div
      className="card-back"
      style={{
        position: "relative",
        width: `${CANVAS_W}px`,
        height: `${CANVAS_H}px`,
        overflow: "hidden",
        flexShrink: 0,
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
          background: "linear-gradient(135deg, #0f1f3d 0%, #1A3A6B 50%, #2B5EA7 100%)",
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

      {/* Top gold accent */}
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

      {/* Bottom gold accent */}
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

      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          left: "-100px",
          top: "-80px",
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
          right: "-100px",
          bottom: "-80px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,168,67,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Header section */}
      <div
        style={{
          position: "absolute",
          top: "60px",
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "#D4A843",
            letterSpacing: "2px",
          }}
        >
          AIUAG
        </div>
        <div
          style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.5)",
            marginTop: "4px",
          }}
        >
          {isRtl ? "رابطة خريجي جامعة أفريقيا العالمية" : "Association of IUA Graduates"}
        </div>
      </div>

      {/* QR Code section */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -55%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        {/* QR code background */}
        <div
          style={{
            padding: "20px",
            background: "#FFFFFF",
            borderRadius: "16px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          }}
        >
          <QRCodeSVG
            value={verificationUrl}
            size={200}
            bgColor="#FFFFFF"
            fgColor="#1A3A6B"
            level="M"
          />
        </div>
        <div
          style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.7)",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          {isRtl ? "امسح الرمز للتحقق من العضوية" : "Scan to verify membership"}
        </div>
      </div>

      {/* Member number */}
      <div
        style={{
          position: "absolute",
          [isRtl ? "right" : "left"]: "60px",
          bottom: "100px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: "rgba(212,168,67,0.7)",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          {isRtl ? "رقم العضوية" : "MEMBER NO."}
        </div>
        <div
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "#D4A843",
            letterSpacing: "2px",
          }}
        >
          {member.membershipNumber || "------"}
        </div>
      </div>

      {/* Verification URL */}
      <div
        style={{
          position: "absolute",
          [isRtl ? "left" : "right"]: "60px",
          bottom: "100px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          alignItems: isRtl ? "flex-start" : "flex-end",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: "rgba(212,168,67,0.7)",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          {isRtl ? "رابط التحقق" : "VERIFY AT"}
        </div>
        <div
          style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.5)",
            fontFamily: "'Courier New', monospace",
            maxWidth: "350px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {`${origin}/${lang}/verify?id=${member.membershipNumber}`}
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
          color: "rgba(255,255,255,0.15)",
          letterSpacing: "3px",
        }}
      >
        {isRtl ? "هذه البطاقة تخص حاملها - للتحقق استخدم الرمز أعلاه" : "This card belongs to the bearer - verify using QR code"}
      </div>
    </div>
  )
}
