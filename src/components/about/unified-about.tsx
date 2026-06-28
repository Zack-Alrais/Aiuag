"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  Eye,
  Megaphone,
  Target,
  Users,
  Globe,
  Building2,
  Calendar,
  Database,
  FileText,
  Briefcase,
  Heart,
  Handshake,
  Lightbulb,
  TrendingUp,
  Star,
  Compass,
  Rocket,
  BookOpen,
  Flag,
  Award,
  MapPin,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
} from "lucide-react"

interface UnifiedAboutProps {
  lang: string
}

const sections = [
  { id: "about", labelAr: "من نحن", labelEn: "About Us" },
  { id: "vision", labelAr: "رؤيتنا", labelEn: "Our Vision" },
  { id: "mission", labelAr: "مهمتنا", labelEn: "Our Mission" },
  { id: "objectives", labelAr: "أهدافنا", labelEn: "Our Objectives" },
  { id: "history", labelAr: "تاريخنا", labelEn: "Our History" },
]

const facts = [
  { icon: Calendar, number: "2013", labelAr: "سنة التأسيس", labelEn: "Founded" },
  { icon: Users, number: "5,000+", labelAr: "عضو", labelEn: "Members" },
  { icon: Target, number: "50+", labelAr: "فعالية", labelEn: "Events" },
  { icon: Building2, number: "20+", labelAr: "مشروع", labelEn: "Projects" },
]

const visionElements = [
  { icon: Eye, titleAr: "الريادة", titleEn: "Leadership", descAr: "أن نكون الرابطة الرائدة في إفريقيا، معترفاً بتأثيرنا وابتكارنا والالتزامنا بالتميز في خدمة الخريجين والمجتمع.", descEn: "To be the leading alumni association in Africa, recognized for our impact, innovation, and commitment to excellence." },
  { icon: Handshake, titleAr: "التواصل", titleEn: "Connection", descAr: "بناء شبكة لا تنفصل من المحترفين تتجاوز الحدود والثقافات والصناعات في جميع أنحاء القارة الأفريقية.", descEn: "Building an unbreakable network of professionals that transcends borders, cultures, and industries across Africa." },
  { icon: Lightbulb, titleAr: "الابتكار", titleEn: "Innovation", descAr: "تعزيز ثقافة الابتكار وريادة الأعمال بين الخريجين، ودفع عجلة النمو الاقتصادي والتنمية الاجتماعية.", descEn: "Fostering a culture of innovation and entrepreneurship among alumni, driving economic growth and social development." },
  { icon: TrendingUp, titleAr: "التنمية", titleEn: "Development", descAr: "المساهمة في أهداف التنمية المستدامة في أفريقيا من خلال التعليم والإرشاد وخدمة المجتمع.", descEn: "Contributing to sustainable development goals across Africa through education, mentorship, and community service." },
]

const strategicPillars = [
  { icon: Users, num: "01", titleAr: "التواصل والشبكات", titleEn: "Connect & Network", descAr: "بناء وaintenance شبكات مهنية قوية بين الخريجين. نوفر منصات للتواصل الذكي الذي يعزز التعاون والإرشاد وفرص التقدم المهني.", descEn: "Building and maintaining strong professional networks among alumni. We create platforms for meaningful connections that foster collaboration and mentorship." },
  { icon: BookOpen, num: "02", titleAr: "التطوير والتمكين", titleEn: "Develop & Empower", descAr: "توفير فرص التطوير المهني المستمر من خلال البرامج التدريبية وورش العمل والشهادات والموارد التعليمية.", descEn: "Providing continuous professional development opportunities through training programs, workshops, certifications, and educational resources." },
  { icon: Handshake, num: "03", titleAr: "الخدمة والدعم", titleEn: "Serve & Support", descAr: "دعم تطوير الجامعة وخدمة المجتمع السوداني من خلال مشاريع مؤثرة ومبادرات خيرية وبرامج تطوعية.", descEn: "Supporting the university development and serving the Sudanese community through impactful projects, charitable initiatives, and volunteer programs." },
  { icon: Rocket, num: "04", titleAr: "الابتكار والقيادة", titleEn: "Innovate & Lead", descAr: "تعزيز الابتكار والقيادة بين الخريجين. نشجع التفكير الريادي وندعم منظومات الشركات الناشئة.", descEn: "Fostering innovation and leadership among alumni. We encourage entrepreneurial thinking and support startup ecosystems." },
]

const objectives = [
  { icon: Users, num: "01", titleAr: "توحيد الخريجين تحت مظلة منظمة", titleEn: "Unite Alumni Under One Organization", descAr: "توحيد جميع خريجي الجامعة الدولية الأفريقية تحت مظلة منظمة واحدة تمثل مصالحهم ويعظم صوتها.", descEn: "To unite all graduates under one umbrella organization that represents their interests and amplifies their voice." },
  { icon: Building2, num: "02", titleAr: "دعم مشاريع تطوير الجامعة", titleEn: "Support University Development", descAr: "المساهمة الفعّالة في دعم مشاريع التحسين في الجامعة بما في ذلك تحسين البنية التحتية والبرامج الأكاديمية.", descEn: "To actively contribute to development projects at the university, including infrastructure improvement and academic program enhancement." },
  { icon: Calendar, num: "03", titleAr: "تنظيم فعاليات ومؤتمرات", titleEn: "Organize Events and Conferences", descAr: "تنظيم لقاءات منتظمة للخريجين ومؤتمرات مهنية وورش عمل وأحداث التواصل.", descEn: "To organize regular alumni gatherings, professional conferences, workshops, and networking events." },
  { icon: Globe, num: "04", titleAr: "بناء شراكات دولية", titleEn: "Build International Partnerships", descAr: "إنشاء شراكات استراتيجية مع جمعيات الخريجين الدولية والمؤسسات الأكاديمية والمنظمات المهنية.", descEn: "To establish strategic partnerships with international alumni associations and professional organizations." },
  { icon: Database, num: "05", titleAr: "إنشاء قاعدة بيانات للخريجين", titleEn: "Create Alumni Database", descAr: "تطوير وإدارة قاعدة بيانات شاملة للخريجين تتيح التواصل وتدعم مبادرات البحث.", descEn: "To develop and maintain a comprehensive alumni database that facilitates communication and networking." },
  { icon: FileText, num: "06", titleAr: "نشر التقارير والأبحاث", titleEn: "Publish Reports and Research", descAr: "إعداد ونشر تقارير منتظمة وأوراق بحثية توثق إنجازات الخريجين واحتياجات المجتمع.", descEn: "To produce and publish regular reports and research papers that document alumni achievements and community needs." },
  { icon: Briefcase, num: "07", titleAr: "تسهيل التطوير المهني", titleEn: "Facilitate Professional Development", descAr: "توفير موارد التطوير المهني وبرامج الإرشاد والتدريب على المهارات وفرص العمل.", descEn: "To provide career development resources, mentoring programs, skills training, and employment opportunities." },
  { icon: Heart, num: "08", titleAr: "خدمة المجتمع السوداني", titleEn: "Serve the Sudanese Community", descAr: "المشاركة في أنشطة خدمة المجتمع التي تتناول التحديات الاجتماعية وتعزز التعليم.", descEn: "To engage in community service activities that address social challenges and promote education." },
]

const milestones = [
  { year: "2013", icon: Flag, titleAr: "تأسيس الرابطة", titleEn: "Association Founded", descAr: "تم تأسيس رابطة خريجي الجامعة الدولية الأفريقية رسمياً في الخرطوم، السودان، من مجموعة مؤسسة مكونة من 200 خريج.", descEn: "The AIUAG was officially established in Khartoum, Sudan, with a founding group of 200 passionate alumni." },
  { year: "2015", icon: Users, titleAr: "أول مؤتمر للخريجين", titleEn: "First Alumni Conference", descAr: "أُقيم أول مؤتمر للخريجين، حيث شهد حضور أكثر من 500 خريج من مختلف المجالات.", descEn: "The first alumni conference was held, bringing together over 500 graduates from various fields." },
  { year: "2018", icon: Globe, titleAr: "إطلاق برنامج الإرشاد", titleEn: "Mentoring Program Launch", descAr: "أطلقت الرابطة برنامجها الرئيسي للإرشاد، الذي يربط المحترفين ذوي الخبرة بالخريجين الجدد.", descEn: "The association launched its flagship mentoring program, connecting experienced professionals with recent graduates." },
  { year: "2020", icon: TrendingUp, titleAr: "توسيع العضوية", titleEn: "Membership Expansion", descAr: "وسعت الرابطة عضويتها لتتجاوز 3000 عضو، مع انضمام خريجين من جميع أنحاء إفريقيا والشرق الأوسط.", descEn: "The association expanded its membership to over 3,000 members, with alumni joining from across Africa and the Middle East." },
  { year: "2023", icon: Award, titleAr: "المؤتمر الخامس", titleEn: "5th Conference", descAr: "كان المؤتمر الخامس هو الأكبر حتى الآن، بمشاركة أكثر من 1500 شخص.", descEn: "The 5th alumni conference was the largest yet, with over 1,500 attendees." },
  { year: "2025", icon: MapPin, titleAr: "ملتقى أفريقيا للتنمية", titleEn: "Africa Development Forum", descAr: "نظّمت الرابطة الملتقى الأول لأفريقيا للتنمية، بمشاركة قادة الخريجين وصنّاع السياسات.", descEn: "The association organized the inaugural Africa Development Forum, bringing together alumni leaders and policymakers." },
  { year: "2026", icon: Calendar, titleAr: "التوسع الإقليمي", titleEn: "Regional Expansion", descAr: "تبدأ الرابطة خطتها للتوسع الإقليمي، بإنشاء فروع في عدة دول أفريقية.", descEn: "The association begins its regional expansion plan, establishing chapters in multiple African countries." },
]

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const counted = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true
          const start = 0
          const end = target
          const startTime = performance.now()
          const animate = (now: number) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(start + (end - start) * eased))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return <div ref={ref}>{count.toLocaleString()}</div>
}

export default function UnifiedAbout({ lang }: UnifiedAboutProps) {
  const isArabic = lang === "ar"
  const [activeSection, setActiveSection] = useState("about")
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100)
      const sectionElements = sections.map((s) => document.getElementById(s.id))
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i]
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(sections[i].id)
          break
        }
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A3A6B] via-[#2B5EA7] to-[#1A3A6B]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-[#D4A843] rounded-full blur-[120px]" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-white rounded-full blur-[150px]" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-6 py-2 mb-8">
            <div className="w-2 h-2 bg-[#D4A843] rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">{isArabic ? "رابطة خريجي الجامعة الدولية الأفريقية" : "AIUAG Alumni Association"}</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {isArabic ? "من نحن" : "About Us"}
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed">
            {isArabic
              ? "تعرف على رؤيتنا ومهمتنا وأهدافنا وتاريخنا في رابطة خريجي الجامعة الدولية الأفريقية"
              : "Discover our vision, mission, objectives, and history at the Africa International University Alumni Association"}
          </p>
          <button
            onClick={() => scrollTo("about")}
            className="inline-flex items-center gap-2 bg-[#D4A843] text-[#0f2547] px-8 py-3 rounded-full font-bold hover:bg-[#E0BC6A] transition-colors"
          >
            {isArabic ? "ابدأ الاستكشاف" : "Start Exploring"}
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </button>
        </div>
      </section>

      {/* Sticky Nav */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200" : "bg-white border-b border-gray-100"}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide gap-1 py-3">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeSection === s.id
                    ? "bg-[#1A3A6B] text-white"
                    : "text-gray-500 hover:text-[#1A3A6B] hover:bg-[#1A3A6B]/5"
                }`}
              >
                {isArabic ? s.labelAr : s.labelEn}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* About Section */}
      <section id="about" className="py-20 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-[#D4A843] text-sm font-bold tracking-wider uppercase">{isArabic ? "تعرف علينا" : "Who We Are"}</span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-3 mb-6">{isArabic ? "عن الرابطة" : "About the Association"}</h2>
            <div className="w-20 h-1 bg-[#D4A843] mx-auto rounded-full" />
          </div>
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 mb-16">
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              {isArabic ? (
                <>
                  <p>رابطة خريجي الجامعة الدولية الأفريقية (AIUAG) هي منظمة غير ربحية تأسست عام 2013 بمدينة الخرطوم بالسودان، بهدف ربط خريجي الجامعة الدولية الأفريقية وتعزيز الروابط المهنية والاجتماعية بينهم.</p>
                  <p>منذ تأسيسها، قامت الرابطة بتنظيم أكثر من 50 فعالية ومؤتمر، شملت ورش عمل تدريبية، ومحاضرات متخصصة، وبرامج إرشاد مهني، وأنشطة تطوعية تخدم المجتمع المحلي. تضم الرابطة أكثر من 5000 عضو من خريجي الجامعة يعملون في مختلف القطاعات والمناطق الجغرافية.</p>
                  <p>تؤمن الرابطة بأن الخريجين هم سفراء الجامعة وأفضل من يمثل قيمها ورسالتها، ولذلك تسعى دائماً إلى توفير بيئة محفزة تتيح لهم تبادل الخبرات وبناء شراكات مهنية من شأنها تعزيز مسيرتهم المهنية والشخصية.</p>
                </>
              ) : (
                <>
                  <p>The Africa International University Alumni Association (AIUAG) is a non-profit organization established in 2013 in Khartoum, Sudan, with the aim of connecting graduates and strengthening professional and social ties among them.</p>
                  <p>Since its establishment, the association has organized more than 50 events and conferences, including training workshops, specialized lectures, professional mentoring programs, and volunteer community service activities. The association has more than 5,000 members working in various sectors and geographic regions.</p>
                  <p>The association believes that graduates are ambassadors of the university and the best representatives of its values and mission, and therefore it always seeks to provide a stimulating environment that allows them to exchange experiences and build professional partnerships.</p>
                </>
              )}
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {facts.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:border-[#D4A843]/30 hover:shadow-md transition-all duration-300 group">
                <f.icon className="w-10 h-10 text-[#D4A843] mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {f.number.includes("+") ? (
                    <><AnimatedCounter target={parseInt(f.number.replace(/[^0-9]/g, ""))} />+</>
                  ) : (
                    <AnimatedCounter target={parseInt(f.number)} />
                  )}
                </div>
                <div className="text-gray-500 text-sm">{isArabic ? f.labelAr : f.labelEn}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-20 bg-white scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-[#D4A843] text-sm font-bold tracking-wider uppercase">{isArabic ? "إلى أين نسير" : "Where We're Going"}</span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-3 mb-6">{isArabic ? "رؤيتنا" : "Our Vision"}</h2>
            <div className="w-20 h-1 bg-[#D4A843] mx-auto rounded-full" />
          </div>
          {/* Vision Statement */}
          <div className="bg-gradient-to-r from-[#D4A843]/10 to-[#1A3A6B]/5 rounded-3xl p-12 border border-[#D4A843]/20 text-center mb-16">
            <Eye className="w-16 h-16 text-[#D4A843] mx-auto mb-6" />
            <p className="text-2xl md:text-3xl text-gray-900 leading-relaxed font-medium italic">
              {isArabic
                ? "أن نكون الرابطة الرائدة في إفريقيا لخدمة الخريجين والمجتمع"
                : "To be the leading alumni association in Africa serving graduates and the community"}
            </p>
          </div>
          {/* Vision Elements */}
          <div className="grid md:grid-cols-2 gap-8">
            {visionElements.map((el, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-[#D4A843]/30 hover:shadow-md transition-all duration-300 group">
                <el.icon className="w-12 h-12 text-[#D4A843] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{isArabic ? el.titleAr : el.titleEn}</h3>
                <p className="text-gray-600 leading-relaxed">{isArabic ? el.descAr : el.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-20 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-[#D4A843] text-sm font-bold tracking-wider uppercase">{isArabic ? "كيف نعمل" : "How We Work"}</span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-3 mb-6">{isArabic ? "مهمتنا" : "Our Mission"}</h2>
            <div className="w-20 h-1 bg-[#D4A843] mx-auto rounded-full" />
          </div>
          {/* Mission Statement */}
          <div className="bg-gradient-to-r from-[#D4A843]/10 to-[#1A3A6B]/5 rounded-3xl p-12 border border-[#D4A843]/20 text-center mb-16">
            <Megaphone className="w-16 h-16 text-[#D4A843] mx-auto mb-6" />
            <p className="text-2xl md:text-3xl text-gray-900 leading-relaxed font-medium italic">
              {isArabic
                ? "توفير بيئة محفزة تجمع الخريجين وتعزز الروابط المهنية والاجتماعية بينهم"
                : "To provide a stimulating environment that brings together alumni and strengthens professional and social ties"}
            </p>
          </div>
          {/* Strategic Pillars */}
          <div className="grid md:grid-cols-2 gap-8">
            {strategicPillars.map((pillar, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-[#D4A843]/30 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-[#D4A843]/10 rounded-xl flex items-center justify-center border border-[#D4A843]/20">
                    <pillar.icon className="w-7 h-7 text-[#D4A843]" />
                  </div>
                  <div>
                    <span className="text-[#D4A843] text-sm font-bold">{isArabic ? `٠${i + 1}` : `0${i + 1}`}</span>
                    <h3 className="text-xl font-bold text-gray-900">{isArabic ? pillar.titleAr : pillar.titleEn}</h3>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">{isArabic ? pillar.descAr : pillar.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Objectives Section */}
      <section id="objectives" className="py-20 bg-white scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-[#D4A843] text-sm font-bold tracking-wider uppercase">{isArabic ? "ما نسعى لتحقيقه" : "What We Aim For"}</span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-3 mb-6">{isArabic ? "أهدافنا" : "Our Objectives"}</h2>
            <div className="w-20 h-1 bg-[#D4A843] mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {objectives.map((obj, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-[#D4A843]/30 hover:shadow-md transition-all duration-300 group flex gap-4">
                <div className="w-12 h-12 bg-[#D4A843]/10 rounded-xl flex items-center justify-center border border-[#D4A843]/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <obj.icon className="w-6 h-6 text-[#D4A843]" />
                </div>
                <div>
                  <span className="text-[#D4A843] text-xs font-bold">{isArabic ? `الهدف ${obj.num}` : `Objective ${obj.num}`}</span>
                  <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2">{isArabic ? obj.titleAr : obj.titleEn}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{isArabic ? obj.descAr : obj.descEn}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section id="history" className="py-20 scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-[#D4A843] text-sm font-bold tracking-wider uppercase">{isArabic ? "رحلتنا عبر الزمن" : "Our Journey"}</span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-3 mb-6">{isArabic ? "تاريخنا" : "Our History"}</h2>
            <div className="w-20 h-1 bg-[#D4A843] mx-auto rounded-full" />
          </div>
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-[#D4A843] to-[#1A3A6B] hidden md:block" />
            <div className="space-y-12">
              {milestones.map((m, i) => {
                const isEven = i % 2 === 0
                return (
                  <div key={i} className={`relative flex items-center ${isArabic ? (isEven ? "md:flex-row-reverse" : "md:flex-row") : (isEven ? "md:flex-row" : "md:flex-row-reverse")}`}>
                    {/* Center dot */}
                    <div className="absolute left-1/2 -translate-x-1/2 w-12 h-12 bg-[#D4A843] rounded-full flex items-center justify-center z-10 border-4 border-gray-50 hidden md:flex">
                      <m.icon className="w-5 h-5 text-[#0f2547]" />
                    </div>
                    {/* Content */}
                    <div className={`w-full md:w-5/12 ${isArabic ? (isEven ? "md:pr-16" : "md:pl-16") : (isEven ? "md:pl-16" : "md:pr-16")}`}>
                      <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#D4A843]/30 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3 mb-3">
                          <m.icon className="w-6 h-6 text-[#D4A843] md:hidden" />
                          <span className="text-2xl font-bold text-[#D4A843]">{m.year}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{isArabic ? m.titleAr : m.titleEn}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">{isArabic ? m.descAr : m.descEn}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-r from-[#1A3A6B] to-[#2B5EA7] rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A843] rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D4A843] rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>
            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-4">{isArabic ? "كن جزءاً من رحلتنا" : "Be Part of Our Journey"}</h2>
              <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                {isArabic ? "انضم إلى آلاف الخريجين المشاركين في بناء مستقبل أفضل" : "Join thousands of graduates working together to build a better future"}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/${lang}/membership/apply`} className="inline-flex items-center justify-center gap-2 bg-[#D4A843] text-[#0f2547] px-8 py-3 rounded-full font-bold hover:bg-[#E0BC6A] transition-colors">
                  {isArabic ? "طلب عضوية" : "Apply for Membership"}
                  {isArabic ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                </Link>
                <Link href={`/${lang}/contact`} className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-colors border border-white/20">
                  {isArabic ? "اتصل بنا" : "Contact Us"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
