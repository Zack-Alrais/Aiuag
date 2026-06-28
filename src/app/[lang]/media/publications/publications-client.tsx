"use client";

import Image from "next/image";
import { FileText, Download, Calendar } from "lucide-react";

interface Publication {
  id: string;
  title: string;
  titleEn: string | null;
  description: string | null;
  category: string | null;
  fileUrl: string | null;
  imageUrl: string | null;
  createdAt: string;
}

export default function PublicationsClient({
  publications,
  isArabic,
}: {
  publications: Publication[];
  isArabic: boolean;
}) {
  if (publications.length === 0) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center py-20 text-text-secondary">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">{isArabic ? "لا توجد منشورات حالياً" : "No publications available yet"}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publications.map((pub) => (
            <div
              key={pub.id}
              className="bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
            >
              <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative overflow-hidden">
                {pub.imageUrl ? (
                  <Image src={pub.imageUrl} alt={pub.title} className="w-full h-full object-cover" width={400} height={128} loading="lazy" unoptimized />
                ) : (
                  <FileText className="w-12 h-12 text-primary/30 group-hover:scale-110 transition-transform" />
                )}
                {pub.category && (
                  <div className="absolute top-3 end-3">
                    <span className="px-2 py-0.5 bg-secondary text-white text-xs font-bold rounded">
                      {pub.category}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-base font-bold text-text mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {isArabic ? pub.title : pub.titleEn || pub.title}
                </h3>
                {pub.description && (
                  <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                    {pub.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-text-secondary mb-4">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(pub.createdAt).toLocaleDateString(isArabic ? "ar-EG" : "en-US", { year: "numeric", month: "short" })}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-text-light">PDF</span>
                  {pub.fileUrl ? (
                    <a
                      href={pub.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-light transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {isArabic ? "تحميل" : "Download"}
                    </a>
                  ) : (
                    <button disabled className="flex items-center gap-1.5 px-4 py-2 bg-gray-300 text-gray-500 text-xs font-bold rounded-lg cursor-not-allowed">
                      <Download className="w-3.5 h-3.5" />
                      {isArabic ? "تحميل" : "Download"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
