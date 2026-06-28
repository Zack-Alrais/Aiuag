import { MemberCardData, ExportFormat, BackCardData } from "@/templates/membership-card/types"
import { generateQRDataURL } from "./qrCode"

const CANVAS_W = 1750
const CANVAS_H = 863

export interface RenderOptions {
  lang?: string
  origin?: string
  format?: ExportFormat
  backData?: BackCardData
}

export interface RenderResult {
  frontHtml: string
  backHtml: string
  png?: string
  pdf?: string
}

class TemplateEngineClass {
  async render(member: MemberCardData, options: RenderOptions = {}): Promise<RenderResult> {
    const lang = options.lang || "ar"
    const origin = options.origin || "http://localhost:9000"

    const qrDataURL = await generateQRDataURL(
      member.qrValue || `${origin}/${lang}/verify?id=${member.membershipNumber}`
    )

    const isRtl = lang === "ar"

    const frontHtml = this.buildFrontHtml(member, isRtl)
    const backHtml = this.buildBackHtml(qrDataURL)

    return { frontHtml, backHtml }
  }

  /**
   * Auto-reduce font size if text exceeds allowed width.
   */
  private fitText(text: string, maxWidth: number, baseSize: number, minSize = 10): number {
    if (!text) return baseSize
    const estimatedWidth = text.length * baseSize * 0.6
    if (estimatedWidth <= maxWidth) return baseSize
    const adjusted = Math.floor((maxWidth / (text.length * 0.6)) * 10) / 10
    return Math.max(adjusted, minSize)
  }

  private buildFrontHtml(member: MemberCardData, isRtl: boolean): string {
    const nameValue = isRtl ? member.nameAr : member.nameEn
    const positionText = member.title || member.memberType || (isRtl ? "عضو" : "Member")
    const joinDate = member.joinDate || member.issueDate || new Date().toLocaleDateString("en-GB")

    const nameSize = this.fitText(nameValue, 200, 32)
    const positionSize = this.fitText(positionText, 250, 30)
    const memNumSize = this.fitText(member.membershipNumber, 260, 30)
    const dateSize = this.fitText(joinDate, 250, 28)

    const justify = (rtl: boolean) => rtl ? "flex-end" : "flex-start"

    return `
<div style="position:relative;width:${CANVAS_W}px;height:${CANVAS_H}px;overflow:hidden;direction:${isRtl ? "rtl" : "ltr"};">
  <!-- Background template -->
  <img src="/uploads/Front.svg" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none;" />

  ${member.photo ? `
  <!-- Member Photo: X=1343, Y=157, W=273, H=414 -->
  <img src="${this.escapeHtml(member.photo)}" alt="" style="position:absolute;left:1343px;top:157px;width:273px;height:414px;object-fit:cover;border-radius:18px;" />
  ` : ""}

  <!-- Member Name: X=1110, Y=276, W=200, H=50 -->
  <div style="position:absolute;left:1110px;top:276px;width:200px;height:50px;display:flex;align-items:center;justify-content:${justify(isRtl)};font-weight:700;font-size:${nameSize}px;color:#FFFFFF;font-family:'Noto Sans Arabic','Arial',sans-serif;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">
    ${this.escapeHtml(nameValue)}
  </div>

  <!-- Member Position: X=1110, Y=389, W=250, H=50 -->
  <div style="position:absolute;left:1110px;top:389px;width:250px;height:50px;display:flex;align-items:center;justify-content:${justify(isRtl)};font-weight:700;font-size:${positionSize}px;color:#FFFFFF;font-family:'Noto Sans Arabic','Arial',sans-serif;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">
    ${this.escapeHtml(positionText)}
  </div>

  <!-- Membership Number: X=1110, Y=508, W=260, H=45 -->
  <div style="position:absolute;left:1110px;top:508px;width:260px;height:45px;display:flex;align-items:center;justify-content:${justify(isRtl)};font-weight:700;font-size:${memNumSize}px;letter-spacing:1px;color:#D4A843;font-family:'Arial',sans-serif;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">
    ${this.escapeHtml(member.membershipNumber || "")}
  </div>

  <!-- Join Date: X=1110, Y=625, W=250, H=40 -->
  <div style="position:absolute;left:1110px;top:625px;width:250px;height:40px;display:flex;align-items:center;justify-content:${justify(isRtl)};font-size:${dateSize}px;color:#FFFFFF;font-family:'Noto Sans Arabic','Arial',sans-serif;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">
    ${this.escapeHtml(joinDate)}
  </div>
</div>`
  }

  private buildBackHtml(qrDataURL: string): string {
    return `
<div style="position:relative;width:${CANVAS_W}px;height:${CANVAS_H}px;overflow:hidden;">
  <!-- Background template -->
  <img src="/uploads/Back.svg" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none;" />

  ${qrDataURL ? `
  <!-- QR Code: X=365, Y=662, W=140, H=140 -->
  <div style="position:absolute;left:365px;top:662px;width:140px;height:140px;display:flex;align-items:center;justify-content:center;background:transparent;">
    <img src="${qrDataURL}" alt="QR" style="width:140px;height:140px;object-fit:contain;" />
  </div>
  ` : ""}
</div>`
  }

  private escapeHtml(text: string): string {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
  }
}

export const TemplateEngine = new TemplateEngineClass()
