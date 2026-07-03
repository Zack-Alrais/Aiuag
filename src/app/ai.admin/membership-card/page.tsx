"use client"

import { useState, useEffect, Suspense } from "react"
import { Printer, Loader2, CreditCard } from "lucide-react"
import MembershipCard from "@/components/ui/membership-card"

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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <MembershipCard member={member} showDownload />
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .membership-card-front,
          .membership-card-back {
            visibility: visible !important;
            position: absolute;
            left: 0;
            top: 0;
            box-shadow: none !important;
          }
          .membership-card-front {
            transform: scale(1.5);
            transform-origin: top left;
          }
          .membership-card-back {
            transform: scale(1.5);
            transform-origin: top left;
            margin-top: 310px;
            margin-left: 0;
          }
        }
      `}</style>
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
