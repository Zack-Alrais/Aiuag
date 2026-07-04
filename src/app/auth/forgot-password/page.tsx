"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowRight, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { ASSETS } from "@/lib/assets"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "حدث خطأ أثناء إرسال الطلب")
        return
      }

      setSuccess(true)
    } catch {
      setError("حدث خطأ أثناء إرسال الطلب")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background Image */}
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
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] p-8 text-center overflow-hidden">
            {/* Header Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${ASSETS.formHead}')`,
                opacity: 0.35,
              }}
            />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <img src={ASSETS.logo} alt="Logo" className="w-12 h-12 rounded-full object-cover" />
              </div>
              <h1 className="text-2xl font-bold text-white">نسيت كلمة المرور؟</h1>
              <p className="text-white/70 text-sm mt-2">أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            {success ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">تم إرسال الرابط</h2>
                <p className="text-gray-600 mb-6">
                  إذا كان البريد الإلكتروني <strong>{email}</strong> مسجلاً، ستتلقى رسالة لإعادة تعيين كلمة المرور.
                </p>
                <Link
                  href="/auth/login"
                  className="inline-block bg-[#c8102e] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#a00d24] transition-colors"
                >
                  العودة لتسجيل الدخول
                </Link>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8102e] focus:border-transparent text-right"
                        placeholder="example@email.com"
                        dir="ltr"
                      />
                      <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#c8102e] text-white py-3 rounded-lg font-bold hover:bg-[#a00d24] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        إرسال رابط إعادة التعيين
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center mt-6 text-sm text-gray-600">
                  <Link href="/auth/login" className="text-[#c8102e] font-bold hover:underline">
                    العودة لتسجيل الدخول
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
