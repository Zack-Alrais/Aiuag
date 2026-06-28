import QRCode from "qrcode"

export async function generateQRDataURL(value: string, options?: { width?: number; margin?: number }): Promise<string> {
  return QRCode.toDataURL(value, {
    width: options?.width || 300,
    margin: options?.margin || 1,
    color: {
      dark: "#1A3A6B",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "M",
  })
}

export function generateVerificationURL(origin: string, membershipNumber: string, lang: string): string {
  return `${origin}/${lang}/verify?id=${membershipNumber}`
}
