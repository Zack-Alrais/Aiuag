"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Calendar,
  FolderOpen,
  Newspaper,
  BarChart3,
  BookOpen,
  Rocket,
  Mail,
  Phone,
  CheckCircle2,
  Target,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import HeroSection from "@/components/ui/hero-section";

const committeeIcons = [Users, Calendar, FolderOpen, Newspaper, BarChart3, BookOpen, Rocket];
const committeeColors = [
  "from-primary to-primary-light",
  "from-secondary to-secondary/80",
  "from-accent to-accent/80",
  "from-primary-light to-primary",
  "from-secondary to-secondary/70",
  "from-primary to-accent",
  "from-accent to-secondary",
];

export default function CommitteesPage() {
  const params = useParams();
  const lang = (params as { lang?: string })?.lang || "ar";
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";
  const [committees, setCommittees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/committees")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCommittees(
            data.map((c: any, i: number) => ({
              title: isArabic ? c.nameAr : c.nameEn,
              titleEn: c.nameEn,
              description: isArabic ? c.descriptionAr : c.descriptionEn,
              descriptionEn: c.descriptionEn,
              responsibilities: [],
              responsibilitiesEn: [],
              icon: committeeIcons[i % committeeIcons.length],
              color: committeeColors[i % committeeColors.length],
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isArabic]);



  return (
    <div dir={dir}>
      <HeroSection
        pageSlug="committees"
        lang={lang}
        defaultTitle={isArabic ? "لجان الرابطة" : "Association Committees"}
        defaultSubtitle={isArabic
          ? "Seven specialized committees working to achieve the association's goals"
          : "Seven specialized committees working to achieve the association's goals"}
      >
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-6 animate-fade-in">
            <Target className="w-16 h-16 text-secondary mx-auto" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
            {isArabic ? "لجان الرابطة" : "Association Committees"}
          </h1>
          <p className="text-xl text-white/80 mb-8 animate-fade-in">
            {isArabic
              ? " Seven specialized committees working to achieve the association's goals"
              : "Seven specialized committees working to achieve the association's goals"}
          </p>
        </div>
      </HeroSection>

      {/* Committees Overview */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-text mb-6">
              {isArabic ? "نبذة عن اللجان" : "Committees Overview"}
            </h2>
            <p className="text-text-secondary leading-relaxed text-lg">
              {isArabic
                ? "تعمل اللجان المختلفة في تناغم لتحقيق أهداف الرابطة وتلبية احتياجات أعضائها. كل لجنة مسؤولة عن مجال محدد تعمل خلاله بفعالية لتحقيق النتائج المرجوة."
                : "The various committees work in harmony to achieve the association's goals and meet its members' needs. Each committee is responsible for a specific area where it works effectively to achieve desired outcomes."}
            </p>
          </div>
        </div>
      </section>

      {/* Committees Grid */}
      <section className="py-20 bg-surface">
        <div className="container mx-auto px-4">
          <div className="space-y-8 max-w-6xl mx-auto">
            {loading ? (
              <div className="space-y-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-background rounded-3xl overflow-hidden border border-border">
                    <div className="h-28 animate-pulse bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 p-6 md:p-8">
                      <div className="flex items-center gap-4">
                        <div className="animate-pulse bg-white/30 w-16 h-16 rounded-2xl" />
                        <div className="space-y-2">
                          <div className="animate-pulse bg-white/30 h-6 w-48 rounded" />
                          <div className="animate-pulse bg-white/20 h-3 w-64 rounded" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6 md:p-8 space-y-3">
                      <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-4 w-40 rounded" />
                      <div className="grid md:grid-cols-2 gap-3">
                        {Array.from({ length: 4 }).map((_, j) => (
                          <div key={j} className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-3 w-full rounded" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : committees.map((committee, index) => (
              <div
                key={index}
                className="bg-background rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-border"
              >
                <div className={`bg-gradient-to-r ${committee.color} p-6 md:p-8 text-white`}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                      <committee.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold">
                        {isArabic ? committee.title : committee.titleEn}
                      </h3>
                      <p className="text-white/80 text-sm mt-1">
                        {isArabic ? committee.description : committee.descriptionEn}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <h4 className="font-bold text-text mb-4 text-lg">
                    {isArabic ? "المسؤوليات:" : "Responsibilities:"}
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {committee.responsibilities.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                        <span className="text-text-secondary text-sm">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Committee Contact Info */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
              {isArabic ? "معلومات التواصل" : "Contact Information"}
            </h2>
            <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-surface rounded-2xl p-6 text-center border border-border">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold text-text mb-2">
                {isArabic ? "البريد الإلكتروني" : "Email"}
              </h3>
              <a
                href="mailto:aiuagho@gmail.com"
                className="text-text-secondary text-sm hover:text-primary"
              >
                aiuagho@gmail.com
              </a>
            </div>
            <div className="bg-surface rounded-2xl p-6 text-center border border-border">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold text-text mb-2">
                {isArabic ? "الهاتف" : "Phone"}
              </h3>
              <a
                href="tel:+249114210853"
                className="text-text-secondary text-sm hover:text-primary"
              >
                +249114210853
              </a>
            </div>
            <div className="bg-surface rounded-2xl p-6 text-center border border-border">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold text-text mb-2">
                {isArabic ? "مواعيد الاجتماعات" : "Meeting Schedule"}
              </h3>
              <p className="text-text-secondary text-sm">
                {isArabic ? "الأسبوع الأول من كل شهر" : "First week of each month"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            {isArabic ? "هل تريد الانضمام إلى إحدى اللجان؟" : "Want to Join a Committee?"}
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            {isArabic
              ? "نحن نرحب بالأعضاء الجدد الراغبين في المشاركة الفعالة في لجان الرابطة"
              : "We welcome new members who want to actively participate in the association's committees"}
          </p>
          <Link
            href={`/${lang}/membership/apply`}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-white rounded-xl text-lg font-bold hover:bg-secondary/90 transition-all hover:scale-105"
          >
            {isArabic ? "قدم طلب العضوية" : "Apply for Membership"}
            {isArabic ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
          </Link>
        </div>
      </section>
    </div>
  );
}
