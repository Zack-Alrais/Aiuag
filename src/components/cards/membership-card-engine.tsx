"use client"

import { useRef, useCallback, useState } from "react"
import { MemberCardData } from "@/templates/membership-card/types"
import { CardFront } from "./card-front"
import { CardBack } from "./card-back"

const CANVAS_W = 1750
const CANVAS_H = 863

interface Props {
  member: MemberCardData
  showDownload?: boolean
  showFlip?: boolean
  size?: "sm" | "md" | "lg"
  showBoth?: boolean
}

export function MembershipCardEngine({
  member,
  showDownload = false,
  showFlip = true,
  size = "md",
  showBoth = false,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [flipped, setFlipped] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleDownload = useCallback(async () => {
    if (typeof window === "undefined") return
    setIsExporting(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const card = cardRef.current
      if (!card) return

      // Temporarily show front for full card render
      const wasFlipped = flipped
      if (wasFlipped) setFlipped(false)

      await new Promise((r) => setTimeout(r, 100))

      const canvas = await html2canvas(card, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        width: card.scrollWidth,
        height: card.scrollHeight,
      })

      const link = document.createElement("a")
      link.download = `membership-card-${member.membershipNumber}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (err) {
      console.error("Download failed:", err)
    } finally {
      setIsExporting(false)
    }
  }, [flipped, member.membershipNumber])

  const handlePrint = useCallback(() => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const cardEl = cardRef.current
    if (!cardEl) return

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>بطاقة العضوية - ${member.nameAr}</title>
          <style>
            @page { size: 85.6mm 107.96mm; margin: 0; }
            body { margin: 0; padding: 0; display: flex; flex-direction: column; align-items: center; font-family: 'Noto Sans Arabic', sans-serif; }
            .card-wrapper { transform: scale(0.5); transform-origin: top center; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${cardEl.innerHTML}
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }, [member])

  // Scale factors to map 1750×863 canvas to display size
  const scaleMap = { sm: 0.15, md: 0.22, lg: 0.35 }
  const scale = scaleMap[size]

  return (
    <div
      className="membership-card-wrapper"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        ref={cardRef}
        className="membership-card"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        {(!flipped || showBoth) && <CardFront member={member} />}
        {(flipped || showBoth) && <CardBack member={member} />}
      </div>

      <div
        className="card-actions no-print"
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {showFlip && !showBoth && (
          <button
            onClick={() => setFlipped(!flipped)}
            className="btn btn-sm btn-outline"
            style={{
              padding: "6px 16px",
              borderRadius: 6,
              border: "1px solid #1A3A6B",
              background: "white",
              color: "#1A3A6B",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {flipped ? "الوجه الأمامي" : "الوجه الخلفي"}
          </button>
        )}

        {showDownload && (
          <>
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="btn btn-sm btn-primary"
              style={{
                padding: "6px 16px",
                borderRadius: 6,
                border: "none",
                background: "#1A3A6B",
                color: "white",
                cursor: isExporting ? "not-allowed" : "pointer",
                fontSize: 13,
                fontWeight: 600,
                opacity: isExporting ? 0.7 : 1,
              }}
            >
              {isExporting ? "...جاري التحميل" : "تحميل PNG"}
            </button>
            <button
              onClick={handlePrint}
              className="btn btn-sm btn-secondary"
              style={{
                padding: "6px 16px",
                borderRadius: 6,
                border: "1px solid #D4A843",
                background: "#D4A843",
                color: "#1A3A6B",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              طباعة
            </button>
          </>
        )}
      </div>
    </div>
  )
}
