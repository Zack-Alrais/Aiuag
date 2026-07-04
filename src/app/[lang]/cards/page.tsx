"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2, CreditCard, Download, Printer } from "lucide-react"
import { MembershipCardEngine } from "@/components/cards/membership-card-engine"

interface ProfileData {
  id: string
  name: string
  email: string
  image: string | null
  nameEn: string
  phone: string
  gender: string
  country: string
  university: string
  faculty: string
  specialization: string
  degree: string
  graduationYear: string
  membershipType: string
  membershipNumber: string
  memberStatus: string
  memberSince: string
  membershipEndDate: string
  cardPhoto: string
  jobTitle: string
}

export default function CardsPage({ params }: { params: Promise<{ lang: string }> }) {
  const [lang, setLang] = useState("ar")
  const isArabic = lang === "ar"
  const { data: session, status } = useSession()
  const router = useRouter()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { params.then((p) => setLang(p.lang)) }, [params])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login")
  }, [status, router])

  useEffect(() => {
    if (status !== "loading" && session?.user?.id) {
      fetch("/api/profile")
        .then((r) => {
          if (r.status === 401) { router.push("/auth/login"); return null }
          return r.json()
        })
        .then((data) => { if (data) setProfile(data) })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [session, status, router])

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-text-secondary">{isArabic ? "يرجى تسجيل الدخول أولاً" : "Please login first"}</p>
          <button onClick={() => router.push("/auth/login")} className="px-4 py-2 bg-primary text-white rounded-lg text-sm">
            {isArabic ? "تسجيل الدخول" : "Login"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">
            {isArabic ? "بطاقة العضوية" : "Membership Card"}
          </h1>
          <p className="text-text-secondary">
            {isArabic ? "بطاقتك الشخصية كعضو في رابطة خريجي جامعة أفريقيا العالمية" : "Your personal card as a member of AIUAG"}
          </p>
        </div>

        {/* Card */}
        <div className="flex justify-center mb-8">
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
            showBoth
            showActions
            size="lg"
          />
        </div>

        {/* Info */}
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-gray-100 max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-text mb-4">
            {isArabic ? "معلومات البطاقة" : "Card Information"}
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">{isArabic ? "الاسم" : "Name"}</span>
              <span className="font-medium text-text">{profile.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">{isArabic ? "رقم العضوية" : "Membership Number"}</span>
              <span className="font-mono font-medium text-text">{profile.membershipNumber || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">{isArabic ? "نوع العضوية" : "Membership Type"}</span>
              <span className="font-medium text-text">{profile.membershipType || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">{isArabic ? "تاريخ الانضمام" : "Join Date"}</span>
              <span className="font-medium text-text">{profile.memberSince || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">{isArabic ? "الحالة" : "Status"}</span>
              <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                profile.memberStatus === "approved" ? "bg-green-100 text-green-700" :
                profile.memberStatus === "pending" ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              }`}>
                {profile.memberStatus === "approved" ? (isArabic ? "نشط" : "Active") :
                 profile.memberStatus === "pending" ? (isArabic ? "قيد المراجعة" : "Pending") :
                 (isArabic ? "مرفوض" : "Rejected")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
