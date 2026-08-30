"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Printer, Loader2, CreditCard, ArrowLeft, ArrowRight } from "lucide-react"
import { MembershipCardEngine } from "@/components/cards/membership-card-engine"
import { useAdminLang } from "../admin-lang"

interface MemberData {
  nameAr: string
  nameEn: string
  membershipNumber: string
  memberType: string
  photo?: string
  faculty?: string
  department?: string
  graduationYear?: number
  phone?: string
  email?: string
  bloodGroup?: string
  nationality?: string
  city?: string
  issueDate?: string
  expiryDate?: string
}

function MembershipCardContent() {
  const { lang, t } = useAdminLang()
  const searchParams = useSearchParams()
  const router = useRouter()
  const memberId = searchParams.get("id")

  const [member, setMember] = useState<MemberData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!memberId) {
      setError(t("membershipCard.notSpecified"))
      setLoading(false)
      return
    }

    const fetchMember = async () => {
      try {
        const res = await fetch(`/api/admin/members/${memberId}`)
        if (!res.ok) {
          if (res.status === 404) throw new Error(t("membershipCard.notFound"))
          throw new Error(t("membershipCard.fetchFailed"))
        }
        const json = await res.json()
        const m = json.member || json.data || json
        setMember({
          nameAr: m.nameAr || m.name || "",
          nameEn: m.nameEn || m.name || "",
          membershipNumber: m.membershipNumber || "",
          memberType: m.membershipType || m.memberType || t("membershipCard.memberTypeDefault"),
          photo: m.cardPhoto || m.photo || "",
          faculty: m.faculty || "",
          department: m.department || m.specialization || "",
          graduationYear: m.graduationYear || undefined,
          phone: m.phone || "",
          email: m.email || "",
          city: m.city || "",
          issueDate: m.createdAt || m.memberSince || "",
        })
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : t("membershipCard.fetchError"))
      } finally {
        setLoading(false)
      }
    }

    fetchMember()
  }, [memberId])

  const handlePrint = () => { window.print() }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1A3A6B] animate-spin" />
          <p className="text-sm text-gray-500">{t("membershipCard.loading")}</p>
        </div>
      </div>
    )
  }

  if (error || !member) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
          {lang === "ar" ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />} {t("membershipCard.back")}
        </button>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-700">{error || t("membershipCard.notFound")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            {lang === "ar" ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </button>
          <CreditCard className="w-8 h-8 text-[#1A3A6B]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{t("membershipCard.title")}</h1>
            <p className="text-sm text-gray-500">{member.nameAr}</p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-[#1A3A6B] text-white rounded-xl hover:bg-[#0f2547] transition-colors text-sm font-medium"
        >
          <Printer className="w-4 h-4" /> {t("membershipCard.printBtn")}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col items-center justify-center border-s md:border-s-0 border-gray-200 md:ps-6">
          <p className="text-xs text-gray-400 mb-2">{t("membershipCard.cardPhoto")}</p>
          {member.photo ? (
            <img src={member.photo} alt={t("membershipCard.photoAlt")} className="w-32 h-40 rounded-xl object-cover border border-gray-200 shadow-sm" />
          ) : (
            <div className="w-32 h-40 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm border border-gray-200">{t("membershipCard.noPhoto")}</div>
          )}
        </div>
        <div className="md:col-span-2 space-y-3">
          <h3 className="text-sm font-bold text-gray-700 border-b border-gray-100 pb-2 mb-3">{t("membershipCard.memberInfo")}</h3>
          <InfoRow label={t("membershipCard.nameArLabel")} value={member.nameAr} />
          <InfoRow label={t("membershipCard.nameEnLabel")} value={member.nameEn} />
          <InfoRow label={t("membershipCard.membershipNoLabel")} value={member.membershipNumber} />
          <InfoRow label={t("membershipCard.memberTypeLabel")} value={member.memberType} />
          <InfoRow label={t("membershipCard.facultyLabel")} value={member.faculty || "—"} />
          <InfoRow label={t("membershipCard.departmentLabel")} value={member.department || "—"} />
          <InfoRow label={t("membershipCard.graduationYearLabel")} value={member.graduationYear?.toString() || "—"} />
          <InfoRow label={t("membershipCard.issueDateLabel")} value={member.issueDate || "—"} />
          <InfoRow label={t("membershipCard.expiryDateLabel")} value={member.expiryDate || t("membershipCard.expiryDefault")} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex justify-center">
        <MembershipCardEngine
          member={{
            id: "",
            nameAr: member.nameAr,
            nameEn: member.nameEn,
            membershipNumber: member.membershipNumber,
            memberType: member.memberType,
            photo: member.photo,
            joinDate: member.issueDate,
            expiryDate: member.expiryDate,
          }}
          showDownload
          size="lg"
        />
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .membership-card, .membership-card * { visibility: visible !important; }
          .membership-card { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%) scale(1.5) !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-gray-400 min-w-[100px] font-medium">{label}</span>
      <span className="text-gray-700 font-semibold">{value || "—"}</span>
    </div>
  )
}

export default function MembershipCardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#1A3A6B] animate-spin" />
      </div>
    }>
      <MembershipCardContent />
    </Suspense>
  )
}