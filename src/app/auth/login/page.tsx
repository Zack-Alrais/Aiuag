"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setSuccess("تم تأكيد حسابك بنجاح. يمكنك الآن تسجيل الدخول.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === "email-not-verified") {
          setError("لم يتم تأكيد البريد الإلكتروني بعد. يرجى التحقق من بريدك وإدخال رمز التأكيد.")
          setTimeout(() => {
            router.push(`/auth/verify?email=${encodeURIComponent(email)}`)
          }, 3000)
        } else if (result.error === "google-auth-required") {
          setError("هذا الحساب مسجل عبر Google. يرجى تسجيل الدخول باستخدام Google.")
        } else {
          setError("البريد الإلكتروني أو كلمة المرور غير صحيحة")
        }
      } else {
        router.push("/")
        router.refresh()
      }
    } catch {
      setError("حدث خطأ أثناء تسجيل الدخول")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/uploads/Form_Back.png')",
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
                backgroundImage: "url('/uploads/Form_Head.png')",
                opacity: 0.35,
              }}
            />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <img src="/uploads/شعار الرابطة.jpg" alt="Logo" className="w-12 h-12 rounded-full object-cover" />
              </div>
              <h1 className="text-2xl font-bold text-white">تسجيل الدخول</h1>
              <p className="text-white/70 text-sm mt-2">مرحباً بعودتك</p>
            </div>
          </div>

          <div className="p-8">
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
                <CheckCircle className="w-5 h-5 shrink-0" />
                {success}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div>
                  <p>{error}</p>
                  {error.includes("لم يتم تأكيد") && (
                    <Link
                      href={`/auth/verify?email=${encodeURIComponent(email)}`}
                      className="text-red-800 font-bold hover:underline mt-1 inline-block"
                    >
                      الذهاب لصفحة التأكيد ←
                    </Link>
                  )}
                </div>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
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

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#c8102e] focus:ring-[#c8102e]" />
                  <span className="text-sm text-gray-600">تذكرني</span>
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-[#c8102e] hover:underline">
                  نسيت كلمة المرور؟
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#c8102e] text-white py-3 rounded-lg font-bold hover:bg-[#a00d24] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  "تسجيل الدخول"
                )}
              </button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-500">أو</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-medium text-gray-700">تسجيل الدخول بجوجل</span>
            </button>

            <div className="mt-4 border-t border-gray-100 pt-4">
              <Link
                href="/ar/graduate/claim"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[#1A3A6B]/30 text-[#1A3A6B] rounded-lg hover:bg-[#1A3A6B]/5 transition-colors font-medium text-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                استعادة حساب
              </Link>
            </div>

            <p className="text-center mt-4 text-sm text-gray-600">
              ليس لديك حساب؟{" "}
              <Link href="/auth/register" className="text-[#c8102e] font-bold hover:underline">
                أنشئ حساباً جديداً
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">جاري التحميل...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
