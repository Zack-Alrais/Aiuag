"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle, ArrowRight, Home, Receipt, Copy, Loader2 } from "lucide-react"
import Link from "next/link"

interface DonationResult {
  donationNumber: string
  amount: number
  currency: string
  status: string
  paymentMethod: string
}

function DonationSuccessContent() {
  const searchParams = useSearchParams()
  const donationId = searchParams.get("donationId")
  const paymentId = searchParams.get("paymentId")
  const [donation, setDonation] = useState<DonationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const id = donationId || paymentId
    if (!id) {
      setLoading(false)
      return
    }

    fetch(`/api/payment/status?${donationId ? "donationId" : "paymentId"}=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.donation) {
          setDonation({
            donationNumber: data.donation.donationNumber,
            amount: data.payment?.amount || data.donation.amount,
            currency: data.payment?.currency || data.donation.currency,
            status: data.payment?.status || data.donation.status,
            paymentMethod: data.payment?.gateway || "",
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [donationId, paymentId])

  const copyNumber = () => {
    if (donation) {
      navigator.clipboard.writeText(donation.donationNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-[#1A3A6B] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-green-500 p-8 text-center">
          <CheckCircle className="w-20 h-20 text-white mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">تم استلام التبرع بنجاح</h1>
          <p className="text-green-100 mt-2">شكراً لك على تبرعك</p>
        </div>

        <div className="p-8 space-y-4">
          {donation && (
            <>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-500">رقم التبرع</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#1A3A6B]">{donation.donationNumber}</span>
                  <button onClick={copyNumber} className="text-gray-400 hover:text-[#1A3A6B]">
                    {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-500">المبلغ</span>
                <span className="font-bold text-lg">{donation.amount} {donation.currency}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-500">الحالة</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  donation.status === "completed" ? "bg-green-100 text-green-700" :
                  donation.status === "processing" ? "bg-yellow-100 text-yellow-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {donation.status === "completed" ? "مكتمل" : donation.status === "processing" ? "قيد المعالجة" : donation.status}
                </span>
              </div>
            </>
          )}

          <div className="flex flex-col gap-3 pt-4">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 bg-[#1A3A6B] text-white py-3 rounded-xl font-bold hover:bg-[#0f2547] transition-colors"
            >
              <Home className="w-5 h-5" />
              العودة للرئيسية
            </Link>
            <Link
              href="/donations"
              className="flex items-center justify-center gap-2 border-2 border-[#1A3A6B] text-[#1A3A6B] py-3 rounded-xl font-bold hover:bg-[#1A3A6B]/5 transition-colors"
            >
              تبرع جديد
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DonationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-[#1A3A6B] animate-spin" />
      </div>
    }>
      <DonationSuccessContent />
    </Suspense>
  )
}
