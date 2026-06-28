import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import ExcelJS from "exceljs"

const pendingImports = new Map<string, any[]>()

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
  // Pass 1: exact match
  for (const n of names) {
    const nn = normalizeHeader(n)
    const idx = headers.findIndex((h) => normalizeHeader(h.text) === nn)
    if (idx >= 0) return idx
  }
  // Pass 2: header starts with search term or search term starts with header
  for (const n of names) {
    const nn = normalizeHeader(n)
    const idx = headers.findIndex((h) => {
      const nh = normalizeHeader(h.text)
      if (!nh || nh.length < 2) return false
      return nh.startsWith(nn) || nn.startsWith(nh)
    })
    if (idx >= 0) return idx
  }
  // Pass 3: word-level match (split by spaces, check individual words)
  for (const n of names) {
    const nn = normalizeHeader(n)
    const idx = headers.findIndex((h) => {
      const nh = normalizeHeader(h.text)
      if (!nh || nh.length < 3) return false
      const words = nh.split(/\s+/)
      return words.some((w) => w === nn || nn === w)
    })
    if (idx >= 0) return idx
  }
  return -1
}

function excelSerialToDate(serial: number): Date {
  return new Date((serial - 25569) * 86400000)
}

function parseYear(raw: any): number | null {
  if (raw == null) return null

  // ExcelJS Date object
  if (raw instanceof Date) {
    const y = raw.getFullYear()
    return y >= 1900 && y <= 2100 ? y : null
  }

  // Object with value (rich text, formula result, etc.)
  if (typeof raw === "object") {
    if (raw.text) raw = raw.text
    else if (raw.result !== undefined) raw = raw.result
    else if (raw.value !== undefined) raw = raw.value
    else raw = String(raw)
  }

  // If it's a number (Excel serial date)
  if (typeof raw === "number") {
    if (raw > 30 && raw < 2958465) {
      const d = excelSerialToDate(raw)
      const y = d.getFullYear()
      if (y >= 1900 && y <= 2100) return y
    }
    return null
  }

  const s = String(raw).trim()
  if (!s) return null

  // Strip non-numeric chars except slash/dash for ranges
  const cleaned = s.replace(/[^\d\/\-–]/g, "").trim()

  // Pure 4-digit year (e.g. "2021")
  if (/^\d{4}$/.test(cleaned)) return parseInt(cleaned)

  // Try as Excel serial number string
  if (/^\d{4,6}$/.test(cleaned)) {
    const numVal = parseInt(cleaned)
    if (numVal > 30 && numVal < 2958465) {
      const d = excelSerialToDate(numVal)
      const y = d.getFullYear()
      if (y >= 1900 && y <= 2100) return y
    }
    return null
  }

  // Academic year ranges: 2020/2021, 2020-2021, 2020–2021
  const rangeMatch = cleaned.match(/(\d{4})\s*[\/\-–]\s*(\d{2,4})/)
  if (rangeMatch) return parseInt(rangeMatch[1])

  // Embedded year: "الفصل الأول 2021", "يناير 2020"
  const embedded = s.match(/(\d{4})/)
  if (embedded) {
    const y = parseInt(embedded[1])
    if (y >= 1900 && y <= 2100) return y
  }

  return null
}

function parseFile(buffer: Buffer) {
  const workbook = new ExcelJS.Workbook()
  let ws: ExcelJS.Worksheet | undefined
  return workbook.xlsx.load(buffer).then(() => {
    ws = workbook.worksheets[0]
    if (!ws) return null

    const headerRow = ws.getRow(1)
    const headers: { text: string; col: number }[] = []
    headerRow.eachCell({ includeEmpty: false }, (cell: any, colNumber: number) => {
      headers.push({ text: String(cell.value || "").trim(), col: colNumber })
    })

    const nameIdx = findCol(headers, ["الاسم", "اسم", "الاسم الثلاثي", "الاسم الكامل", "اسم الطالب", "name", "student name", "full name"])
    const countryIdx = findCol(headers, ["الدولة", "البلد", "الجنسية", "القطر", "country", "nationality"])
    const facultyIdx = findCol(headers, ["الكلية", "الكليه", "faculty", "college"])
    const specIdx = findCol(headers, ["التخصص", "الاختصاص", "القسم", "specialization", "major", "department"])
    const yearIdx = findCol(headers, ["سنة التخرج", "التخرج", "السنة", "سنه التخرج", "تاريخ التخرج", "العام الدراسي", "العام", "الفصل", "year", "graduation year", "graduation", "academic year"])
    const uniIdx = findCol(headers, ["الجامعة", "جامعة", "university"])
    const emailIdx = findCol(headers, ["البريد", "البريد الإلكتروني", "الايميل", "email", "e-mail"])
    const phoneIdx = findCol(headers, ["الهاتف", "الجوال", "الموبايل", "رقم الهاتف", "phone", "mobile", "tel"])
    const studentIdIdx = findCol(headers, ["رقم القيد", "رقم الطالب", "رقم الجلوس", "student id", "student number", "id"])
    const dobIdx = findCol(headers, ["تاريخ الميلاد", "الميلاد", "date of birth", "dob"])

    // Known column indices to skip from extraData
    const knownIdx = new Set([nameIdx, countryIdx, facultyIdx, specIdx, yearIdx, uniIdx, emailIdx, phoneIdx, studentIdIdx, dobIdx].filter((i) => i >= 0))

    const getVal = (row: any, headerIdx: number) => {
      if (headerIdx < 0) return ""
      const colNum = headers[headerIdx].col
      return String(row.getCell(colNum).value || "").trim()
    }

    // Get raw cell value (preserves Date objects and numbers)
    const getRaw = (row: any, headerIdx: number) => {
      if (headerIdx < 0) return null
      const colNum = headers[headerIdx].col
      const cell = row.getCell(colNum)
      const v = cell.value
      if (v == null) return null
      if (v instanceof Date) return v
      if (typeof v === "object") {
        if (v.text) return v.text
        if (v.result !== undefined) return v.result
        if (v.value !== undefined) return v.value
      }
      return v
    }

    return { ws: ws!, headers, nameIdx, countryIdx, facultyIdx, specIdx, yearIdx, uniIdx, emailIdx, phoneIdx, studentIdIdx, dobIdx, knownIdx, getVal, getRaw }
  })
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const confirm = formData.get("confirm") as string
    const importId = formData.get("importId") as string
    if (!file) return NextResponse.json({ error: "الملف مطلوب" }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const parsed = await parseFile(buffer)
    if (!parsed) return NextResponse.json({ error: "لا توجد أوراق عمل في الملف" }, { status: 400 })

    const { ws, headers, nameIdx, countryIdx, facultyIdx, specIdx, yearIdx, uniIdx, emailIdx, phoneIdx, studentIdIdx, dobIdx, knownIdx, getVal, getRaw } = parsed

    if (nameIdx === -1 || countryIdx === -1 || facultyIdx === -1 || yearIdx === -1) {
      return NextResponse.json({
        error: "لم يتم العثور على الأعمدة المطلوبة (الاسم، الدولة، الكلية، سنة التخرج)",
        headers: headers.map(h => h.text).filter(Boolean),
        detected: {
          name: nameIdx >= 0 ? headers[nameIdx].text : null,
          country: countryIdx >= 0 ? headers[countryIdx].text : null,
          faculty: facultyIdx >= 0 ? headers[facultyIdx].text : null,
          year: yearIdx >= 0 ? headers[yearIdx].text : null,
          specialization: specIdx >= 0 ? headers[specIdx].text : null,
          university: uniIdx >= 0 ? headers[uniIdx].text : null,
          email: emailIdx >= 0 ? headers[emailIdx].text : null,
          phone: phoneIdx >= 0 ? headers[phoneIdx].text : null,
          studentId: studentIdIdx >= 0 ? headers[studentIdIdx].text : null,
        },
      }, { status: 400 })
    }

    const records: any[] = []
    const errors: string[] = []
    let skipped = 0

    ws.eachRow((row: any, rowNumber: number) => {
      if (rowNumber === 1) return

      const name = getVal(row, nameIdx)
      const country = getVal(row, countryIdx)
      const faculty = getVal(row, facultyIdx)
      const yearRaw = getRaw(row, yearIdx)

      // Skip completely empty rows
      const hasAnyData = name || country || faculty || yearRaw || getVal(row, specIdx) || getVal(row, uniIdx)
      if (!hasAnyData) return

      // Only require year
      const graduationYear = parseYear(yearRaw)
      if (!graduationYear) {
        errors.push(`الصف ${rowNumber}: سنة التخرج غير صالحة "${yearRaw}"`)
        skipped++
        return
      }

      // Collect extra columns not in the known set
      const extra: Record<string, string> = {}
      for (let i = 0; i < headers.length; i++) {
        const h = headers[i]
        if (knownIdx.has(i)) continue
        const val = String(row.getCell(h.col).value || "").trim()
        if (val) extra[h.text] = val
      }

      records.push({
        name,
        country,
        faculty,
        specialization: specIdx >= 0 ? getVal(row, specIdx) : "",
        graduationYear,
        university: uniIdx >= 0 ? getVal(row, uniIdx) : "جامعة إفريقيا العالمية",
        email: emailIdx >= 0 ? getVal(row, emailIdx) : null,
        phone: phoneIdx >= 0 ? getVal(row, phoneIdx) : null,
        studentId: studentIdIdx >= 0 ? getVal(row, studentIdIdx) : null,
        extraData: Object.keys(extra).length > 0 ? JSON.stringify(extra) : null,
        _rawYear: yearRaw,
      })
    })

    // Add debug info to sample only
    const sampleWithDebug = records.slice(0, 10).map(r => ({ ...r, _rawYear: r._rawYear }))

    // Remove _rawYear from records before DB save
    const dbRecords = records.map(({ _rawYear, ...rest }) => rest)

    if (confirm !== "true") {
      const newImportId = Date.now().toString(36)
      pendingImports.set(newImportId, dbRecords)
      setTimeout(() => pendingImports.delete(newImportId), 5 * 60 * 1000)

      return NextResponse.json({
        preview: true,
        importId: newImportId,
        total: dbRecords.length + skipped,
        validCount: dbRecords.length,
        skipped,
        errors: errors.slice(0, 20),
        sample: sampleWithDebug,
        headers: headers.map(h => h.text).filter(Boolean),
      })
    }

    for (const r of dbRecords) {
      await prisma.graduate.create({ data: r })
    }

    return NextResponse.json({
      success: true,
      imported: records.length,
      skipped,
      errors: errors.slice(0, 20),
      total: records.length + skipped,
    })
  } catch (error: any) {
    console.error("Import error:", error)
    return NextResponse.json({ error: error.message || "فشل الاستيراد" }, { status: 500 })
  }
}
