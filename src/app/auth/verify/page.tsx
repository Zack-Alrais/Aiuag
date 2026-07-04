"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Mail, Loader2, CheckCircle, AlertCircle, ArrowRight, RotateCcw } from "lucide-react"
import { ASSETS } from "@/lib/assets"

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [countdown, setCountdown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1)
    }

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    setError("")

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newCode.every((digit) => digit !== "")) {
      handleVerify(newCode.join(""))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pastedData) {
      const newCode = pastedData.split("").concat(Array(6).fill("")).slice(0, 6)
      setCode(newCode)
      const nextEmptyIndex = newCode.findIndex((digit) => digit === "")
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex
      inputRefs.current[focusIndex]?.focus()

      if (pastedData.length === 6) {
        handleVerify(pastedData)
      }
    }
  }

  const handleVerify = async (codeString?: string) => {
    const verifyCode = codeString || code.join("")
    if (verifyCode.length !== 6) {
      setError("يرجى إدخال رمز التأكيد كاملاً (6 أرقام)")
      return
    }

    if (!email) {
      setError("يرجى إدخال البريد الإلكتروني أولاً")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verifyCode }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess("تم التحقق بنجاح! جاري التحويل لصفحة تسجيل الدخول...")
        setTimeout(() => {
          router.push("/auth/login?verified=true")
        }, 2000)
      } else {
        setError(data.error || "رمز التأكيد غير صحيح")
        setCode(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()
      }
    } catch {
      setError("حدث خطأ أثناء التحقق")
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (countdown > 0 || !email) return

    setResending(true)
    setError("")

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess("تم إرسال رمز جديد إلى بريدك الإلكتروني")
        setCountdown(60)
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(data.error || "فشل إرسال الرمز")
      }
    } catch {
      setError("حدث خطأ أثناء إرسال الرمز")
    } finally {
      setResending(false)
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
                <Mail className="w-8 h-8 text-[#1e3a5f]" />
              </div>
              <h1 className="text-2xl font-bold text-white">تأكيد البريد الإلكتروني</h1>
              <p className="text-white/70 text-sm mt-2">أدخل رمز التأكيد المكون من 6 أرقام</p>
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
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!!searchParams.get("email")}
                  className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8102e] focus:border-transparent text-right disabled:bg-gray-50"
                  placeholder="example@email.com"
                  dir="ltr"
                />
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">رمز التأكيد</label>
              <div className="flex gap-2 justify-center" dir="ltr">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8102e] focus:border-[#c8102e] transition-colors"
                    disabled={loading || !!success}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => handleVerify()}
              disabled={loading || code.some((d) => !d) || !!success}
              className="w-full bg-[#c8102e] text-white py-3 rounded-lg font-bold hover:bg-[#a00d24] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mb-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري التحقق...
                </>
              ) : (
                "تأكيد الحساب"
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">لم تتلقى الرمز؟</p>
              <button
                onClick={handleResendCode}
                disabled={countdown > 0 || resending || !email}
                className="text-[#c8102e] font-bold text-sm hover:underline disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
              >
                {resending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                {countdown > 0
                  ? `إعادة الإرسال خلال ${countdown} ثانية`
                  : "إرسال رمز جديد"}
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#c8102e]"
              >
                <ArrowRight className="w-4 h-4" />
                العودة لتسجيل الدخول
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">جاري التحميل...</p>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}
