"use client"

import { useState, useEffect, Suspense } from "react"
import { Printer, Loader2, CreditCard } from "lucide-react"
import { MembershipCardEngine } from "@/components/cards/membership-card-engine"

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
  const [member, setMember] = useState<MemberData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await fetch("/api/admin/members?limit=1")
        if (!res.ok) throw new Error("Failed to fetch members")
        const data = await res.json()
        if (data.members?.length > 0) {
          const m = data.members[0]
          setMember({
            nameAr: m.nameAr || m.name || "",
            nameEn: m.nameEn || m.name || "",
            membershipNumber: m.membershipNumber || "",
            memberType: m.memberType || "عضو مسجل",
            photo: m.cardPhoto || m.photo || "",
            faculty: m.faculty || "",
            department: m.department || "",
            graduationYear: m.graduationYear || undefined,
            phone: m.phone || "",
            email: m.email || "",
            city: "",
            issueDate: m.memberSince || "",
          })
        } else {
          setError("لا توجد بيانات عضو")
        }
      } catch {
        setError("خطأ في تحميل بيانات البطاقة")
      } finally {
        setLoading(false)
      }
    }

    fetchMember()
  }, [])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1A3A6B] animate-spin" />
          <p className="text-sm text-gray-500">جاري تحميل البطاقة...</p>
        </div>
      </div>
    )
  }

  if (error || !member) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-700">{error || "العضو غير موجود"}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-[#1A3A6B]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">بطاقة العضوية</h1>
            <p className="text-sm text-gray-500">{member.nameAr}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-[#1A3A6B] text-white rounded-xl hover:bg-[#0f2547] transition-colors text-sm font-medium"
          >
            <Printer className="w-4 h-4" />
            طباعة البطاقة
          </button>
        </div>
      </div>

      {/* Member Info + صورة البطاقة */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* صورة البطاقة */}
        <div className="flex flex-col items-center justify-center border-l md:border-l-0 border-gray-200 md:pl-6">
          <p className="text-xs text-gray-400 mb-2">صورة البطاقة</p>
          {member.photo ? (
            <img
              src={member.photo}
              alt="صورة البطاقة"
              className="w-32 h-40 rounded-xl object-cover border border-gray-200 shadow-sm"
            />
          ) : (
            <div className="w-32 h-40 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm border border-gray-200">
              لا توجد صورة
            </div>
          )}
        </div>
        {/* المعلومات */}
        <div className="md:col-span-2 space-y-3">
          <h3 className="text-sm font-bold text-gray-700 border-b border-gray-100 pb-2 mb-3">معلومات العضو</h3>
          <InfoRow label="الاسم (عربي)" value={member.nameAr} />
          <InfoRow label="الاسم (إنجليزي)" value={member.nameEn} />
          <InfoRow label="رقم العضوية" value={member.membershipNumber} />
          <InfoRow label="نوع العضوية" value={member.memberType} />
          <InfoRow label="الكلية" value={member.faculty || "—"} />
          <InfoRow label="التخصص" value={member.department || "—"} />
          <InfoRow label="سنة التخرج" value={member.graduationYear?.toString() || "—"} />
          <InfoRow label="تاريخ الإصدار" value={member.issueDate || "—"} />
          <InfoRow label="تاريخ الانتهاء" value={member.expiryDate || "سنتان من تاريخ الإصدار"} />
        </div>
      </div>

      {/* Card Display - View Only / Click to Flip */}
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

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .membership-card,
          .membership-card * {
            visibility: visible !important;
          }
          .membership-card {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) scale(1.5) !important;
          }
          .no-print {
            display: none !important;
          }
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
