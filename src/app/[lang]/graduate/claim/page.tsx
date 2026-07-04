"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  CheckCircle, AlertCircle, Loader2, User, Globe, GraduationCap,
  BookOpen, Lock, EyeOff, Eye, Calendar, Phone, MapPin, Mail,
} from "lucide-react"
import { ASSETS } from "@/lib/assets"

export default function ClaimGraduatePage() {
  const [lang, setLang] = useState("ar")
  const params = useParams()
  useEffect(() => { if (params?.lang) setLang(params.lang as string) }, [params])

  const [step, setStep] = useState<"verify" | "setup" | "done">("verify")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [verifyForm, setVerifyForm] = useState({ name: "", faculty: "", country: "", graduationYear: "" })
  const [claimToken, setClaimToken] = useState("")
  const [graduateData, setGraduateData] = useState<any>(null)

  const [setupForm, setSetupForm] = useState({
    email: "", password: "", confirmPassword: "", birthDate: "",
    country: "", state: "", city: "", address: "", phone: "",
  })
  const [showPassword, setShowPassword] = useState(false)

  const inputClass = "w-full px-4 py-3 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B] text-right transition-all"

  const handleVerifyChange = (field: string, value: string) => {
    setVerifyForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSetupChange = (field: string, value: string) => {
    setSetupForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verifyForm.name || !verifyForm.faculty || !verifyForm.country || !verifyForm.graduationYear) {
      setError("يرجى ملء جميع الحقول المطلوبة")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/graduate/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verifyForm),
      })
      const data = await res.json()
      if (!res.ok || !data.found) {
        setError(data.message || data.error || "لم يتم العثور على تطابق. تحقق من صحة البيانات المدخلة.")
        return
      }
      setClaimToken(data.claimToken)
      setGraduateData(data.graduate)
      setSetupForm((prev) => ({ ...prev, country: data.graduate.country || "" }))
      setStep("setup")
    } catch {
      setError("خطأ في الاتصال بالخادم")
    } finally {
      setLoading(false)
    }
  }

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!setupForm.email) { setError("البريد الإلكتروني مطلوب"); return }
    if (setupForm.password.length < 6) { setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return }
    if (setupForm.password !== setupForm.confirmPassword) { setError("كلمتا المرور غير متطابقتين"); return }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/graduate/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimToken,
          email: setupForm.email,
          password: setupForm.password,
          birthDate: setupForm.birthDate || undefined,
          country: setupForm.country || undefined,
          state: setupForm.state || undefined,
          city: setupForm.city || undefined,
          address: setupForm.address || undefined,
          phone: setupForm.phone || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "حدث خطأ"); return }
      setStep("done")
    } catch {
      setError("خطأ في الاتصال بالخادم")
    } finally {
      setLoading(false)
    }
  }

  if (step === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/uploads/Form_Back.png')", filter: "blur(2px)", opacity: 0.3 }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f2547]/80 via-[#1A3A6B]/70 to-[#0f2547]/80" />
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">تم إنشاء الحساب!</h2>
            <p className="text-gray-600 mb-2">تم إرسال رمز التأكيد إلى <strong>{setupForm.email}</strong></p>
            <p className="text-gray-500 text-sm mb-6">يرجى التحقق من بريدك الإلكتروني وإدخال الرمز</p>
            <Link
              href={`/auth/verify?email=${encodeURIComponent(setupForm.email)}`}
              className="inline-block bg-[#1A3A6B] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#0f2547] transition-colors"
            >
              التحقق من البريد
            </Link>
            <p className="mt-4 text-sm">
              <Link href="/auth/login" className="text-[#1A3A6B] font-bold hover:underline">تسجيل الدخول</Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/uploads/Form_Back.png')", filter: "blur(2px)", opacity: 0.3 }} />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f2547]/80 via-[#1A3A6B]/70 to-[#0f2547]/80" />
      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="relative bg-gradient-to-r from-[#0f2547] to-[#1A3A6B] p-8 text-center overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/uploads/Form_Head.png')", opacity: 0.35 }} />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <img src={ASSETS.logo} alt="Logo" className="w-12 h-12 rounded-lg object-cover" />
              </div>
              <h1 className="text-2xl font-bold text-white">تفعيل العضوية</h1>
              <p className="text-white/70 text-sm mt-2">للخريجين المسجلين مسبقاً في قاعدة البيانات</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 p-4 bg-gray-50">
            {["verify", "setup"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === s ? "bg-[#1A3A6B] text-white" : "bg-gray-200 text-gray-500"}`}>
                  {i + 1}
                </div>
                <span className="text-sm font-medium hidden sm:block text-gray-600">
                  {s === "verify" ? "التحقق" : "إكمال التسجيل"}
                </span>
                {i === 0 && (
                  <div className={`w-12 h-1 ${step === "setup" || step === "done" ? "bg-[#1A3A6B]" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>

          <div className="p-6 md:p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            {step === "verify" && (
              <form onSubmit={handleVerify} className="space-y-5">
                <p className="text-sm text-gray-600 mb-4">أدخل بياناتك بالكامل للتحقق من هويتك:</p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الاسم *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={verifyForm.name}
                      onChange={(e) => handleVerifyChange("name", e.target.value)}
                      className={inputClass}
                      placeholder="أدخل اسمك الكامل"
                      required
                    />
                    <User className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الكلية *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={verifyForm.faculty}
                      onChange={(e) => handleVerifyChange("faculty", e.target.value)}
                      className={inputClass}
                      placeholder="أدخل اسم الكلية"
                      required
                    />
                    <BookOpen className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الدولة *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={verifyForm.country}
                      onChange={(e) => handleVerifyChange("country", e.target.value)}
                      className={inputClass}
                      placeholder="أدخل الدولة"
                      required
                    />
                    <Globe className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">سنة التخرج *</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={verifyForm.graduationYear}
                      onChange={(e) => handleVerifyChange("graduationYear", e.target.value)}
                      className={inputClass}
                      placeholder="مثال: 2024"
                      required
                    />
                    <GraduationCap className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1A3A6B] text-white py-3 rounded-lg font-bold hover:bg-[#0f2547] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  تحقق من البيانات
                </button>
              </form>
            )}

            {step === "setup" && graduateData && (
              <form onSubmit={handleSetup} className="space-y-5">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <p className="text-green-700 text-sm font-medium mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    تم التحقق من هويتك
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">الاسم:</span> <span className="font-medium text-gray-800">{graduateData.name}</span></div>
                    <div><span className="text-gray-500">الكلية:</span> <span className="font-medium text-gray-800">{graduateData.faculty}</span></div>
                    <div><span className="text-gray-500">سنة التخرج:</span> <span className="font-medium text-gray-800">{graduateData.graduationYear}</span></div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-2">أكمل بيانات تسجيل حسابك:</p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني *</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={setupForm.email}
                      onChange={(e) => handleSetupChange("email", e.target.value)}
                      className={inputClass}
                      placeholder="example@email.com"
                      dir="ltr"
                      required
                    />
                    <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={setupForm.password}
                      onChange={(e) => handleSetupChange("password", e.target.value)}
                      className={`${inputClass} pl-11`}
                      placeholder="6 أحرف على الأقل"
                      required
                      minLength={6}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={setupForm.confirmPassword}
                      onChange={(e) => handleSetupChange("confirmPassword", e.target.value)}
                      className={inputClass}
                      placeholder="أعد إدخال كلمة المرور"
                      required
                    />
                    <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الميلاد</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={setupForm.birthDate}
                      onChange={(e) => handleSetupChange("birthDate", e.target.value)}
                      className={`${inputClass} text-right`}
                    />
                    <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الدولة</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={setupForm.country}
                      onChange={(e) => handleSetupChange("country", e.target.value)}
                      className={inputClass}
                      placeholder="الدولة"
                    />
                    <Globe className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الولاية/المحافظة</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={setupForm.state}
                      onChange={(e) => handleSetupChange("state", e.target.value)}
                      className={inputClass}
                      placeholder="الولاية أو المحافظة"
                    />
                    <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المدينة</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={setupForm.city}
                      onChange={(e) => handleSetupChange("city", e.target.value)}
                      className={inputClass}
                      placeholder="المدينة"
                    />
                    <MapPin className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
                  <div className="relative">
                    <textarea
                      value={setupForm.address}
                      onChange={(e) => handleSetupChange("address", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B] text-right transition-all resize-none"
                      rows={3}
                      placeholder="العنوان بالتفصيل"
                    />
                    <MapPin className="absolute start-3 top-3 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الهاتف</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={setupForm.phone}
                      onChange={(e) => handleSetupChange("phone", e.target.value)}
                      className={inputClass}
                      placeholder="رقم الهاتف"
                      dir="ltr"
                    />
                    <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1A3A6B] text-white py-3 rounded-lg font-bold hover:bg-[#0f2547] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  إنشاء الحساب
                </button>
              </form>
            )}
          </div>
        </div>
        <p className="text-center text-gray-400 text-sm mt-6">
          لديك حساب بالفعل؟ <Link href="/auth/login" className="text-white font-bold hover:underline">تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  )
}
