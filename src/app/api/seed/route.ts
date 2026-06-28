import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const admin = await prisma.user.findFirst({ where: { role: "admin" } });
    if (!admin) return NextResponse.json({ error: "No admin found" }, { status: 400 });

    let galleryCount = 0;
    let newsCount = 0;
    let videoCount = 0;
    let publicationCount = 0;
    let reportCount = 0;
    let branchCount = 0;

    const existingGallery = await prisma.gallery.count();
    if (existingGallery === 0) {
      const galleryItems = [
        { title: "حفل التخرج 2023", description: "حفل تخرج دفعة 2023 من جامعة أفريقيا العالمية", type: "image", imageUrl: "/uploads/gallery/alumni-event-2023-01.jpeg", album: "events", tags: "تخرج,2023" },
        { title: "المؤتمر السنوي", description: "افتتاح المؤتمر السنوي لرابطة الخريجين", type: "image", imageUrl: "/uploads/gallery/alumni-event-2023-05.jpeg", album: "conferences", tags: "مؤتمر" },
        { title: "ورشة العمل البحثية", description: "ورشة عمل حول مناهج البحث العلمي", type: "image", imageUrl: "/uploads/gallery/alumni-event-2023-10.jpeg", album: "events", tags: "ورشة,بحث" },
        { title: "لقاء الخريجين", description: "لقاء تواصلي مع خريجي الجامعة", type: "image", imageUrl: "/uploads/gallery/alumni-event-2023-15.jpeg", album: "events", tags: "لقاء,خريجين" },
        { title: "الحرم الجامعي", description: "مناظر جميلة من حرم الجامعة", type: "image", imageUrl: "/uploads/gallery/alumni-event-2023-20.jpeg", album: "campus", tags: "حرم,جامعة" },
        { title: "نشاط طلابي", description: "الأنشطة الطلابية المتنوعة", type: "image", imageUrl: "/uploads/gallery/alumni-event-2023-25.jpeg", album: "general", tags: "نشاط,طلاب" },
        { title: "مؤتمر التقنية الحديثة", description: "مؤتمر التقنية الحديثة والذكاء الاصطناعي", type: "image", imageUrl: "/uploads/projects/1782278813617-5b6i4x.jpg", album: "conferences", tags: "تقنية,ذكاء_اصطناعي" },
        { title: "مشاريع التخرج", description: "عرض مشاريع التخرج للطلاب المتميزين", type: "image", imageUrl: "/uploads/projects/1782263742971-qctx76.jpg", album: "general", tags: "مشروع,تخرج" },
        { title: "صورة جماعية للخريجين", description: "لقاء تذكاري مع خريجي الدفعات السابقة", type: "image", imageUrl: "/uploads/gallery/alumni-event-2023-07.jpeg", album: "events", tags: "خريجين,لقاء" },
        { title: "الاحتفال بالخريجين", description: "حفل تخليد ذكرى تخرج الخريجين", type: "image", imageUrl: "/uploads/gallery/alumni-event-2023-12.jpeg", album: "events", tags: "احتفال,تخرج" },
        { title: "أبحاث الخريجين", description: "عرض الأبحاث العلمية للخريجين المتميزين", type: "image", imageUrl: "/uploads/general/1782565575771-j3dh1v.jpg", album: "conferences", tags: "أبحاث,علم" },
        { title: "الأنشطة الطلابية", description: "الأنشطة والفعاليات الطلابية المتنوعة", type: "image", imageUrl: "/uploads/general/1782378070360-s0oj9p.jpg", album: "campus", tags: "نشاط,طلاب" },
      ];
      for (const item of galleryItems) {
        await prisma.gallery.create({
          data: { ...item, fileUrl: null, thumbnailUrl: null, authorId: admin.id, isActive: true },
        });
      }
      galleryCount = galleryItems.length;
    }

    const existingNews = await prisma.news.count();
    if (existingNews === 0) {
      const now = new Date();
      const newsItems = [
        {
          titleAr: "افتتاح المؤتمر الدولي الأول لرابطة الخريجين",
          titleEn: "Opening of the First International Conference of the Alumni Association",
          slug: "first-international-conference-2024",
          contentAr: "<p>افتتح المؤتمر الدولي الأول لرابطة خريجي جامعة أفريقيا العالمية بحضور أكثر من 500 خريج من مختلف الدول العربية والأفريقية.</p>",
          contentEn: "<p>The first international conference of the AIUAG Alumni Association was inaugurated with the attendance of over 500 graduates.</p>",
          excerptAr: "مؤتمر دولي بمشاركة أكثر من 500 خريج من 15 دولة",
          excerptEn: "An international conference with over 500 graduates from 15 countries",
          featuredImage: "/uploads/gallery/alumni-event-2023-05.jpeg",
          category: "conferences",
          tags: "مؤتمر,دولي",
        },
        {
          titleAr: "برنامج التدريب المهني للخريجين الجدد",
          titleEn: "Professional Training Program for New Graduates",
          slug: "professional-training-program-new-graduates",
          contentAr: "<p>أعلنت رابطة خريجي جامعة أفريقيا العالمية عن إطلاق برنامج التدريب المهني الجديد.</p>",
          contentEn: "<p>The AIUAG Alumni Association announced the launch of a new professional training program.</p>",
          excerptAr: "برنامج تدريب مدته 3 أشهر يشمل إدارة أعمال وتسويق رقمي",
          excerptEn: "A 3-month training program covering business management and digital marketing",
          featuredImage: "/uploads/gallery/alumni-event-2023-10.jpeg",
          category: "workshops",
          tags: "تدريب,مهني",
        },
      ];
      for (const item of newsItems) {
        await prisma.news.create({
          data: { ...item, authorId: admin.id, status: "published", publishedAt: now },
        });
      }
      newsCount = newsItems.length;
    }

    const existingVideos = await prisma.video.count();
    if (existingVideos === 0) {
      const videoItems = [
        { title: "مؤتمر الخريجين السنوي 2024", titleEn: "Annual Alumni Conference 2024", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", description: "المؤتمر السنوي لرابطة الخريجين بمشاركة نخبة من الم speakingين والخبراء", category: "conferences" },
        { title: "محاضرة: مستقبل التعليم في أفريقيا", titleEn: "Lecture: Future of Education in Africa", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", description: "محاضرة أكاديمية حول تحديات وفرص التعليم العالي في القارة الأفريقية", category: "lectures" },
        { title: "حفل توزيع شهادات التخرج 2024", titleEn: "Graduation Ceremony 2024", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", description: "حفل توزيع الشهادات على دفعة 2024 من جامعة أفريقيا العالمية", category: "events" },
        { title: "ورشة العمل: ريادة الأعمال", titleEn: "Workshop: Entrepreneurship", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", description: "ورشة عمل تطبيقية حول أسس ريادة الأعمال وبناء المشاريع الناشئة", category: "lectures" },
        { title: "مؤتمر شراكات الخريجين", titleEn: "Alumni Partnerships Conference", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", description: "مؤتمر لتعزيز الشراكات بين الخريجين والشركات والمؤسسات", category: "conferences" },
        { title: "فعالية يوم الخريجين", titleEn: "Alumni Day Event", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", description: "اليوم السنوي للتواصل والتعارف بين خريجي الجامعة", category: "events" },
      ];
      for (const item of videoItems) {
        await prisma.video.create({ data: { ...item, authorId: admin.id } });
      }
      videoCount = videoItems.length;
    }

    const existingPublications = await prisma.publication.count();
    if (existingPublications === 0) {
      const pubItems = [
        { title: "دليل الخريجين 2024", titleEn: "Alumni Guide 2024", description: "دليل شامل للخريجين يتضمن معلومات عن الخدمات المتوفرة والبرامج والأنشطة", category: "guide" },
        { title: "تقرير السنوي 2023", titleEn: "Annual Report 2023", description: "تقرير شامل عن أنشطة وإنجازات الرابطة خلال عام 2023", category: "annual" },
        { title: "مجلة الخريجين - العدد الخامس", titleEn: "Alumni Magazine - Issue 5", description: "مجلة فصلية تتضمن أخبار الخريجين والمقالات والمقابلات", category: "magazine" },
        { title: "بحث: مستقبل التعليم العالي في أفريقيا", titleEn: "Research: Future of Higher Education in Africa", description: "بحث أكاديمي يستعرض تحديات وفرص التعليم العالي في القارة الأفريقية", category: "research" },
        { title: "دليل التوظيف والتوظيف", titleEn: "Employment and Recruitment Guide", description: "دليل عملي للخريجين حول فرص العمل ومهارات البحث عن وظائف", category: "guide" },
      ];
      for (const item of pubItems) {
        await prisma.publication.create({ data: { ...item, authorId: admin.id } });
      }
      publicationCount = pubItems.length;
    }

    const existingReports = await prisma.report.count();
    if (existingReports === 0) {
      const reportItems = [
        { title: "التقرير السنوي 2024", titleEn: "Annual Report 2024", description: "تقرير شامل عن أنشطة وإنجازات الرابطة خلال عام 2024", category: "annual", year: 2024 },
        { title: "التقرير السنوي 2023", titleEn: "Annual Report 2023", description: "تقرير سنوي يتضمن ملخصاً لأنشطة الرابطة والإنجازات الرئيسية", category: "annual", year: 2023 },
        { title: "التقرير السنوي 2022", titleEn: "Annual Report 2022", description: "تقرير يتضمن مراجعة شاملة لعمل الرابطة وتطوراتها", category: "annual", year: 2022 },
        { title: "التقرير المالي السنوي 2024", titleEn: "Financial Annual Report 2024", description: "تقرير مالي تفصيلي يتضمن الإيرادات والنفقات والميزانية", category: "financial", year: 2024 },
        { title: "التقرير المالي السنوي 2023", titleEn: "Financial Annual Report 2023", description: "تقرير مالي شامل عن الأداء المالي للرابطة", category: "financial", year: 2023 },
        { title: "تقرير الأنشطة الربع سنوي - Q1 2024", titleEn: "Quarterly Activity Report - Q1 2024", description: "تقرير عن الأنشطة والبرامج المنفذة خلال الربع الأول", category: "quarterly", year: 2024 },
        { title: "تقرير الأنشطة الربع سنوي - Q2 2024", titleEn: "Quarterly Activity Report - Q2 2024", description: "تقرير عن الأنشطة والبرامج المنفذة خلال الربع الثاني", category: "quarterly", year: 2024 },
      ];
      for (const item of reportItems) {
        await prisma.report.create({ data: { ...item, authorId: admin.id } });
      }
      reportCount = reportItems.length;
    }

    const existingBranches = await prisma.branch.count();
    if (existingBranches === 0) {
      const branchItems = [
        { name: "فرع الخرطوم", nameEn: "Khartoum Branch", city: "الخرطوم", country: "السودان", status: "active", type: "sudan", email: "khartoum@aiuag.org", memberCount: 500, headName: "أ. محمد أحمد" },
        { name: "فرع أم درمان", nameEn: "Omdurman Branch", city: "أم درمان", country: "السودان", status: "active", type: "sudan", email: "omdurman@aiuag.org", memberCount: 350, headName: "د. فاطمة علي" },
        { name: "فرع بحري", nameEn: "Bahri Branch", city: "بحري", country: "السودان", status: "active", type: "sudan", email: "bahri@aiuag.org", memberCount: 280, headName: "أ. خالد إبراهيم" },
        { name: "فرع الخرطوم بحري", nameEn: "Khartoum North Branch", city: "الخرطوم بحري", country: "السودان", status: "establishing", type: "sudan", email: "khartoum-north@aiuag.org", memberCount: 120 },
        { name: "فرع الجزيرة", nameEn: "Gezira Branch", city: "ولاية الجزيرة", country: "السودان", status: "active", type: "sudan", email: "gezira@aiuag.org", memberCount: 200, headName: "د. سعيد حسن" },
        { name: "فرع كردفان", nameEn: "Kordofan Branch", city: "ولاية كردفان", country: "السودان", status: "establishing", type: "sudan", email: "kordofan@aiuag.org", memberCount: 80 },
        { name: "فرع دارفور", nameEn: "Darfur Branch", city: "ولاية جنوب دارفور", country: "السودان", status: "planned", type: "sudan", email: "darfur@aiuag.org", memberCount: 60 },
        { name: "فرع النيل الأبيض", nameEn: "White Nile Branch", city: "ولاية النيل الأبيض", country: "السودان", status: "planned", type: "sudan", email: "whitenile@aiuag.org", memberCount: 40 },
        { name: "فرع أوغندا", nameEn: "Uganda Branch", city: "كامبالا", country: "أوغندا", status: "active", type: "africa", email: "uganda@aiuag.org", memberCount: 150, headName: "Dr. James Okello" },
        { name: "فرع كينيا", nameEn: "Kenya Branch", city: "نيروبي", country: "كينيا", status: "active", type: "africa", email: "kenya@aiuag.org", memberCount: 120, headName: "Dr. Grace Wanjiku" },
        { name: "فرع إثيوبيا", nameEn: "Ethiopia Branch", city: "أديس أبابا", country: "إثيوبيا", status: "establishing", type: "africa", email: "ethiopia@aiuag.org", memberCount: 80 },
        { name: "فرع مصر", nameEn: "Egypt Branch", city: "القاهرة", country: "مصر", status: "active", type: "africa", email: "egypt@aiuag.org", memberCount: 100, headName: "د. أحمد سعيد" },
        { name: "فرع تشاد", nameEn: "Chad Branch", city: "نجامينا", country: "تشاد", status: "planned", type: "africa", email: "chad@aiuag.org", memberCount: 30 },
        { name: "فرع نيجيريا", nameEn: "Nigeria Branch", city: "لاغوس", country: "نيجيريا", status: "planned", type: "africa", email: "nigeria@aiuag.org", memberCount: 50 },
        { name: "فرع جنوب السودان", nameEn: "South Sudan Branch", city: "جوبا", country: "جنوب السودان", status: "active", type: "africa", email: "southsudan@aiuag.org", memberCount: 70, headName: "Dr. Peter Deng" },
        { name: "فرع ألمانيا", nameEn: "Germany Branch", city: "برلين", country: "ألمانيا", status: "establishing", type: "africa", email: "germany@aiuag.org", memberCount: 40 },
      ];
      for (const item of branchItems) {
        await prisma.branch.create({ data: item });
      }
      branchCount = branchItems.length;
    }

    return NextResponse.json({ success: true, gallery: galleryCount, news: newsCount, videos: videoCount, publications: publicationCount, reports: reportCount, branches: branchCount });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
