import { FileText, Download, Calendar, FolderOpen, BookOpen, BarChart3 } from "lucide-react";

export default async function ResourcesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isArabic = lang === "ar";
  const dir = isArabic ? "rtl" : "ltr";

  const categories = [
    { icon: FileText, title: isArabic ? "التقارير السنوية" : "Annual Reports", count: 5 },
    { icon: BookOpen, title: isArabic ? "المنشورات" : "Publications", count: 8 },
    { icon: BarChart3, title: isArabic ? "الأبحاث" : "Research", count: 12 },
    { icon: FolderOpen, title: isArabic ? "الموارد التعليمية" : "Educational Resources", count: 15 },
  ];

  const documents = [
    { title: isArabic ? "التقرير السنوي 2025" : "Annual Report 2025", category: isArabic ? "تقارير" : "Reports", date: isArabic ? "يناير 2026" : "January 2026", size: "2.5 MB", type: "PDF" },
    { title: isArabic ? "دليل الخريجين" : "Alumni Handbook", category: isArabic ? "منشورات" : "Publications", date: isArabic ? "ديسمبر 2025" : "December 2025", size: "4.2 MB", type: "PDF" },
    { title: isArabic ? "بحث: سوق العمل للخريجين" : "Research: Graduate Job Market", category: isArabic ? "أبحاث" : "Research", date: isArabic ? "نوفمبر 2025" : "November 2025", size: "1.8 MB", type: "PDF" },
    { title: isArabic ? "خطة الإعمار الشاملة" : "Comprehensive Reconstruction Plan", category: isArabic ? "تقارير" : "Reports", date: isArabic ? "أكتوبر 2025" : "October 2025", size: "6.1 MB", type: "PDF" },
    { title: isArabic ? "إحصائيات الخريجين 2024" : "Graduate Statistics 2024", category: isArabic ? "أبحاث" : "Research", date: isArabic ? "سبتمبر 2025" : "September 2025", size: "3.0 MB", type: "PDF" },
    { title: isArabic ? "دليل المهارات المهنية" : "Professional Skills Guide", category: isArabic ? "موارد تعليمية" : "Educational", date: isArabic ? "أغسطس 2025" : "August 2025", size: "5.5 MB", type: "PDF" },
    { title: isArabic ? "تقرير البرامج التدريبية" : "Training Programs Report", category: isArabic ? "تقارير" : "Reports", date: isArabic ? "يوليو 2025" : "July 2025", size: "2.8 MB", type: "PDF" },
    { title: isArabic ? "نشرية الرابطة" : "Association Newsletter", category: isArabic ? "منشورات" : "Publications", date: isArabic ? "يونيو 2025" : "June 2025", size: "1.2 MB", type: "PDF" },
  ];

  return (
    <div dir={dir}>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary via-primary-light to-primary py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 start-20 w-72 h-72 rounded-full bg-secondary blur-3xl" />
          <div className="absolute bottom-20 end-20 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {isArabic ? "الموارد" : "Resources"}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            {isArabic ? "مصادر مفيدة وتقارير ومنشورات لخدمة الخريجين والمجتمع" : "Useful sources, reports, and publications for graduates and the community"}
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <div key={i} className="bg-surface rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-primary/30 border border-border">
                <div className="w-14 h-14 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                  <cat.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-text text-sm mb-1">{cat.title}</h3>
                <span className="text-text-light text-xs">{isArabic ? `${cat.count} وثيقة` : `${cat.count} documents`}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documents List */}
      <section className="py-20 bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text mb-4">
              {isArabic ? "المستندات المتاحة" : "Available Documents"}
            </h2>
            <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
          </div>
          <div className="max-w-4xl mx-auto space-y-4">
            {documents.map((doc, i) => (
              <div key={i} className="flex items-center gap-4 bg-background rounded-xl p-4 border border-border hover:border-primary/30 transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text text-sm truncate">{doc.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-text-light mt-1">
                    <span>{doc.category}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{doc.date}</span>
                    </div>
                    <span>•</span>
                    <span>{doc.size}</span>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shrink-0">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">{isArabic ? "تحميل" : "Download"}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
