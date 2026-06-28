"use client"

import { XCircle, ArrowRight, Home, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function DonationCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-red-500 p-8 text-center">
          <XCircle className="w-20 h-20 text-white mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">تم إلغاء الدفع</h1>
          <p className="text-red-100 mt-2">لم يتم إتمام التبرع</p>
        </div>

        <div className="p-8 text-center space-y-4">
          <p className="text-gray-600">
            لم يتم خصم أي مبلغ من حسابك. يمكنك المحاولة مرة أخرى أو اختيار طريقة دفع أخرى.
          </p>

          <div className="flex flex-col gap-3 pt-4">
            <Link
              href="/donations"
              className="flex items-center justify-center gap-2 bg-[#1A3A6B] text-white py-3 rounded-xl font-bold hover:bg-[#0f2547] transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              المحاولة مرة أخرى
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 border-2 border-[#1A3A6B] text-[#1A3A6B] py-3 rounded-xl font-bold hover:bg-[#1A3A6B]/5 transition-colors"
            >
              <Home className="w-5 h-5" />
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
