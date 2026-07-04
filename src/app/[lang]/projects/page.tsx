"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FolderOpen, Calendar, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Clock, Users, Image } from "lucide-react";
import Link from "next/link";
import ScrollReveal from "@/components/ui/scroll-reveal";
import HeroSection from "@/components/ui/hero-section-client";

export default function ProjectsPage() {
  const params = useParams();
  const lang = (params as { lang?: string })?.lang || "ar";
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/projects")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(
            data.map((p: any) => ({
              id: p.id,
              title: isArabic ? p.titleAr : p.titleEn,
              description: isArabic ? p.descriptionAr : p.descriptionEn,
              featuredImage: p.featuredImage,
              gallery: p.gallery,
              status:
                p.status === "active"
                  ? isArabic ? "نشط" : "Active"
                  : p.status === "completed"
                  ? isArabic ? "مكتمل" : "Completed"
                  : isArabic ? "متوقف" : "Paused",
              statusColor:
                p.status === "active"
                  ? "bg-primary text-white"
                  : p.status === "completed"
                  ? "bg-success text-white"
                  : "bg-warning text-white",
              startDate: p.startDate
                ? new Date(p.startDate).toLocaleDateString(isArabic ? "ar" : "en", { year: "numeric", month: "long" })
                : "",
              endDate: p.endDate
                ? new Date(p.endDate).toLocaleDateString(isArabic ? "ar" : "en", { year: "numeric", month: "long" })
                : "",
              progress: 0,
              team: 0,
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isArabic]);



  const filterTabs = [
    { id: "all", label: isArabic ? "الكل" : "All" },
    { id: "active", label: isArabic ? "نشط" : "Active" },
    { id: "completed", label: isArabic ? "مكتمل" : "Completed" },
    { id: "planning", label: isArabic ? "تخطيط" : "Planning" },
  ];

  return (
    <div dir={dir}>
      <HeroSection
        pageSlug="projects"
        lang={lang}
        defaultTitle={isArabic ? "المشاريع" : "Projects"}
        defaultSubtitle={isArabic
          ? "نعمل على مشاريع تطويرية تساهم في بناء مستقبل أفضل للجامعة والمجتمع"
          : "We work on developmental projects that contribute to building a better future for the university and community"}
        badge={
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm">
            <FolderOpen className="w-4 h-4" />
            <span>{isArabic ? "مشاريعنا" : "Our Projects"}</span>
          </div>
        }
      />

      {/* Filter Tabs */}
      <ScrollReveal direction="up"><section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                  tab.id === "all"
                    ? "bg-primary text-white"
                    : "bg-surface text-text-secondary hover:bg-primary/10 hover:text-primary border border-border"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section></ScrollReveal>

      {/* Projects Grid */}
      <ScrollReveal direction="up"><section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-surface rounded-2xl overflow-hidden border border-border">
                    <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-48" />
                    <div className="p-6 space-y-3">
                      <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-5 w-3/4 rounded" />
                      <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-3 w-full rounded" />
                      <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-3 w-2/3 rounded" />
                      <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-2 w-full rounded-full mt-4" />
                      <div className="flex gap-4">
                        <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-3 w-24 rounded" />
                        <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-3 w-16 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
              >
                <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative overflow-hidden">
                  {project.featuredImage ? (
                    <img
                      src={project.featuredImage}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <div className={`absolute inset-0 flex items-center justify-center ${project.featuredImage ? 'hidden' : ''}`}>
                    <FolderOpen className="w-20 h-20 text-primary/20" />
                  </div>
                  <div className="absolute top-4 start-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${project.statusColor}`}>
                      {project.status}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-text mb-2 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-text-secondary text-sm mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-secondary">{isArabic ? "التقدم" : "Progress"}</span>
                      <span className="font-bold text-primary">{project.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-text-secondary border-t border-border pt-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{project.startDate} - {project.endDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{project.team}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section></ScrollReveal>

      {/* CTA */}
      <ScrollReveal direction="up"><section className="py-16 bg-surface">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-primary-light rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {isArabic ? "هل لديك فكرة لمشروع جديد؟" : "Have an idea for a new project?"}
            </h2>
            <p className="text-white/80 mb-6 max-w-xl mx-auto">
              {isArabic
                ? "شاركنا أفكارك ودعنا نعمل معاً على بناء مشاريع تخدم المجتمع"
                : "Share your ideas and let's work together to build projects that serve the community"}
            </p>
            <Link
              href={`/${lang}/contact`}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary rounded-xl font-bold hover:bg-white/90 transition-all"
            >
              {isArabic ? "تواصل معنا" : "Contact Us"}
              {isArabic ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            </Link>
          </div>
        </div>
        </section></ScrollReveal>
    </div>
  );
}
