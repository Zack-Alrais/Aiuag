"use client"

import Link from "next/link"
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface FooterProps {
  lang: string
}

interface SiteSettings {
  contact?: { email?: string; phone?: string; address?: string }
  social?: { facebook?: string; twitter?: string; instagram?: string; youtube?: string }
}

export default function Footer({ lang }: FooterProps) {
  const [email, setEmail] = useState("")
  const [subscribing, setSubscribing] = useState(false)
  const [settings, setSettings] = useState<SiteSettings>({})

  const isArabic = lang === "ar"

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => { if (d.data) setSettings(d.data) })
      .catch(() => {})
  }, [])

  const quickLinks = [
    { label: isArabic ? "من نحن" : "About Us", href: `/${lang}/about` },
    { label: isArabic ? "مجلس الإدارة" : "Board", href: `/${lang}/organization/board` },
    { label: isArabic ? "المشاريع" : "Projects", href: `/${lang}/projects` },
    { label: isArabic ? "الأخبار" : "News", href: `/${lang}/news` },
    { label: isArabic ? "الأحداث" : "Events", href: `/${lang}/events` },
    { label: isArabic ? "طلب عضوية" : "Membership", href: `/${lang}/membership/apply` },
  ]

  const servicesLinks = [
    { label: isArabic ? "خدمات الخريجين" : "Alumni Services", href: `/${lang}/services` },
    { label: isArabic ? "التطوع" : "Volunteer", href: `/${lang}/volunteer` },
    { label: isArabic ? "التبرعات" : "Donations", href: `/${lang}/donations` },
    { label: isArabic ? "المنشورات" : "Publications", href: `/${lang}/publications` },
  ]

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubscribing(true)
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        toast.success(isArabic ? "تم الاشتراك بنجاح ✓" : "Subscribed successfully ✓")
        setEmail("")
      } else {
        toast.error(isArabic ? "فشل الاشتراك" : "Subscription failed")
      }
    } catch {
      toast.error(isArabic ? "حدث خطأ" : "An error occurred")
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <footer className="bg-dark text-white" dir={isArabic ? "rtl" : "ltr"}>
      {/* Newsletter Section */}
      <div className="bg-primary border-b border-white/10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white">
                {isArabic ? "اشترك في نشرتنا البريدية" : "Subscribe to Our Newsletter"}
              </h3>
              <p className="text-white/70 text-sm mt-1">
                {isArabic ? "احصل على آخر الأخبار والفعاليات" : "Get the latest news and events"}
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isArabic ? "بريدك الإلكتروني" : "Your email"}
                className="flex-1 md:w-80 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-secondary text-sm"
                required
              />
              <button
                type="submit"
                disabled={subscribing}
                className="px-6 py-3 bg-secondary text-primary-dark rounded-lg font-bold text-sm hover:bg-secondary-light transition-colors me-0 md:me-2 mt-2 md:mt-0 disabled:opacity-50"
              >
                {subscribing ? (isArabic ? "جاري..." : "Sending...") : (isArabic ? "اشترك" : "Subscribe")}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/uploads/شعار الرابطة.jpg"
                alt="AIUAG Logo"
                className="w-12 h-12 rounded-full object-cover border border-white/30"
              />
              <div>
                <div className="text-lg font-bold">AIUAG</div>
                <div className="text-xs text-white/60">
                  {isArabic ? "رابطة خريجي جامعة أفريقيا العالمية" : "Association of IUA Graduates"}
                </div>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              {isArabic
                ? "رابطة مهنية واجتماعية تجمع خريجي جامعة أفريقيا العالمية وتعزز الروابط بينهم لخدمة المجتمع والتنمية."
                : "A professional and social association that brings together graduates of Africa International University and strengthens bonds between them to serve the community."}
            </p>
            <div className="flex gap-3">
              {settings.social?.facebook && (
                <a href={settings.social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings.social?.twitter && (
                <a href={settings.social.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {settings.social?.instagram && (
                <a href={settings.social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings.social?.youtube && (
                <a href={settings.social.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {!settings.social?.facebook && !settings.social?.twitter && !settings.social?.instagram && !settings.social?.youtube && (
                <>
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center opacity-50">
                    <Facebook className="w-5 h-5" />
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center opacity-50">
                    <Twitter className="w-5 h-5" />
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center opacity-50">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center opacity-50">
                    <Youtube className="w-5 h-5" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-secondary">
              {isArabic ? "روابط سريعة" : "Quick Links"}
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/60 hover:text-secondary text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-secondary">
              {isArabic ? "الخدمات" : "Services"}
            </h4>
            <ul className="space-y-2">
              {servicesLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/60 hover:text-secondary text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-secondary">
              {isArabic ? "تواصل معنا" : "Contact Us"}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <span className="text-white/60 text-sm">
                  {settings.contact?.address || (isArabic ? "الخرطوم - السودان" : "Khartoum - Sudan")}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-secondary shrink-0" />
                <a href={`tel:${settings.contact?.phone || '+249114210853'}`} className="text-white/60 text-sm hover:text-secondary">
                  {settings.contact?.phone || '+249114210853'}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-secondary shrink-0" />
                <a href={`mailto:${settings.contact?.email || 'aiuagho@gmail.com'}`} className="text-white/60 text-sm hover:text-secondary">
                  {settings.contact?.email || 'aiuagho@gmail.com'}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
              {isArabic
                ? `© ${new Date().getFullYear()} رابطة خريجي جامعة أفريقيا العالمية. جميع الحقوق محفوظة.`
                : `© ${new Date().getFullYear()} Association of IUA Graduates. All rights reserved.`}
            </p>
            <div className="flex gap-4">
              <Link href={`/${lang}/privacy`} className="text-white/40 hover:text-white text-sm transition-colors">
                {isArabic ? "الخصوصية" : "Privacy"}
              </Link>
              <Link href={`/${lang}/terms`} className="text-white/40 hover:text-white text-sm transition-colors">
                {isArabic ? "الشروط" : "Terms"}
              </Link>
              <Link href={`/${lang}/support`} className="text-white/40 hover:text-white text-sm transition-colors">
                {isArabic ? "الدعم" : "Support"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
