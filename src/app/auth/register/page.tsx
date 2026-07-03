"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, User, Phone, GraduationCap, Building2, Loader2, CheckCircle, AlertCircle, Upload, FileCheck, Globe, Briefcase, Calendar } from "lucide-react"
import { GENDERS, DEGREES, SECTORS, COUNTRIES, UNIVERSITIES, FACULTIES } from "@/lib/constants"
import { SearchableSelect } from "@/components/ui/searchable-select"

export default function RegisterPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [uploadingCert, setUploadingCert] = useState(false)
  const [faculties, setFaculties] = useState<string[]>([])
  const [countries, setCountries] = useState<string[]>([])

  useEffect(() => {
    fetch("/api/public/filters").then(r => r.json()).then(d => {
      setFaculties(d.faculties || [])
      setCountries(d.countries || [])
    }).catch(() => {})
  }, [])

  const [form, setForm] = useState({
    name: "",
    nameEn: "",
    email: "",
    password: "",
    confirmPassword: "",
    dialCode: "+249",
    phone: "",
    gender: "",
    birthDate: "",
    country: "السودان",
    state: "",
    city: "",
    address: "",
    university: "",
    faculty: "",
    specialization: "",
    degree: "",
    graduationYear: "",
    employer: "",
    jobTitle: "",
    jobSector: "",
    yearsOfExperience: "",
    graduationCertificate: "",
  })

  const updateForm = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError("حجم الملف يجب أن يكون أقل من 5 ميجابايت"); return }
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if (!allowedTypes.includes(file.type)) { setError("نوع الملف غير مدعوم"); return }
    setUploadingCert(true)
    setError("")
    try {
      const fd = new FormData(); fd.append("file", file); fd.append("folder", "members")
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const url = data.files?.[0]?.url || data.urls?.[0]
      if (!url) throw new Error("No URL returned")
      setForm((prev) => ({ ...prev, graduationCertificate: url }))
    } catch { setError("فشل رفع الملف") }
    finally { setUploadingCert(false) }
  }

  const validateStep = (s: number): boolean => {
    setError("")
    if (s === 1) {
      if (!form.name.trim()) { setError("الاسم مطلوب"); return false }
      if (!form.email.trim()) { setError("البريد الإلكتروني مطلوب"); return false }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError("البريد الإلكتروني غير صحيح"); return false }
      if (!form.password) { setError("كلمة المرور مطلوبة"); return false }
      if (form.password.length < 6) { setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return false }
      if (form.password !== form.confirmPassword) { setError("كلمتا المرور غير متطابقتين"); return false }
    }
    if (s === 2) {
      if (!form.gender) { setError("الجنس مطلوب"); return false }
      if (!form.birthDate) { setError("تاريخ الميلاد مطلوب"); return false }
      if (!form.country.trim()) { setError("الدولة مطلوبة"); return false }
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    if (!validateStep(3)) { setLoading(false); return }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "حدث خطأ"); return }
      setSuccess(true)
    } catch { setError("حدث خطأ في الاتصال") }
    finally { setLoading(false) }
  }

  const inputClass = "w-full px-4 py-3 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8102e] focus:border-transparent text-right"

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/uploads/Form_Back.png')", filter: "blur(2px)", opacity: 0.3 }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f]/80 via-[#2d5a87]/70 to-[#1e3a5f]/80" />
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">تم إنشاء الحساب بنجاح</h2>
            <p className="text-gray-600 mb-6">يرجى التحقق من بريدك الإلكتروني <strong>{form.email}</strong> وإدخال رمز التأكيد</p>
            <Link href={`/auth/verify?email=${encodeURIComponent(form.email)}`} className="inline-block bg-[#c8102e] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#a00d24] transition-colors">
              التحقق من البريد الإلكتروني
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/uploads/Form_Back.png')", filter: "blur(2px)", opacity: 0.3 }} />
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f]/80 via-[#2d5a87]/70 to-[#1e3a5f]/80" />
      <div className="w-full max-w-2xl relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] p-8 text-center overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/uploads/Form_Head.png')", opacity: 0.35 }} />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <img src="/uploads/شعار الرابطة.jpg" alt="Logo" className="w-12 h-12 rounded-full object-cover" />
              </div>
              <h1 className="text-2xl font-bold text-white">إنشاء حساب جديد</h1>
              <p className="text-white/70 text-sm mt-2">انضم إلى رابطة خريجي الجامعة العالمية (AIUAG)</p>
            </div>
          </div>

          {/* Steps */}
          <div className="flex items-center justify-center gap-2 p-4 bg-gray-50">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-[#c8102e]" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? "bg-[#c8102e] text-white" : "bg-gray-200"}`}>1</div>
              <span className="text-sm font-medium hidden sm:block">الحساب</span>
            </div>
            <div className={`w-12 h-1 ${step >= 2 ? "bg-[#c8102e]" : "bg-gray-200"}`} />
            <div className={`flex items-center gap-2 ${step >= 2 ? "text-[#c8102e]" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? "bg-[#c8102e] text-white" : "bg-gray-200"}`}>2</div>
              <span className="text-sm font-medium hidden sm:block">البيانات الشخصية</span>
            </div>
            <div className={`w-12 h-1 ${step >= 3 ? "bg-[#c8102e]" : "bg-gray-200"}`} />
            <div className={`flex items-center gap-2 ${step >= 3 ? "text-[#c8102e]" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? "bg-[#c8102e] text-white" : "bg-gray-200"}`}>3</div>
              <span className="text-sm font-medium hidden sm:block">الأكاديمي والعمل</span>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 md:p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Step 1: Account */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الاسم بالعربية *</label>
                    <div className="relative">
                      <input type="text" value={form.name} onChange={(e) => updateForm("name", e.target.value)} required className={inputClass} placeholder="محمد أحمد" />
                      <User className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الاسم بالإنجليزية</label>
                    <div className="relative">
                      <input type="text" value={form.nameEn} onChange={(e) => updateForm("nameEn", e.target.value)} className={inputClass} placeholder="Mohamed Ahmed" dir="ltr" />
                      <Globe className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني *</label>
                    <div className="relative">
                      <input type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} required className={inputClass} placeholder="example@email.com" dir="ltr" />
                      <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف *</label>
                    <div className="flex gap-2">
                      <div className="w-44 shrink-0">
                        <SearchableSelect
                          value={form.dialCode}
                          onChange={(val) => {
                            updateForm("dialCode", val)
                            const c = COUNTRIES.find(c => c.dial === val)
                            if (c && !form.country) updateForm("country", c.name)
                          }}
                          options={COUNTRIES.map(c => ({ value: c.dial, label: `${c.dial} - ${c.name}` }))}
                          placeholder="+249"
                          dir="ltr"
                        />
                      </div>
                      <div className="relative flex-1">
                        <input type="tel" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8102e] focus:border-transparent text-right" placeholder="912345678" dir="ltr" />
                        <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور *</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => updateForm("password", e.target.value)} required className={`${inputClass} pl-11`} placeholder="••••••••" />
                      <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">{showPassword ? "إخفاء" : "إظهار"}</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور *</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={(e) => updateForm("confirmPassword", e.target.value)} required className={inputClass} placeholder="••••••••" />
                      <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <button type="button" onClick={() => { if (validateStep(1)) setStep(2) }} className="w-full bg-[#c8102e] text-white py-3 rounded-lg font-bold hover:bg-[#a00d24] transition-colors">
                    التالي ←
                  </button>
                </div>
              )}

              {/* Step 2: Personal */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الجنس *</label>
                      <SearchableSelect
                        value={form.gender}
                        onChange={(val) => updateForm("gender", val)}
                        options={GENDERS.map(g => ({ value: g, label: g }))}
                        placeholder="اختر"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الميلاد *</label>
                      <input type="date" value={form.birthDate} onChange={(e) => updateForm("birthDate", e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الدولة *</label>
                      <SearchableSelect
                        value={form.country}
                        onChange={(val) => updateForm("country", val)}
                        options={(countries.length > 0 ? countries : COUNTRIES.map(c => c.name)).map(c => ({ value: c, label: c }))}
                        placeholder="ابحث عن دولتك..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الولاية</label>
                      <input type="text" value={form.state} onChange={(e) => updateForm("state", e.target.value)} className={inputClass} placeholder="الخرطوم" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">المدينة</label>
                      <input type="text" value={form.city} onChange={(e) => updateForm("city", e.target.value)} className={inputClass} placeholder="أم درمان" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">عنوان السكن</label>
                      <input type="text" value={form.address} onChange={(e) => updateForm("address", e.target.value)} className={inputClass} placeholder="الرياض - حي النزهة" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)} className="flex-1 border-2 border-[#c8102e] text-[#c8102e] py-3 rounded-lg font-bold hover:bg-[#c8102e]/5 transition-colors">→ السابق</button>
                    <button type="button" onClick={() => { if (validateStep(2)) setStep(3) }} className="flex-1 bg-[#c8102e] text-white py-3 rounded-lg font-bold hover:bg-[#a00d24] transition-colors">التالي ←</button>
                  </div>
                </div>
              )}

              {/* Step 3: Academic + Work */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الجامعة *</label>
                    <SearchableSelect
                      value={form.university}
                      onChange={(val) => updateForm("university", val)}
                      options={UNIVERSITIES.map(u => ({ value: u, label: u }))}
                      placeholder="ابحث عن الجامعة..."
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الكلية *</label>
                    <SearchableSelect
                      value={form.faculty}
                      onChange={(val) => updateForm("faculty", val)}
                      options={(faculties.length > 0 ? faculties : FACULTIES).map(f => ({ value: f, label: f }))}
                      placeholder="ابحث عن الكلية..."
                    />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">التخصص *</label>
                      <input type="text" value={form.specialization} onChange={(e) => updateForm("specialization", e.target.value)} className={inputClass} placeholder="علوم الحاسب" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الدرجة العلمية *</label>
                      <SearchableSelect
                        value={form.degree}
                        onChange={(val) => updateForm("degree", val)}
                        options={DEGREES.map(d => ({ value: d, label: d }))}
                        placeholder="اختر الدرجة"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">سنة التخرج *</label>
                      <input type="number" value={form.graduationYear} onChange={(e) => updateForm("graduationYear", e.target.value)} className={inputClass} placeholder="2023" min="1970" max="2030" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">جهة العمل</label>
                      <div className="relative">
                        <input type="text" value={form.employer} onChange={(e) => updateForm("employer", e.target.value)} className={inputClass} placeholder="شركة..." />
                        <Briefcase className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">المسمى الوظيفي</label>
                      <input type="text" value={form.jobTitle} onChange={(e) => updateForm("jobTitle", e.target.value)} className={inputClass} placeholder="مهندس" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">القطاع</label>
                      <SearchableSelect
                        value={form.jobSector}
                        onChange={(val) => updateForm("jobSector", val)}
                        options={SECTORS.map(s => ({ value: s, label: s }))}
                        placeholder="اختر"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">سنوات الخبرة</label>
                      <input type="number" value={form.yearsOfExperience} onChange={(e) => updateForm("yearsOfExperience", e.target.value)} className={inputClass} placeholder="5" min="0" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">شهادة التخرج (اختياري)</label>
                    <input type="file" ref={fileInputRef} onChange={handleCertificateUpload} accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" />
                    {form.graduationCertificate ? (
                      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <FileCheck className="w-5 h-5 text-green-600 shrink-0" />
                        <span className="text-sm text-green-700 flex-1">تم رفع الشهادة</span>
                        <button type="button" onClick={() => setForm((prev) => ({ ...prev, graduationCertificate: "" }))} className="text-sm text-red-500 hover:text-red-700">حذف</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingCert}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#c8102e] hover:text-[#c8102e] transition-colors disabled:opacity-50">
                        {uploadingCert ? <><Loader2 className="w-5 h-5 animate-spin" /> جاري الرفع...</> : <><Upload className="w-5 h-5" /> اضغط لرفع الشهادة</>}
                      </button>
                    )}
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP, PDF - حد أقصى 5 ميجابايت</p>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(2)} className="flex-1 border-2 border-[#c8102e] text-[#c8102e] py-3 rounded-lg font-bold hover:bg-[#c8102e]/5 transition-colors">→ السابق</button>
                    <button type="submit" disabled={loading} className="flex-1 bg-[#c8102e] text-white py-3 rounded-lg font-bold hover:bg-[#a00d24] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> جاري...</> : "إنشاء الحساب"}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <p className="text-center mt-6 text-sm text-gray-600">
              لديك حساب بالفعل؟{" "}
              <Link href="/auth/login" className="text-[#c8102e] font-bold hover:underline">سجّل الدخول</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
