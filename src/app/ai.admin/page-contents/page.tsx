"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminLang } from "../admin-lang";

interface PageContentItem {
  id: string;
  page: string;
  section: string;
  key: string;
  valueAr: string;
  valueEn: string;
}

const PAGE_LABELS: Record<string, { ar: string; en: string }> = {
  home: { ar: "الرئيسية", en: "Home" },
  about: { ar: "من نحن", en: "About" },
  contact: { ar: "اتصل بنا", en: "Contact" },
  services: { ar: "خدماتنا", en: "Services" },
  membership: { ar: "العضوية", en: "Membership" },
  media: { ar: "المركز الإعلامي", en: "Media Center" },
  organization: { ar: "الهيكل التنظيمي", en: "Organization" },
  secretariat: { ar: "الأمانة العامة", en: "Secretariat" },
  faq: { ar: "الأسئلة الشائعة", en: "FAQ" },
  posts: { ar: "المشاركات", en: "Posts" },
  projects: { ar: "المشاريع", en: "Projects" },
  news: { ar: "الأخبار", en: "News" },
  events: { ar: "الأحداث", en: "Events" },
  partners: { ar: "شركاؤنا", en: "Partners" },
  volunteer: { ar: "التطوع", en: "Volunteer" },
  donations: { ar: "التبرعات", en: "Donations" },
  footer: { ar: "التذييل", en: "Footer" },
};

export default function PageContentsPage() {
  const { lang, t } = useAdminLang();
  const [contents, setContents] = useState<PageContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState("home");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAr, setEditAr] = useState("");
  const [editEn, setEditEn] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState("");

  const fetchContents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/page-content?page=" + selectedPage);
      const data = await res.json();
      setContents(Array.isArray(data) ? data : []);
    } catch {
      setContents([]);
    } finally {
      setLoading(false);
    }
  }, [selectedPage]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  const handleSave = async (id: string) => {
    setSaving(true);
    try {
      await fetch("/api/admin/page-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, valueAr: editAr, valueEn: editEn }),
      });
      setEditingId(null);
      fetchContents();
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedResult("");
    try {
      const res = await fetch("/api/admin/seed-content", { method: "POST" });
      const data = await res.json();
      setSeedResult(t("pageContents.seedSuccess").replace("{pages}", String(data.pageCount)).replace("{members}", String(data.memberCount)));
      fetchContents();
    } catch {
      setSeedResult(t("pageContents.seedError"));
    } finally {
      setSeeding(false);
    }
  };

  const filtered = contents.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.section.toLowerCase().includes(q) || c.key.toLowerCase().includes(q) || c.valueAr.toLowerCase().includes(q) || (c.valueEn || "").toLowerCase().includes(q);
  });

  const grouped: Record<string, PageContentItem[]> = {};
  filtered.forEach((item) => {
    if (!grouped[item.section]) grouped[item.section] = [];
    grouped[item.section].push(item);
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("pageContents.title")}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("pageContents.subtitle")}</p>
          </div>
          <button onClick={handleSeed} disabled={seeding} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium">
            {seeding ? t("pageContents.seeding") : t("pageContents.seedBtn")}
          </button>
        </div>

        {seedResult && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg text-green-700 dark:text-green-300 text-sm">
            {seedResult}
          </div>
        )}

        <div className="bg-white dark:bg-[#111927] rounded-xl shadow-sm border border-gray-200 dark:border-[#3b4f6b] mb-6">
          <div className="p-4 border-b border-gray-200 dark:border-[#3b4f6b]">
            <div className="flex flex-wrap gap-2">
              {Object.entries(PAGE_LABELS).map(([slug, label]) => (
                <button key={slug} onClick={() => setSelectedPage(slug)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedPage === slug ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-[#1e2d42] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2a3f5f]"}`}>
                  {lang === "ar" ? label.ar : label.en}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-b border-gray-200 dark:border-[#3b4f6b]">
            <input type="text" placeholder={t("pageContents.searchPh")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-[#3b4f6b] rounded-lg bg-white dark:bg-[#1e2d42] text-gray-900 dark:text-[#f1f5f9] text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div className="p-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 dark:bg-[#1e2d42] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : Object.keys(grouped).length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p className="text-lg mb-2">{t("pageContents.emptyTitle")}</p>
                <p className="text-sm">{t("pageContents.emptyHint")}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(grouped).map(([section, items]) => (
                  <div key={section}>
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 pb-2 border-b border-gray-100 dark:border-[#1e2d42]">{section}</h3>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row gap-3 p-3 bg-gray-50 dark:bg-[#0d1525] rounded-lg border border-gray-100 dark:border-[#1e2d42]">
                          <div className="sm:w-40 flex-shrink-0">
                            <span className="text-xs font-mono text-blue-600 dark:text-blue-400">{item.key}</span>
                          </div>
                          {editingId === item.id ? (
                            <div className="flex-1 space-y-2">
                              <input type="text" value={editAr} onChange={(e) => setEditAr(e.target.value)} placeholder={t("pageContents.arPh")} className="w-full px-3 py-1.5 border border-gray-300 dark:border-[#3b4f6b] rounded bg-white dark:bg-[#1e2d42] text-gray-900 dark:text-[#f1f5f9] text-sm" dir="rtl" />
                              <input type="text" value={editEn} onChange={(e) => setEditEn(e.target.value)} placeholder={t("pageContents.enPh")} className="w-full px-3 py-1.5 border border-gray-300 dark:border-[#3b4f6b] rounded bg-white dark:bg-[#1e2d42] text-gray-900 dark:text-[#f1f5f9] text-sm" />
                              <div className="flex gap-2">
                                <button onClick={() => handleSave(item.id)} disabled={saving} className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50">
                                  {saving ? t("common.saving") : t("pageContents.save")}
                                </button>
                                <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-gray-300 dark:bg-[#3b4f6b] text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-400">
                                  {t("common.cancel")}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-start">
                              <div className="text-sm text-gray-800 dark:text-gray-200 break-words min-w-0" dir="rtl">{item.valueAr}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 break-words min-w-0">{item.valueEn}</div>
                              <button onClick={() => { setEditingId(item.id); setEditAr(item.valueAr); setEditEn(item.valueEn || ""); }} className="px-3 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded whitespace-nowrap">
                                {t("common.edit")}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
