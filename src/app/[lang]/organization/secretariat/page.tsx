"use client"

import { useState, useEffect } from "react"
import {
  Building2, Mail, Phone, User, ChevronDown, ChevronUp, Loader2, Crown, Shield, Users
} from "lucide-react"
import HeroSection from "@/components/ui/hero-section-client"

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

interface LevelConfig {
  label: string
  labelEn: string
  roles: string[]
  color: string
  icon: string
}

const LEVELS: LevelConfig[] = [
  {
    label: "رئيس الرابطة", labelEn: "President",
    roles: ["رئيس الرابطة"],
    color: "from-amber-500 to-amber-600", icon: "crown",
  },
  {
    label: "القادة", labelEn: "Leadership",
    roles: ["الأمين العام", "النائب الأول لرئيس الرابطة", "نائب رئيس الرابطة"],
    color: "from-blue-600 to-blue-700", icon: "shield",
  },
  {
    label: "الأمناء", labelEn: "Secretaries",
    roles: ["نائب الأمين العام", "النائب الثاني للأمين العام", "أمين", "أمينة"],
    color: "from-emerald-600 to-emerald-700", icon: "users",
  },
  {
    label: "نواب الأمناء", labelEn: "Deputy Secretaries",
    roles: ["نائب", "نائبة"],
    color: "from-violet-500 to-violet-600", icon: "users",
  },
  {
    label: "الأعضاء", labelEn: "Members",
    roles: ["عضوا"],
    color: "from-gray-500 to-gray-600", icon: "users",
  },
]

function getMemberLevel(order: number): number {
  if (order === 1) return 0
  if (order <= 4) return 1
  if (order <= 17) return 2
  if (order <= 26) return 3
  return 4
}

function LevelIcon({ icon }: { icon: string }) {
  if (icon === "crown") return <Crown className="w-5 h-5" />
  if (icon === "shield") return <Shield className="w-5 h-5" />
  return <Users className="w-5 h-5" />
}

function MemberCard({ member, level, isArabic, onToggle, isOpen }: {
  member: Member; level: number; isArabic: boolean; onToggle: () => void; isOpen: boolean
}) {
  const levelColors = [
    "border-amber-300 dark:border-amber-600 shadow-amber-200/30",
    "border-blue-300 dark:border-blue-600 shadow-blue-200/30",
    "border-emerald-300 dark:border-emerald-600 shadow-emerald-200/30",
    "border-violet-300 dark:border-violet-600 shadow-violet-200/30",
    "border-gray-300 dark:border-gray-600 shadow-gray-200/30",
  ]

  return (
    <div
      className={`bg-white dark:bg-[#1a2332] rounded-2xl border-2 ${levelColors[level]} shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden`}
      onClick={onToggle}
    >
      <div className="p-4 text-center">
        <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md mb-3">
          {member.image ? (
            <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
              <User className="w-10 h-10 text-primary/40" />
            </div>
          )}
        </div>
        <h3 className="font-bold text-text text-sm leading-tight">{member.name}</h3>
        <p className="text-[10px] text-text-secondary mt-0.5 truncate">{member.nameEn}</p>
        <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white bg-gradient-to-r ${LEVELS[level].color}`}>
          {isArabic ? member.role : (member.roleEn || member.role)}
        </span>
      </div>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-border pt-3 space-y-2 text-xs">
          {member.bio && <p className="text-text-secondary leading-relaxed">{member.bio}</p>}
          {member.email && (
            <a href={`mailto:${member.email}`} className="flex items-center gap-1.5 text-text-secondary hover:text-primary">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{member.email}</span>
            </a>
          )}
          {member.phone && (
            <a href={`tel:${member.phone}`} className="flex items-center gap-1.5 text-text-secondary hover:text-primary">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span dir="ltr">{member.phone}</span>
            </a>
          )}
        </div>
      )}
    </div>
  )
}

function HierarchyTree({ members, level, isArabic }: { members: Member[]; level: number; isArabic: boolean }) {
  if (members.length === 0) return null
  const [openId, setOpenId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(true)

  const gridCols = level === 0 ? "justify-center" : level === 1 ? "grid-cols-1 sm:grid-cols-3" : level <= 3 ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-3 sm:grid-cols-3 md:grid-cols-5"

  return (
    <div className="mb-2">
      {/* Vertical connector line */}
      {level > 0 && (
        <div className="flex justify-center mb-2">
          <div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-600" />
        </div>
      )}

      {/* Horizontal connector */}
      {level > 0 && members.length > 1 && (
        <div className="flex justify-center mb-2">
          <div className="h-0.5 w-3/4 max-w-md bg-gray-300 dark:bg-gray-600" />
        </div>
      )}

      {/* Level label */}
      <div className="text-center mb-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${LEVELS[level].color} shadow-md hover:shadow-lg transition-all`}
        >
          <LevelIcon icon={LEVELS[level].icon} />
          {isArabic ? LEVELS[level].label : LEVELS[level].labelEn}
          <span className="opacity-80">({members.length})</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Cards */}
      {expanded && (
        <div className={`grid ${gridCols} gap-3 md:gap-4 max-w-5xl mx-auto`}>
          {members.map((m) => (
            <MemberCard
              key={m.id} member={m} level={level} isArabic={isArabic}
              isOpen={openId === m.id}
              onToggle={() => setOpenId(openId === m.id ? null : m.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function SecretariatPage({ params: paramsPromise }: { params: Promise<{ lang: string }> }) {
  const [lang, setLang] = useState("ar")
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    paramsPromise.then(p => setLang(p.lang))
  }, [paramsPromise])

  useEffect(() => {
    if (!lang) return
    fetch("/api/public/secretariat")
      .then(r => r.json())
      .then(d => {
        const all = (d.data || []) as Member[]
        all.sort((a, b) => a.order - b.order)
        setMembers(all)
      })
      .catch(() => setMembers([]))
      .finally(() => setLoading(false))
  }, [lang])

  const isArabic = lang === "ar"
  const dir = isArabic ? "rtl" : "ltr"

  const groupedByLevel: Member[][] = LEVELS.map(() => [])
  members.forEach(m => {
    const level = getMemberLevel(m.order)
    groupedByLevel[level].push(m)
  })

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

      {/* Hierarchy */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
              {isArabic ? "الهيكل التنظيمي للأمانة العامة" : "Secretariat Organizational Structure"}
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              {isArabic
                ? "يتكون الأمانة العامة من 29 عضواً يتوزعون على 5 مستويات هرمية"
                : "The Secretariat consists of 29 members distributed across 5 hierarchical levels"}
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
            <div className="max-w-6xl mx-auto">
              {groupedByLevel.map((group, i) => (
                <HierarchyTree key={i} members={group} level={i} isArabic={isArabic} />
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
            <a href="mailto:aiuagho@gmail.com" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white border-2 border-white/30 rounded-xl font-bold hover:bg-white/20 transition-all">
              <Mail className="w-5 h-5" /> aiuagho@gmail.com
            </a>
            <a href="tel:+249114210853" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white border-2 border-white/30 rounded-xl font-bold hover:bg-white/20 transition-all">
              <Phone className="w-5 h-5" /> +249114210853
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
