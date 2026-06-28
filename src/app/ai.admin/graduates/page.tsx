"use client"

import { useState, useRef, useEffect } from "react"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, Search, Eye, X, Filter, Download } from "lucide-react"

export default function GraduatesImportPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [graduates, setGraduates] = useState<any[]>([])
  const [loadingGrads, setLoadingGrads] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  // Filter state
  const [filterFaculty, setFilterFaculty] = useState("")
  const [filterCountry, setFilterCountry] = useState("")
  const [filterYear, setFilterYear] = useState("")
  const [filterSpec, setFilterSpec] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Unique values for filter dropdowns
  const [faculties, setFaculties] = useState<string[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const [years, setYears] = useState<number[]>([])
  const [specs, setSpecs] = useState<string[]>([])

  const [preview, setPreview] = useState<any>(null)
  const [importId, setImportId] = useState("")
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [fixing, setFixing] = useState(false)
  const [fixResult, setFixResult] = useState("")

  const fetchGraduates = async (s = "", faculty = "", country = "", year = "", spec = "") => {
    setLoadingGrads(true)
    try {
      const params = new URLSearchParams({ limit: "100", search: s })
      if (faculty) params.set("faculty", faculty)
      if (country) params.set("country", country)
      if (year) params.set("year", year)
      if (spec) params.set("spec", spec)
      const res = await fetch(`/api/admin/graduates?${params}`)
      const data = await res.json()
      setGraduates(data.data || [])
      setTotalCount(data.pagination?.total || 0)
    } catch {}
    finally { setLoadingGrads(false) }
  }

  const fetchFilters = async () => {
    try {
      const res = await fetch("/api/admin/graduates?filtersOnly=true")
      const data = await res.json()
      setFaculties(data.faculties || [])
      setCountries(data.countries || [])
      setYears(data.years || [])
      setSpecs(data.specs || [])
    } catch {}
  }

  useEffect(() => { fetchGraduates(); fetchFilters() }, [])

  const handleFixYears = async () => {
    setFixing(true)
    setFixResult("")
    try {
      const res = await fetch("/api/admin/graduates", { method: "PATCH" })
      const data = await res.json()
      if (res.ok) {
        setFixResult(`تم إصلاح ${data.fixed} سجل من أصل ${data.total} سجل مشكل`)
        fetchGraduates()
        fetchFilters()
      } else {
        setFixResult("خطأ: " + (data.error || "فشل الإصلاح"))
      }
    } catch { setFixResult("خطأ في الاتصال") }
    finally { setFixing(false) }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setResult(null)
    setError("")
    setPreview(null)
    setPendingFile(file)

    const fd = new FormData()
    fd.append("file", file)
    try {
      const res = await fetch("/api/admin/graduates/import", { method: "POST", body: fd })
      const data = await res.json()
      if (data.preview) {
        setPreview(data)
        setImportId(data.importId)
      } else if (res.ok) {
        setResult(data)
      } else {
        let errMsg = data.error || "فشل الاستيراد"
        if (data.headers) errMsg += "\n\nالعناوين: " + data.headers.join(", ")
        if (data.detected) errMsg += "\n\nالتعرف: " + Object.entries(data.detected).map(([k, v]) => `${k}=${v || "—"}`).join(", ")
        setError(errMsg)
      }
    } catch { setError("فشل الاتصال") }
    finally { setImporting(false) }
  }

  const handleConfirmImport = async () => {
    if (!pendingFile) return
    setImporting(true)
    setError("")
    const fd = new FormData()
    fd.append("file", pendingFile)
    fd.append("confirm", "true")
    fd.append("importId", importId)
    try {
      const res = await fetch("/api/admin/graduates/import", { method: "POST", body: fd })
      const data = await res.json()
      if (res.ok) {
        setResult(data)
        setPreview(null)
        setPendingFile(null)
        setImportId("")
        fetchGraduates()
      } else {
        setError(data.error || "فشل الاستيراد")
      }
    } catch { setError("فشل الاتصال") }
    finally { setImporting(false) }
  }

  const handleCancelPreview = () => {
    setPreview(null)
    setPendingFile(null)
    setImportId("")
    setError("")
    if (fileRef.current) fileRef.current.value = ""
  }

  return (
    <div className="max-w-5xl mx-auto" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f2547] dark:text-white">استيراد الخريجين</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">رفع ملف Excel بقائمة الخريجين للتحقق من هويتهم لاحقاً</p>
      </div>

      {/* Import Card */}
      <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-gray-100 dark:border-[#2a3d56] shadow-sm p-6 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileSpreadsheet className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-[#0f2547] dark:text-white">رفع ملف Excel</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">الأعمدة المطلوبة: الاسم، الدولة، الكلية، سنة التخرج</p>
          </div>
        </div>

        <input type="file" ref={fileRef} accept=".xlsx,.xls" className="hidden" onChange={handleFileSelect} />
        {!preview && (
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className="flex items-center gap-2 px-6 py-3 bg-[#1A3A6B] text-white rounded-xl hover:bg-[#0f2547] disabled:opacity-60 transition-colors text-sm font-medium"
            >
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {importing ? "جاري التحليل..." : "اختيار ملف ورفعه"}
            </button>
            <button
              onClick={handleFixYears}
              disabled={fixing}
              className="flex items-center gap-2 px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-60 transition-colors text-sm font-medium"
            >
              {fixing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {fixing ? "جاري الإصلاح..." : "إصلاح سنوات التخرج"}
            </button>
          </div>
        )}

        {fixResult && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            {fixResult}
          </div>
        )}

        {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 whitespace-pre-line"><AlertCircle className="w-4 h-4 inline ml-1" />{error}</div>}

        {/* Preview */}
        {preview && (
          <div className="mt-4 border border-amber-200 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/20 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-amber-200 dark:border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-800 dark:text-amber-300 text-sm">معاينة البيانات قبل الاستيراد</span>
              </div>
              <button onClick={handleCancelPreview} className="p-1 text-amber-600 hover:bg-amber-100 rounded"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-3 gap-3 text-sm mb-4">
                <div className="bg-white dark:bg-[#1a2332] rounded-lg p-3 text-center"><p className="text-2xl font-bold text-green-600">{preview.validCount}</p><p className="text-xs text-gray-500">صف صالح</p></div>
                <div className="bg-white dark:bg-[#1a2332] rounded-lg p-3 text-center"><p className="text-2xl font-bold text-amber-600">{preview.skipped}</p><p className="text-xs text-gray-500">تم تجاهله</p></div>
                <div className="bg-white dark:bg-[#1a2332] rounded-lg p-3 text-center"><p className="text-2xl font-bold text-gray-600">{preview.total}</p><p className="text-xs text-gray-500">إجمالي الصفوف</p></div>
              </div>

              {preview.sample?.length > 0 && (
                <div className="overflow-x-auto mb-4">
                  <p className="text-xs text-gray-500 mb-2">أول {preview.sample.length} صفوف:</p>
                  <table className="w-full text-xs border border-gray-200 dark:border-[#2a3d56]">
                    <thead><tr className="bg-gray-100 dark:bg-[#111927]">
                      <th className="px-3 py-2 text-right">الاسم</th>
                      <th className="px-3 py-2 text-right">الدولة</th>
                      <th className="px-3 py-2 text-right">الكلية</th>
                      <th className="px-3 py-2 text-right">التخصص</th>
                      <th className="px-3 py-2 text-right">السنة</th>
                      <th className="px-3 py-2 text-right">الجامعة</th>
                      <th className="px-3 py-2 text-right">البريد</th>
                      <th className="px-3 py-2 text-right">الهاتف</th>
                      <th className="px-3 py-2 text-right">رقم الطالب</th>
                    </tr></thead>
                    <tbody>{preview.sample.map((r: any, i: number) => (
                      <tr key={i} className="border-t border-gray-100 dark:border-[#253347]">
                        <td className="px-3 py-2 font-medium dark:text-white">{r.name}</td>
                        <td className="px-3 py-2 dark:text-gray-300">{r.country}</td>
                        <td className="px-3 py-2 dark:text-gray-300">{r.faculty}</td>
                        <td className="px-3 py-2 dark:text-gray-300">{r.specialization || "—"}</td>
                        <td className="px-3 py-2 dark:text-gray-300">{r.graduationYear}</td>
                        <td className="px-3 py-2 dark:text-gray-300">{r.university}</td>
                        <td className="px-3 py-2 dark:text-gray-300">{r.email || "—"}</td>
                        <td className="px-3 py-2 dark:text-gray-300">{r.phone || "—"}</td>
                        <td className="px-3 py-2 dark:text-gray-300">{r.studentId || "—"}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}

              {preview.errors?.length > 0 && (
                <details className="mb-4"><summary className="text-xs text-amber-600 cursor-pointer">أخطاء ({preview.errors.length})</summary>
                  <div className="mt-2 text-xs text-red-600 space-y-1">{preview.errors.map((e: string, i: number) => <p key={i}>{e}</p>)}</div>
                </details>
              )}

              <div className="flex gap-2">
                <button onClick={handleConfirmImport} disabled={importing} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60 transition-colors">
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  تأكيد الاستيراد ({preview.validCount} خريج)
                </button>
                <button onClick={handleCancelPreview} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">إلغاء</button>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2 text-green-700 font-medium mb-2"><CheckCircle className="w-5 h-5" />تم الاستيراد بنجاح</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="bg-white rounded-lg p-3 text-center"><p className="text-2xl font-bold text-[#0f2547]">{result.imported}</p><p className="text-xs text-gray-500">تم الاستيراد</p></div>
              <div className="bg-white rounded-lg p-3 text-center"><p className="text-2xl font-bold text-amber-600">{result.skipped}</p><p className="text-xs text-gray-500">تم التجاهل</p></div>
              <div className="bg-white rounded-lg p-3 text-center"><p className="text-2xl font-bold text-gray-600">{result.total}</p><p className="text-xs text-gray-500">إجمالي الصفوف</p></div>
            </div>
            {result.errors?.length > 0 && (
              <details className="mt-3"><summary className="text-xs text-amber-600 cursor-pointer">عرض الأخطاء ({result.errors.length})</summary>
                <div className="mt-2 text-xs text-red-600 space-y-1">{result.errors.map((e: string, i: number) => <p key={i}>{e}</p>)}</div>
              </details>
            )}
          </div>
        )}
      </div>

      {/* Search & List */}
      <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-gray-100 dark:border-[#2a3d56] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-[#2a3d56]">
          <div className="flex gap-3 mb-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم، البريد، الهاتف..."
                onKeyDown={(e) => e.key === "Enter" && fetchGraduates(search, filterFaculty, filterCountry, filterYear, filterSpec)}
                className="w-full pr-10 pl-4 py-2 border border-gray-200 dark:border-[#3b4f6b] rounded-xl text-sm dark:bg-[#111927] dark:text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <button onClick={() => fetchGraduates(search, filterFaculty, filterCountry, filterYear, filterSpec)} className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors">بحث</button>
            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${showFilters ? "bg-primary text-white" : "bg-gray-100 dark:bg-[#1e2d42] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#253347]"}`}>
              <Filter className="w-4 h-4" />فلترة
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">الكلية</label>
                <select value={filterFaculty} onChange={(e) => { setFilterFaculty(e.target.value); fetchGraduates(search, e.target.value, filterCountry, filterYear, filterSpec) }}
                  className="w-full px-3 py-1.5 border border-gray-200 dark:border-[#3b4f6b] rounded-lg text-sm dark:bg-[#111927] dark:text-[#f1f5f9]">
                  <option value="">الكل</option>
                  {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">الدولة</label>
                <select value={filterCountry} onChange={(e) => { setFilterCountry(e.target.value); fetchGraduates(search, filterFaculty, e.target.value, filterYear, filterSpec) }}
                  className="w-full px-3 py-1.5 border border-gray-200 dark:border-[#3b4f6b] rounded-lg text-sm dark:bg-[#111927] dark:text-[#f1f5f9]">
                  <option value="">الكل</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">سنة التخرج</label>
                <select value={filterYear} onChange={(e) => { setFilterYear(e.target.value); fetchGraduates(search, filterFaculty, filterCountry, e.target.value, filterSpec) }}
                  className="w-full px-3 py-1.5 border border-gray-200 dark:border-[#3b4f6b] rounded-lg text-sm dark:bg-[#111927] dark:text-[#f1f5f9]">
                  <option value="">الكل</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">التخصص</label>
                <select value={filterSpec} onChange={(e) => { setFilterSpec(e.target.value); fetchGraduates(search, filterFaculty, filterCountry, filterYear, e.target.value) }}
                  className="w-full px-3 py-1.5 border border-gray-200 dark:border-[#3b4f6b] rounded-lg text-sm dark:bg-[#111927] dark:text-[#f1f5f9]">
                  <option value="">الكل</option>
                  {specs.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}

          {showFilters && (filterFaculty || filterCountry || filterYear || filterSpec) && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400">الفلاتر النشطة:</span>
              {filterFaculty && <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs flex items-center gap-1">{filterFaculty} <X className="w-3 h-3 cursor-pointer" onClick={() => { setFilterFaculty(""); fetchGraduates(search, "", filterCountry, filterYear, filterSpec) }} /></span>}
              {filterCountry && <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs flex items-center gap-1">{filterCountry} <X className="w-3 h-3 cursor-pointer" onClick={() => { setFilterCountry(""); fetchGraduates(search, filterFaculty, "", filterYear, filterSpec) }} /></span>}
              {filterYear && <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs flex items-center gap-1">{filterYear} <X className="w-3 h-3 cursor-pointer" onClick={() => { setFilterYear(""); fetchGraduates(search, filterFaculty, filterCountry, "", filterSpec) }} /></span>}
              {filterSpec && <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs flex items-center gap-1">{filterSpec} <X className="w-3 h-3 cursor-pointer" onClick={() => { setFilterSpec(""); fetchGraduates(search, filterFaculty, filterCountry, filterYear, "") }} /></span>}
              <button onClick={() => { setFilterFaculty(""); setFilterCountry(""); setFilterYear(""); setFilterSpec(""); fetchGraduates(search) }} className="text-xs text-red-500 hover:text-red-700">مسح الكل</button>
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-b border-gray-50 dark:border-[#253347] text-xs text-gray-400">
          {totalCount > 0 && <span>إجمالي النتائج: <strong className="text-gray-600 dark:text-gray-300">{totalCount}</strong></span>}
        </div>

        {loadingGrads ? (
          <div className="p-8 text-center text-gray-400"><Loader2 className="w-8 h-8 mx-auto animate-spin" /></div>
        ) : graduates.length === 0 ? (
          <div className="p-8 text-center text-gray-400"><FileSpreadsheet className="w-12 h-12 mx-auto mb-2 opacity-40" /><p>لا يوجد خريجين مستوردين بعد</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-gray-500 border-b border-gray-50 dark:border-[#253347]">
                <th className="text-right px-4 py-3">الاسم</th><th className="text-right px-4 py-3">الدولة</th><th className="text-right px-4 py-3">الكلية</th><th className="text-right px-4 py-3">التخصص</th><th className="text-right px-4 py-3">سنة التخرج</th><th className="text-right px-4 py-3">البريد</th><th className="text-right px-4 py-3">الهاتف</th><th className="text-right px-4 py-3">رقم الطالب</th><th className="text-right px-4 py-3">الحالة</th></tr></thead>
              <tbody>{graduates.map((g: any) => (
                <tr key={g.id} className="border-b border-gray-50 dark:border-[#253347] hover:bg-gray-50/50 dark:hover:bg-[#1e2d42]/50">
                  <td className="px-4 py-3 font-medium text-[#0f2547] dark:text-white">{g.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{g.country}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{g.faculty}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{g.specialization || "—"}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{g.graduationYear}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{g.email || "—"}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{g.phone || "—"}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{g.studentId || "—"}</td>
                  <td className="px-4 py-3">{g.isClaimed ? <span className="text-green-600 text-xs">مفعل</span> : <span className="text-amber-600 text-xs">غير مفعل</span>}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
