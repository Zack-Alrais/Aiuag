import ExcelJS from "exceljs"
import { PrismaClient } from "@prisma/client"
import * as fs from "fs"

const prisma = new PrismaClient()

function excelSerialToDate(serial: number): Date {
  return new Date((serial - 25569) * 86400000)
}

function parseYear(raw: any): number | null {
  if (raw == null) return null
  if (raw instanceof Date) {
    const y = raw.getFullYear()
    return y >= 1900 && y <= 2100 ? y : null
  }
  if (typeof raw === "object") {
    if (raw.text) raw = raw.text
    else if (raw.result !== undefined) raw = raw.result
    else if (raw.value !== undefined) raw = raw.value
    else raw = String(raw)
  }
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
  if (/^\d{4}$/.test(s)) return parseInt(s)
  if (/^\d{4,6}$/.test(s)) {
    const numVal = parseInt(s)
    if (numVal > 30 && numVal < 2958465) {
      const d = excelSerialToDate(numVal)
      const y = d.getFullYear()
      if (y >= 1900 && y <= 2100) return y
    }
    return null
  }
  const rangeMatch = s.match(/(\d{4})\s*[\/\-–]\s*(\d{2,4})/)
  if (rangeMatch) return parseInt(rangeMatch[1])
  const embedded = s.match(/(\d{4})/)
  if (embedded) {
    const y = parseInt(embedded[1])
    if (y >= 1900 && y <= 2100) return y
  }
  return null
}

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

async function main() {
  const filePath = process.argv[2] || "D:\\مشاريع\\Aseast\\مرجع الطلاب الخريجين.xlsx"
  console.log(`Reading file: ${filePath}`)

  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath)
    process.exit(1)
  }

  const buffer = fs.readFileSync(filePath)
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)
  const ws = workbook.worksheets[0]
  if (!ws) {
    console.error("No worksheet found")
    process.exit(1)
  }

  console.log(`Worksheet: ${ws.name}, rows: ${ws.rowCount}`)

  const headerRow = ws.getRow(1)
  const headers: { text: string; col: number }[] = []
  headerRow.eachCell({ includeEmpty: false }, (cell: any, colNumber: number) => {
    headers.push({ text: String(cell.value || "").trim(), col: colNumber })
  })

  console.log("Headers found:", headers.map(h => h.text))

  const nameIdx = findCol(headers, ["الاسم", "اسم", "الاسم الثلاثي", "الاسم الكامل", "اسم الطالب", "name", "student name", "full name"])
  const countryIdx = findCol(headers, ["الدولة", "البلد", "الجنسية", "القطر", "country", "nationality"])
  const facultyIdx = findCol(headers, ["الكلية", "الكليه", "faculty", "college"])
  const specIdx = findCol(headers, ["التخصص", "الاختصاص", "القسم", "specialization", "major", "department"])
  const yearIdx = findCol(headers, ["سنة التخرج", "التخرج", "السنة", "سنه التخرج", "تاريخ التخرج", "العام الدراسي", "العام", "الفصل", "year", "graduation year", "graduation", "academic year"])
  const uniIdx = findCol(headers, ["الجامعة", "جامعة", "university"])
  const emailIdx = findCol(headers, ["البريد", "البريد الإلكتروني", "الايميل", "email", "e-mail"])
  const phoneIdx = findCol(headers, ["الهاتف", "الجوال", "الموبايل", "رقم الهاتف", "phone", "mobile", "tel"])
  const studentIdIdx = findCol(headers, ["رقم القيد", "رقم الطالب", "رقم الجلوس", "student id", "student number", "id"])

  console.log("Column mapping:")
  console.log("  name:", nameIdx >= 0 ? headers[nameIdx].text : "NOT FOUND")
  console.log("  country:", countryIdx >= 0 ? headers[countryIdx].text : "NOT FOUND")
  console.log("  faculty:", facultyIdx >= 0 ? headers[facultyIdx].text : "NOT FOUND")
  console.log("  spec:", specIdx >= 0 ? headers[specIdx].text : "NOT FOUND")
  console.log("  year:", yearIdx >= 0 ? headers[yearIdx].text : "NOT FOUND")
  console.log("  uni:", uniIdx >= 0 ? headers[uniIdx].text : "NOT FOUND")
  console.log("  email:", emailIdx >= 0 ? headers[emailIdx].text : "NOT FOUND")
  console.log("  phone:", phoneIdx >= 0 ? headers[phoneIdx].text : "NOT FOUND")
  console.log("  studentId:", studentIdIdx >= 0 ? headers[studentIdIdx].text : "NOT FOUND")

  if (yearIdx === -1) {
    console.error("Year column not found! Cannot import.")
    process.exit(1)
  }

  const getVal = (row: any, headerIdx: number) => {
    if (headerIdx < 0) return ""
    return String(row.getCell(headers[headerIdx].col).value || "").trim()
  }

  const getRaw = (row: any, headerIdx: number) => {
    if (headerIdx < 0) return null
    const cell = row.getCell(headers[headerIdx].col)
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

  const knownIdx = new Set([nameIdx, countryIdx, facultyIdx, specIdx, yearIdx, uniIdx, emailIdx, phoneIdx, studentIdIdx].filter(i => i >= 0))

  const records: any[] = []
  let skipped = 0
  let emptyRows = 0

  ws.eachRow((row: any, rowNumber: number) => {
    if (rowNumber === 1) return

    const name = getVal(row, nameIdx)
    const country = getVal(row, countryIdx)
    const faculty = getVal(row, facultyIdx)
    const yearRaw = getRaw(row, yearIdx)

    const hasAnyData = name || country || faculty || yearRaw || getVal(row, specIdx) || getVal(row, uniIdx)
    if (!hasAnyData) {
      emptyRows++
      return
    }

    const graduationYear = parseYear(yearRaw)
    if (!graduationYear) {
      skipped++
      if (skipped <= 10) console.log(`  Skip row ${rowNumber}: bad year "${yearRaw}"`)
      return
    }

    const extra: Record<string, string> = {}
    for (let i = 0; i < headers.length; i++) {
      const h = headers[i]
      if (knownIdx.has(i)) continue
      const val = String(row.getCell(h.col).value || "").trim()
      if (val) extra[h.text] = val
    }

    records.push({
      name: name || "غير معروف",
      country: country || "",
      faculty: faculty || "",
      specialization: specIdx >= 0 ? getVal(row, specIdx) : "",
      graduationYear,
      university: uniIdx >= 0 ? getVal(row, uniIdx) : "جامعة إفريقيا العالمية",
      email: emailIdx >= 0 ? getVal(row, emailIdx) : null,
      phone: phoneIdx >= 0 ? getVal(row, phoneIdx) : null,
      studentId: studentIdIdx >= 0 ? getVal(row, studentIdIdx) : null,
      extraData: Object.keys(extra).length > 0 ? JSON.stringify(extra) : null,
    })
  })

  console.log(`\nParsed: ${records.length} valid, ${skipped} skipped (bad year), ${emptyRows} empty rows`)

  // Show sample
  if (records.length > 0) {
    console.log("\nSample records:")
    records.slice(0, 5).forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.name} | ${r.country} | ${r.faculty} | ${r.graduationYear} | ${r.university}`)
    })
  }

  // Batch insert
  const BATCH_SIZE = 500
  let imported = 0
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)
    try {
      await prisma.graduate.createMany({ data: batch, skipDuplicates: false })
      imported += batch.length
      process.stdout.write(`\rImported: ${imported}/${records.length}`)
    } catch (err: any) {
      console.error(`\nBatch error at offset ${i}:`, err.message)
      // Try one by one for this batch
      for (const r of batch) {
        try {
          await prisma.graduate.create({ data: r })
          imported++
        } catch (e: any) {
          console.error(`  Failed: ${r.name} - ${e.message}`)
        }
      }
    }
  }

  console.log(`\n\nDone! Imported ${imported} graduates to database.`)
  await prisma.$disconnect()
}

main().catch(err => {
  console.error("Fatal error:", err)
  process.exit(1)
})
