"use client";

import { useState, useEffect } from "react";
import { Handshake, Building2, Heart, Star, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import HeroSection from "@/components/ui/hero-section";

interface Partner {
  id: string | number;
  nameAr?: string;
  nameEn?: string;
  name?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  description?: string;
  logo?: string;
  website?: string;
  type?: string;
  [key: string]: unknown;
}

export default function PartnersPage() {
  const params = useParams();
  const lang = (params as { lang?: string })?.lang || "ar";
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await fetch("/api/public/partners");
        if (res.ok) {
          const data = await res.json();
          setPartners(data);
        }
      } catch (error) {
        console.error("Failed to fetch partners:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  const partnerCategories = [
    { id: "all", label: isArabic ? "الكل" : "All", icon: Handshake },
    { id: "partners", label: isArabic ? "شركاء" : "Partners", icon: Building2 },
    { id: "sponsors", label: isArabic ? "رعاة" : "Sponsors", icon: Star },
    { id: "supporters", label: isArabic ? "داعمون" : "Supporters", icon: Heart },
  ];

  const getName = (p: Partner) => isArabic ? (p.nameAr || p.name || "") : (p.nameEn || p.name || "");
  const getDescription = (p: Partner) => isArabic ? (p.descriptionAr || p.description || "") : (p.descriptionEn || p.description || "");
  const getCategory = (p: Partner) => {
    const t = (p.type || "").toLowerCase();
    if (t === "sponsor" || t === "sponsors" || t === "راعي") return "sponsors";
    if (t === "supporter" || t === "supporters" || t === "داعم") return "supporters";
    return "partners";
  };

  const categoryColors: Record<string, string> = {
    partners: "from-primary to-primary-light",
    sponsors: "from-green-500 to-green-600",
    supporters: "from-red-500 to-red-600",
  };

  const filteredPartners = activeCategory === "all"
    ? partners
    : partners.filter((p) => getCategory(p) === activeCategory);

  return (
    <div dir={dir}>
      <HeroSection
        pageSlug="partners"
        lang={lang}
        defaultTitle={isArabic ? "الشركاء" : "Partners"}
        defaultSubtitle={isArabic
          ? "نفخر بشراكتنا مع مؤسسات وشركات رائدة تدعم رسالتنا وأهدافنا"
          : "We are proud to partner with leading institutions and companies that support our mission and goals"}
        badge={
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm">
            <Handshake className="w-4 h-4" />
            <span>{isArabic ? "شركاؤنا" : "Our Partners"}</span>
          </div>
        }
      />

      {/* Category Filter */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {partnerCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                  cat.id === activeCategory
                    ? "bg-primary text-white"
                    : "bg-surface text-text-secondary hover:bg-primary/10 hover:text-primary border border-border"
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-surface rounded-2xl overflow-hidden border border-border">
                  <div className="h-32 animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light" />
                  <div className="p-5 space-y-3">
                    <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-5 w-3/4 rounded" />
                    <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-3 w-full rounded" />
                    <div className="animate-pulse bg-gradient-to-r from-border-light via-surface to-border-light h-3 w-2/3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPartners.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-secondary text-lg">
                {isArabic ? "لا يوجد شركاء حالياً" : "No partners available"}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPartners.map((partner) => {
                const cat = getCategory(partner);
                const color = categoryColors[cat] || "from-primary to-primary-light";
                return (
                  <div
                    key={partner.id}
                    className="bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
                  >
                    <div className={`h-32 bg-gradient-to-br ${color} flex items-center justify-center relative`}>
                      {partner.logo ? (
                        <img
                          src={partner.logo}
                          alt={getName(partner)}
                          className="h-20 w-auto object-contain group-hover:scale-110 transition-transform"
                        />
                      ) : (
                        <Building2 className="w-16 h-16 text-white/30 group-hover:scale-110 transition-transform" />
                      )}
                      <div className="absolute top-3 end-3">
                        <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full backdrop-blur-sm">
                          {cat === "partners"
                            ? isArabic ? "شريك" : "Partner"
                            : cat === "sponsors"
                            ? isArabic ? "راعي" : "Sponsor"
                            : isArabic ? "داعم" : "Supporter"}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-bold text-text mb-2 group-hover:text-primary transition-colors">
                        {getName(partner)}
                      </h3>
                      <p className="text-text-secondary text-sm line-clamp-3">
                        {getDescription(partner)}
                      </p>
                      {partner.website && (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-block text-primary text-xs font-bold hover:underline"
                        >
                          {isArabic ? "زيارة الموقع" : "Visit Website"}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Become a Partner CTA */}
      <section className="py-16 bg-surface">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-primary-light rounded-3xl p-8 md:p-12 text-center text-white">
            <Handshake className="w-12 h-12 mx-auto mb-4 text-secondary" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {isArabic ? "كن شريكاً معنا" : "Become a Partner"}
            </h2>
            <p className="text-white/80 mb-6 max-w-xl mx-auto">
              {isArabic
                ? "انضم إلى شبكة شركائنا المتنوعين وساهم في دعم رسالة الرابطة وتحقيق أهدافها"
                : "Join our diverse network of partners and contribute to supporting the association's mission and goals"}
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
      </section>
    </div>
  );
}
