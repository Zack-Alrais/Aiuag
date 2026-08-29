"use client"

import { useState, useEffect, useCallback } from "react"
import { Settings, Globe, Mail, Phone, MapPin, Share2, Search, Save, X, Image, Plus, ChevronUp, ChevronDown, Check } from "lucide-react"
import ImageUpload from "@/components/admin/ImageUpload"
import { useAdminLang } from "../admin-lang"

interface SettingsForm {
  siteNameAr: string
  siteNameEn: string
  siteDescription: string
  email: string
  phone: string
  address: string
  facebook: string
  twitter: string
  instagram: string
  youtube: string
  metaTitle: string
  metaDescription: string
}

interface HeroImage {
  id: string
  pageSlugs: string
  imageUrl: string
  titleAr: string | null
  titleEn: string | null
  subtitleAr: string | null
  subtitleEn: string | null
  linkUrl: string | null
  order: number
  isActive: boolean
}

const pageOptions = [
  { slug: "home", labelAr: "الرئيسية", labelEn: "Home" },
  { slug: "about", labelAr: "من نحن", labelEn: "About" },
  { slug: "news", labelAr: "الأخبار", labelEn: "News" },
  { slug: "events", labelAr: "الأحداث", labelEn: "Events" },
  { slug: "gallery", labelAr: "المعرض", labelEn: "Gallery" },
  { slug: "contact", labelAr: "اتصل بنا", labelEn: "Contact" },
  { slug: "membership", labelAr: "العضوية", labelEn: "Membership" },
  { slug: "projects", labelAr: "المشاريع", labelEn: "Projects" },
  { slug: "partners", labelAr: "الشركاء", labelEn: "Partners" },
  { slug: "donations", labelAr: "التبرعات", labelEn: "Donations" },
  { slug: "volunteer", labelAr: "التطوع", labelEn: "Volunteer" },
  { slug: "services", labelAr: "الخدمات", labelEn: "Services" },
  { slug: "publications", labelAr: "المنشورات", labelEn: "Publications" },
  { slug: "media", labelAr: "المركز الإعلامي", labelEn: "Media Center" },
  { slug: "board", labelAr: "مجلس الإدارة", labelEn: "Board" },
  { slug: "history", labelAr: "تاريخنا", labelEn: "History" },
  { slug: "vision", labelAr: "رؤيتنا", labelEn: "Vision" },
  { slug: "mission", labelAr: "مهمتنا", labelEn: "Mission" },
]

const initialForm: SettingsForm = {
  siteNameAr: "رابطة خريجي جامعة أفريقيا العالمية",
  siteNameEn: "AIUAG - Association of IUA Graduates",
  siteDescription: "رابطة مهنية واجتماعية تجمع خريجي جامعة أفريقيا العالمية وتعزز الروابط بينهم لخدمة المجتمع والتنمية.",
  email: "info@aiuag.org",
  phone: "+249 123 456 789",
  address: "الخرطوم، السودان",
  facebook: "https://facebook.com/aiuag",
  twitter: "https://twitter.com/aiuag",
  instagram: "https://instagram.com/aiuag",
  youtube: "https://youtube.com/@aiuag",
  metaTitle: "رابطة خريجي جامعة أفريقيا العالمية - AIUAG",
  metaDescription: "رابطة مهنية واجتماعية تجمع خريجي جامعة أفريقيا العالمية وتعزز الروابط بينهم لخدمة المجتمع والتنمية.",
}

export default function SettingsPage() {
  const { lang, t } = useAdminLang()
  const [form, setForm] = useState<SettingsForm>(initialForm)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [loadingSettings, setLoadingSettings] = useState(true)

  // Hero images state
  const [heroImages, setHeroImages] = useState<HeroImage[]>([])
  const [heroLoading, setHeroLoading] = useState(true)
  const [filterPages, setFilterPages] = useState<string[]>([])
  const [showHeroModal, setShowHeroModal] = useState(false)
  const [editingHero, setEditingHero] = useState<HeroImage | null>(null)
  const [heroForm, setHeroForm] = useState({
    imageUrl: "",
    titleAr: "",
    titleEn: "",
    subtitleAr: "",
    subtitleEn: "",
    linkUrl: "",
    selectedPages: [] as string[],
    isActive: true,
  })

  // Load settings from DB on mount
  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const d = data.data
          setForm({
            siteNameAr: d.general?.siteNameAr || initialForm.siteNameAr,
            siteNameEn: d.general?.siteNameEn || initialForm.siteNameEn,
            siteDescription: d.general?.siteDescription || initialForm.siteDescription,
            email: d.contact?.email || initialForm.email,
            phone: d.contact?.phone || initialForm.phone,
            address: d.contact?.address || initialForm.address,
            facebook: d.social?.facebook || initialForm.facebook,
            twitter: d.social?.twitter || initialForm.twitter,
            instagram: d.social?.instagram || initialForm.instagram,
            youtube: d.social?.youtube || initialForm.youtube,
            metaTitle: d.seo?.metaTitle || initialForm.metaTitle,
            metaDescription: d.seo?.metaDescription || initialForm.metaDescription,
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSettings(false))
  }, [])

  const handleFieldChange = (field: keyof SettingsForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Fetch hero images
  const fetchHeroImages = useCallback(async () => {
    try {
      const allImages: HeroImage[] = []
      const pagesToFetch = filterPages.length > 0 ? filterPages : pageOptions.map(p => p.slug)

      for (const slug of pagesToFetch) {
        const res = await fetch(`/api/admin/hero-images?pageSlug=${slug}`)
        const data = await res.json()
        if (data.data) {
          allImages.push(...data.data)
        }
      }

      const unique = allImages.filter((img, idx, arr) => arr.findIndex(i => i.id === img.id) === idx)
      unique.sort((a, b) => a.order - b.order)
      setHeroImages(unique)
    } catch {
      setHeroImages([])
    } finally {
      setHeroLoading(false)
    }
  }, [filterPages])

  useEffect(() => {
    fetchHeroImages()
  }, [fetchHeroImages])

  // Save settings to DB
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const groups = [
        { group: "general", settings: { siteNameAr: form.siteNameAr, siteNameEn: form.siteNameEn, siteDescription: form.siteDescription } },
        { group: "contact", settings: { email: form.email, phone: form.phone, address: form.address } },
        { group: "social", settings: { facebook: form.facebook, twitter: form.twitter, instagram: form.instagram, youtube: form.youtube } },
        { group: "seo", settings: { metaTitle: form.metaTitle, metaDescription: form.metaDescription } },
      ]
      const results = await Promise.all(
        groups.map((g) =>
          fetch("/api/admin/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(g),
          }).then((r) => r.json())
        )
      )
      const allOk = results.every((r) => r.success)
      if (allOk) {
        showToast(t("settings.saved"), "success")
      } else {
        showToast(t("settings.savePartialFail"), "error")
      }
    } catch {
      showToast(t("settings.saveFail"), "error")
    } finally {
      setSaving(false)
    }
  }

  // Hero CRUD
  const openAddHero = () => {
    setEditingHero(null)
    setHeroForm({ imageUrl: "", titleAr: "", titleEn: "", subtitleAr: "", subtitleEn: "", linkUrl: "", selectedPages: [], isActive: true })
    setShowHeroModal(true)
  }

  const openEditHero = (hero: HeroImage) => {
    setEditingHero(hero)
    const pages = hero.pageSlugs.split(",").map(s => s.trim()).filter(Boolean)
    setHeroForm({
      imageUrl: hero.imageUrl,
      titleAr: hero.titleAr || "",
      titleEn: hero.titleEn || "",
      subtitleAr: hero.subtitleAr || "",
      subtitleEn: hero.subtitleEn || "",
      linkUrl: hero.linkUrl || "",
      selectedPages: pages,
      isActive: hero.isActive,
    })
    setShowHeroModal(true)
  }

  const togglePageInForm = (slug: string) => {
    setHeroForm(prev => {
      const pages = prev.selectedPages.includes(slug)
        ? prev.selectedPages.filter(p => p !== slug)
        : [...prev.selectedPages, slug]
      return { ...prev, selectedPages: pages }
    })
  }

  const saveHero = async () => {
    if (!heroForm.imageUrl) {
      showToast(t("settings.pickImage"), "error")
      return
    }
    if (heroForm.selectedPages.length === 0) {
      showToast(t("settings.pickPage"), "error")
      return
    }

    const pageSlugs = heroForm.selectedPages.join(",")

    try {
      if (editingHero) {
        await fetch(`/api/admin/hero-images/${editingHero.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...heroForm, pageSlugs }),
        })
        showToast(t("settings.imageUpdated"), "success")
      } else {
        await fetch("/api/admin/hero-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...heroForm, pageSlugs }),
        })
        showToast(t("settings.imageAdded"), "success")
      }
      setShowHeroModal(false)
      fetchHeroImages()
    } catch {
      showToast(t("settings.saveError"), "error")
    }
  }

  const deleteHero = async (id: string) => {
    if (!confirm(t("settings.confirmDeleteImage"))) return
    try {
      await fetch(`/api/admin/hero-images/${id}`, { method: "DELETE" })
      showToast(t("settings.deleted"), "success")
      fetchHeroImages()
    } catch {
      showToast(t("settings.deleteFailed"), "error")
    }
  }

  const moveHero = async (id: string, direction: "up" | "down") => {
    const idx = heroImages.findIndex((h) => h.id === id)
    if (idx === -1) return
    const targetIdx = direction === "up" ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= heroImages.length) return

    const items = [...heroImages]
    const tempOrder = items[idx].order
    items[idx].order = items[targetIdx].order
    items[targetIdx].order = tempOrder

    await Promise.all([
      fetch(`/api/admin/hero-images/${items[idx].id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: items[idx].order }),
      }),
      fetch(`/api/admin/hero-images/${items[targetIdx].id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: items[targetIdx].order }),
      }),
    ])
    fetchHeroImages()
  }

  const toggleHeroActive = async (hero: HeroImage) => {
    await fetch(`/api/admin/hero-images/${hero.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !hero.isActive }),
    })
    fetchHeroImages()
  }

  const getPageLabels = (pageSlugs: string) => {
    return pageSlugs.split(",").map(slug => {
      const page = pageOptions.find(p => p.slug === slug.trim())
      if (!page) return slug.trim()
      return lang === "ar" ? page.labelAr : page.labelEn
    }).join(lang === "ar" ? "، " : ", ")
  }

  const toggleFilterPage = (slug: string) => {
    setFilterPages(prev =>
      prev.includes(slug) ? prev.filter(p => p !== slug) : [...prev, slug]
    )
  }

  return (
    <div className="space-y-6 dark:bg-[#0b1120]">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.type === "success" ? <Save className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-blue-600 dark:text-[#60a5fa]" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-[#f1f5f9]">{t("settings.title")}</h1>
          <p className="text-sm text-gray-500 dark:text-[#94a3b8]">{t("settings.subtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-[#1a2332] dark:border dark:border-[#2a3d56]">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-gray-50 dark:bg-[#111927] dark:border-[#2a3d56]">
            <Globe className="w-5 h-5 text-blue-600 dark:text-[#60a5fa]" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-[#f1f5f9]">{t("settings.general")}</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">{t("settings.siteNameAr")}</label>
                <input type="text" value={form.siteNameAr} onChange={(e) => handleFieldChange("siteNameAr", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]" dir="rtl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">{t("settings.siteNameEn")}</label>
                <input type="text" value={form.siteNameEn} onChange={(e) => handleFieldChange("siteNameEn", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">{t("settings.siteDescription")}</label>
              <textarea rows={3} value={form.siteDescription} onChange={(e) => handleFieldChange("siteDescription", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]" />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-[#1a2332] dark:border dark:border-[#2a3d56]">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-gray-50 dark:bg-[#111927] dark:border-[#2a3d56]">
            <Mail className="w-5 h-5 text-blue-600 dark:text-[#60a5fa]" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-[#f1f5f9]">{t("settings.contactInfo")}</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                  <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {t("common.email")}</span>
                </label>
                <input type="email" value={form.email} onChange={(e) => handleFieldChange("email", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                  <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {t("common.phone")}</span>
                </label>
                <input type="tel" value={form.phone} onChange={(e) => handleFieldChange("phone", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {t("settings.address")}</span>
              </label>
              <textarea rows={2} value={form.address} onChange={(e) => handleFieldChange("address", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]" />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-[#1a2332] dark:border dark:border-[#2a3d56]">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-gray-50 dark:bg-[#111927] dark:border-[#2a3d56]">
            <Share2 className="w-5 h-5 text-blue-600 dark:text-[#60a5fa]" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-[#f1f5f9]">{t("settings.social")}</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">{t("settings.facebook")}</label>
                <input type="url" value={form.facebook} onChange={(e) => handleFieldChange("facebook", e.target.value)} placeholder="https://facebook.com/..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">{t("settings.twitterX")}</label>
                <input type="url" value={form.twitter} onChange={(e) => handleFieldChange("twitter", e.target.value)} placeholder="https://twitter.com/..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">{t("settings.instagram")}</label>
                <input type="url" value={form.instagram} onChange={(e) => handleFieldChange("instagram", e.target.value)} placeholder="https://instagram.com/..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">{t("settings.youtube")}</label>
                <input type="url" value={form.youtube} onChange={(e) => handleFieldChange("youtube", e.target.value)} placeholder="https://youtube.com/..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]" />
              </div>
            </div>
          </div>
        </div>

        {/* Hero Images */}
        <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-[#1a2332] dark:border dark:border-[#2a3d56]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 dark:bg-[#111927] dark:border-[#2a3d56]">
            <div className="flex items-center gap-3">
              <Image className="w-5 h-5 text-blue-600 dark:text-[#60a5fa]" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-[#f1f5f9]">{t("settings.hero")}</h2>
            </div>
            <button type="button" onClick={openAddHero} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              <Plus className="w-4 h-4" /> {t("settings.addImageNow")}
            </button>
          </div>
          <div className="p-6 space-y-4">
            {/* Page filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-[#cbd5e1]">{t("settings.filterByPage")}</label>
              <div className="flex flex-wrap gap-2">
                {pageOptions.map((page) => (
                  <button key={page.slug} type="button" onClick={() => toggleFilterPage(page.slug)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${filterPages.includes(page.slug) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {filterPages.includes(page.slug) && <Check className="w-3.5 h-3.5" />}
                    {lang === "ar" ? page.labelAr : page.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Hero images table */}
            <div className="border border-gray-200 rounded-lg overflow-x-auto">
              {heroLoading ? (
                <div className="p-8 text-center text-gray-500">{t("common.loading")}</div>
              ) : heroImages.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Image className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>{t("settings.noHeroImages")}</p>
                  <button type="button" onClick={openAddHero} className="mt-2 text-blue-600 hover:underline text-sm">{t("settings.addImageNow")}</button>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-right font-medium text-gray-600 w-12"></th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">{t("settings.imageCol")}</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">{t("settings.titleCol")}</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">{t("settings.pagesCol")}</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">{t("common.status")}</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">{t("common.actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {heroImages.map((hero, idx) => (
                      <tr key={hero.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            <button type="button" onClick={() => moveHero(hero.id, "up")} disabled={idx === 0} className="text-gray-400 hover:text-blue-600 disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                            <button type="button" onClick={() => moveHero(hero.id, "down")} disabled={idx === heroImages.length - 1} className="text-gray-400 hover:text-blue-600 disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <img src={hero.imageUrl} alt={hero.titleAr || ""} className="w-20 h-12 object-cover rounded" loading="lazy" />
                        </td>
                        <td className="px-4 py-3 text-gray-700">{hero.titleAr || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {getPageLabels(hero.pageSlugs).split(lang === "ar" ? "، " : ", ").map((label, i) => (
                              <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{label}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button type="button" onClick={() => toggleHeroActive(hero)} className={`px-2 py-1 rounded-full text-xs font-medium ${hero.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {hero.isActive ? t("settings.statusActive") : t("settings.statusDisabled")}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => openEditHero(hero)} className="text-blue-600 hover:text-blue-800 text-xs">{t("common.edit")}</button>
                            <button type="button" onClick={() => deleteHero(hero.id)} className="text-red-600 hover:text-red-800 text-xs">{t("common.delete")}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-[#1a2332] dark:border dark:border-[#2a3d56]">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-gray-50 dark:bg-[#111927] dark:border-[#2a3d56]">
            <Search className="w-5 h-5 text-blue-600 dark:text-[#60a5fa]" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-[#f1f5f9]">{t("settings.seo")}</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">{t("settings.metaTitle")}</label>
              <input type="text" value={form.metaTitle} onChange={(e) => handleFieldChange("metaTitle", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]" />
              <p className="mt-1 text-xs text-gray-400 dark:text-[#7a8ba3]">{t("settings.metaTitleHint").replace("{n}", String(form.metaTitle.length))}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">{t("settings.metaDescription")}</label>
              <textarea rows={3} value={form.metaDescription} onChange={(e) => handleFieldChange("metaDescription", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]" />
              <p className="mt-1 text-xs text-gray-400 dark:text-[#7a8ba3]">{t("settings.metaDescHint").replace("{n}", String(form.metaDescription.length))}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium">
            <Save className="w-4 h-4" />
            {saving ? t("common.saving") : t("settings.saveSettings")}
          </button>
        </div>
      </form>

      {/* Hero Image Modal */}
      {showHeroModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto dark:bg-[#1a2332] dark:border dark:border-[#2a3d56]">
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-[#2a3d56]">
              <h3 className="text-lg font-semibold dark:text-[#f1f5f9]">{editingHero ? t("settings.editHero") : t("settings.addHeroNew")}</h3>
              <button onClick={() => setShowHeroModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-[#cbd5e1]">{t("settings.imageLabel")}</label>
                <ImageUpload value={heroForm.imageUrl} onChange={(url) => setHeroForm((p) => ({ ...p, imageUrl: url }))} folder="hero" label={t("settings.heroImageUpload")} />
              </div>

              {/* Multi-page selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-[#cbd5e1]">{t("settings.choosePages")}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {pageOptions.map((page) => (
                    <button key={page.slug} type="button" onClick={() => togglePageInForm(page.slug)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-right ${heroForm.selectedPages.includes(page.slug) ? "bg-blue-100 text-blue-700 border border-blue-300" : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"}`}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${heroForm.selectedPages.includes(page.slug) ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}>
                        {heroForm.selectedPages.includes(page.slug) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      {lang === "ar" ? page.labelAr : page.labelEn}
                    </button>
                  ))}
                </div>
                {heroForm.selectedPages.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500">{t("settings.selectedPages").replace("{n}", String(heroForm.selectedPages.length))}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">{t("settings.titleAr")}</label>
                <input type="text" value={heroForm.titleAr} onChange={(e) => setHeroForm((p) => ({ ...p, titleAr: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]" dir="rtl" />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">{t("settings.titleEn")}</label>
                <input type="text" value={heroForm.titleEn} onChange={(e) => setHeroForm((p) => ({ ...p, titleEn: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">{t("settings.descAr")}</label>
                <input type="text" value={heroForm.subtitleAr} onChange={(e) => setHeroForm((p) => ({ ...p, subtitleAr: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]" dir="rtl" />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">{t("settings.descEn")}</label>
                <input type="text" value={heroForm.subtitleEn} onChange={(e) => setHeroForm((p) => ({ ...p, subtitleEn: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-[#cbd5e1]">{t("settings.linkUrl")}</label>
                <input type="url" value={heroForm.linkUrl} onChange={(e) => setHeroForm((p) => ({ ...p, linkUrl: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-[#111927] dark:border-[#3b4f6b] dark:text-[#f1f5f9]" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="heroActive" checked={heroForm.isActive} onChange={(e) => setHeroForm((p) => ({ ...p, isActive: e.target.checked }))} className="rounded border-gray-300 dark:border-[#3b4f6b]" />
                <label htmlFor="heroActive" className="text-sm text-gray-700 dark:text-[#cbd5e1]">{t("settings.activeCheckbox")}</label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
              <button type="button" onClick={() => setShowHeroModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm">{t("common.cancel")}</button>
              <button type="button" onClick={saveHero} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">{editingHero ? t("common.update") : t("common.add")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
