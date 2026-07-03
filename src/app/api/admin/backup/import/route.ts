import { NextResponse } from "next/server"
import { restoreFromFile } from "@/services/backup"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    if (!file) {
      return NextResponse.json({ success: false, message: "الرجاء اختيار ملف" }, { status: 400 })
    }
    const text = await file.text()
    const jsonData = JSON.parse(text)
    if (!jsonData.tables || !Array.isArray(jsonData.tables)) {
      return NextResponse.json({ success: false, message: "تنسيق الملف غير صحيح" }, { status: 400 })
    }
    const result = await restoreFromFile(jsonData)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "فشلت عملية الاستيراد" }, { status: 500 })
  }
}
