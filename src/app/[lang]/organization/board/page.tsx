"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Crown,
  Shield,
  Users,
  Building2,
  Globe,
  Newspaper,
  BarChart3,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import HeroSection from "@/components/ui/hero-section-client";

interface BoardPageProps {
  params: Promise<{ lang: string }>;
}

interface BoardMember {
  id?: string | number;
  nameAr?: string;
  nameEn?: string;
  name?: string;
  positionAr?: string;
  positionEn?: string;
  position?: string;
  bioAr?: string;
  bioEn?: string;
  bio?: string;
  photo?: string;
  initials?: string;
  icon?: typeof Crown;
  [key: string]: unknown;
}

const iconMap: Record<string, typeof Crown> = {
  Crown,
  Shield,
  Users,
  Building2,
  Globe,
  Newspaper,
  BarChart3,
};

const iconKeys = Object.keys(iconMap);

function getIcon(index: number): typeof Crown {
  return iconMap[iconKeys[index % iconKeys.length]] || Crown;
}

export default function BoardPage() {
  const params = useParams();
  const lang = (params as { lang?: string })?.lang || "ar";
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await fetch("/api/public/board");
        if (res.ok) {
          const data = await res.json();
          setBoardMembers(data);
        }
      } catch (error) {
        console.error("Failed to fetch board:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, []);

  const getName = (m: BoardMember) => isArabic ? (m.nameAr || m.name || "") : (m.nameEn || m.name || "");
  const getPosition = (m: BoardMember) => isArabic ? (m.positionAr || m.position || "") : (m.positionEn || m.position || "");
  const getBio = (m: BoardMember) => isArabic ? (m.bioAr || m.bio || "") : (m.bioEn || m.bio || "");
  const getInitials = (name: string) => {
    const parts = name.split(" ").filter(Boolean);
    return parts.length >= 2 ? parts[0] + parts[1] : parts[0] || "";
  };

  return (
    <div dir={dir}>
      <HeroSection
        pageSlug="board"
        lang={lang}
        defaultTitle={isArabic ? "مجلس إدارة الرابطة" : "Board of Directors"}
        defaultSubtitle={isArabic
          ? "القيادة العليا التي توجّه أداء الرابطة لتحقيق أهدافها"
          : "The senior leadership guiding the association's performance toward its goals"}
      >
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-6 animate-fade-in">
            <Crown className="w-16 h-16 text-secondary mx-auto" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
            {isArabic ? "مجلس إدارة الرابطة" : "Board of Directors"}
          </h1>
          <p className="text-xl text-white/80 mb-8 animate-fade-in">
            {isArabic
              ? "القيادة العليا التي توجّه أداء الرابطة لتحقيق أهدافها"
              : "The senior leadership guiding the association's performance toward its goals"}
          </p>
        </div>
      </HeroSection>

      {/* Board Members Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div>
              {/* President skeleton */}
              <div className="max-w-2xl mx-auto bg-surface rounded-3xl overflow-hidden border border-border mb-12">
                <div className="h-48 animate-pulse bg-gradient-to-r from-secondary/30 via-secondary/20 to-secondary/30" />
                <div className="p-8 text-center space-y-4">
                  <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light w-24 h-24 rounded-full mx-auto" />
                  <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-6 w-48 mx-auto rounded" />
                  <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-4 w-32 mx-auto rounded" />
                  <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-3 w-64 mx-auto rounded" />
                </div>
              </div>
              {/* Board members skeleton */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-surface rounded-2xl overflow-hidden border border-border">
                    <div className="h-32 animate-pulse bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 flex items-center justify-center">
                      <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light w-20 h-20 rounded-full" />
                    </div>
                    <div className="p-6 text-center space-y-3">
                      <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-5 w-32 mx-auto rounded" />
                      <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-3 w-24 mx-auto rounded" />
                      <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-3 w-48 mx-auto rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : boardMembers.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-secondary text-lg">
                {isArabic ? "لا يوجد أعضاء حالياً" : "No board members available"}
              </p>
            </div>
          ) : (
            <>
              {/* President - Featured */}
              {boardMembers[0] && (
                <div className="mb-16">
                  <div className="max-w-2xl mx-auto">
                    <div className="bg-surface rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all group border border-border">
                      <div className="bg-gradient-to-r from-secondary to-secondary/80 p-8 text-center">
                        {boardMembers[0].photo ? (
                          <img
                            src={boardMembers[0].photo}
                            alt={getName(boardMembers[0])}
                            className="w-28 h-28 mx-auto rounded-full object-cover border-4 border-white/30 mb-4"
                          />
                        ) : (
                          <div className="w-28 h-28 mx-auto bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30 mb-4">
                            <span className="text-3xl font-bold text-white">
                              {getInitials(getName(boardMembers[0]))}
                            </span>
                          </div>
                        )}
                        <Crown className="w-8 h-8 text-white/80 mx-auto mb-2" />
                      </div>
                      <div className="p-8 text-center">
                        <h3 className="text-2xl font-bold text-text mb-2">
                          {getName(boardMembers[0])}
                        </h3>
                        <span className="inline-block px-4 py-2 bg-secondary/10 text-secondary font-bold rounded-full text-sm mb-4">
                          {getPosition(boardMembers[0])}
                        </span>
                        <p className="text-text-secondary leading-relaxed">
                          {getBio(boardMembers[0])}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Members */}
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
                  {isArabic ? "أعضاء مجلس الإدارة" : "Board Members"}
                </h2>
                <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {boardMembers.slice(1).map((member, index) => {
                  const IconComp = member.icon || getIcon(index);
                  return (
                    <div
                      key={member.id || index}
                      className="bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group border border-border"
                    >
                      <div className="bg-gradient-to-br from-primary to-primary-light p-6 text-center">
                        {member.photo ? (
                          <img
                            src={member.photo}
                            alt={getName(member)}
                            className="w-20 h-20 mx-auto rounded-full object-cover border-2 border-white/30"
                          />
                        ) : (
                          <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                            <span className="text-xl font-bold text-white">
                              {getInitials(getName(member))}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-6 text-center">
                        <h3 className="text-lg font-bold text-text mb-2">
                          {getName(member)}
                        </h3>
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-bold rounded-full text-xs mb-4">
                          {getPosition(member)}
                        </span>
                        <p className="text-text-secondary text-sm leading-relaxed">
                          {getBio(member)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Board Mission */}
      <section className="py-20 bg-surface">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
                {isArabic ? "رسالة مجلس الإدارة" : "Board Mission"}
              </h2>
              <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
            </div>
            <div className="bg-background rounded-3xl p-8 md:p-12 border border-border">
              <ul className="space-y-6">
                {[
                  {
                    ar: "وضع الاستراتيجيات والأهداف طويلة المدى للرابطة",
                    en: "Setting long-term strategies and goals for the association",
                  },
                  {
                    ar: "الإشراف على تنفيذ الخطط والبرامج المعتمدة",
                    en: "Supervising the implementation of approved plans and programs",
                  },
                  {
                    ar: "اتخاذ القرارات المالية والإدارية المحورية",
                    en: "Making key financial and administrative decisions",
                  },
                  {
                    ar: "تعزيز الشراكات مع المؤسسات الأكاديمية والمهنية",
                    en: "Enhancing partnerships with academic and professional institutions",
                  },
                  {
                    ar: "ضمان الحوكمة الرشيدة والشفافية في إدارة الرابطة",
                    en: "Ensuring good governance and transparency in association management",
                  },
                  {
                    ar: "تمثيل الرابطة في المحافل الوطنية والإقليمية والدولية",
                    en: "Representing the association at national, regional, and international forums",
                  },
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                      <span className="text-secondary font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <span className="text-text-secondary leading-relaxed">
                      {isArabic ? item.ar : item.en}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            {isArabic ? "تواصل مع مجلس الإدارة" : "Contact the Board"}
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            {isArabic
              ? "لأي استفسارات أو اقتراحات، لا تتردد في التواصل معنا"
              : "For any inquiries or suggestions, feel free to contact us"}
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
  );
}
