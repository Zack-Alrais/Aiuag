"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  User, Mail, Phone, Camera, Lock, Save, X, Check,
  FileCheck, Loader2, LogOut, Upload, GraduationCap,
  Briefcase, Award, ChevronDown, ChevronUp, Heart, MessageCircle, Trash2,
} from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MembershipCardEngine } from "@/components/cards/membership-card-engine"
import ImageEditor from "@/components/ui/image-editor"
import { GENDERS, DEGREES, SECTORS, MEMBERSHIP_TYPES, COUNTRY_NAMES } from "@/lib/constants"

interface ProfileData {
  id: string
  name: string
  email: string
  image: string | null
  nameEn: string
  phone: string
  gender: string
  birthDate: string
  country: string
  state: string
  city: string
  address: string
  university: string
  faculty: string
  specialization: string
  degree: string
  graduationYear: string
  employer: string
  jobTitle: string
  jobSector: string
  yearsOfExperience: number
  membershipType: string
  membershipNumber: string
  memberStatus: string
  memberSince: string
  membershipEndDate: string
  cardPhoto: string
  graduationCertificate: string
}

export default function ProfilePage({ params }: { params: Promise<{ lang: string }> }) {
  const [lang, setLang] = useState("ar")
  const isArabic = lang === "ar"

  const { data: session, status, update } = useSession()
  const router = useRouter()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [activeTab, setActiveTab] = useState<"profile" | "posts">("profile")
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<ProfileData>>({})

  // Collapsible sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true, contact: false, academic: false, work: false, security: false,
  })

  // Password states
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")

  // Upload states
  const [editorImage, setEditorImage] = useState<string | null>(null)
  const [editorTarget, setEditorTarget] = useState<"avatar" | "card">("avatar")
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingCard, setUploadingCard] = useState(false)

  useEffect(() => { params.then((p) => setLang(p.lang)) }, [params])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login")
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) fetchProfile()
    else if (status === "authenticated" && !session?.user?.id) {
      router.push("/auth/login")
    }
  }, [session, status, fetchProfile, router])

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile")
      if (res.status === 401) {
        router.push("/auth/login")
        return
      }
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setEditForm(data)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    setSaveError("")
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (res.ok) {
        setProfile(data)
        setEditing(false)
        await update({ name: data.name, image: data.image })
      } else {
        setSaveError(data.error || (isArabic ? "حدث خطأ" : "Save failed"))
      }
    } catch {
      setSaveError(isArabic ? "خطأ في الاتصال" : "Connection error")
    } finally { setSaving(false) }
  }

  const openEditor = (target: "avatar" | "card", file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      setEditorTarget(target)
      setEditorImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    const target = editorTarget
    setEditorImage(null)
    if (target === "avatar") setUploadingAvatar(true)
    else setUploadingCard(true)

    const file = new File([croppedBlob], "cropped-image.jpg", { type: "image/jpeg" })
    const fd = new FormData()
    fd.append("file", file)
    fd.append("folder", target === "avatar" ? "avatars" : "cards")
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      const url = data.files?.[0]?.url || data.urls?.[0]
      if (!url) throw new Error("No URL returned from upload")

      if (target === "avatar") {
        await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: url }) })
        setProfile((p) => p ? { ...p, image: url } : null)
        await update({ image: url })
      } else {
        await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cardPhoto: url }) })
        setProfile((p) => p ? { ...p, cardPhoto: url } : null)
      }
    } catch (err) {
      console.error("Upload failed:", err)
      toast.error(isArabic ? "فشل رفع الصورة" : "Image upload failed")
    } finally {
      if (target === "avatar") setUploadingAvatar(false)
      else setUploadingCard(false)
    }
  }

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    openEditor("avatar", file)
  }

  const handleCardPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    openEditor("card", file)
  }

  const handleChangePassword = async () => {
    setPasswordError(""); setPasswordSuccess("")
    if (!currentPassword || !newPassword) { setPasswordError(isArabic ? "املأ جميع الحقول" : "Fill all fields"); return }
    if (newPassword !== confirmPassword) { setPasswordError(isArabic ? "كلمتا المرور غير متطابقتين" : "Passwords don't match"); return }
    if (newPassword.length < 8) { setPasswordError(isArabic ? "8 أحرف على الأقل" : "Min 8 characters"); return }
    setChangingPassword(true)
    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        setPasswordSuccess(isArabic ? "تم تغيير كلمة المرور" : "Password changed")
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
      } else {
        setPasswordError(data.error || (isArabic ? "حدث خطأ" : "Error"))
      }
    } catch { setPasswordError(isArabic ? "خطأ في الاتصال" : "Connection error") }
    finally { setChangingPassword(false) }
  }

  const toggleSection = (key: string) => setOpenSections((s) => ({ ...s, [key]: !s[key] }))

  const renderField = (label: string, field: keyof ProfileData, type: string = "text", options?: string[]) => {
    const value = editing ? (editForm as any)[field] ?? "" : (profile as any)[field] ?? ""
    return (
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">{label}</label>
        {editing ? (
          options ? (
            <select
              value={value}
              onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
              className="w-full h-10 rounded-xl border border-border bg-white dark:bg-[#1a2332] px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">-- {isArabic ? "اختر" : "Select"} --</option>
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <Input
              type={type}
              value={value}
              onChange={(e) => setEditForm({ ...editForm, [field]: type === "number" ? Number(e.target.value) : e.target.value })}
            />
          )
        ) : (
          <div className="flex items-center gap-2.5 p-2.5 bg-background rounded-xl text-sm">
            <span className="text-text">{value || "—"}</span>
          </div>
        )}
      </div>
    )
  }

  const tabs = [
    { id: "profile" as const, label: isArabic ? "الملف الشخصي" : "Profile", icon: User },
    { id: "posts" as const, label: isArabic ? "منشوراتي" : "My Posts", icon: FileCheck },
  ]

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-text-secondary">{isArabic ? "خطأ في تحميل البيانات" : "Error loading profile"}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => fetchProfile()} className="px-4 py-2 bg-primary text-white rounded-lg text-sm">{isArabic ? "إعادة المحاولة" : "Retry"}</button>
          <button onClick={() => router.push("/auth/login")} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm">{isArabic ? "تسجيل الدخول" : "Login"}</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 md:p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar src={profile.image} fallback={profile.name} size="xl" className="w-24 h-24 text-3xl border-4 border-white/30" />
              <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} disabled={uploadingAvatar} />
              </label>
              {uploadingAvatar && <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"><Loader2 className="w-6 h-6 text-white animate-spin" /></div>}
            </div>
            <div className="text-center md:text-right flex-1">
              <h1 className="text-2xl font-bold mb-1">{profile.name}</h1>
              {profile.nameEn && <p className="text-white/70 text-sm mb-2">{profile.nameEn}</p>}
              <p className="text-white/60 text-xs">{profile.email}</p>
              {profile.memberSince && <p className="text-white/50 text-xs mt-1">{isArabic ? "عضو منذ" : "Member since"} {profile.memberSince}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 text-xs" onClick={() => router.push("/")}>
                <LogOut className="w-3.5 h-3.5 ml-1.5" />
                {isArabic ? "الرئيسية" : "Home"}
              </Button>
            </div>
          </div>
        </div>

        {/* Profile completion banner */}
        {(!profile.phone || !profile.country || !profile.faculty) && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 text-sm font-bold mt-0.5">!</div>
            <div>
              <p className="font-medium text-amber-800 text-sm">{isArabic ? "بياناتك غير مكتملة" : "Profile incomplete"}</p>
              <p className="text-amber-700 text-xs mt-1">{isArabic ? "يرجى إكمال بياناتك لتفعيل العضوية كاملة." : "Complete your data for full membership."}</p>
            </div>
            <button onClick={() => setEditing(true)} className="mr-auto text-amber-700 hover:text-amber-900 text-sm font-medium shrink-0">{isArabic ? "إكمال" : "Complete"} ←</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap text-sm ${activeTab === tab.id ? "bg-primary text-white shadow-lg" : "bg-surface text-text-secondary hover:bg-primary/5"}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* === PROFILE TAB === */}
        {activeTab === "profile" && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{isArabic ? "البيانات الشخصية" : "Personal Information"}</CardTitle>
                {!editing ? (
                  <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                    <Save className="w-3.5 h-3.5 ml-1.5" /> {isArabic ? "تعديل" : "Edit"}
                  </Button>
                ) : (
                  <div className="flex gap-2 items-center">
                    {saveError && <span className="text-xs text-red-500">{saveError}</span>}
                    <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setEditForm(profile); setSaveError("") }}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 ml-1" />}
                      {isArabic ? "حفظ" : "Save"}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* === Section: Personal === */}
                <div className="border border-border rounded-xl overflow-hidden">
                  <button type="button" onClick={() => toggleSection("personal")} className="w-full flex items-center justify-between p-4 bg-background/80 hover:bg-background transition-colors">
                    <span className="flex items-center gap-2 font-semibold text-sm text-text"><User className="w-4 h-4 text-primary" />{isArabic ? "البيانات الشخصية" : "Personal Data"}</span>
                    {openSections.personal ? <ChevronUp className="w-4 h-4 text-text-light" /> : <ChevronDown className="w-4 h-4 text-text-light" />}
                  </button>
                  {openSections.personal && (
                    <div className="p-4 grid md:grid-cols-2 gap-4">
                      {renderField(isArabic ? "الاسم بالعربية *" : "Arabic Name *", "name")}
                      {renderField(isArabic ? "الاسم بالإنجليزية *" : "English Name *", "nameEn")}
                      {renderField(isArabic ? "الجنس *" : "Gender *", "gender", "text", GENDERS)}
                      {renderField(isArabic ? "تاريخ الميلاد *" : "Date of Birth *", "birthDate", "date")}
                      {renderField(isArabic ? "الدولة *" : "Country *", "country", "text", [...COUNTRY_NAMES])}
                      {renderField(isArabic ? "الولاية" : "State", "state")}
                      {renderField(isArabic ? "المدينة" : "City", "city")}
                    </div>
                  )}
                </div>

                {/* === Section: Contact === */}
                <div className="border border-border rounded-xl overflow-hidden">
                  <button type="button" onClick={() => toggleSection("contact")} className="w-full flex items-center justify-between p-4 bg-background/80 hover:bg-background transition-colors">
                    <span className="flex items-center gap-2 font-semibold text-sm text-text"><Mail className="w-4 h-4 text-primary" />{isArabic ? "بيانات التواصل" : "Contact Info"}</span>
                    {openSections.contact ? <ChevronUp className="w-4 h-4 text-text-light" /> : <ChevronDown className="w-4 h-4 text-text-light" />}
                  </button>
                  {openSections.contact && (
                    <div className="p-4 grid md:grid-cols-2 gap-4">
                      {renderField(isArabic ? "رقم الهاتف *" : "Phone *", "phone", "tel")}
                      <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1.5">{isArabic ? "البريد الإلكتروني" : "Email"}</label>
                        <div className="flex items-center gap-2.5 p-2.5 bg-background rounded-xl text-sm"><Mail className="w-4 h-4 text-text-light" /><span className="text-text">{profile.email}</span></div>
                      </div>
                      {renderField(isArabic ? "عنوان السكن" : "Address", "address")}
                    </div>
                  )}
                </div>

                {/* === Section: Academic === */}
                <div className="border border-border rounded-xl overflow-hidden">
                  <button type="button" onClick={() => toggleSection("academic")} className="w-full flex items-center justify-between p-4 bg-background/80 hover:bg-background transition-colors">
                    <span className="flex items-center gap-2 font-semibold text-sm text-text"><GraduationCap className="w-4 h-4 text-primary" />{isArabic ? "البيانات الأكاديمية" : "Academic Data"}</span>
                    {openSections.academic ? <ChevronUp className="w-4 h-4 text-text-light" /> : <ChevronDown className="w-4 h-4 text-text-light" />}
                  </button>
                  {openSections.academic && (
                    <div className="p-4 grid md:grid-cols-2 gap-4">
                      {renderField(isArabic ? "الجامعة *" : "University *", "university")}
                      {renderField(isArabic ? "الكلية *" : "Faculty *", "faculty")}
                      {renderField(isArabic ? "التخصص *" : "Specialization *", "specialization")}
                      {renderField(isArabic ? "الدرجة العلمية *" : "Degree *", "degree", "text", DEGREES)}
                      {renderField(isArabic ? "سنة التخرج *" : "Graduation Year *", "graduationYear", "number")}
                    </div>
                  )}
                </div>

                {/* === Section: Work === */}
                <div className="border border-border rounded-xl overflow-hidden">
                  <button type="button" onClick={() => toggleSection("work")} className="w-full flex items-center justify-between p-4 bg-background/80 hover:bg-background transition-colors">
                    <span className="flex items-center gap-2 font-semibold text-sm text-text"><Briefcase className="w-4 h-4 text-primary" />{isArabic ? "بيانات العمل" : "Work Data"}</span>
                    {openSections.work ? <ChevronUp className="w-4 h-4 text-text-light" /> : <ChevronDown className="w-4 h-4 text-text-light" />}
                  </button>
                  {openSections.work && (
                    <div className="p-4 grid md:grid-cols-2 gap-4">
                      {renderField(isArabic ? "جهة العمل" : "Employer", "employer")}
                      {renderField(isArabic ? "المسمى الوظيفي" : "Job Title", "jobTitle")}
                      {renderField(isArabic ? "القطاع" : "Sector", "jobSector", "text", SECTORS)}
                      {renderField(isArabic ? "سنوات الخبرة" : "Experience", "yearsOfExperience", "number")}
                    </div>
                  )}
                </div>

                {/* === Membership Summary === */}
                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="p-4 bg-primary/5">
                    <span className="flex items-center gap-2 font-semibold text-sm text-text mb-3"><Award className="w-4 h-4 text-primary" />{isArabic ? "بيانات العضوية" : "Membership Data"}</span>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="bg-white dark:bg-[#1a2332] rounded-xl p-3 text-center">
                        <p className="text-[10px] text-text-secondary">{isArabic ? "النوع" : "Type"}</p>
                        <p className="font-bold text-sm text-primary">{profile.membershipType}</p>
                      </div>
                      <div className="bg-white dark:bg-[#1a2332] rounded-xl p-3 text-center">
                        <p className="text-[10px] text-text-secondary">{isArabic ? "رقم العضوية" : "Number"}</p>
                        <p className="font-bold text-xs text-text">{profile.membershipNumber}</p>
                      </div>
                      <div className="bg-white dark:bg-[#1a2332] rounded-xl p-3 text-center">
                        <p className="text-[10px] text-text-secondary">{isArabic ? "تاريخ الانضمام" : "Joined"}</p>
                        <p className="font-bold text-xs text-text">{profile.memberSince}</p>
                      </div>
                      <div className="bg-white dark:bg-[#1a2332] rounded-xl p-3 text-center">
                        <p className="text-[10px] text-text-secondary">{isArabic ? "الحالة" : "Status"}</p>
                        <p className={`font-bold text-xs ${profile.memberStatus === "approved" ? "text-green-600" : "text-amber-600"}`}>
                          {profile.memberStatus === "approved" ? (isArabic ? "مفعلة" : "Active") : isArabic ? "قيد الانتظار" : "Pending"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Graduation Certificate */}
                <div className="border border-border rounded-xl p-4">
                  <p className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-primary" />
                    {isArabic ? "شهادة التخرج" : "Graduation Certificate"}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      {profile.graduationCertificate ? <FileCheck className="w-7 h-7 text-green-600" /> : <GraduationCap className="w-7 h-7 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-text-secondary mb-2">{isArabic ? "أضف شهادة التخرج للتحقق من الهوية" : "Upload for identity verification"}</p>
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg cursor-pointer hover:bg-primary/20 transition-colors text-xs font-medium">
                        {profile.graduationCertificate ? <><Check className="w-3 h-3 text-green-600" /><span className="text-green-600">{isArabic ? "تم الرفع" : "Uploaded"}</span></> : <><Upload className="w-3 h-3" />{isArabic ? "رفع الشهادة" : "Upload"}</>}
                        <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]; if (!file) return
                            if (file.size > 5 * 1024 * 1024) { toast.warning(isArabic ? "الحد الأقصى 5 ميجابايت" : "Max 5MB"); return }
                            const fd = new FormData(); fd.append("file", file); fd.append("folder", "certificates")
                            try {
                              const res = await fetch("/api/upload", { method: "POST", body: fd })
                              const d = await res.json()
                              if (!res.ok) throw new Error(d.error)
                              const url = d.files?.[0]?.url || d.urls?.[0]
                              if (!url) throw new Error("No URL returned")
                              await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ graduationCertificate: url }) })
                              setProfile((p) => p ? { ...p, graduationCertificate: url } : null)
                            } catch { toast.error(isArabic ? "فشل الرفع" : "Upload failed") }
                          }} />
                      </label>
                    </div>
                  </div>
                  {profile.graduationCertificate && (
                    <div className="mt-3 flex items-center justify-between p-2 bg-gray-50 dark:bg-[#1e2d42] rounded-lg">
                      <a href={profile.graduationCertificate} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate">{isArabic ? "عرض الشهادة" : "View"}</a>
                      <button onClick={async () => { await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ graduationCertificate: "" }) }); setProfile((p) => p ? { ...p, graduationCertificate: "" } : null) }} className="text-xs text-red-500 hover:text-red-700">{isArabic ? "حذف" : "Delete"}</button>
                    </div>
                  )}
                </div>

                {/* === Security / Change Password === */}
                <div className="border border-border rounded-xl overflow-hidden">
                  <button type="button" onClick={() => toggleSection("security")} className="w-full flex items-center justify-between p-4 bg-background/80 hover:bg-background transition-colors">
                    <span className="flex items-center gap-2 font-semibold text-sm text-text"><Lock className="w-4 h-4 text-primary" />{isArabic ? "تغيير كلمة المرور" : "Change Password"}</span>
                    {openSections.security ? <ChevronUp className="w-4 h-4 text-text-light" /> : <ChevronDown className="w-4 h-4 text-text-light" />}
                  </button>
                  {openSections.security && (
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-text mb-1.5">{isArabic ? "كلمة المرور الحالية" : "Current Password"}</label>
                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full h-10 rounded-xl border border-gray-300 bg-white dark:bg-[#1a2332] px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-text mb-1.5">{isArabic ? "كلمة المرور الجديدة" : "New Password"}</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full h-10 rounded-xl border border-gray-300 bg-white dark:bg-[#1a2332] px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-text mb-1.5">{isArabic ? "تأكيد كلمة المرور" : "Confirm Password"}</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full h-10 rounded-xl border border-gray-300 bg-white dark:bg-[#1a2332] px-3 py-2 text-sm" />
                      </div>
                      {passwordError && <p className="text-xs text-red-600">{passwordError}</p>}
                      {passwordSuccess && <p className="text-xs text-green-600">{passwordSuccess}</p>}
                      <Button onClick={handleChangePassword} disabled={changingPassword || !currentPassword || !newPassword}>
                        {changingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin ml-1.5" /> : <Lock className="w-3.5 h-3.5 ml-1.5" />}
                        {isArabic ? "تغيير كلمة المرور" : "Change Password"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* === Membership Card === */}
                <div className="border border-border rounded-xl p-4">
                  <p className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-primary" />
                    {isArabic ? "صورة البطاقة" : "Card Photo"}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center border-2 border-dashed border-primary/30">
                        {profile.cardPhoto ? <img src={profile.cardPhoto} alt="" className="w-full h-full object-cover" loading="lazy" /> : <User className="w-8 h-8 text-primary/30" />}
                      </div>
                      <label className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="w-5 h-5 text-white" /><input type="file" accept="image/*" className="hidden" onChange={handleCardPhotoSelect} disabled={uploadingCard} />
                      </label>
                      {uploadingCard && <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center"><Loader2 className="w-5 h-5 text-white animate-spin" /></div>}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-text-secondary mb-2">{isArabic ? "صورة شخصية لتظهر على البطاقة" : "Personal photo for the card"}</p>
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg cursor-pointer hover:bg-primary/20 transition-colors text-xs font-medium">
                        <Camera className="w-3 h-3" />{profile.cardPhoto ? (isArabic ? "تغيير" : "Change") : (isArabic ? "إضافة" : "Add")}
                        <input type="file" accept="image/*" className="hidden" onChange={handleCardPhotoSelect} disabled={uploadingCard} />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-[#1a2332] rounded-2xl shadow-sm border border-gray-100 dark:border-[#2a3d56] p-6 flex justify-center">
                  <MembershipCardEngine
                    member={{
                      id: profile.id,
                      nameAr: profile.name,
                      nameEn: profile.nameEn || profile.name,
                      membershipNumber: profile.membershipNumber,
                      memberType: profile.membershipType,
                      title: profile.jobTitle || profile.membershipType,
                      photo: profile.cardPhoto || profile.image || session?.user?.image || undefined,
                      specialization: profile.specialization || profile.faculty || undefined,
                      graduationYear: parseInt(profile.graduationYear) || undefined,
                      phone: profile.phone,
                      email: profile.email,
                      joinDate: profile.memberSince,
                    }}
                    showBoth size="md"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* === POSTS TAB === */}
        {activeTab === "posts" && (
          <PostsTab memberId={profile.id} isArabic={isArabic} />
        )}
      </div>

      {/* Image Editor Modal */}
      {editorImage && (
        <ImageEditor
          image={editorImage}
          onCropComplete={handleCropComplete}
          onCancel={() => setEditorImage(null)}
          aspect={editorTarget === "card" ? 4 / 3 : 1}
          title={isArabic ? (editorTarget === "card" ? "تعديل صورة البطاقة" : "تعديل الصورة الشخصية") : "Edit Image"}
        />
      )}
    </div>
  )
}

function PostsTab({ memberId, isArabic }: { memberId: string; isArabic: boolean }) {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [memberId])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/posts?authorId=${memberId}&limit=50`)
      const data = await res.json()
      setPosts(data.data || [])
    } catch { setPosts([]) }
    finally { setLoading(false) }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm(isArabic ? "هل أنت متأكد من حذف هذا المنشور؟" : "Are you sure you want to delete this post?")) return
    setDeletingId(postId)
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" })
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId))
        toast.success(isArabic ? "تم حذف المنشور" : "Post deleted")
      } else {
        toast.error(isArabic ? "فشل حذف المنشور" : "Failed to delete post")
      }
    } catch { toast.error(isArabic ? "خطأ في الاتصال" : "Connection error") }
    finally { setDeletingId(null) }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString(isArabic ? "ar-SA" : "en-US", {
      year: "numeric", month: "short", day: "numeric",
    })
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

  if (posts.length === 0) return (
    <div className="max-w-2xl mx-auto text-center py-12">
      <FileCheck className="w-12 h-12 text-text-light mx-auto mb-4" />
      <p className="text-text-secondary">{isArabic ? "لا توجد منشورات بعد" : "No posts yet"}</p>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="bg-white dark:bg-[#1a2332] rounded-2xl shadow-sm border border-gray-100 dark:border-[#2a3d56] p-4">
          {/* Post header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {post.author?.image ? (
                  <img src={post.author.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <User className="w-4 h-4 text-primary" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-text">{post.author?.name || (isArabic ? "عضو" : "Member")}</p>
                <p className="text-xs text-text-secondary">{formatDate(post.createdAt)}</p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(post.id)}
              disabled={deletingId === post.id}
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-text-light hover:text-red-500 transition-colors"
            >
              {deletingId === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Post content */}
          {post.content && (
            <p className="text-sm text-text whitespace-pre-wrap mb-3 leading-relaxed">{post.content}</p>
          )}

          {/* Post images */}
          {post.images && (() => {
            let imgs: string[]
            try { imgs = JSON.parse(post.images) } catch { imgs = [] }
            if (imgs.length === 0) return null
            return (
              <div className={`grid gap-2 mb-3 ${imgs.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                {imgs.map((img: string, i: number) => (
                  <img key={i} src={img} alt="" className="w-full rounded-xl object-cover max-h-64" loading="lazy" />
                ))}
              </div>
            )
          })()}

          {/* Post stats */}
          <div className="flex items-center gap-4 pt-3 border-t border-border text-text-secondary text-xs">
            <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{post._count?.reactions || 0}</span>
            <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{post._count?.comments || 0}</span>
            <span className="flex items-center gap-1">{isArabic ? "مشاركة" : "Shares"}: {post._count?.shares || 0}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
