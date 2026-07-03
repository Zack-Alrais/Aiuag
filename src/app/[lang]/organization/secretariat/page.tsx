"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Building2, Mail, Phone, User, ChevronDown, ChevronUp, Loader2
} from "lucide-react"
import HeroSection from "@/components/ui/hero-section"

interface Member {
  id: string
  name: string
  nameEn: string
  role: string
  roleEn: string
  bio: string
  phone: string
  email: string
  image: string
  order: number
}

export default function SecretariatPage({ params: paramsPromise }: { params: Promise<{ lang: string }> }) {
  const [lang, setLang] = useState("ar")
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    paramsPromise.then(p => setLang(p.lang))
  }, [paramsPromise])

  useEffect(() => {
    if (!lang) return
    fetch("/api/public/secretariat")
      .then(r => r.json())
      .then(d => setMembers(d.data || []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false))
  }, [lang])

  const isArabic = lang === "ar"
  const dir = isArabic ? "rtl" : "ltr"

  const getRoleClass = (role: string) => {
    if (role.includes("رئيس")) return "bg-amber-500"
    if (role.includes("أمين") || role.includes("امين")) return "bg-blue-600"
    if (role.includes("نائب") || role.includes("نائبة")) return "bg-emerald-600"
    return "bg-gray-500"
  }

  return (
    <div dir={dir}>
      <HeroSection
        pageSlug="secretariat"
        lang={lang}
        defaultTitle={isArabic ? "الأمانة العامة" : "The Secretariat"}
        defaultSubtitle={isArabic
          ? "الجهاز التنفيذي الإداري الذي يضمن سير عمل الرابطة بفعالية وكفاءة"
          : "The executive administrative body ensuring the association's efficient and effective operations"}
      >
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-6 animate-fade-in">
            <Building2 className="w-16 h-16 text-secondary mx-auto" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
            {isArabic ? "الأمانة العامة" : "The Secretariat"}
          </h1>
          <p className="text-xl text-white/80 mb-8 animate-fade-in">
            {isArabic
              ? "الجهاز التنفيذي الإداري الذي يضمن سير عمل الرابطة بفعالية وكفاءة"
              : "The executive administrative body ensuring the association's efficient and effective operations"}
          </p>
        </div>
      </HeroSection>

      {/* Members Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
              {isArabic ? "أعضاء الأمانة العامة" : "Secretariat Members"}
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              {isArabic
                ? "يضم فريق الأمانة العامة نخبة من الكوادر المؤهلة في مختلف التخصصات"
                : "The secretariat team includes a distinguished group of qualified cadres in various specialties"}
            </p>
            <div className="w-20 h-1 bg-secondary mx-auto rounded-full mt-4" />
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-16 text-text-secondary">
              <p>{isArabic ? "لا يوجد أعضاء لعرضهم" : "No members to display"}</p>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-3">
              {members.map((member, idx) => (
                <div
                  key={member.id}
                  className="bg-surface rounded-2xl border border-border hover:border-primary/20 transition-all overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
                    className="w-full flex items-center gap-4 p-4 md:p-5 text-right"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                      {idx + 1}
                    </div>
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 shrink-0 border-2 border-white shadow-sm">
                      {member.image ? (
                        <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                          <User className="w-6 h-6 text-primary/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                      <p className="font-bold text-text">{member.name}</p>
                      <p className="text-sm text-text-secondary">{member.nameEn}</p>
                    </div>
                    <div className="hidden sm:block">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${getRoleClass(member.role)}`}>
                        {isArabic ? member.role : (member.roleEn || member.role)}
                      </span>
                    </div>
                    <div className="text-text-secondary">
                      {expandedId === member.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>

                  {expandedId === member.id && (
                    <div className="px-4 md:px-5 pb-5 border-t border-border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        {member.bio && (
                          <div className="col-span-full">
                            <p className="text-sm text-text-secondary leading-relaxed">
                              {isArabic ? member.bio : (member.bio || "")}
                            </p>
                          </div>
                        )}
                        <div className="sm:hidden">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${getRoleClass(member.role)}`}>
                            {isArabic ? member.role : (member.roleEn || member.role)}
                          </span>
                        </div>
                        {member.email && (
                          <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
                            <Mail className="w-4 h-4" />
                            {member.email}
                          </a>
                        )}
                        {member.phone && (
                          <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
                            <Phone className="w-4 h-4" />
                            {member.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            {isArabic ? "تواصل مع الأمانة العامة" : "Contact the Secretariat"}
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            {isArabic
              ? "لأي استفسارات أو تواصل إداري، يرجى التواصل معنا"
              : "For any inquiries or administrative communication, please contact us"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:aiuagho@gmail.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white border-2 border-white/30 rounded-xl font-bold hover:bg-white/20 transition-all"
            >
              <Mail className="w-5 h-5" />
              aiuagho@gmail.com
            </a>
            <a
              href="tel:+249114210853"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white border-2 border-white/30 rounded-xl font-bold hover:bg-white/20 transition-all"
            >
              <Phone className="w-5 h-5" />
              +249114210853
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
