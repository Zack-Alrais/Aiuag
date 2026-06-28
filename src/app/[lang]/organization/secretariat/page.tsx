import Link from "next/link";
import {
  Building2,
  Users,
  FileText,
  ClipboardList,
  Calendar,
  Settings,
  Database,
  Globe,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ArrowDown,
} from "lucide-react";
import HeroSection from "@/components/ui/hero-section";

interface SecretariatPageProps {
  params: Promise<{ lang: string }>;
}

export default async function SecretariatPage({ params }: SecretariatPageProps) {
  const { lang } = await params;
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const responsibilities = [
    {
      icon: FileText,
      title: isArabic ? "إدارة الوثائق الرسمية" : "Official Documents Management",
      description: isArabic
        ? "إعداد وتنظيم جميع الوثائق الرسمية للرابطة بما في ذلك المحاضر والتقارير والمراسلات"
        : "Preparing and organizing all official association documents including minutes, reports, and correspondence",
    },
    {
      icon: ClipboardList,
      title: isArabic ? "تنفيذ القرارات" : "Decision Implementation",
      description: isArabic
        ? "متابعة تنفيذ قرارات مجلس الإدارة ومتابعة التقدم في البرامج والمشاريع"
        : "Following up on board decisions and tracking progress in programs and projects",
    },
    {
      icon: Users,
      title: isArabic ? "إدارة شؤون الأعضاء" : "Member Affairs Management",
      description: isArabic
        ? "إدارة قاعدة بيانات الأعضاء وسجلات العضوية وتجديد الاشتراكات"
        : "Managing member database, membership records, and subscription renewals",
    },
    {
      icon: Calendar,
      title: isArabic ? "تنسيق الأنشطة" : "Activity Coordination",
      description: isArabic
        ? "تنسيق وتنظيم الاجتماعات والمؤتمرات والفعاليات المختلفة للرابطة"
        : "Coordinating and organizing meetings, conferences, and various association events",
    },
    {
      icon: Database,
      title: isArabic ? "إدارة المعلومات" : "Information Management",
      description: isArabic
        ? "جمع وتحليل وتخزين المعلومات والإحصاءات المتعلقة بالأعضاء والأنشطة"
        : "Collecting, analyzing, and storing information and statistics about members and activities",
    },
    {
      icon: Settings,
      title: isArabic ? "التنسيق الإداري" : "Administrative Coordination",
      description: isArabic
        ? "التنسيق بين الأعضاء واللجان المختلفة لضمان سير العمل بفعالية"
        : "Coordinating between members and various committees to ensure efficient workflow",
    },
  ];

  const orgChart = [
    {
      level: isArabic ? "مجلس الإدارة" : "Board of Directors",
      color: "bg-secondary",
      children: [
        {
          level: isArabic ? "الأمانة العامة" : "Secretariat",
          color: "bg-primary",
          children: [
            {
              level: isArabic ? "الأمين العام" : "Secretary General",
              color: "bg-primary-light",
              children: [],
            },
            {
              level: isArabic ? "اللجان المختلفة" : "Various Committees",
              color: "bg-primary-light",
              children: [
                { level: isArabic ? "لجنة العضوية" : "Membership Committee", color: "bg-accent/80", children: [] },
                { level: isArabic ? "لجنة الأنشطة" : "Activities Committee", color: "bg-accent/80", children: [] },
                { level: isArabic ? "لجنة المشاريع" : "Projects Committee", color: "bg-accent/80", children: [] },
                { level: isArabic ? "لجنة الإعلام" : "Media Committee", color: "bg-accent/80", children: [] },
              ],
            },
          ],
        },
      ],
    },
  ];

  const departments = [
    {
      title: isArabic ? "القسم الإداري" : "Administrative Department",
      items: isArabic
        ? ["إدارة الملفات والأرشيف", "تنظيم الاجتماعات", "متابعة القرارات", "إدارة المراسلات"]
        : ["File and archive management", "Meeting organization", "Decision follow-up", "Correspondence management"],
    },
    {
      title: isArabic ? "قسم العضوية" : "Membership Department",
      items: isArabic
        ? ["تسجيل الأعضاء الجدد", "تجديد الاشتراكات", "إصدار بطاقات العضوية", "إعداد قواعد البيانات"]
        : ["New member registration", "Subscription renewal", "Membership card issuance", "Database preparation"],
    },
    {
      title: isArabic ? "قسم الإعلام والعلاقات" : "Media & Relations Department",
      items: isArabic
        ? ["إدارة وسائل التواصل الاجتماعي", "النشرات الصحفية", "العلاقات مع وسائل الإعلام", "التوثيق الإعلامي"]
        : ["Social media management", "Press releases", "Media relations", "Media documentation"],
    },
  ];

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

      {/* About Secretariat */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-surface rounded-3xl p-8 md:p-12 border border-border">
              <h2 className="text-2xl md:text-3xl font-bold text-text mb-6">
                {isArabic ? "نبذة عن الأمانة العامة" : "About the Secretariat"}
              </h2>
              <div className="space-y-4 text-text-secondary leading-relaxed">
                <p>
                  {isArabic
                    ? "الأمانة العامة هي الجهاز التنفيذي الرئيسي في رابطة خريجي جامعة أفريقيا العالمية. وهي المسؤولة عن تنفيذ سياسات مجلس الإدارة وإدارة العمليات اليومية للرابطة."
                    : "The Secretariat is the main executive body in the Association of IUA Graduates. It is responsible for implementing board policies and managing the association's daily operations."}
                </p>
                <p>
                  {isArabic
                    ? "تتكون الأمانة العامة من الأقسام الإدارية المختلفة التي تعمل بتناغم لضمان تحقيق أهداف الرابطة وخدم أعضائها بأفضل صورة ممكنة."
                    : "The Secretariat consists of various administrative departments working in harmony to ensure the achievement of the association's goals and serve its members in the best possible way."}
                </p>
                <p>
                  {isArabic
                    ? "يترأس الأمانة العامة الأمين العام الذي ينوب عن الرئيس في إدارة الشؤون الإدارية والفنية اليومية، ويضمن الاتصال الفعال بين مجلس الإدارة واللجان المختلفة."
                    : "The Secretariat is headed by the Secretary General who deputizes for the President in managing daily administrative and technical affairs, and ensures effective communication between the board and various committees."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Organizational Chart */}
      <section className="py-20 bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
              {isArabic ? "الهيكل التنظيمي" : "Organizational Structure"}
            </h2>
            <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Board Level */}
            <div className="flex justify-center mb-4">
              <div className="bg-secondary text-white px-8 py-4 rounded-2xl text-center shadow-lg">
                <span className="font-bold text-lg">
                  {isArabic ? "مجلس الإدارة" : "Board of Directors"}
                </span>
              </div>
            </div>
            <div className="flex justify-center mb-4">
              <div className="w-0.5 h-8 bg-secondary/30" />
            </div>

            {/* Secretary General */}
            <div className="flex justify-center mb-4">
              <div className="bg-primary text-white px-8 py-4 rounded-2xl text-center shadow-lg">
                <span className="font-bold text-lg">
                  {isArabic ? "الأمين العام" : "Secretary General"}
                </span>
                <p className="text-white/80 text-sm mt-1">
                  {isArabic ? "الأمانة العامة" : "The Secretariat"}
                </p>
              </div>
            </div>
            <div className="flex justify-center mb-4">
              <div className="w-0.5 h-8 bg-primary/30" />
            </div>

            {/* Committees Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { ar: "لجنة العضوية", en: "Membership Committee", color: "bg-primary-light" },
                { ar: "لجنة الأنشطة", en: "Activities Committee", color: "bg-primary-light" },
                { ar: "لجنة المشاريع", en: "Projects Committee", color: "bg-primary-light" },
                { ar: "لجنة الإعلام", en: "Media Committee", color: "bg-primary-light" },
              ].map((committee, index) => (
                <div
                  key={index}
                  className={`${committee.color} text-white px-4 py-3 rounded-xl text-center shadow-md`}
                >
                  <span className="font-bold text-sm">
                    {isArabic ? committee.ar : committee.en}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Responsibilities */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
              {isArabic ? "المهام والمسؤوليات" : "Functions & Responsibilities"}
            </h2>
            <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {responsibilities.map((item, index) => (
              <div
                key={index}
                className="bg-surface rounded-2xl p-6 border border-border hover:border-primary/30 transition-all group"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-text mb-3">
                  {item.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-20 bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
              {isArabic ? "الأقسام الرئيسية" : "Main Departments"}
            </h2>
            <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {departments.map((dept, index) => (
              <div
                key={index}
                className="bg-background rounded-2xl p-6 border border-border"
              >
                <h3 className="text-lg font-bold text-text mb-4 pb-3 border-b border-border">
                  {dept.title}
                </h3>
                <ul className="space-y-3">
                  {dept.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                      <span className="text-text-secondary text-sm">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
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
