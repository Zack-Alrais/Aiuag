"use client"

import { useRef, useCallback } from "react"
import { usePathname } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import { Download } from "lucide-react"

// Canvas size per specification: 1750 × 863
const CANVAS_W = 1750
const CANVAS_H = 863
// Display size (~22% scale)
const DISPLAY_SCALE = 0.22
const DISPLAY_W = Math.round(CANVAS_W * DISPLAY_SCALE)
const DISPLAY_H = Math.round(CANVAS_H * DISPLAY_SCALE)

interface MemberData {
  nameAr: string
  nameEn: string
  membershipNumber: string
  memberType: string
  photo?: string
  title?: string
  faculty?: string
  department?: string
  graduationYear?: number
  phone?: string
  email?: string
  issueDate?: string
  expiryDate?: string
}

interface MembershipCardProps {
  member: MemberData
  showDownload?: boolean
}

export default function MembershipCard({
  member,
  showDownload = false,
}: MembershipCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const lang = pathname?.split("/")[1] || "ar"
  const isRtl = lang === "ar"

  const verificationUrl = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/${lang}/verify?id=${member.membershipNumber}`

  // Auto-reduce font size for text fields
  const fitText = (text: string, maxWidth: number, baseSize: number) => {
    if (!text) return baseSize
    const estimatedWidth = text.length * baseSize * 0.6
    if (estimatedWidth <= maxWidth) return baseSize
    const adjusted = Math.floor((maxWidth / (text.length * 0.6)) * 10) / 10
    return Math.max(adjusted, 10)
  }

  const nameValue = isRtl ? member.nameAr : member.nameEn
  const positionText =
    member.title || member.memberType || (isRtl ? "عضو" : "Member")
  const joinDate =
    member.issueDate ||
    new Date().toLocaleDateString("en-GB")

  const handleDownload = async () => {
    if (!cardRef.current) return
    try {
      const { default: html2canvas } = await import("html2canvas")
      const canvas = await html2canvas(cardRef.current, {
        scale: 4,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      })
      const link = document.createElement("a")
      link.download = `membership-card-${member.membershipNumber}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (err) {
      console.error("Failed to download card:", err)
    }
  }

  return (
    <div className="space-y-4">
      <div
        ref={cardRef}
        className="flex flex-col xl:flex-row gap-4 items-center justify-center p-4"
      >
        {/* ═══════════ FRONT SIDE ═══════════ */}
        <div>
          <h3 className="text-base font-bold text-gray-500 mb-3 text-center uppercase tracking-widest">
            {isRtl ? "الوجه الأمامي" : "Front Side"}
          </h3>
          <div
            className="membership-card-front"
            style={{
              width: `${DISPLAY_W}px`,
              height: `${DISPLAY_H}px`,
              borderRadius: "8px",
              overflow: "hidden",
              position: "relative",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.1)",
            }}
          >
            {/* Background template – never modify */}
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

            {/* Overlay elements – positions are percentages of display size
                based on original 1750×863 canvas coordinates */}

            {/* Photo: X=1343=>76.74%, Y=157=>18.19%, W=273=>15.6%, H=414=>47.97% */}
            {member.photo && (
              <img
                src={member.photo}
                alt=""
                style={{
                  position: "absolute",
                  left: "76.74%",
                  top: "18.19%",
                  width: "15.6%",
                  height: "47.97%",
                  objectFit: "cover",
                  borderRadius: `${18 * DISPLAY_SCALE}px`,
                }}
              />
            )}

            {/* Name: X=1110=>63.43%, Y=276=>31.98%, W=200=>11.43%, H=50=>5.79% */}
            <div
              style={{
                position: "absolute",
                left: "63.43%",
                top: "31.98%",
                width: "11.43%",
                height: "5.79%",
                display: "flex",
                alignItems: "center",
                justifyContent: isRtl ? "flex-end" : "flex-start",
                fontWeight: 700,
                fontSize: `${fitText(nameValue, 200, 32) * DISPLAY_SCALE}px`,
                color: "#FFFFFF",
                fontFamily: "'Noto Sans Arabic', 'Arial', sans-serif",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {nameValue}
            </div>

            {/* Position: X=1110=>63.43%, Y=389=>45.07%, W=250=>14.29%, H=50=>5.79% */}
            <div
              style={{
                position: "absolute",
                left: "63.43%",
                top: "45.07%",
                width: "14.29%",
                height: "5.79%",
                display: "flex",
                alignItems: "center",
                justifyContent: isRtl ? "flex-end" : "flex-start",
                fontWeight: 700,
                fontSize: `${fitText(positionText, 250, 30) * DISPLAY_SCALE}px`,
                color: "#FFFFFF",
                fontFamily: "'Noto Sans Arabic', 'Arial', sans-serif",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {positionText}
            </div>

            {/* Membership #: X=1110=>63.43%, Y=508=>58.86%, W=260=>14.86%, H=45=>5.21% */}
            <div
              style={{
                position: "absolute",
                left: "63.43%",
                top: "58.86%",
                width: "14.86%",
                height: "5.21%",
                display: "flex",
                alignItems: "center",
                justifyContent: isRtl ? "flex-end" : "flex-start",
                fontWeight: 700,
                fontSize: `${fitText(member.membershipNumber, 260, 30) * DISPLAY_SCALE}px`,
                letterSpacing: `${1 * DISPLAY_SCALE}px`,
                color: "#D4A843",
                fontFamily: "'Arial', sans-serif",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {member.membershipNumber}
            </div>

            {/* Join Date: X=1110=>63.43%, Y=625=>72.42%, W=250=>14.29%, H=40=>4.63% */}
            <div
              style={{
                position: "absolute",
                left: "63.43%",
                top: "72.42%",
                width: "14.29%",
                height: "4.63%",
                display: "flex",
                alignItems: "center",
                justifyContent: isRtl ? "flex-end" : "flex-start",
                fontSize: `${fitText(joinDate, 250, 28) * DISPLAY_SCALE}px`,
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
        </div>

        {/* ═══════════ BACK SIDE ═══════════ */}
        <div>
          <h3 className="text-base font-bold text-gray-500 mb-3 text-center uppercase tracking-widest">
            {isRtl ? "الوجه الخلفي" : "Back Side"}
          </h3>
          <div
            className="membership-card-back"
            style={{
              width: `${DISPLAY_W}px`,
              height: `${DISPLAY_H}px`,
              borderRadius: "8px",
              overflow: "hidden",
              position: "relative",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.1)",
            }}
          >
            {/* Background template – never modify */}
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

            {/* QR Code: X=365=>20.86%, Y=662=>76.71%, W=140=>8%, H=140=>16.22% */}
            <div
              style={{
                position: "absolute",
                left: "20.86%",
                top: "76.71%",
                width: "8%",
                height: "16.22%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
              }}
            >
              <QRCodeSVG
                value={verificationUrl}
                size={Math.min(
                  DISPLAY_W * 0.08,
                  DISPLAY_H * 0.1622
                )}
                level="M"
                includeMargin={false}
                bgColor="transparent"
                fgColor="#1A3A6B"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      {showDownload && (
        <div className="flex justify-center">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-3 bg-[#1A3A6B] text-white rounded-xl hover:bg-[#0f2547] transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            {isRtl ? "تحميل البطاقة" : "Download Card"}
          </button>
        </div>
      )}
    </div>
  )
}
