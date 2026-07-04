import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import ExcelJS from "exceljs"
import { TemplateEngine } from "@/services/templateEngine"

function normalizeHeader(h: string) {
  return h.replace(/^\uFEFF/, "")
    .replace(/[ًٌٍَُِّْ]/g, "")
    .replace(/[أإآا]/g, "ا")
    .replace(/[يى]/g, "ي")
    .replace(/[ؤ]/g, "و")
    .replace(/[ة]/g, "ه")
    .trim()
    .toLowerCase()
}

function findCol(headers: { text: string; col: number }[], names: string[]) {
  for (const n of names) {
    const nn = normalizeHeader(n)
    const idx = headers.findIndex((h) => normalizeHeader(h.text) === nn)
    if (idx >= 0) return idx
  }
  for (const n of names) {
    const nn = normalizeHeader(n)
    const idx = headers.findIndex((h) => {
      const nh = normalizeHeader(h.text)
      if (!nh || nh.length < 2) return false
      return nh.startsWith(nn) || nn.startsWith(nh)
    })
    if (idx >= 0) return idx
  }
  return -1
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    if (!file) {
      return NextResponse.json({ error: "الملف مطلوب" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    const worksheet = workbook.worksheets[0]
    if (!worksheet) {
      return NextResponse.json({ error: "لا توجد صفحات في الملف" }, { status: 400 })
    }

    const rows = worksheet.getRows(1, worksheet.rowCount) || []
    if (rows.length < 2) {
      return NextResponse.json({ error: "الملف لا يحتوي على بيانات" }, { status: 400 })
    }

    // Parse headers from first row
    const headerRow = rows[0]
    const headers: { text: string; col: number }[] = []
    headerRow.eachCell((cell, colNumber) => {
      if (cell.value) headers.push({ text: String(cell.value), col: colNumber })
    })

    const colName = findCol(headers, ["الاسم", "الاسم العربي", "name", "الاسم بالعربي", "name arabic"])
    const colNameEn = findCol(headers, ["الاسم الانجليزي", "name en", "name english", "الاسم بالانجليزي", "english name"])
    const colEmail = findCol(headers, ["البريد", "البريد الالكتروني", "email", "ايميل", "e-mail"])
    const colPhone = findCol(headers, ["الجوال", "الهاتف", "phone", "رقم الجوال", "رقم الهاتف", "mobile"])
    const colMembershipNumber = findCol(headers, ["رقم العضوية", "membership number", "membership", "رقم عضو"])
    const colFaculty = findCol(headers, ["الكلية", "faculty", "college"])
    const colSpecialization = findCol(headers, ["التخصص", "specialization", "department", "القسم"])
    const colGraduationYear = findCol(headers, ["سنة التخرج", "graduation year", "graduation", "تخرج"])
    const colMembershipType = findCol(headers, ["نوع العضوية", "membership type", "member type", "نوع عضو"])
    const colCountry = findCol(headers, ["الدولة", "country", "الجنسية", "nationality"])

    const results: { row: number; name: string; membershipNumber: string; status: string; error?: string }[] = []

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const getVal = (colIdx: number): string => {
        if (colIdx < 0) return ""
        const cell = row.getCell(colIdx + 1)
        return cell?.value ? String(cell.value).trim() : ""
      }

      const name = getVal(colName)
      const email = getVal(colEmail)

      if (!name && !email) {
        results.push({ row: i + 1, name: "", membershipNumber: "", status: "skipped", error: "الاسم والبريد فارغان" })
        continue
      }

      try {
        // Look up existing user by email or name, or create placeholder
        let user = null
        if (email) {
          user = await prisma.user.findUnique({ where: { email }, include: { member: true } })
        }
        if (!user && name) {
          user = await prisma.user.findFirst({
            where: { name },
            include: { member: true },
          })
        }

        // If no user found, create a placeholder member record directly
        if (!user) {
          // We need a member record - create a minimal one without auth user
          results.push({ row: i + 1, name, membershipNumber: "", status: "skipped", error: "المستخدم غير موجود في النظام" })
          continue
        }

        const memberData = {
          id: user.member?.id || user.id,
          nameAr: user.name,
          nameEn: getVal(colNameEn) || user.member?.nameEn || user.name,
          membershipNumber: getVal(colMembershipNumber) || user.member?.membershipNumber || `AIUAG-${user.id.slice(-6)}`,
          memberType: getVal(colMembershipType) || user.member?.membershipType || "عضو عامل",
          photo: user.member?.cardPhoto || user.image || undefined,
          specialization: getVal(colFaculty) || user.member?.faculty || undefined,
          department: getVal(colSpecialization) || user.member?.specialization || undefined,
          graduationYear: parseInt(getVal(colGraduationYear)) || user.member?.graduationYear || undefined,
          phone: getVal(colPhone) || user.member?.phone || undefined,
          email: user.email || undefined,
          joinDate: user.member?.createdAt
            ? new Date(user.member.createdAt).toLocaleDateString("en-GB")
            : new Date().toLocaleDateString("en-GB"),
          expiryDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB"),
        }

        const origin = request.headers.get("origin") || "http://localhost:9000"

        const result = await TemplateEngine.render(memberData, {
          lang: "ar",
          origin,
          format: "html",
        })

        results.push({
          row: i + 1,
          name: name || user.name,
          membershipNumber: memberData.membershipNumber,
          status: "success",
        })
      } catch (err) {
        results.push({
          row: i + 1,
          name: name || "—",
          membershipNumber: "",
          status: "error",
          error: err instanceof Error ? err.message : "خطأ غير معروف",
        })
      }
    }

    return NextResponse.json({
      success: true,
      total: results.length,
      successCount: results.filter((r) => r.status === "success").length,
      skippedCount: results.filter((r) => r.status === "skipped").length,
      errorCount: results.filter((r) => r.status === "error").length,
      results,
    })
  } catch (error) {
    console.error("Bulk card generation error:", error)
    return NextResponse.json({ error: "فشل في معالجة الملف" }, { status: 500 })
  }
}
