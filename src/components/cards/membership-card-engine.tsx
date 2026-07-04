"use client"

import { useRef, useCallback, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Download, Printer, RotateCcw } from "lucide-react"

interface MemberCardData {
  id: string
  nameAr: string
  nameEn: string
  membershipNumber: string
  memberType: string
  title?: string
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

  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const verificationUrl = `${origin}/ar/verify?id=${member.membershipNumber}`
  const joinDate = member.joinDate || new Date().toLocaleDateString("en-GB")
  const expiryDate = member.expiryDate || ""
  const photoUrl = member.photo || ""

  const handleDownload = useCallback(async () => {
    if (typeof window === "undefined") return
    setIsExporting(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const card = cardRef.current
      if (!card) return
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
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            @page { size: 450px 280px; margin: 0; }
            body { margin: 0; padding: 0; font-family: 'Cairo', sans-serif; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>${cardEl.innerHTML}<script>window.onload = function() { window.print(); window.close(); }</script></body>
      </html>
    `)
    printWindow.document.close()
  }, [member])

  const scaleMap = { sm: 0.55, md: 0.75, lg: 1.0 }
  const scale = scaleMap[size]

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={cardRef}
        className="membership-card"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        {(!flipped || showBoth) && (
          <div
            className="bg-white rounded-xl overflow-hidden"
            style={{
              width: "450px",
              height: "280px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              border: "1px solid #ddd",
              fontFamily: "'Cairo', sans-serif",
              direction: "rtl",
            }}
          >
            {/* Front Header */}
            <div
              style={{
                textAlign: "center",
                color: "#0b5394",
                padding: "8px 0 4px",
                borderBottom: "2px solid #6aa84f",
                margin: "0 20px",
              }}
            >
              <div style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>
                رابطة خريجي جامعة إفريقيا العالمية
              </div>
              <div style={{ margin: 0, fontSize: "11px", fontWeight: 600 }}>
                Graduates IUA Association
              </div>
            </div>

            {/* Front Body */}
            <div
              style={{
                display: "flex",
                padding: "8px 20px",
                height: "180px",
              }}
            >
              {/* Photo */}
              <div
                style={{
                  width: "25%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="صورة العضو"
                    style={{
                      width: "85px",
                      height: "105px",
                      borderRadius: "8px",
                      objectFit: "cover",
                      border: "2px solid #ccc",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "85px",
                      height: "105px",
                      borderRadius: "8px",
                      backgroundColor: "#e0e0e0",
                      border: "2px solid #ccc",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "28px",
                      fontWeight: 700,
                      color: "#0b5394",
                    }}
                  >
                    {member.nameAr?.charAt(0) || "A"}
                  </div>
                )}
              </div>

              {/* Data */}
              <div
                style={{
                  width: "50%",
                  padding: "0 15px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    margin: "0 0 8px",
                    color: "#0b5394",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  بطاقة عضوية
                </div>
                <DataRow label="الاسم:" value={member.nameAr || member.nameEn} />
                <DataRow label="الصفة:" value={member.title || member.memberType || "عضو"} />
                <DataRow label="رقم العضوية:" value={member.membershipNumber} />
                <DataRow label="تاريخ الانضمام:" value={joinDate} />
              </div>

              {/* QR Code & Watermark Logo */}
              <div
                style={{
                  width: "25%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  paddingTop: "12px",
                  position: "relative",
                }}
              >
                {/* Watermark logo */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "110px",
                    opacity: 0.15,
                    zIndex: 0,
                  }}
                >
                  <img
                    src="/uploads/شعار الرابطة.jpg"
                    alt=""
                    style={{ width: "100%", height: "auto" }}
                  />
                </div>
                {/* QR Code */}
                <div style={{ zIndex: 1, width: "75px", height: "75px" }}>
                  <QRCodeSVG
                    value={verificationUrl}
                    size={75}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                  />
                </div>
              </div>
            </div>

            {/* Front Footer */}
            <div
              style={{
                backgroundColor: "#073763",
                color: "white",
                textAlign: "center",
                padding: "6px",
                fontSize: "10px",
                position: "absolute",
                bottom: 0,
                width: "100%",
              }}
            >
              معاً من أجل تعليم متميز وتنمية مستدامة في إفريقيا
            </div>
          </div>
        )}

        {(flipped || showBoth) && (
          <div
            className="bg-white rounded-xl overflow-hidden"
            style={{
              width: "450px",
              height: "280px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              border: "1px solid #ddd",
              fontFamily: "'Cairo', sans-serif",
              direction: "rtl",
              marginTop: showBoth ? "16px" : 0,
            }}
          >
            {/* Back Header */}
            <div
              style={{
                backgroundColor: "#3d85c6",
                color: "white",
                textAlign: "center",
                padding: "8px",
                borderBottomLeftRadius: "20px",
                borderBottomRightRadius: "20px",
                margin: "0 20px",
              }}
            >
              <div style={{ margin: 0, fontSize: "14px", fontWeight: 700 }}>
                رابطة خريجي جامعة إفريقيا العالمية
              </div>
              <div style={{ margin: 0, fontSize: "10px" }}>
                Graduates IUA Association
              </div>
            </div>

            {/* Back Body */}
            <div
              style={{
                display: "flex",
                padding: "12px 20px",
                justifyContent: "space-between",
              }}
            >
              {/* Terms */}
              <div
                style={{
                  width: "48%",
                  paddingLeft: "10px",
                  borderLeft: "1px solid #ccc",
                }}
              >
                <ul
                  style={{
                    paddingRight: "15px",
                    margin: 0,
                    color: "#073763",
                    fontSize: "9px",
                    lineHeight: 1.5,
                  }}
                >
                  <li style={{ marginBottom: "4px" }}>هذه البطاقة شخصية ولا يجوز لغير حاملها استخدامها.</li>
                  <li style={{ marginBottom: "4px" }}>يجب إبراز البطاقة عند الاستفادة من خدمات الرابطة.</li>
                  <li style={{ marginBottom: "4px" }}>في حالة فقدان البطاقة، يرجى إبلاغ الرابطة فوراً.</li>
                  <li style={{ marginBottom: "4px" }}>تبقى هذه البطاقة ملكاً للرابطة ويجب إعادتها عند الطلب أو عند انتهاء العضوية.</li>
                </ul>
              </div>

              {/* Contact Info */}
              <div
                style={{
                  width: "30%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  color: "#073763",
                  fontWeight: 600,
                  fontSize: "11px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg viewBox="0 0 24 24" style={{ width: "14px", height: "14px", fill: "#0b5394", flexShrink: 0 }}>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                  www.aiuag.com
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg viewBox="0 0 24 24" style={{ width: "14px", height: "14px", fill: "#0b5394", flexShrink: 0 }}>
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  info@aiuag.com
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg viewBox="0 0 24 24" style={{ width: "14px", height: "14px", fill: "#0b5394", flexShrink: 0 }}>
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                  +249 123 456 789
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg viewBox="0 0 24 24" style={{ width: "14px", height: "14px", fill: "#0b5394", flexShrink: 0 }}>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  Khartoum - Sudan
                </div>
              </div>

              {/* Logo */}
              <div style={{ width: "18%", textAlign: "center" }}>
                <img
                  src="/uploads/شعار الرابطة.jpg"
                  alt="الشعار"
                  style={{ width: "60px", height: "auto", borderRadius: "50%" }}
                />
              </div>
            </div>

            {/* Back Footer */}
            <div
              style={{
                backgroundColor: "#073763",
                color: "white",
                position: "absolute",
                bottom: 0,
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "6px 20px",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  backgroundColor: "white",
                  padding: "2px",
                  borderRadius: "4px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg id="barcode" style={{ height: "26px" }} />
              </div>
              <div
                style={{
                  textAlign: "left",
                  fontSize: "9px",
                  fontWeight: "bold",
                  lineHeight: 1.3,
                }}
              >
                تسري هذه البطاقة حتى
                <br />
                <span>{expiryDate || "------"}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap justify-center no-print">
        {showFlip && !showBoth && (
          <button
            onClick={() => setFlipped(!flipped)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            {flipped ? "الوجه الأمامي" : "الوجه الخلفي"}
          </button>
        )}
        {showDownload && (
          <>
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              {isExporting ? "...جاري التحميل" : "تحميل PNG"}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-primary-dark text-sm font-medium hover:bg-secondary-light transition-colors"
            >
              <Printer className="w-4 h-4" />
              طباعة
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        fontSize: "10px",
        marginBottom: "8px",
        fontWeight: 600,
      }}
    >
      <span style={{ width: "75px", color: "#333" }}>{label}</span>
      <span
        style={{
          borderBottom: "1px dotted #999",
          flexGrow: 1,
          paddingBottom: "2px",
          color: "#333",
        }}
      >
        {value || "———"}
      </span>
    </div>
  )
}
