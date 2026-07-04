"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { ASSETS } from "@/lib/assets"

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!token) {
      setError("رابط إعادة التعيين غير صالح")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "حدث خطأ أثناء إعادة تعيين كلمة المرور")
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/auth/login")
      }, 3000)
    } catch {
      setError("حدث خطأ أثناء إعادة تعيين كلمة المرور")
    } finally {
      setLoading(false)
    }
  }

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
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="relative bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] p-8 text-center overflow-hidden">
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
              <h1 className="text-2xl font-bold text-white">إعادة تعيين كلمة المرور</h1>
              <p className="text-white/70 text-sm mt-2">أدخل كلمة المرور الجديدة</p>
            </div>
          </div>

          <div className="p-8">
            {success ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">تم إعادة التعيين بنجاح</h2>
                <p className="text-gray-600 mb-6">سيتم تحويلك لصفحة تسجيل الدخول...</p>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الجديدة</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 pr-11 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8102e] focus:border-transparent text-right"
                        placeholder="••••••••"
                      />
                      <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8102e] focus:border-transparent text-right"
                        placeholder="••••••••"
                      />
                      <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !token}
                    className="w-full bg-[#c8102e] text-white py-3 rounded-lg font-bold hover:bg-[#a00d24] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        جاري إعادة التعيين...
                      </>
                    ) : (
                      "إعادة تعيين كلمة المرور"
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">جاري التحميل...</p>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
