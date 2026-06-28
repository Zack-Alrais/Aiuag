"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle, XCircle, Loader2, Shield } from "lucide-react"

interface VerifyData {
  valid: boolean
  member?: {
    name: string
    membershipNumber: string
    status: string
    faculty: string
    department: string
    graduationYear: number
    photo: string
    joinDate: string
  }
  error?: string
}

function VerifyContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const [data, setData] = useState<VerifyData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setData({ valid: false, error: "لم يتم تحديد رقم العضوية" })
      setLoading(false)
      return
    }

    fetch(`/api/verify?id=${id}`)
      .then((res) => res.json())
      .then((result) => {
        setData(result)
      })
      .catch(() => {
        setData({ valid: false, error: "خطأ في التحقق" })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f]/80 via-[#2d5a87]/70 to-[#1e3a5f]/80" />
        <Loader2 className="w-12 h-12 text-white animate-spin relative z-10" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/uploads/Form_Back.png')", filter: "blur(2px)", opacity: 0.3 }} />
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f]/80 via-[#2d5a87]/70 to-[#1e3a5f]/80" />
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className={`p-6 text-center ${data.valid ? "bg-green-500" : "bg-red-500"}`}>
            {data.valid ? (
              <CheckCircle className="w-16 h-16 text-white mx-auto mb-3" />
            ) : (
              <XCircle className="w-16 h-16 text-white mx-auto mb-3" />
            )}
            <h1 className="text-2xl font-bold text-white">
              {data.valid ? "بطاقة سارية" : "بطاقة غير صالحة"}
            </h1>
          </div>

          <div className="p-6">
            {data.member ? (
              <div className="space-y-4">
                {data.member.photo && (
                  <div className="flex justify-center">
                    <img
                      src={data.member.photo}
                      alt={data.member.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-green-500"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">الاسم</span>
                    <span className="font-semibold">{data.member.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">رقم العضوية</span>
                    <span className="font-semibold font-mono">{data.member.membershipNumber}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">الكلية</span>
                    <span className="font-semibold">{data.member.faculty}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">سنة التخرج</span>
                    <span className="font-semibold">{data.member.graduationYear}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">تاريخ الانضمام</span>
                    <span className="font-semibold">
                      {new Date(data.member.joinDate).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                </div>

                <div className={`text-center py-3 rounded-xl ${
                  data.member.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : data.member.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  <span className="font-semibold">
                    {data.member.status === "approved"
                      ? "عضو مسجل"
                      : data.member.status === "pending"
                      ? "قيد المراجعة"
                      : "مرفوض"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-red-600 font-semibold">{data.error}</p>
              </div>
            )}

            <div className="mt-6 text-center text-xs text-gray-400">
              <Shield className="w-4 h-4 inline-block ml-1" />
              رابطة خريجي جامعة أفريقيا العالمية
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
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f]/80 via-[#2d5a87]/70 to-[#1e3a5f]/80" />
        <Loader2 className="w-12 h-12 text-white animate-spin relative z-10" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}
