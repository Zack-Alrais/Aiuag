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
  joinDate?: string
  issueDate?: string
  expiryDate?: string
  qrValue?: string
}

export type ExportFormat = "html" | "png" | "pdf"

export interface BackCardData {
  qrDataURL?: string
  barcode?: string
  expiryDate?: string
}
