export interface MemberCardData {
  id: string
  nameAr: string
  nameEn: string
  membershipNumber: string
  memberType: string
  title?: string
  photo?: string
  specialization?: string
  department?: string
  graduationYear?: number
  phone?: string
  email?: string
  issueDate?: string
  expiryDate?: string
  joinDate?: string
  qrValue?: string
  barcodeValue?: string
}

export interface BackCardData {
  headerAr?: string
  headerEn?: string
  terms?: string[]
  website?: string
  email?: string
  phone?: string
  socialLinks?: { label: string; value: string }[]
  barcodeValue?: string
  expiryDate?: string
}

export interface TemplateElement {
  x: number
  y: number
  width?: number | string
  height?: number | string
  fontSize?: number
  fontWeight?: string
  color?: string
  textAlign?: string
  fontFamily?: string
  lineHeight?: number
  borderRadius?: number
  border?: string
  clipPath?: string
  size?: number
  letterSpacing?: string
  objectFit?: string
  opacity?: number
}

export interface CardTemplateConfig {
  card: {
    widthMm: number
    heightMm: number
    widthPx: number
    heightPx: number
    aspectRatio: number
  }
  front: {
    colors: Record<string, string>
    elements: Record<string, TemplateElement>
  }
  back: {
    colors: Record<string, string>
    elements: Record<string, TemplateElement>
  }
}

export type ExportFormat = "png" | "pdf" | "print" | "html"
