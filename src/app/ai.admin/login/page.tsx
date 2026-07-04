"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { ASSETS } from "@/lib/assets"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "البريد الإلكتروني أو كلمة المرور غير صحيحة")
      } else {
        router.push("/ai.admin")
        router.refresh()
      }
    } catch {
      setError("حدث خطأ أثناء تسجيل الدخول")
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
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f2547]/80 via-[#1A3A6B]/70 to-[#0f2547]/80" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-[#0f2547] to-[#1A3A6B] p-8 text-center overflow-hidden">
            {/* Header Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${ASSETS.formHead}')`,
                opacity: 0.35,
              }}
            />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <img src={ASSETS.logo} alt="Logo" className="w-12 h-12 rounded-lg object-cover" />
              </div>
              <h1 className="text-2xl font-bold text-white">لوحة التحكم</h1>
              <p className="text-white/70 text-sm mt-2">تسجيل الدخول كمدير</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
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
                    className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B] text-right transition-all"
                    placeholder="admin@aiuag.org"
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
                    className="w-full px-4 py-3 pr-11 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B] text-right transition-all"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1A3A6B] text-white py-3 rounded-xl font-bold hover:bg-[#0f2547] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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

            <p className="text-center mt-6 text-sm text-gray-500">
              <Link href="/auth/login" className="text-[#1A3A6B] hover:underline">
                تسجيل الدخول العام
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
