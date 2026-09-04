"use client"

import { useRef, useCallback, useState, useEffect, useMemo } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Download, Printer, RotateCcw } from "lucide-react"
import { ASSETS } from "@/lib/assets"

interface MemberCardData {
  id: string
  nameAr: string
  nameEn: string
  membershipNumber: string
  memberType: string
  position?: string
  positionEn?: string
  jobTitle?: string
  photo?: string
  specialization?: string
  graduationYear?: number
  phone?: string
  email?: string
  joinDate?: string
  expiryDate?: string
}

interface Props {
  member: MemberCardData
  showDownload?: boolean
  showFlip?: boolean
  size?: "sm" | "md" | "lg"
  showBoth?: boolean
  showActions?: boolean
}

const DESIGN_W = 450
const DESIGN_H = 280
const CARD_GAP = 16

const COLORS = {
  deep: "#073763",
  primary: "#0b5394",
  light: "#3d85c6",
  green: "#6aa84f",
  gold: "#D4A843",
  text: "#333333",
}

export function MembershipCardEngine({
  member,
  showDownload = false,
  showFlip = true,
  size = "md",
  showBoth = false,
  showActions = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const frontRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<HTMLDivElement>(null)
  const barcodeRef = useRef<SVGSVGElement>(null)
  const [flipped, setFlipped] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [scale, setScale] = useState(1)
  const [exportRaw, setExportRaw] = useState(false)

  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const verificationUrl = `${origin}/ar/verify?id=${member.membershipNumber}`
  const joinDate = member.joinDate || new Date().toISOString().slice(0, 10)
  const photoUrl = member.photo || ""

  const expiryDate = useMemo(() => {
    if (member.expiryDate) return member.expiryDate
    const parts = joinDate.split("-")
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
      d.setFullYear(d.getFullYear() + 2)
      return d.toISOString().slice(0, 10)
    }
    return ""
  }, [member.expiryDate, joinDate])

  const showBack = flipped || showBoth

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth
      setScale(Math.min(1, w / DESIGN_W))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!showBack || !barcodeRef.current || typeof window === "undefined") return
    let cancelled = false
    import("jsbarcode").then((mod) => {
      if (cancelled) return
      const JsBarcode = (mod.default || mod) as typeof import("jsbarcode")
      try {
        JsBarcode(barcodeRef.current!, member.membershipNumber, {
          format: "CODE128",
          width: 2,
          height: 40,
          displayValue: true,
          fontSize: 11,
          margin: 0,
          background: "#ffffff",
          lineColor: "#000000",
        })
      } catch {
        /* barcode might already be drawn */
      }
    })
    return () => {
      cancelled = true
    }
  }, [showBack, member.membershipNumber])

  const effectiveScale = exportRaw ? 1 : scale
  const totalHeight = showBoth ? (DESIGN_H + CARD_GAP) * effectiveScale : DESIGN_H * effectiveScale

  const handleDownload = useCallback(async () => {
    if (typeof window === "undefined") return
    setIsExporting(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      setExportRaw(true)
      await new Promise((r) => setTimeout(r, 160))
      const face = (flipped ? backRef : frontRef).current
      if (!face) return
      const canvas = await html2canvas(face, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
      })
      const link = document.createElement("a")
      link.download = `membership-card-${member.membershipNumber}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (err) {
      console.error("Download failed:", err)
    } finally {
      setExportRaw(false)
      setIsExporting(false)
    }
  }, [flipped, member.membershipNumber])

  const handlePrint = useCallback(() => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return
    const wrapEl = wrapperRef.current
    if (!wrapEl) return
    setExportRaw(true)
    setTimeout(() => {
      const html = wrapperRef.current?.innerHTML || ""
      setExportRaw(false)
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>بطاقة العضوية - ${member.nameAr}</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
              @page { size: 450px 280px; margin: 0; }
              body { margin: 0; padding: 0; font-family: 'Cairo', sans-serif; }
              @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
            </style>
          </head>
          <body>${html}<script>window.onload = function() { window.print(); window.close(); }</script></body>
        </html>
      `)
      printWindow.document.close()
    }, 120)
  }, [member])

  const scaleExtra = { sm: 0.82, md: 1, lg: 1.12 }[size] ?? 1

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4 w-full">
      <div
        ref={wrapperRef}
        className="membership-card"
        style={{
          position: "relative",
          width: DESIGN_W * effectiveScale * scaleExtra,
          height: totalHeight * scaleExtra,
        }}
      >
        {(!flipped || showBoth) && (
        <div
          ref={frontRef}
          onClick={() => { if (!showBoth) setFlipped(true) }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: DESIGN_W,
            height: DESIGN_H,
            transform: `scale(${effectiveScale * scaleExtra})`,
            transformOrigin: "top left",
            borderRadius: "14px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.16)",
            border: "1px solid #d5d5d5",
            fontFamily: "'Cairo', sans-serif",
            direction: "rtl",
            backgroundColor: "#ffffff",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            cursor: showBoth ? "default" : "pointer",
          }}
        >
          {/* Front header */}
          <div
            style={{
              background: `linear-gradient(135deg, ${COLORS.deep}, ${COLORS.primary})`,
              color: "#fff",
              padding: "10px 18px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <img
              src={ASSETS.logo}
              alt=""
              style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#fff", objectFit: "contain", flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "15px", fontWeight: 700, lineHeight: 1.3 }}>
                رابطة خريجي جامعة إفريقيا العالمية
              </div>
              <div style={{ fontSize: "10px", opacity: 0.92 }}>
                Graduates of International University of Africa Association
              </div>
            </div>
            <div
              style={{
                background: COLORS.gold,
                color: COLORS.deep,
                fontSize: "11px",
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: "999px",
                flexShrink: 0,
              }}
            >
              بطاقة عضوية
            </div>
          </div>

          {/* Front body */}
          <div style={{ display: "flex", flex: 1, padding: "10px 18px", gap: "14px" }}>
            {/* Photo */}
            <div style={{ width: 88, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="صورة العضو"
                  style={{ width: "82px", height: "104px", borderRadius: "8px", objectFit: "cover", border: "2px solid #d0d0d0" }}
                />
              ) : (
                <div
                  style={{
                    width: "82px",
                    height: "104px",
                    borderRadius: "8px",
                    backgroundColor: "#e8ecf4",
                    border: "2px solid #d0d0d0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "30px",
                    fontWeight: 700,
                    color: COLORS.primary,
                  }}
                >
                  {member.nameAr?.charAt(0) || "A"}
                </div>
              )}
            </div>

            {/* Details */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "5px", minWidth: 0 }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: COLORS.deep, marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {member.nameAr || member.nameEn}
              </div>
              {member.nameAr && member.nameEn && member.nameEn !== member.nameAr && (
                <div dir="ltr" style={{ fontSize: "10px", color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textAlign: "left" }}>
                  {member.nameEn}
                </div>
              )}
              <DataRow label="الصفة:" value={member.position || member.memberType || "عضو"} strong />
              <DataRow label="المهنة:" value={member.jobTitle || ""} />
              <DataRow label="رقم العضوية:" value={member.membershipNumber} ltr />
              <div style={{ display: "flex", gap: "20px" }}>
                <DataRow label="الانضمام:" value={joinDate} ltr compact />
                <DataRow label="الصلاحية:" value={expiryDate || "------"} ltr compact highlight />
              </div>
            </div>

            {/* QR */}
            <div style={{ width: 82, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <div
                style={{ width: "76px", height: "76px", opacity: 0.3, }}
              >
                <img src={ASSETS.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
              <div style={{ width: "64px", height: "64px", background: "#fff", padding: "3px", borderRadius: "6px", boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }}>
                <QRCodeSVG value={verificationUrl} size={64} bgColor="#ffffff" fgColor="#000000" level="H" />
              </div>
            </div>
          </div>

          {/* Colored decorative bar */}
          <div
            style={{
              height: "5px",
              background: `linear-gradient(to right, ${COLORS.gold}, ${COLORS.green}, ${COLORS.primary}, ${COLORS.gold})`,
            }}
          />

          {/* Front footer */}
          <div
            style={{
              backgroundColor: COLORS.deep,
              color: "white",
              textAlign: "center",
              padding: "6px",
              fontSize: "10px",
              fontWeight: 600,
            }}
          >
            معاً من أجل تعليم متميز وتنمية مستدامة في إفريقيا
          </div>
        </div>
        )}

        {(flipped || showBoth) && (
          <div
            ref={backRef}
            onClick={() => { if (!showBoth) setFlipped(false) }}
            style={{
              position: "absolute",
              top: showBoth ? (DESIGN_H + CARD_GAP) * effectiveScale * scaleExtra : 0,
              left: 0,
              width: DESIGN_W,
              height: DESIGN_H,
              transform: `scale(${effectiveScale * scaleExtra})`,
              transformOrigin: "top left",
              borderRadius: "14px",
              boxShadow: "0 6px 16px rgba(0,0,0,0.16)",
              border: "1px solid #d5d5d5",
              fontFamily: "'Cairo', sans-serif",
              direction: "rtl",
              backgroundColor: "#ffffff",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              cursor: showBoth ? "default" : "pointer",
            }}
          >
            {/* Back header */}
            <div
              style={{
                background: `linear-gradient(135deg, ${COLORS.light}, ${COLORS.primary})`,
                color: "white",
                textAlign: "center",
                padding: "7px 18px",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 700 }}>رابطة خريجي جامعة إفريقيا العالمية</div>
              <div style={{ fontSize: "9px", opacity: 0.95 }}>Graduates IUA Association</div>
            </div>

            {/* Back body */}
            <div style={{ display: "flex", flex: 1, padding: "10px 18px", gap: "12px" }}>
              <div
                style={{
                  flex: 1,
                  paddingLeft: "14px",
                  borderLeft: "1px solid #ddd",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <ul style={{ paddingRight: "16px", margin: 0, color: COLORS.deep, fontSize: "9px", lineHeight: 1.6 }}>
                  <li>هذه البطاقة شخصية ولا يجوز لغير حاملها استخدامها.</li>
                  <li>يجب إبراز البطاقة عند الاستفادة من خدمات الرابطة.</li>
                  <li>في حالة فقدان البطاقة، يرجى إبلاغ الرابطة فوراً.</li>
                  <li>تبقى هذه البطاقة ملكاً للرابطة وتُعاد عند طلبها أو انتهاء العضوية.</li>
                </ul>
              </div>

              <div style={{ flex: 0.8, display: "flex", flexDirection: "column", justifyContent: "center", gap: "8px", color: COLORS.deep, fontWeight: 600, fontSize: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg viewBox="0 0 24 24" style={{ width: "13px", height: "13px", fill: COLORS.primary, flexShrink: 0 }}>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                  <span dir="ltr" style={{ textAlign: "left" }}>www.aiuag.com</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg viewBox="0 0 24 24" style={{ width: "13px", height: "13px", fill: COLORS.primary, flexShrink: 0 }}>
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  <span dir="ltr" style={{ textAlign: "left" }}>info@aiuag.com</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg viewBox="0 0 24 24" style={{ width: "13px", height: "13px", fill: COLORS.primary, flexShrink: 0 }}>
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                  <span dir="ltr" style={{ textAlign: "left" }}>+249 123 456 789</span>
                </div>
              </div>

              <div style={{ width: 64, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={ASSETS.logo} alt="الشعار" style={{ width: "58px", height: "58px", objectFit: "contain" }} />
              </div>
            </div>

            {/* Colored decorative bar (same as front) */}
            <div
              style={{
                height: "5px",
                background: `linear-gradient(to right, ${COLORS.gold}, ${COLORS.green}, ${COLORS.primary}, ${COLORS.gold})`,
              }}
            />

            {/* Back footer */}
            <div
              style={{
                backgroundColor: COLORS.deep,
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "5px 18px",
              }}
            >
              <div style={{ backgroundColor: "white", padding: "2px 4px", borderRadius: "4px", height: "38px", display: "flex", alignItems: "center" }}>
                <svg ref={barcodeRef} style={{ height: "34px" }} />
              </div>
              <div style={{ textAlign: "left", fontSize: "9px", fontWeight: "bold", lineHeight: 1.4 }}>
                تسري هذه البطاقة حتى
                <br />
                <span style={{ color: COLORS.gold }}>{expiryDate || "------"}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {showActions && (
        <div className="flex gap-2 flex-wrap justify-center no-print">
          {showFlip && !showBoth && (
            <button
              onClick={(e) => { e.stopPropagation(); setFlipped(!flipped) }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              {flipped ? "الوجه الأمامي" : "الوجه الخلفي"}
            </button>
          )}
          {showDownload && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handleDownload() }}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-60"
              >
                <Download className="w-4 h-4" />
                {isExporting ? "...جاري التحميل" : "تحميل PNG"}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrint() }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-primary-dark text-sm font-medium hover:bg-secondary-light transition-colors"
              >
                <Printer className="w-4 h-4" />
                طباعة
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function DataRow({
  label,
  value,
  ltr = false,
  compact = false,
  strong = false,
  highlight = false,
}: {
  label: string
  value: string
  ltr?: boolean
  compact?: boolean
  strong?: boolean
  highlight?: boolean
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        fontSize: compact ? "9.5px" : "10.5px",
        fontWeight: strong ? 700 : 600,
        color: strong ? COLORS.deep : COLORS.text,
        gap: "6px",
      }}
    >
      <span style={{ color: "#777", flexShrink: 0 }}>{label}</span>
      <span
        dir={ltr ? "ltr" : undefined}
        style={{
          borderBottom: "1px dotted #bbb",
          flexGrow: 1,
          paddingBottom: "1px",
          color: highlight ? COLORS.green : COLORS.text,
          fontWeight: strong ? 700 : 600,
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          textAlign: ltr ? "left" : undefined,
        }}
      >
        {value || "———"}
      </span>
    </div>
  )
}