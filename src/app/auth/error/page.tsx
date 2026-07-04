"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle, ArrowRight } from "lucide-react"
import { ASSETS } from "@/lib/assets"

const errorMessages: Record<string, string> = {
  "invalid-token": "رابط التأكيد غير صالح",
  "token-expired": "رابط التأكيد منتهي الصلاحية",
  "verification-failed": "فشل التأكيد. يرجى المحاولة مرة أخرى",
  "CredentialsSignin": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  "CallbackRouteError": "حدث خطأ أثناء تسجيل الدخول. تأكد من صحة إعدادات Google OAuth.",
  "AccessDenied": "تم رفض الوصول. تأكد من صحة بيانات تسجيل الدخول.",
  default: "حدث خطأ غير متوقع",
}

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error") || "default"
  const errorMessage = errorMessages[error] || errorMessages.default

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${ASSETS.formBack}')`,
          filter: "blur(2px)",
          opacity: 0.3,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f]/80 via-[#2d5a87]/70 to-[#1e3a5f]/80" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">خطأ في المصادقة</h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 bg-[#c8102e] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#a00d24] transition-colors"
            >
              تسجيل الدخول
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 border-2 border-[#c8102e] text-[#c8102e] px-6 py-3 rounded-lg font-bold hover:bg-[#c8102e]/5 transition-colors"
            >
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">جاري التحميل...</p>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
