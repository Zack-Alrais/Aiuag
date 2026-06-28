import prisma from "@/lib/prisma"
import { generateReceiptNumber } from "./utils"
import { Currency, CURRENCIES } from "@/types/payment"

// ─── Generate donation receipt ────────────────────────────────
export async function generateDonationReceipt(donationId: string) {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: {
      payment: true,
      receipt: true,
    },
  })

  if (!donation) {
    throw new Error("Donation not found")
  }

  if (donation.receipt) {
    return donation.receipt
  }

  const receiptNumber = generateReceiptNumber()
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9000"}/verify?receipt=${receiptNumber}`

  const receipt = await prisma.donationReceipt.create({
    data: {
      receiptNumber,
      donationId,
      donorName: donation.donorName,
      donorEmail: donation.donorEmail,
      amount: donation.amount,
      currency: donation.currency,
      paymentMethod: donation.gateway || "unknown",
      gatewayReference: donation.payment?.gatewayReference || "",
    },
  })

  return receipt
}

// ─── Generate receipt HTML ────────────────────────────────────
export function generateReceiptHtml(receipt: {
  receiptNumber: string
  donorName: string
  donorEmail: string
  amount: number
  currency: string
  paymentMethod: string
  gatewayReference: string
  issuedAt: Date
}): string {
  const currencyConfig = CURRENCIES[receipt.currency as Currency]
  const symbol = currencyConfig?.symbol || "$"
  const methodName = receipt.paymentMethod

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Tajawal', sans-serif; background: #f0f2f5; padding: 40px; }
        .receipt { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #1A3A6B, #2B5EA7); padding: 40px 30px; text-align: center; color: white; }
        .header h1 { font-size: 24px; margin-bottom: 8px; }
        .header p { opacity: 0.8; font-size: 14px; }
        .body { padding: 40px 30px; }
        .row { display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #f1f5f9; }
        .row:last-child { border-bottom: none; }
        .label { color: #64748b; font-size: 14px; }
        .value { font-weight: 700; color: #1e293b; }
        .amount-box { background: #ecfdf5; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0; }
        .amount { font-size: 36px; font-weight: 800; color: #059669; }
        .footer { background: #1A3A6B; padding: 24px; text-align: center; color: rgba(255,255,255,0.7); font-size: 12px; }
        .qr { margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" style="margin-bottom:16px"><circle cx="32" cy="32" r="30" stroke="rgba(255,255,255,0.2)" stroke-width="2" fill="rgba(255,255,255,0.1)"/><circle cx="32" cy="32" r="20" fill="#D4A843"/><path d="M32 18L40 23V41L32 46L24 41V23L32 18Z" fill="#1A3A6B"/></svg>
          <h1>إيصال التبرع</h1>
          <p>رابطة خريجي جامعة أفريقيا العالمية</p>
        </div>
        <div class="body">
          <div class="amount-box">
            <div class="amount">${symbol}${receipt.amount.toFixed(2)}</div>
            <div style="color:#059669;font-size:14px;margin-top:4px">${currencyConfig?.nameAr || receipt.currency}</div>
          </div>
          <div class="row"><span class="label">رقم الإيصال</span><span class="value" style="font-family:monospace">${receipt.receiptNumber}</span></div>
          <div class="row"><span class="label">الاسم</span><span class="value">${receipt.donorName}</span></div>
          <div class="row"><span class="label">البريد الإلكتروني</span><span class="value" dir="ltr">${receipt.donorEmail}</span></div>
          <div class="row"><span class="label">طريقة الدفع</span><span class="value">${methodName}</span></div>
          <div class="row"><span class="label">رقم المعاملة</span><span class="value" style="font-family:monospace;font-size:12px">${receipt.gatewayReference}</span></div>
          <div class="row"><span class="label">التاريخ</span><span class="value">${new Date(receipt.issuedAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span></div>
        </div>
        <div class="footer">
          <p>شكراً لك على تبرعك. هذا الإيصال يُعتبر مستنداً رسمياً.</p>
          <p style="margin-top:8px">&copy; ${new Date().getFullYear()} رابطة خريجي جامعة أفريقيا العالمية</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// ─── Send donation confirmation email ─────────────────────────
export async function sendDonationConfirmationEmail(donationId: string) {
  const receipt = await generateDonationReceipt(donationId)
  const { sendEmail } = await import("@/lib/email")

  const html = generateReceiptHtml(receipt)

  await sendEmail({
    to: receipt.donorEmail,
    subject: `إيصال تبرع - ${receipt.receiptNumber}`,
    html,
  })
}
