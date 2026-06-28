"use client"

import { MapPin, Globe, Building2, Users, Mail, Phone, Flag } from "lucide-react"

interface BranchItem {
  id: string
  name: string
  nameEn: string | null
  city: string | null
  country: string | null
  status: string | null
  type: string | null
  address: string | null
  phone: string | null
  email: string | null
  headName: string | null
  memberCount: number | null
}

export default function BranchesClient({
  branches,
  isArabic,
}: {
  branches: BranchItem[]
  isArabic: boolean
}) {
  const sudanBranches = branches.filter((b) => b.type === "sudan")
  const africanBranches = branches.filter((b) => b.type === "africa")

  const activeCount = branches.filter((b) => b.status === "active").length
  const establishingCount = branches.filter((b) => b.status === "establishing").length
  const plannedCount = branches.filter((b) => b.status === "planned").length

  const getStatusLabel = (status: string | null, type: "ar" | "en") => {
    if (type === "ar") {
      return status === "active" ? "نشط" : status === "establishing" ? "قيد التأسيس" : "مخطط له"
    }
    return status === "active" ? "Active" : status === "establishing" ? "Establishing" : "Planned"
  }

  const renderBranchCard = (branch: BranchItem, isSudan: boolean) => (
    <div
      key={branch.id}
      className={`${isSudan ? "bg-background" : "bg-surface"} rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-border group`}
    >
      <div className={`bg-gradient-to-r ${isSudan ? "from-primary to-primary-light" : "from-secondary to-secondary/80"} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              {isSudan ? <MapPin className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {isArabic ? branch.name : branch.nameEn || branch.name}
              </h3>
              <p className="text-white/80 text-sm">
                {branch.city || ""}{branch.country ? " - " + branch.country : ""}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              branch.status === "active"
                ? "bg-white/20 text-white"
                : branch.status === "establishing"
                ? "bg-accent/80 text-white"
                : "bg-white/10 text-white/70"
            }`}
          >
            {getStatusLabel(branch.status, isArabic ? "ar" : "en")}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="space-y-3">
          {branch.memberCount != null && branch.memberCount > 0 && (
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-text-secondary" />
              <span className="text-text-secondary text-sm">
                {branch.memberCount}+ {isArabic ? "عضو" : "members"}
              </span>
            </div>
          )}
          {branch.email && (
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-text-secondary" />
              <a href={`mailto:${branch.email}`} className="text-text-secondary text-sm hover:text-primary">
                {branch.email}
              </a>
            </div>
          )}
          {branch.phone && (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-text-secondary" />
              <a href={`tel:${branch.phone}`} className="text-text-secondary text-sm hover:text-primary">
                {branch.phone}
              </a>
            </div>
          )}
          {branch.headName && (
            <div className="flex items-center gap-3 text-text-secondary text-sm">
              <span className="font-medium">{isArabic ? "مدير الفرع:" : "Branch Head:"}</span>
              <span>{branch.headName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-surface rounded-2xl shadow-sm border border-border">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{branches.length}</div>
              <div className="text-text-secondary text-sm">{isArabic ? "إجمالي الفروع" : "Total Branches"}</div>
            </div>
            <div className="text-center p-6 bg-surface rounded-2xl shadow-sm border border-border">
              <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">{activeCount}</div>
              <div className="text-text-secondary text-sm">{isArabic ? "فروع نشطة" : "Active Branches"}</div>
            </div>
            <div className="text-center p-6 bg-surface rounded-2xl shadow-sm border border-border">
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">{establishingCount}</div>
              <div className="text-text-secondary text-sm">{isArabic ? "قيد التأسيس" : "Establishing"}</div>
            </div>
            <div className="text-center p-6 bg-surface rounded-2xl shadow-sm border border-border">
              <div className="text-3xl md:text-4xl font-bold text-primary-light mb-2">{plannedCount}</div>
              <div className="text-text-secondary text-sm">{isArabic ? "مخطط لها" : "Planned"}</div>
            </div>
          </div>
        </div>
      </section>

      {branches.length === 0 ? (
        <section className="py-20 bg-surface">
          <div className="text-center py-20 text-text-secondary">
            <Building2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">{isArabic ? "لا توجد فروع حالياً" : "No branches available yet"}</p>
          </div>
        </section>
      ) : (
        <>
          {sudanBranches.length > 0 && (
            <section className="py-20 bg-surface">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-full mb-4">
                    <Flag className="w-5 h-5" />
                    <span className="font-bold text-sm">{isArabic ? "الخرطوم - السودان" : "Khartoum - Sudan"}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">{isArabic ? "فروع السودان" : "Sudan Branches"}</h2>
                  <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {sudanBranches.map((branch) => renderBranchCard(branch, true))}
                </div>
              </div>
            </section>
          )}

          {africanBranches.length > 0 && (
            <section className="py-20 bg-background">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-full mb-4">
                    <Globe className="w-5 h-5" />
                    <span className="font-bold text-sm">{isArabic ? "أفريقيا والعالم" : "Africa & Worldwide"}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">{isArabic ? "الفروع الأفريقية والدولية" : "African & International Branches"}</h2>
                  <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {africanBranches.map((branch) => renderBranchCard(branch, false))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      <section className="py-16 bg-surface border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold text-text mb-2">{isArabic ? "المقر الرئيسي" : "Headquarters"}</h3>
              <p className="text-text-secondary text-sm">{isArabic ? "الخرطوم - السودان" : "Khartoum - Sudan"}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold text-text mb-2">{isArabic ? "الهاتف" : "Phone"}</h3>
              <a href="tel:+249114210853" className="text-text-secondary text-sm hover:text-primary">+249114210853</a>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold text-text mb-2">{isArabic ? "البريد الإلكتروني" : "Email"}</h3>
              <a href="mailto:aiuagho@gmail.com" className="text-text-secondary text-sm hover:text-primary">aiuagho@gmail.com</a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
