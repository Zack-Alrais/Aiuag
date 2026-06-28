"use client";

import { useState } from "react";
import { Loader2, Check, AlertCircle } from "lucide-react";

interface Props {
  isArabic: boolean;
  dir: string;
}

export default function VolunteerForm({ isArabic, dir }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [skills, setSkills] = useState("");
  const [availability, setAvailability] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, skills, availability }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || (isArabic ? "حدث خطأ" : "An error occurred"));
      }
    } catch {
      setError(isArabic ? "حدث خطأ في الاتصال" : "Connection error");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-text mb-2">
          {isArabic ? "تم إرسال طلبك بنجاح!" : "Application submitted!"}
        </h3>
        <p className="text-text-secondary">
          {isArabic
            ? "سنتواصل معك قريباً لمراجعة طلبك"
            : "We will contact you soon to review your application"}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          {isArabic ? "الاسم الكامل" : "Full Name"} *
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          dir={dir}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          {isArabic ? "البريد الإلكتروني" : "Email"} *
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          dir={dir}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          {isArabic ? "المهارات" : "Skills"}
        </label>
        <textarea
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="w-full min-h-[80px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
          dir={dir}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          {isArabic ? "التوفر" : "Availability"}
        </label>
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          dir={dir}
        >
          <option value="">{isArabic ? "اختر..." : "Select..."}</option>
          <option value="weekdays">{isArabic ? "أيام الأسبوع" : "Weekdays"}</option>
          <option value="weekends">{isArabic ? "عطلة نهاية الأسبوع" : "Weekends"}</option>
          <option value="both">{isArabic ? "المتاح دائماً" : "Always Available"}</option>
        </select>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {isArabic ? "جاري الإرسال..." : "Submitting..."}
          </>
        ) : (
          isArabic ? "تقديم طلب التطوع" : "Submit Volunteer Application"
        )}
      </button>
    </form>
  );
}
