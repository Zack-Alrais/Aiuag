"use client";

import { useState } from "react";
import { User, GraduationCap, CheckCircle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

export default function ApplyPage({ params }: { params: Promise<{ lang: string }> }) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("ar");
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "",
    studentId: "", graduationYear: "", faculty: "", department: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = isArabic ? "الاسم مطلوب" : "Name is required";
    if (!form.email.trim()) e.email = isArabic ? "البريد الإلكتروني مطلوب" : "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = isArabic ? "بريد غير صالح" : "Invalid email";
    if (!form.phone.trim()) e.phone = isArabic ? "الهاتف مطلوب" : "Phone is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.studentId.trim()) e.studentId = isArabic ? "رقم الطالب مطلوب" : "Student ID is required";
    if (!form.graduationYear.trim()) e.graduationYear = isArabic ? "سنة التخرج مطلوبة" : "Graduation year is required";
    if (!form.faculty.trim()) e.faculty = isArabic ? "الكلية مطلوبة" : "Faculty is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/membership/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          studentId: form.studentId,
          graduationYear: form.graduationYear,
          faculty: form.faculty,
          department: form.department,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ submit: data.error || "Failed to submit" });
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setErrors({ submit: "حدث خطأ أثناء الإرسال" });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: isArabic ? "المعلومات الشخصية" : "Personal Info", icon: User },
    { num: 2, label: isArabic ? "المعلومات الأكاديمية" : "Academic Info", icon: GraduationCap },
    { num: 3, label: isArabic ? "المراجعة والإرسال" : "Review & Submit", icon: CheckCircle },
  ];

  const inputClass = "w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const labelClass = "block text-sm font-medium text-text mb-1.5";
  const errorClass = "text-sm text-error mt-1";

  if (submitted) {
    return (
      <div dir={dir} className="min-h-[70vh] flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-text mb-4">{isArabic ? "تم إرسال طلبك بنجاح!" : "Application Submitted!"}</h1>
          <p className="text-text-secondary mb-6">{isArabic ? "تم استلام طلب العضوية الخاص بك وسيتم مراجعته من قبل الإدارة. سنتواصل معك قريباً." : "Your membership application has been received and will be reviewed. We will contact you soon."}</p>
          <a href={`/${lang}`} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all">
            {isArabic ? "العودة للرئيسية" : "Back to Home"}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div dir={dir} className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text mb-2">{isArabic ? "طلب عضوية" : "Membership Application"}</h1>
            <p className="text-text-secondary">{isArabic ? "أكمل الخطوات التالية للتقديم" : "Complete the following steps to apply"}</p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${step >= s.num ? "bg-primary text-white" : "bg-border text-text-secondary"}`}>
                  <s.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{s.num}</span>
                </div>
                {i < steps.length - 1 && <div className={`w-12 h-0.5 mx-2 ${step > s.num ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          <div className="bg-surface rounded-2xl p-8 shadow-sm">
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-text mb-4">{isArabic ? "المعلومات الشخصية" : "Personal Information"}</h2>
                <div>
                  <label className={labelClass}>{isArabic ? "الاسم الكامل" : "Full Name"} *</label>
                  <input className={`${inputClass} ${errors.name ? "border-error" : ""}`} value={form.name} onChange={(e) => update("name", e.target.value)} dir={dir} />
                  {errors.name && <p className={errorClass}>{errors.name}</p>}
                </div>
                <div>
                  <label className={labelClass}>{isArabic ? "البريد الإلكتروني" : "Email"} *</label>
                  <input type="email" className={`${inputClass} ${errors.email ? "border-error" : ""}`} value={form.email} onChange={(e) => update("email", e.target.value)} dir={dir} />
                  {errors.email && <p className={errorClass}>{errors.email}</p>}
                </div>
                <div>
                  <label className={labelClass}>{isArabic ? "رقم الهاتف" : "Phone Number"} *</label>
                  <input className={`${inputClass} ${errors.phone ? "border-error" : ""}`} value={form.phone} onChange={(e) => update("phone", e.target.value)} dir={dir} />
                  {errors.phone && <p className={errorClass}>{errors.phone}</p>}
                </div>
                <div>
                  <label className={labelClass}>{isArabic ? "العنوان" : "Address"}</label>
                  <input className={inputClass} value={form.address} onChange={(e) => update("address", e.target.value)} dir={dir} />
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-text mb-4">{isArabic ? "المعلومات الأكاديمية" : "Academic Information"}</h2>
                <div>
                  <label className={labelClass}>{isArabic ? "رقم الطالب" : "Student ID"} *</label>
                  <input className={`${inputClass} ${errors.studentId ? "border-error" : ""}`} value={form.studentId} onChange={(e) => update("studentId", e.target.value)} dir={dir} />
                  {errors.studentId && <p className={errorClass}>{errors.studentId}</p>}
                </div>
                <div>
                  <label className={labelClass}>{isArabic ? "سنة التخرج" : "Graduation Year"} *</label>
                  <input className={`${inputClass} ${errors.graduationYear ? "border-error" : ""}`} value={form.graduationYear} onChange={(e) => update("graduationYear", e.target.value)} dir={dir} placeholder="2024" />
                  {errors.graduationYear && <p className={errorClass}>{errors.graduationYear}</p>}
                </div>
                <div>
                  <label className={labelClass}>{isArabic ? "الكلية" : "Faculty"} *</label>
                  <input className={`${inputClass} ${errors.faculty ? "border-error" : ""}`} value={form.faculty} onChange={(e) => update("faculty", e.target.value)} dir={dir} />
                  {errors.faculty && <p className={errorClass}>{errors.faculty}</p>}
                </div>
                <div>
                  <label className={labelClass}>{isArabic ? "القسم" : "Department"}</label>
                  <input className={inputClass} value={form.department} onChange={(e) => update("department", e.target.value)} dir={dir} />
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-text mb-4">{isArabic ? "مراجعة البيانات" : "Review Information"}</h2>
                <div className="bg-background rounded-xl p-5 space-y-3">
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-text-secondary text-sm">{isArabic ? "الاسم" : "Name"}</span>
                    <span className="font-medium text-text text-sm">{form.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-text-secondary text-sm">{isArabic ? "البريد" : "Email"}</span>
                    <span className="font-medium text-text text-sm">{form.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-text-secondary text-sm">{isArabic ? "الهاتف" : "Phone"}</span>
                    <span className="font-medium text-text text-sm">{form.phone}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-text-secondary text-sm">{isArabic ? "رقم الطالب" : "Student ID"}</span>
                    <span className="font-medium text-text text-sm">{form.studentId}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-text-secondary text-sm">{isArabic ? "سنة التخرج" : "Graduation Year"}</span>
                    <span className="font-medium text-text text-sm">{form.graduationYear}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-text-secondary text-sm">{isArabic ? "الكلية" : "Faculty"}</span>
                    <span className="font-medium text-text text-sm">{form.faculty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary text-sm">{isArabic ? "القسم" : "Department"}</span>
                    <span className="font-medium text-text text-sm">{form.department || "-"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-6 py-3 border-2 border-border rounded-xl font-bold text-text-secondary hover:border-primary/30 transition-all">
                  {isArabic ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                  {isArabic ? "السابق" : "Previous"}
                </button>
              ) : <div />}
              {step < 3 ? (
                <button onClick={handleNext} className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all">
                  {isArabic ? "التالي" : "Next"}
                  {isArabic ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-8 py-3 bg-secondary text-white rounded-xl font-bold hover:bg-secondary/90 transition-all disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {isArabic ? "إرسال الطلب" : "Submit Application"}
                </button>
              )}
            </div>
            {errors.submit && (
              <div className="mt-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm text-center">
                {errors.submit}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
