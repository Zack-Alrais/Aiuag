"use client"

import { useState } from "react"
import { Send, Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function ContactForm({ lang }: { lang: string }) {
  const isArabic = lang === "ar"
  const dir = isArabic ? "rtl" : "ltr"

  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<"success" | "error" | null>(null)
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setResult("success")
        setForm({ name: "", email: "", phone: "", subject: "", message: "" })
      } else {
        setResult("error")
        setErrorMsg(data.error || "حدث خطأ")
      }
    } catch {
      setResult("error")
      setErrorMsg("خطأ في الاتصال")
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">{isArabic ? "الاسم" : "Name"}</label>
          <input required value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} className={inputClass} dir={dir} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">{isArabic ? "البريد الإلكتروني" : "Email"}</label>
          <input required type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} className={inputClass} dir={dir} />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">{isArabic ? "الهاتف" : "Phone"}</label>
          <input value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} className={inputClass} dir={dir} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">{isArabic ? "الموضوع" : "Subject"}</label>
          <input required value={form.subject} onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))} className={inputClass} dir={dir} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">{isArabic ? "الرسالة" : "Message"}</label>
        <textarea required value={form.message} onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))} className="w-full min-h-[120px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" dir={dir} />
      </div>

      {result === "success" && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <CheckCircle className="w-4 h-4" />{isArabic ? "تم إرسال رسالتك بنجاح!" : "Your message has been sent successfully!"}
        </div>
      )}
      {result === "error" && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4" />{errorMsg}
        </div>
      )}

      <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-60">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {loading ? (isArabic ? "جاري الإرسال..." : "Sending...") : (isArabic ? "إرسال" : "Send")}
      </button>
    </form>
  )
}
