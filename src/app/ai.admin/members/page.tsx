"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { Plus, Pencil, Trash2, Users, CheckCircle, XCircle, Search, X, Mail, Phone, GraduationCap, CreditCard, Download, Square, CheckSquare, AlertTriangle, Barcode, QrCode } from "lucide-react"

interface MemberRaw {
  id: string
  userId: string
  user: { id: string; name: string; email: string; image?: string | null; role?: string }
  studentId: string | null
  membershipNumber: string | null
  graduationYear: number | null
  faculty: string | null
  phone: string | null
  address: string | null
  bio: string | null
  linkedin: string | null
  status: "pending" | "approved" | "rejected"
  createdAt: string
  hasMember?: boolean
  nameEn?: string | null
  gender?: string | null
  birthDate?: string | null
  country?: string | null
  state?: string | null
  city?: string | null
  university?: string | null
  specialization?: string | null
  degree?: string | null
  employer?: string | null
  jobTitle?: string | null
  jobSector?: string | null
  yearsOfExperience?: number | null
  graduationCertificate?: string | null
}

interface Member {
  id: string
  userId: string
  name: string
  email: string
  image?: string | null
  role: string
  studentId: string | null
  membershipNumber: string | null
  graduationYear: number | null
  faculty: string | null
  phone: string | null
  address: string | null
  bio: string | null
  linkedin: string | null
  status: "pending" | "approved" | "rejected"
  createdAt: string
  hasMember?: boolean
  nameEn?: string | null
  gender?: string | null
  birthDate?: string | null
  country?: string | null
  state?: string | null
  city?: string | null
  university?: string | null
  specialization?: string | null
  degree?: string | null
  employer?: string | null
  jobTitle?: string | null
  jobSector?: string | null
  yearsOfExperience?: number | null
  graduationCertificate?: string | null
}

function flattenMember(raw: MemberRaw): Member {
  return {
    id: raw.id,
    userId: raw.userId,
    name: raw.user?.name ?? "",
    email: raw.user?.email ?? "",
    image: raw.user?.image ?? null,
    role: raw.user?.role ?? "member",
    studentId: raw.studentId,
    membershipNumber: raw.membershipNumber,
    graduationYear: raw.graduationYear,
    faculty: raw.faculty,
    phone: raw.phone,
    address: raw.address,
    bio: raw.bio,
    linkedin: raw.linkedin,
    status: raw.status,
    createdAt: raw.createdAt,
    hasMember: raw.hasMember,
    nameEn: raw.nameEn,
    gender: raw.gender,
    birthDate: raw.birthDate,
    country: raw.country,
    state: raw.state,
    city: raw.city,
    university: raw.university,
    specialization: raw.specialization,
    degree: raw.degree,
    employer: raw.employer,
    jobTitle: raw.jobTitle,
    jobSector: raw.jobSector,
    yearsOfExperience: raw.yearsOfExperience,
    graduationCertificate: raw.graduationCertificate,
  }
}

interface MemberFormData {
  name: string
  email: string
  password: string
  studentId: string
  membershipNumber: string
  graduationYear: string
  faculty: string
  phone: string
  address: string
  bio: string
  linkedin: string
  status: string
  nameEn: string
  gender: string
  birthDate: string
  country: string
  state: string
  city: string
  university: string
  specialization: string
  degree: string
  employer: string
  jobTitle: string
  jobSector: string
  yearsOfExperience: string
  graduationCertificate: string
}

const emptyForm: MemberFormData = {
  name: "",
  email: "",
  password: "",
  studentId: "",
  membershipNumber: "",
  graduationYear: "",
  faculty: "",
  phone: "",
  address: "",
  bio: "",
  linkedin: "",
  status: "pending",
  nameEn: "",
  gender: "",
  birthDate: "",
  country: "",
  state: "",
  city: "",
  university: "",
  specialization: "",
  degree: "",
  employer: "",
  jobTitle: "",
  jobSector: "",
  yearsOfExperience: "",
  graduationCertificate: "",
}

export default function MembersManagement() {
  const [rawMembers, setRawMembers] = useState<MemberRaw[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [form, setForm] = useState<MemberFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [currentRole, setCurrentRole] = useState<string>("")

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [createError, setCreateError] = useState("")
  const [detailMember, setDetailMember] = useState<Member | null>(null)

  // Barcode & QR code state
  const [barcodeDataUrl, setBarcodeDataUrl] = useState<string | null>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const barcodeSvgRef = useRef<SVGSVGElement>(null)

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/members")
      const json = await res.json()
      const raw: MemberRaw[] = json.data ?? json.members ?? []
      setRawMembers(raw)
      setMembers(raw.map(flattenMember))
    } catch {
      setRawMembers([])
      setMembers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMembers()
    fetch("/api/admin/auth/me").then((r) => r.json()).then((d) => {
      if (d.role) setCurrentRole(d.role)
    }).catch(() => {})
  }, [fetchMembers])

  const filteredMembers = members
    .filter((m) => currentRole === "admin" || m.role !== "admin")
    .filter((m) => filter === "all" || m.status === filter)
    .filter(
      (m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        (m.faculty ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (m.membershipNumber ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (m.country ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (m.phone ?? "").toLowerCase().includes(search.toLowerCase())
    )

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      approved: "bg-green-100 text-green-800 border border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      rejected: "bg-red-100 text-red-800 border border-red-200",
    }
    return styles[status] || "bg-gray-100 text-gray-600 border border-gray-200"
  }

  const openAddModal = () => {
    setEditingMember(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEditModal = (member: Member) => {
    setEditingMember(member)
    setForm({
      name: member.name,
      email: member.email,
      password: "",
      studentId: member.studentId ?? "",
      membershipNumber: member.membershipNumber ?? "",
      graduationYear: member.graduationYear ? String(member.graduationYear) : "",
      faculty: member.faculty ?? "",
      phone: member.phone ?? "",
      address: member.address ?? "",
      bio: member.bio ?? "",
      linkedin: member.linkedin ?? "",
      status: member.status,
      nameEn: member.nameEn ?? "",
      gender: member.gender ?? "",
      birthDate: member.birthDate ?? "",
      country: member.country ?? "",
      state: member.state ?? "",
      city: member.city ?? "",
      university: member.university ?? "",
      specialization: member.specialization ?? "",
      degree: member.degree ?? "",
      employer: member.employer ?? "",
      jobTitle: member.jobTitle ?? "",
      jobSector: member.jobSector ?? "",
      yearsOfExperience: member.yearsOfExperience ? String(member.yearsOfExperience) : "",
      graduationCertificate: member.graduationCertificate ?? "",
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingMember(null)
    setForm(emptyForm)
    setBarcodeDataUrl(null)
    setQrCodeDataUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        studentId: form.studentId || null,
        membershipNumber: form.membershipNumber || null,
        graduationYear: form.graduationYear ? Number(form.graduationYear) : null,
        faculty: form.faculty || null,
        phone: form.phone || null,
        address: form.address || null,
        bio: form.bio || null,
        linkedin: form.linkedin || null,
        status: form.status,
        nameEn: form.nameEn || null,
        gender: form.gender || null,
        birthDate: form.birthDate || null,
        country: form.country || null,
        state: form.state || null,
        city: form.city || null,
        university: form.university || null,
        specialization: form.specialization || null,
        degree: form.degree || null,
        employer: form.employer || null,
        jobTitle: form.jobTitle || null,
        jobSector: form.jobSector || null,
        yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : null,
        graduationCertificate: form.graduationCertificate || null,
      }

      if (!editingMember && form.password) {
        payload.password = form.password
        payload.role = (form as any).role || "member"
      }

      if (editingMember) {
        await fetch(`/api/admin/members/${editingMember.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch("/api/admin/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      await fetchMembers()
      closeModal()
    } catch {
      // silently fail
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (id: string, status: "approved" | "rejected") => {
    try {
      await fetch(`/api/admin/members/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      await fetchMembers()
    } catch {
      // silently fail
    }
  }

  const handleRoleChange = async (memberId: string, userId: string, newRole: string) => {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })
      await fetchMembers()
    } catch {
      // silently fail
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setDeleteError("")
      const res = await fetch(`/api/admin/members/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) {
        setDeleteError(data.error || "فشل الحذف")
        return
      }
      setDeleteConfirmId(null)
      await fetchMembers()
    } catch (e: any) {
      setDeleteError("خطأ في الاتصال: " + (e.message || ""))
    }
  }

  const handleBulkDelete = async () => {
    try {
      setDeleteError("")
      let failed = 0
      let succeeded = 0
      for (const id of Array.from(selectedIds)) {
        const res = await fetch(`/api/admin/members/${id}`, { method: "DELETE" })
        if (res.ok) succeeded++
        else failed++
      }
      if (failed > 0) {
        setDeleteError(`فشل حذف ${failed} عضو، تم حذف ${succeeded}`)
      }
      setSelectedIds(new Set())
      setBulkDeleteConfirm(false)
      await fetchMembers()
    } catch (e: any) {
      setDeleteError("خطأ في الاتصال: " + (e.message || ""))
    }
  }

  const handleCreateMember = async (userId: string) => {
    try {
      setCreateError("")
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: "pending" }),
      })
      const data = await res.json()
      console.log("Create member response:", res.status, data)
      if (res.ok) {
        await fetchMembers()
      } else {
        setCreateError(data.details || data.error || "فشل إنشاء الملف")
      }
    } catch (e: any) {
      setCreateError("خطأ: " + (e.message || ""))
    }
  }

  const handleFieldChange = (field: keyof MemberFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const generateBarcode = async () => {
    if (!form.membershipNumber) return
    setBarcodeDataUrl(null)
    try {
      const JsBarcode = (await import("jsbarcode")).default
      if (barcodeSvgRef.current) {
        JsBarcode(barcodeSvgRef.current, form.membershipNumber, {
          format: "CODE128",
          width: 2,
          height: 60,
          displayValue: true,
          fontSize: 14,
          margin: 10,
          background: "#ffffff",
          lineColor: "#000000",
        })
        setBarcodeDataUrl("generated")
      }
    } catch {}
  }

  const generateQrCode = async () => {
    if (!form.membershipNumber) return
    try {
      const QRCode = (await import("qrcode")).default
      const origin = typeof window !== "undefined" ? window.location.origin : ""
      const url = `${origin}/ar/verify?id=${form.membershipNumber}`
      const dataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 1,
        color: { dark: "#1A3A6B", light: "#FFFFFF" },
        errorCorrectionLevel: "M",
      })
      setQrCodeDataUrl(dataUrl)
    } catch {}
  }

  const downloadBarcode = () => {
    if (!barcodeSvgRef.current) return
    const svg = barcodeSvgRef.current
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    canvas.width = svg.getBoundingClientRect().width || 300
    canvas.height = svg.getBoundingClientRect().height || 100
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      const link = document.createElement("a")
      link.download = `barcode-${form.membershipNumber}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    }
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  const downloadQrCode = () => {
    if (!qrCodeDataUrl) return
    const link = document.createElement("a")
    link.download = `qrcode-${form.membershipNumber}.png`
    link.href = qrCodeDataUrl
    link.click()
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredMembers.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredMembers.map((m) => m.id)))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6 dark:bg-[#0b1120]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600 dark:text-[#60a5fa]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f1f5f9]">إدارة الأعضاء</h1>
            <p className="text-sm text-gray-500 dark:text-[#94a3b8]">إدارة أعضاء الرابطة وطلبات العضوية</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => window.open("/api/admin/members/export", "_blank")}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            تصدير Excel
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            إضافة عضو
          </button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
            <CheckSquare className="w-4 h-4" />
            <span>تم تحديد <strong>{selectedIds.size}</strong> {selectedIds.size === 1 ? "عضو" : "أعضاء"}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              إلغاء التحديد
            </button>
            {bulkDeleteConfirm ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 text-xs text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium"
                >
                  تأكيد الحذف ({selectedIds.size})
                </button>
                <button
                  onClick={() => setBulkDeleteConfirm(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
              </div>
            ) : (
              <button
                onClick={() => setBulkDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 bg-red-100 hover:bg-red-200 rounded-lg transition-colors font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                حذف المحدد
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 flex-wrap">
          {([
            { value: "all", label: "الكل" },
            { value: "pending", label: "قيد المراجعة" },
            { value: "approved", label: "مقبول" },
            { value: "rejected", label: "مرفوض" },
          ] as const).map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === item.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#1e2d42] dark:text-[#cbd5e1] dark:hover:bg-[#2a3d56]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#7a8ba3]" />
          <input
            type="text"
            placeholder="بحث في الأعضاء..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] dark:placeholder-[#7a8ba3]"
          />
        </div>
      </div>

      {deleteError && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-red-700 dark:text-red-400">{deleteError}</span>
          <button onClick={() => setDeleteError("")} className="text-red-500 hover:text-red-700 text-xs">✕</button>
        </div>
      )}

      {createError && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-amber-700 dark:text-amber-400">{createError}</span>
          <button onClick={() => setCreateError("")} className="text-amber-500 hover:text-amber-700 text-xs">✕</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden dark:bg-[#1a2332] dark:border-[#2a3d56]">
        {loading ? (
          <div>
            <div className="h-12 bg-gray-100 dark:bg-[#111927] animate-pulse border-b border-gray-200 dark:border-[#2a3d56]" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 dark:border-[#2a3d56] last:border-0">
                <div className="h-4 bg-gray-200 dark:bg-[#1e2d42] rounded flex-1 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-[#1e2d42] rounded flex-1 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-[#1e2d42] rounded flex-1 animate-pulse" />
              </div>
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Users className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-sm">لا يوجد أعضاء</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 dark:bg-[#111927] dark:border-[#2a3d56]">
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap w-10">
                    <button onClick={toggleSelectAll} className="flex items-center justify-center">
                      {selectedIds.size === filteredMembers.length && filteredMembers.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">
                    الاسم
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      البريد الإلكتروني
                    </span>
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">
                    الجنس
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">
                    الدولة
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">
                    الصلاحية
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">
                    الكلية
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">
                    التخصص
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5" />
                      سنة التخرج
                    </span>
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">
                    الحالة
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-[#94a3b8] whitespace-nowrap">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#253347]">
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className={`transition-colors dark:hover:bg-[#1e2d42] ${
                      selectedIds.has(member.id) ? "bg-blue-50 dark:bg-blue-500/10" : "hover:bg-gray-50/50"
                    }`}
                  >
                    <td className="px-4 py-4 w-10">
                      <button onClick={() => toggleSelect(member.id)} className="flex items-center justify-center">
                        {selectedIds.has(member.id) ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button onClick={() => setDetailMember(member)} className="text-right w-full">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 text-sm dark:text-[#f1f5f9] hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{member.name}</span>
                          {member.hasMember === false && (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-medium">جديد</span>
                          )}
                        </div>
                        {member.membershipNumber && (
                          <div className="text-xs text-gray-400 mt-0.5 dark:text-[#7a8ba3]">{member.membershipNumber}</div>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-[#cbd5e1] whitespace-nowrap max-w-[200px] truncate" title={member.email}>
                      {member.email}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-[#cbd5e1] whitespace-nowrap">
                      {member.gender === "male" ? "ذكر" : member.gender === "female" ? "أنثى" : "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-[#cbd5e1] whitespace-nowrap max-w-[120px] truncate" title={member.country ?? ""}>
                      {member.country ?? "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, member.userId, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-lg border cursor-pointer transition-colors ${
                          member.role === "admin"
                            ? "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200"
                            : member.role === "moderator"
                            ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                            : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        <option value="member">عضو</option>
                        <option value="moderator">مشرف</option>
                        <option value="admin">مدير</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-[#cbd5e1] whitespace-nowrap max-w-[160px] truncate" title={member.faculty ?? ""}>
                      {member.faculty ?? "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-[#cbd5e1] whitespace-nowrap max-w-[160px] truncate" title={member.specialization ?? ""}>
                      {member.specialization ?? "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-[#cbd5e1] whitespace-nowrap">
                      {member.graduationYear ?? "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {member.hasMember === false ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">بدون ملف</span>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(member.status)}`}>
                          {member.status === "pending" ? "قيد المراجعة" : member.status === "approved" ? "مقبول" : "مرفوض"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-start gap-1">
                        {member.hasMember === false ? (
                          <>
                            <button
                              onClick={() => handleCreateMember(member.userId)}
                              className="px-3 py-1.5 bg-[#1A3A6B] text-white text-xs rounded-lg hover:bg-[#0f2547] transition-colors font-medium"
                              title="إنشاء ملف عضو"
                            >
                              + إنشاء ملف
                            </button>
                            {deleteConfirmId === member.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(member.id)}
                                  className="px-2.5 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
                                >
                                  تأكيد
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-2.5 py-1 bg-gray-200 text-gray-600 text-xs rounded-md hover:bg-gray-300 transition-colors"
                                >
                                  إلغاء
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(member.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="حذف المستخدم"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            {member.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(member.id, "approved")}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="قبول"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleStatusChange(member.id, "rejected")}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="رفض"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => openEditModal(member)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="تعديل"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <Link
                              href={`/ai.admin/membership-card?id=${member.id}`}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="بطاقة العضوية"
                            >
                              <CreditCard className="h-4 w-4" />
                            </Link>
                            {deleteConfirmId === member.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(member.id)}
                                  className="px-2.5 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
                                >
                                  تأكيد
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-2.5 py-1 bg-gray-200 text-gray-600 text-xs rounded-md hover:bg-gray-300 transition-colors"
                                >
                                  إلغاء
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(member.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="حذف"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto dark:bg-[#1a2332] dark:border dark:border-[#2a3d56]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2a3d56]">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[#f1f5f9]">
                {editingMember ? "تعديل عضو" : "إضافة عضو جديد"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors dark:text-[#7a8ba3] dark:hover:text-[#cbd5e1] dark:hover:bg-[#2a3d56]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                    الاسم *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] dark:placeholder-[#7a8ba3]"
                    placeholder="الاسم الكامل"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      البريد الإلكتروني *
                    </span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9] dark:placeholder-[#7a8ba3]"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              {!editingMember && (
                <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    كلمة المرور *
                  </label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => handleFieldChange("password", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="كلمة مرور الحساب"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">صلاحية الحساب</label>
                  <select
                    value={(form as any).role || "member"}
                    onChange={(e) => handleFieldChange("role" as any, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="member">عضو</option>
                    <option value="moderator">مشرف</option>
                    <option value="admin">مدير</option>
                  </select>
                </div>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم العضوية
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.membershipNumber}
                      onChange={(e) => handleFieldChange("membershipNumber", e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="AIUAG-XXX"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/admin/members/generate-number")
                          const data = await res.json()
                          if (data.number) handleFieldChange("membershipNumber", data.number)
                        } catch {}
                      }}
                      className="px-3 py-2 bg-[#1A3A6B] text-white text-xs rounded-lg hover:bg-[#0f2547] transition-colors font-medium whitespace-nowrap"
                      title="توليد رقم عضوية"
                    >
                      توليد
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 items-end">
                  <button type="button" onClick={generateBarcode} disabled={!form.membershipNumber}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-40">
                    <Barcode className="h-3.5 w-3.5" /> باركود
                  </button>
                  <button type="button" onClick={generateQrCode} disabled={!form.membershipNumber}
                    className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 text-white text-xs rounded-lg hover:bg-violet-700 transition-colors font-medium disabled:opacity-40">
                    <QrCode className="h-3.5 w-3.5" /> QR كود
                  </button>
                  {(barcodeDataUrl || qrCodeDataUrl) && (
                    <button type="button" onClick={() => { setBarcodeDataUrl(null); setQrCodeDataUrl(null) }}
                      className="px-2 py-1.5 text-gray-400 hover:text-gray-600 text-xs transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Barcode / QR preview */}
              {(barcodeDataUrl || qrCodeDataUrl) && (
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 justify-center">
                  {barcodeDataUrl && (
                    <div className="text-center">
                      <svg ref={barcodeSvgRef} className="mx-auto" />
                      <button type="button" onClick={downloadBarcode}
                        className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                        <Download className="h-3 w-3" /> تحميل الباركود
                      </button>
                    </div>
                  )}
                  {qrCodeDataUrl && (
                    <div className="text-center">
                      <img src={qrCodeDataUrl} alt="QR" className="w-28 h-28 mx-auto" />
                      <button type="button" onClick={downloadQrCode}
                        className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                        <Download className="h-3 w-3" /> تحميل QR
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5" />
                      سنة التخرج
                    </span>
                  </label>
                  <input
                    type="number"
                    min="1970"
                    max="2030"
                    value={form.graduationYear}
                    onChange={(e) => handleFieldChange("graduationYear", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="مثال: 2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الكلية
                  </label>
                  <input
                    type="text"
                    value={form.faculty}
                    onChange={(e) => handleFieldChange("faculty", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="مثال: الهندسة"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    الهاتف
                  </span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="+1 234 567 890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  العنوان
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => handleFieldChange("address", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="العنوان الكامل"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم بالإنجليزية</label>
                  <input type="text" value={form.nameEn} onChange={(e) => handleFieldChange("nameEn", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Mohamed Ahmed" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الجنس</label>
                  <select value={form.gender} onChange={(e) => handleFieldChange("gender", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white">
                    <option value="">اختر</option>
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الميلاد</label>
                  <input type="date" value={form.birthDate} onChange={(e) => handleFieldChange("birthDate", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الدولة</label>
                  <input type="text" value={form.country} onChange={(e) => handleFieldChange("country", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="السودان" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الولاية/المدينة</label>
                  <input type="text" value={form.state} onChange={(e) => handleFieldChange("state", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="الخرطوم" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المدينة</label>
                  <input type="text" value={form.city} onChange={(e) => handleFieldChange("city", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="أم درمان" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الجامعة</label>
                  <input type="text" value={form.university} onChange={(e) => handleFieldChange("university", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="جامعة أفريقيا العالمية" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">التخصص</label>
                  <input type="text" value={form.specialization} onChange={(e) => handleFieldChange("specialization", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="علوم الحاسب" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الدرجة العلمية</label>
                  <select value={form.degree} onChange={(e) => handleFieldChange("degree", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white">
                    <option value="">اختر</option>
                    <option value="diploma">دبلوم</option>
                    <option value="bachelor">بكالوريوس</option>
                    <option value="master">ماجستير</option>
                    <option value="phd">دكتوراه</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">جهة العمل</label>
                  <input type="text" value={form.employer} onChange={(e) => handleFieldChange("employer", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="جهة العمل" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المسمى الوظيفي</label>
                  <input type="text" value={form.jobTitle} onChange={(e) => handleFieldChange("jobTitle", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="مهندس" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">سنوات الخبرة</label>
                  <input type="number" min="0" value={form.yearsOfExperience} onChange={(e) => handleFieldChange("yearsOfExperience", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="5" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الشهادة (PDF)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const fd = new FormData()
                    fd.append("file", file)
                    try {
                      const res = await fetch("/api/upload", { method: "POST", body: fd })
                      const data = await res.json()
                      const url = data.files?.[0]?.url || data.urls?.[0]
                      if (url) handleFieldChange("graduationCertificate", url)
                    } catch {}
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                {form.graduationCertificate && (
                  <a href={form.graduationCertificate} target="_blank" rel="noreferrer" className="text-xs text-blue-600 mt-1 block truncate">رابط الشهادة الحالية</a>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الحالة
                </label>
                <select
                  value={form.status}
                  onChange={(e) => handleFieldChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                >
                  <option value="pending">قيد المراجعة</option>
                  <option value="approved">مقبول</option>
                  <option value="rejected">مرفوض</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-[#2a3d56]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:text-[#cbd5e1] dark:bg-[#1e2d42] dark:hover:bg-[#2a3d56]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? "جاري الحفظ..."
                    : editingMember
                      ? "تحديث العضو"
                      : "إنشاء عضو"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Detail Popup */}
      {detailMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={() => setDetailMember(null)} />
          <div className="relative bg-white dark:bg-[#1a2332] rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto dark:border dark:border-[#2a3d56]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2a3d56]">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[#f1f5f9]">تفاصيل العضو</h2>
              <button onClick={() => setDetailMember(null)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors dark:text-[#7a8ba3] dark:hover:text-[#cbd5e1] dark:hover:bg-[#2a3d56]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Photo - Rectangular like member card (not circular) */}
              <div className="flex justify-center">
                {detailMember.image ? (
                  <img
                    src={detailMember.image}
                    alt={detailMember.name}
                    className="w-32 h-40 object-cover rounded-lg shadow-md border border-gray-200 dark:border-[#3b4f6b]"
                  />
                ) : (
                  <div className="w-32 h-40 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-[#2a3d56] dark:to-[#1e2d42] rounded-lg flex items-center justify-center shadow-md border border-gray-200 dark:border-[#3b4f6b]">
                    <span className="text-4xl font-bold text-gray-400 dark:text-[#7a8ba3]">{detailMember.name.charAt(0)}</span>
                  </div>
                )}
              </div>

              {/* Name & Status */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-[#f1f5f9]">{detailMember.name}</h3>
                {detailMember.nameEn && <p className="text-sm text-gray-500 dark:text-[#94a3b8]">{detailMember.nameEn}</p>}
                <div className="mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(detailMember.status)}`}>
                    {detailMember.status === "pending" ? "قيد المراجعة" : detailMember.status === "approved" ? "مقبول" : "مرفوض"}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mr-2 ${
                    detailMember.role === "admin" ? "bg-purple-100 text-purple-700" : detailMember.role === "moderator" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                  }`}>
                    {detailMember.role === "admin" ? "مدير" : detailMember.role === "moderator" ? "مشرف" : "عضو"}
                  </span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                {detailMember.email && (
                  <div className="p-3 bg-gray-50 dark:bg-[#111927] rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-[#94a3b8]">البريد الإلكتروني</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-[#f1f5f9] truncate mt-0.5" dir="ltr">{detailMember.email}</p>
                  </div>
                )}
                {detailMember.phone && (
                  <div className="p-3 bg-gray-50 dark:bg-[#111927] rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-[#94a3b8]">الهاتف</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-[#f1f5f9] mt-0.5">{detailMember.phone}</p>
                  </div>
                )}
                {detailMember.country && (
                  <div className="p-3 bg-gray-50 dark:bg-[#111927] rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-[#94a3b8]">الدولة</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-[#f1f5f9] mt-0.5">{detailMember.country}</p>
                  </div>
                )}
                {detailMember.city && (
                  <div className="p-3 bg-gray-50 dark:bg-[#111927] rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-[#94a3b8]">المدينة</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-[#f1f5f9] mt-0.5">{detailMember.city}</p>
                  </div>
                )}
                {detailMember.faculty && (
                  <div className="p-3 bg-gray-50 dark:bg-[#111927] rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-[#94a3b8]">الكلية</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-[#f1f5f9] mt-0.5">{detailMember.faculty}</p>
                  </div>
                )}
                {detailMember.specialization && (
                  <div className="p-3 bg-gray-50 dark:bg-[#111927] rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-[#94a3b8]">التخصص</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-[#f1f5f9] mt-0.5">{detailMember.specialization}</p>
                  </div>
                )}
                {detailMember.graduationYear && (
                  <div className="p-3 bg-gray-50 dark:bg-[#111927] rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-[#94a3b8]">سنة التخرج</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-[#f1f5f9] mt-0.5">{detailMember.graduationYear}</p>
                  </div>
                )}
                {detailMember.membershipNumber && (
                  <div className="p-3 bg-gray-50 dark:bg-[#111927] rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-[#94a3b8]">رقم العضوية</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-[#f1f5f9] mt-0.5">{detailMember.membershipNumber}</p>
                  </div>
                )}
                {detailMember.university && (
                  <div className="p-3 bg-gray-50 dark:bg-[#111927] rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-[#94a3b8]">الجامعة</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-[#f1f5f9] mt-0.5">{detailMember.university}</p>
                  </div>
                )}
                {detailMember.degree && (
                  <div className="p-3 bg-gray-50 dark:bg-[#111927] rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-[#94a3b8]">الدرجة العلمية</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-[#f1f5f9] mt-0.5">{detailMember.degree}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => { setDetailMember(null); openEditModal(detailMember) }}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                >
                  <Pencil className="w-4 h-4 inline ml-1.5" />
                  تعديل
                </button>
                <button
                  onClick={() => setDetailMember(null)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-[#cbd5e1] dark:bg-[#1e2d42] dark:hover:bg-[#2a3d56] rounded-xl transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
