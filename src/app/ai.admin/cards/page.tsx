"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Grid,
  List,
  X,
  Globe,
  User,
  CreditCard,
  Calendar,
  Building2,
  Loader2,
} from "lucide-react";
import { MembershipCardEngine } from "@/components/cards/membership-card-engine";

interface MemberCard {
  id: string;
  nameAr: string;
  nameEn: string;
  email: string;
  phone: string;
  studentId: string;
  membershipNumber: string;
  faculty: string;
  department: string;
  graduationYear: number;
  country: string;
  membershipType: string;
  status: "active" | "inactive" | "expired";
  joinDate: string;
  photo?: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: "نشط", color: "bg-green-100 text-green-700" },
  inactive: { label: "غير نشط", color: "bg-gray-100 text-gray-600" },
  expired: { label: "منتهي", color: "bg-red-100 text-red-600" },
};

type SortField = "nameAr" | "country" | "faculty" | "graduationYear";

export default function AdminCardsPage() {
  const [cards, setCards] = useState<MemberCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("nameAr");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCard, setSelectedCard] = useState<MemberCard | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch("/api/admin/members?limit=100")
      .then((r) => r.json())
      .then((data) => {
        const mapped: MemberCard[] = (data.data || []).map((m: Record<string, unknown>) => {
          const u = (m.user || {}) as Record<string, unknown>;
          return {
            id: m.id as string,
            nameAr: (u.name as string) || "",
            nameEn: (m.nameEn as string) || (u.name as string) || "",
            email: (u.email as string) || "",
            phone: (m.phone as string) || "",
            studentId: (m.studentId as string) || "",
            membershipNumber: (m.membershipNumber as string) || "",
            faculty: (m.faculty as string) || "",
            department: (m.specialization as string) || "",
            graduationYear: (m.graduationYear as number) || 0,
            country: (m.country as string) || "",
            membershipType: (m.membershipType as string) || "عضو عامل",
            status: m.status === "approved" ? "active" : (m.status === "rejected" ? "inactive" : "active"),
            joinDate: (m.createdAt as string) || "",
            photo: (m.cardPhoto as string) || (u.image as string) || undefined,
          };
        });
        setCards(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const COUNTRIES = [...new Set(cards.map((c) => c.country).filter(Boolean))].sort();
  const FACULTIES = [...new Set(cards.map((c) => c.faculty).filter(Boolean))].sort();

  const filteredCards = useMemo(() => {
    let result = [...cards];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.nameAr.toLowerCase().includes(q) || c.nameEn.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.membershipNumber.toLowerCase().includes(q) || c.studentId.toLowerCase().includes(q));
    }
    if (countryFilter) result = result.filter((c) => c.country === countryFilter);
    if (facultyFilter) result = result.filter((c) => c.faculty === facultyFilter);
    if (statusFilter) result = result.filter((c) => c.status === statusFilter);
    result.sort((a, b) => {
      const cmp = a[sortField].localeCompare(b[sortField], "ar");
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [search, countryFilter, facultyFilter, statusFilter, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const handlePrint = (card: MemberCard) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>بطاقة العضوية - ${card.nameAr}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            .card-container { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div id="card-container"></div>
        <script src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
        <script>
          setTimeout(() => { window.print(); }, 500);
        <\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = (card: MemberCard) => {
    const link = document.createElement("a");
    const content = `بطاقة عضوية - رابطة خريجي جامعة أفريقيا العالمية\n${"=".repeat(40)}\nالاسم: ${card.nameAr}\nالاسم الإنجليزي: ${card.nameEn}\nرقم العضوية: ${card.membershipNumber}\nرقم الطالب: ${card.studentId}\nالكلية: ${card.faculty}\nالقسم: ${card.department}\nسنة التخرج: ${card.graduationYear}\nالدولة: ${card.country}\nنوع العضوية: ${card.membershipType}\nالحالة: ${STATUS_MAP[card.status].label}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    link.href = URL.createObjectURL(blob);
    link.download = `card-${card.membershipNumber}.txt`;
    link.click();
  };

  const handlePrintAll = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>طباعة البطاقات</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            .card-container { page-break-inside: avoid; margin-bottom: 20px; }
          }
        </style>
      </head>
      <body>
        <div id="cards-container"></div>
        <script src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
        <script>
          setTimeout(() => { window.print(); }, 1000);
        <\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const SortBtn = ({ field, label }: { field: SortField; label: string }) => (
    <button onClick={() => handleSort(field)} className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-[#1A3A6B] transition-colors">
      {label}
      {sortField === field ? (sortDir === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />) : <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">البطاقات</h1>
          <p className="text-sm text-gray-500">{filteredCards.length} بطاقة عضوية</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrintAll} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
            <Printer className="w-4 h-4" />طباعة الكل
          </button>
          <button onClick={() => filteredCards.forEach(handleDownload)} className="flex items-center gap-2 px-4 py-2 bg-[#1A3A6B] text-white rounded-xl text-sm font-medium hover:bg-[#0f2547] transition-colors">
            <Download className="w-4 h-4" />تحميل الكل
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="بحث بالاسم أو الرقم..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pe-4 ps-11 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B]" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${showFilters || countryFilter || facultyFilter || statusFilter ? "bg-[#1A3A6B] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            <Filter className="w-4 h-4" />الفلاتر
            {(countryFilter || facultyFilter || statusFilter) && <span className="w-5 h-5 bg-white/20 rounded-full text-xs flex items-center justify-center">{[countryFilter, facultyFilter, statusFilter].filter(Boolean).length}</span>}
          </button>
          <div className="flex bg-gray-100 rounded-xl overflow-hidden">
            <button onClick={() => setViewMode("grid")} className={`p-2.5 ${viewMode === "grid" ? "bg-[#1A3A6B] text-white" : "text-gray-500 hover:bg-gray-200"}`}><Grid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode("list")} className={`p-2.5 ${viewMode === "list" ? "bg-[#1A3A6B] text-white" : "text-gray-500 hover:bg-gray-200"}`}><List className="w-4 h-4" /></button>
          </div>
        </div>
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">الدولة</label>
              <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20">
                <option value="">الكل</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">الكلية</label>
              <select value={facultyFilter} onChange={(e) => setFacultyFilter(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20">
                <option value="">الكل</option>
                {FACULTIES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">الحالة</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20">
                <option value="">الكل</option>
                {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Sort Bar */}
      <div className="flex items-center gap-6 px-2">
        <span className="text-sm text-gray-400">ترتيب حسب:</span>
        <SortBtn field="nameAr" label="الاسم" />
        <SortBtn field="country" label="الدولة" />
        <SortBtn field="faculty" label="الكلية" />
        <SortBtn field="graduationYear" label="سنة التخرج" />
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCards.map((card) => (
            <div key={card.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer" onClick={() => setSelectedCard(card)}>
              <div className="bg-gradient-to-br from-[#1A3A6B] to-[#2B5EA7] p-5 text-white relative overflow-hidden">
                <div className="absolute top-0 start-0 w-24 h-24 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <CreditCard className="w-6 h-6 text-[#D4A843]" />
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_MAP[card.status].color}`}>{STATUS_MAP[card.status].label}</span>
                  </div>
                  <h3 className="font-bold text-lg">{card.nameAr}</h3>
                  <p className="text-white/70 text-xs">{card.nameEn}</p>
                  <p className="text-white/70 text-sm font-mono mt-1">{card.membershipNumber}</p>
                </div>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm"><Building2 className="w-4 h-4 text-gray-400 shrink-0" /><span className="text-gray-500 truncate">{card.faculty}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Globe className="w-4 h-4 text-gray-400 shrink-0" /><span className="text-gray-500">{card.country}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-gray-400 shrink-0" /><span className="text-gray-500">{card.graduationYear}</span></div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button onClick={(e) => { e.stopPropagation(); handlePrint(card); }} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#1A3A6B]/5 text-[#1A3A6B] rounded-lg text-xs font-medium hover:bg-[#1A3A6B]/10 transition-colors"><Printer className="w-3.5 h-3.5" />طباعة</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDownload(card); }} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#D4A843]/10 text-[#D4A843] rounded-lg text-xs font-medium hover:bg-[#D4A843]/20 transition-colors"><Download className="w-3.5 h-3.5" />تحميل</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">الاسم</th>
                <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">رقم العضوية</th>
                <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">الكلية</th>
                <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">الدولة</th>
                <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">الحالة</th>
                <th className="text-start px-4 py-3 text-sm font-medium text-gray-500">إجراءات</th>
              </tr></thead>
              <tbody>
                {filteredCards.map((card) => (
                  <tr key={card.id} className="border-b border-gray-100 hover:bg-gray-50/50 cursor-pointer transition-colors" onClick={() => setSelectedCard(card)}>
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-[#1A3A6B]/10 rounded-full flex items-center justify-center shrink-0"><User className="w-5 h-5 text-[#1A3A6B]" /></div><div><p className="font-medium text-sm">{card.nameAr}</p><p className="text-gray-400 text-xs">{card.nameEn}</p></div></div></td>
                    <td className="px-4 py-3 font-mono text-sm">{card.membershipNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{card.faculty}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{card.country}</td>
                    <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_MAP[card.status].color}`}>{STATUS_MAP[card.status].label}</span></td>
                    <td className="px-4 py-3"><div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handlePrint(card); }} className="p-2 text-[#1A3A6B] hover:bg-[#1A3A6B]/5 rounded-lg transition-colors"><Printer className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDownload(card); }} className="p-2 text-[#D4A843] hover:bg-[#D4A843]/10 rounded-lg transition-colors"><Download className="w-4 h-4" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty */}
      {filteredCards.length === 0 && <div className="text-center py-16"><CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-bold text-gray-800 mb-2">لا توجد بطاقات</h3><p className="text-gray-500">جرب تغيير معايير البحث</p></div>}

      {/* Detail Modal - Using Unified Card Component */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedCard(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">تفاصيل البطاقة</h2>
              <button onClick={() => setSelectedCard(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <MembershipCardEngine
                member={{
                  id: selectedCard.id,
                  nameAr: selectedCard.nameAr,
                  nameEn: selectedCard.nameEn,
                  membershipNumber: selectedCard.membershipNumber,
                  memberType: selectedCard.membershipType,
                  photo: selectedCard.photo,
                  specialization: selectedCard.faculty,
                  department: selectedCard.department,
                  graduationYear: selectedCard.graduationYear,
                  phone: selectedCard.phone,
                  email: selectedCard.email,
                }}
                showBoth
                size="lg"
              />
            </div>
            <div className="sticky bottom-0 bg-white z-10 p-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => handlePrint(selectedCard)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1A3A6B] text-white rounded-xl font-medium hover:bg-[#0f2547] transition-colors">
                <Printer className="w-5 h-5" />طباعة البطاقة
              </button>
              <button onClick={() => handleDownload(selectedCard)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#D4A843] text-white rounded-xl font-medium hover:bg-[#c49a38] transition-colors">
                <Download className="w-5 h-5" />تحميل البطاقة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
