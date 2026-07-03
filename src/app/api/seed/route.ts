import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const admin = await prisma.user.findFirst({ where: { role: "admin" } });
    if (!admin) return NextResponse.json({ error: "No admin found" }, { status: 400 });

    const results: Record<string, number> = {};

    // 1. Hero Images
    const heroCount = await prisma.heroImage.count();
    if (heroCount === 0) {
      const heroes = [
        { pageSlugs: "home", imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c8f1?w=1600&h=900&fit=crop", titleAr: "رابطة خريجي جامعة أفريقيا العالمية", titleEn: "AIUAG Alumni Association", subtitleAr: "نربط الخريجين.. نبني المستقبل", subtitleEn: "Connecting Alumni, Building the Future", order: 1 },
        { pageSlugs: "home", imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&h=900&fit=crop", titleAr: "ابدأ رحلتك معنا", titleEn: "Start Your Journey With Us", subtitleAr: "انضم لمجتمع أكثر من 5000 خريج", subtitleEn: "Join a community of 5000+ alumni", order: 2 },
        { pageSlugs: "media", imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168d9c?w=1600&h=900&fit=crop", titleAr: "المركز الإعلامي", titleEn: "Media Center", subtitleAr: "تابع آخر أخبارنا وفعالياتنا", subtitleEn: "Follow our latest news and events", order: 1 },
        { pageSlugs: "gallery", imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&h=900&fit=crop", titleAr: "المعرض", titleEn: "Gallery", subtitleAr: "لحظات لا تُنسى من فعالياتنا", subtitleEn: "Unforgettable moments from our events", order: 1 },
        { pageSlugs: "publications", imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&h=900&fit=crop", titleAr: "المنشورات والتفاعل", titleEn: "Publications & Feed", subtitleAr: "شارك وتفاعل مع مجتمع الخريجين", subtitleEn: "Share and interact with alumni community", order: 1 },
        { pageSlugs: "news", imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168d9c?w=1600&h=900&fit=crop", titleAr: "الأخبار والأحداث", titleEn: "News & Events", subtitleAr: "آخر المستجدات والأخبار", subtitleEn: "Latest updates and news", order: 1 },
        { pageSlugs: "membership", imageUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&h=900&fit=crop", titleAr: "العضوية", titleEn: "Membership", subtitleAr: "انضم لعائلة الخريجين", subtitleEn: "Join the alumni family", order: 1 },
        { pageSlugs: "events", imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&h=900&fit=crop", titleAr: "الأحداث والفعاليات", titleEn: "Events & Activities", subtitleAr: "شارك في فعالياتنا المتنوعة", subtitleEn: "Participate in our diverse events", order: 1 },
        { pageSlugs: "about", imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?w=1600&h=900&fit=crop", titleAr: "عن الرابطة", titleEn: "About Us", subtitleAr: "تعرف على رؤيتنا ورسالتنا", subtitleEn: "Learn about our vision and mission", order: 1 },
      ];
      for (const h of heroes) {
        await prisma.heroImage.create({ data: { ...h, isActive: true } });
      }
      results.heroes = heroes.length;
    }

    // 2. Events
    const eventCount = await prisma.event.count();
    if (eventCount === 0) {
      const now = new Date();
      const events = [
        { titleAr: "المؤتمر السنوي لرابطة الخريجين 2025", titleEn: "AIUAG Annual Conference 2025", slug: "annual-conference-2025", descriptionAr: " المؤتمر السنوي الخامس لرابطة خريجي جامعة أفريقيا العالمية بعنوان \"الابتكار والريادة في عصر التحول الرقمي\".", descriptionEn: "The 5th annual conference of AIUAG under the theme 'Innovation and Leadership in the Digital Transformation Era'.", date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), time: "09:00", location: "قاعة المؤتمرات الكبرى - جامعة أفريقيا العالمية", status: "upcoming", category: "conferences", capacity: 500, registeredCount: 280 },
        { titleAr: "ورشة عمل: ريادة الأعمال الرقمية", titleEn: "Workshop: Digital Entrepreneurship", slug: "digital-entrepreneurship-workshop", descriptionAr: "ورشة عمل تطبيقية لمدة يومين حول أساسيات ريادة الأعمال الرقمية.", descriptionEn: "A two-day practical workshop on digital entrepreneurship fundamentals.", date: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), time: "10:00", location: "مركز التدريب - جامعة أفريقيا العالمية", status: "upcoming", category: "workshops", capacity: 50, registeredCount: 35 },
        { titleAr: "يوم التوظيف والتوطين", titleEn: "Career Day", slug: "career-day-2025", descriptionAr: "يوم خاص بالخريجين يجمعهم مع الشركات الرائدة لفرص العمل والتدريب.", descriptionEn: "A special day connecting alumni with leading companies for job opportunities.", date: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000), time: "09:00", location: "الحرم الجامعي الرئيسي", status: "upcoming", category: "career", capacity: 300, registeredCount: 150 },
        { titleAr: "حفل توزيع شهادات التخرج 2025", titleEn: "Graduation Ceremony 2025", slug: "graduation-ceremony-2025", descriptionAr: "حفل توزيع الشهادات على الدفعة الجديدة من خريجي جامعة أفريقيا العالمية.", descriptionEn: "Graduation ceremony for the new batch of AIUAG alumni.", date: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), time: "18:00", location: "قاعة الحفلات الكبرى", status: "upcoming", category: "ceremonies", capacity: 1000, registeredCount: 450 },
        { titleAr: "لقاء الخريجين - دبي", titleEn: "Alumni Meetup - Dubai", slug: "alumni-meetup-dubai", descriptionAr: "لقاء تواصلي مع خريجي الجامعة المقيمين في الإمارات العربية المتحدة.", descriptionEn: "Networking meetup with alumni residing in the UAE.", date: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), time: "19:00", location: "فندق دبي ماريوت - الإمارات", status: "upcoming", category: "networking", capacity: 80, registeredCount: 45 },
      ];
      for (const e of events) {
        await prisma.event.create({ data: e });
      }
      results.events = events.length;
    }

    // 3. Board Members (fix: use positionAr/positionEn + dedup)
    let boardCount = await prisma.boardMember.count();
    if (boardCount !== 6) {
      await prisma.boardMember.deleteMany({});
      boardCount = 0;
    }
    if (boardCount === 0) {
      const boards = [
        { nameAr: "د. عبدالله محمد أحمد", nameEn: "Dr. Abdullah Mohamed Ahmed", positionAr: "رئيس مجلس الإدارة", positionEn: "Chairman of the Board", bioAr: "أستاذ جامعي ورائد أعمال مع خبرة تزيد عن 20 عاماً في مجال التعليم العالي.", bioEn: "University professor and entrepreneur with over 20 years of experience in higher education.", order: 1, isActive: true },
        { nameAr: "أ. فاطمة علي حسن", nameEn: "Ms. Fatima Ali Hassan", positionAr: "نائب الرئيس", positionEn: "Vice Chairwoman", bioAr: "مهندسة مشاريع ومتخصصة في إدارة المشاريع الكبرى.", bioEn: "Project engineer specializing in large-scale project management.", order: 2, isActive: true },
        { nameAr: "د. محمد عثمان إبراهيم", nameEn: "Dr. Mohamed Othman Ibrahim", positionAr: "الSecretary العام", positionEn: "Secretary General", bioAr: "باحث أكاديمي متخصص في العلوم الاجتماعية والإدارة.", bioEn: "Academic researcher specialized in social sciences and management.", order: 3, isActive: true },
        { nameAr: "م. سارة أحمد خالد", nameEn: "Eng. Sarah Ahmed Khalid", positionAr: "أمين الصندوق", positionEn: "Treasurer", bioAr: "مهندسة مدنية ومتخصصة في الإدارة المالية.", bioEn: "Civil engineer specializing in financial management.", order: 4, isActive: true },
        { nameAr: "د. خالد محمد علي", nameEn: "Dr. Khaled Mohamed Ali", positionAr: "عضو مجلس", positionEn: "Board Member", bioAr: "طبيب جراح ومتخصص في الجراحة التجميلية.", bioEn: "Surgeon specializing in plastic surgery.", order: 5, isActive: true },
        { nameAr: "أ. نورا حسن سعيد", nameEn: "Ms. Noura Hassan Saeed", positionAr: "عضو مجلس", positionEn: "Board Member", bioAr: "محامية ومتخصصة في القانون التجاري الدولي.", bioEn: "Lawyer specializing in international commercial law.", order: 6, isActive: true },
      ];
      for (const b of boards) {
        await prisma.boardMember.create({ data: b });
      }
      results.boards = boards.length;
    }

    // 4. Committees (fix: use chairNameAr/chairNameEn + slug + dedup)
    let committeeCount = await prisma.committee.count();
    if (committeeCount !== 6) {
      await prisma.committee.deleteMany({});
      committeeCount = 0;
    }
    if (committeeCount === 0) {
      const committees = [
        { nameAr: "لجنة التخطيط والتطوير", nameEn: "Planning & Development Committee", slug: "planning-development", descriptionAr: "مسؤولة عن التخطيط الاستراتيجي وتطوير برامج الرابطة.", descriptionEn: "Responsible for strategic planning and developing association programs.", chairNameAr: "د. عبدالله أحمد", chairNameEn: "Dr. Abdullah Ahmed", type: "standing", isActive: true },
        { nameAr: "لجنة العلاقات العامة", nameEn: "Public Relations Committee", slug: "public-relations", descriptionAr: "تتولى بناء علاقات الرابطة مع المؤسسات والشركات.", descriptionEn: "Manages relationships with institutions and companies.", chairNameAr: "أ. فاطمة علي", chairNameEn: "Ms. Fatima Ali", type: "standing", isActive: true },
        { nameAr: "لجنة الشباب والأنشطة", nameEn: "Youth & Activities Committee", slug: "youth-activities", descriptionAr: "تخطط وتنفذ الأنشطة والفعاليات الشبابية.", descriptionEn: "Plans and executes youth activities and events.", chairNameAr: "م. سارة خالد", chairNameEn: "Eng. Sarah Khalid", type: "standing", isActive: true },
        { nameAr: "لجنة التقنية والمعلومات", nameEn: "IT & Technology Committee", slug: "it-technology", descriptionAr: "مسؤولة عن البنية التحتية الرقمية والتحول الرقمي.", descriptionEn: "Responsible for digital infrastructure and transformation.", chairNameAr: "م. أحمد محمود", chairNameEn: "Eng. Ahmed Mahmoud", type: "standing", isActive: true },
        { nameAr: "لجنة المالية والميزانية", nameEn: "Finance & Budget Committee", slug: "finance-budget", descriptionAr: "تتولى إدارة الشؤون المالية والميزانية.", descriptionEn: "Manages financial affairs and budget.", chairNameAr: "م. سارة أحمد", chairNameEn: "Eng. Sarah Ahmed", type: "standing", isActive: true },
        { nameAr: "لجنة التعليم والبحث العلمي", nameEn: "Education & Research Committee", slug: "education-research", descriptionAr: "تتعقب البرامج التعليمية والأبحاث العلمية.", descriptionEn: "Oversees educational programs and scientific research.", chairNameAr: "د. محمد عثمان", chairNameEn: "Dr. Mohamed Othman", type: "standing", isActive: true },
      ];
      for (const c of committees) {
        await prisma.committee.create({ data: c });
      }
      results.committees = committees.length;
    }

    // 5. FAQs (delete duplicates, then recreate if needed)
    const faqCount = await prisma.fAQ.count();
    if (faqCount > 8) {
      await prisma.fAQ.deleteMany({});
    }
    const faqCountAfter = await prisma.fAQ.count();
    if (faqCountAfter === 0) {
      const faqs = [
        { questionAr: "كيف يمكنني الانضمام لرابطة الخريجين؟", answerAr: "يمكنك التسجيل عبر موقعنا الإلكتروني من خلال صفحة العضوية، أو التواصل مع أحد الفروع المحلية.", questionEn: "How can I join the alumni association?", answerEn: "You can register through our website's membership page, or contact one of the local branches.", category: "membership", order: 1, isActive: true },
        { questionAr: "ما هي فوائد العضوية؟", answerAr: "تتضمن العضوية خدمات التوظيف، التدريب المهني، الخصومات لدى الشركاء، المشاركة في الفعاليات الحصرية، وبطاقة العضوية.", questionEn: "What are the membership benefits?", answerEn: "Membership includes employment services, professional training, partner discounts, exclusive events, and membership card.", category: "membership", order: 2, isActive: true },
        { questionAr: "هل يمكنني تحديث بياناتي الشخصية؟", answerAr: "نعم، يمكنك تسجيل الدخول والذهاب لصفحة الملف الشخصي لتعديل جميع بياناتك.", questionEn: "Can I update my personal information?", answerEn: "Yes, you can log in and go to the profile page to edit all your information.", category: "general", order: 3, isActive: true },
        { questionAr: "كيف أحصل على بطاقة العضوية؟", answerAr: "بمجرد موافقة طلب العضوية، يمكنك طباعة البطاقة من صفحة البطاقة في لوحة التحكم.", questionEn: "How do I get my membership card?", answerEn: "Once your membership is approved, you can print the card from the card page in your dashboard.", category: "membership", order: 4, isActive: true },
        { questionAr: "ما هي خطوات التحقق من الهوية للخريج؟", answerAr: "قم بالبحث عن اسمك في صفحة التحقق، ثم اختر بياناتك من النتائج، وسيتم مراجعة طلبك من الإدارة.", questionEn: "What are the steps for graduate identity verification?", answerEn: "Search your name on the verification page, select your data from results, and your request will be reviewed by administration.", category: "verification", order: 5, isActive: true },
        { questionAr: "هل يمكنني التبرع لرابطة الخريجين؟", answerAr: "نعم، يمكنك التبرع من خلال صفحة التبرعات باستخدام بطاقات الائتمان أو المحافظ الإلكترونية.", questionEn: "Can I donate to the alumni association?", answerEn: "Yes, you can donate through the donations page using credit cards or digital wallets.", category: "donations", order: 6, isActive: true },
        { questionAr: "كيف أتواصل مع فرع الخريجين في بلدي؟", answerAr: "قم بزيارة صفحة الفروع لاكتشاف الفرع المحلي في بلدك ومعرفة بيانات التواصل.", questionEn: "How do I contact the alumni branch in my country?", answerEn: "Visit the branches page to find your local branch and contact information.", category: "branches", order: 7, isActive: true },
        { questionAr: "ما هي الأنشطة التي تنظمها الرابطة؟", answerAr: "تنظم الرابطة مؤتمرات، ورش عمل، لقاءات خريجين، أنشطة تطوعية، وبرامج تدريب مهني.", questionEn: "What activities does the association organize?", answerEn: "The association organizes conferences, workshops, alumni meetups, volunteer activities, and professional training programs.", category: "activities", order: 8, isActive: true },
      ];
      for (const f of faqs) {
        await prisma.fAQ.create({ data: f });
      }
      results.faqs = faqs.length;
    }

    // 6. Projects
    const projectCount = await prisma.project.count();
    if (projectCount === 0) {
      const projects = [
        { titleAr: "مبادرة التوظيف للخريجين", titleEn: "Alumni Employment Initiative", slug: "alumni-employment-initiative", descriptionAr: "مبادرة لربط الخريجين بفرص العمل في الشركات والمؤسسات الشريكة.", descriptionEn: "An initiative connecting alumni with job opportunities at partner companies.", status: "active", category: "employment" },
        { titleAr: "برنامج الإرشاد الأكاديمي", titleEn: "Academic Mentoring Program", slug: "academic-mentoring-program", descriptionAr: "برنامج يربط الخريجين المتميزين بالطلاب الحاليين للإرشاد الأكاديمي والمهني.", descriptionEn: "A program linking distinguished alumni with current students for academic and professional mentoring.", status: "active", category: "education" },
        { titleAr: "مشروع البحث التعاوني", titleEn: "Collaborative Research Project", slug: "collaborative-research", descriptionAr: "مشروع لتعزيز البحث التعاوني بين الخريجين والأكاديميين.", descriptionEn: "A project to enhance collaborative research between alumni and academics.", status: "active", category: "research" },
        { titleAr: "مبادرة الشباب والابتكار", titleEn: "Youth & Innovation Initiative", slug: "youth-innovation-initiative", descriptionAr: "مبادرة لدعم رواد الأعمال الشباب من بين الخريجين.", descriptionEn: "An initiative supporting young entrepreneurs among alumni.", status: "completed", category: "innovation" },
      ];
      for (const p of projects) {
        await prisma.project.create({ data: { ...p, authorId: admin.id } });
      }
      results.projects = projects.length;
    }

    // 7. Partners
    const partnerCount = await prisma.partner.count();
    if (partnerCount === 0) {
      const partners = [
        { nameAr: "جامعة أفريقيا العالمية", nameEn: "Africa International University", descriptionAr: "الجامعة الأم لخريجي الرابطة", descriptionEn: "The parent university of the alumni association", website: "https://aiu.edu.sd", isActive: true, type: "partner" },
        { nameAr: "شركة سوداتل", nameEn: "Sudatel", descriptionAr: "شريك تقني رئيسي", descriptionEn: "Main technology partner", website: "https://sudatel.net", isActive: true, type: "sponsor" },
        { nameAr: "بنك فيصل الإسلامي", nameEn: "Faisal Islamic Bank", descriptionAr: "بنك رائد يدعم مشاريع الخريجين", descriptionEn: "Leading bank supporting alumni projects", website: "https://example.com", isActive: true, type: "partner" },
        { nameAr: "منظمة الشباب الأفريقي", nameEn: "African Youth Organization", descriptionAr: "منظمة دولية تدعم برامج الشباب", descriptionEn: "International organization supporting youth programs", website: "https://example.com", isActive: true, type: "partner" },
      ];
      for (const p of partners) {
        await prisma.partner.create({ data: p });
      }
      results.partners = partners.length;
    }

    // 8. Secretariat Members
    const secCount = await prisma.secretariatMember.count();
    if (secCount === 0) {
      const secs = [
        { nameAr: "أ. أحمد محمد صالح", nameEn: "Mr. Ahmed Mohamed Saleh", roleAr: "مدير المكتب", roleEn: "Office Manager", email: "ahmed@aiuag.org", order: 1, isActive: true },
        { nameAr: "أ. مريم عبدالرحمن", nameEn: "Ms. Mariam Abdelrahman", roleAr: "منسقة البرامج", roleEn: "Programs Coordinator", email: "mariam@aiuag.org", order: 2, isActive: true },
        { nameAr: "م. عمر حسن إبراهيم", nameEn: "Eng. Omar Hassan Ibrahim", roleAr: "مسؤول تقني", roleEn: "IT Officer", email: "omar@aiuag.org", order: 3, isActive: true },
      ];
      for (const s of secs) {
        await prisma.secretariatMember.create({ data: s });
      }
      results.secretariats = secs.length;
    }

    // 9. News (additional)
    const newsCount = await prisma.news.count();
    if (newsCount < 5) {
      const now = new Date();
      const extraNews = [
        { titleAr: "انطلاق برنامج الإرشاد الأكاديمي الجديد", titleEn: "Launch of New Academic Mentoring Program", slug: "new-mentoring-program", contentAr: "<p>أعلنت رابطة خريجي جامعة أفريقيا العالمية عن انطلاق برنامج الإرشاد الأكاديمي الجديد الذي يهدف لربط الخريجين المتميزين بالطلاب الحاليين.</p>", contentEn: "<p>AIUAG announced the launch of a new academic mentoring program linking distinguished alumni with current students.</p>", excerptAr: "برنامج جديد يربط الخريجين بالطلاب للإرشاد الأكاديمي", excerptEn: "A new program connecting alumni with students for academic mentoring", category: "programs" },
        { titleAr: "إنجاز خريج في مؤتمر دولي", titleEn: "Alumni Achievement at International Conference", slug: "alumni-international-achievement", contentAr: "<p>حصد الخريج محمد أحمد على جائزة أفضل بحث في المؤتمر الدولي للتقنية المعلوماتية.</p>", contentEn: "<p>Alumni Mohamed Ahmed won the best paper award at the international IT conference.</p>", excerptAr: "خريج يحصل على جائزة أفضل بحث دولية", excerptEn: "Alumni wins international best paper award", category: "achievements" },
        { titleAr: "شراكة جديدة مع شركة تقنية عالمية", titleEn: "New Partnership with Global Tech Company", slug: "new-tech-partnership", contentAr: "<p>وقعت رابطة الخريجيين اتفاقية شراكة مع شركة تقنية عالمية لتقنيات التدريب والتطوير.</p>", contentEn: "<p>The alumni association signed a partnership agreement with a global tech company for training and development technologies.</p>", excerptAr: "شراكة استراتيجية مع شركة عالمية", excerptEn: "Strategic partnership with a global company", category: "partnerships" },
      ];
      for (const n of extraNews) {
        const slugExists = await prisma.news.findUnique({ where: { slug: n.slug } });
        if (!slugExists) {
          await prisma.news.create({ data: { ...n, authorId: admin.id, status: "published", publishedAt: now } });
        }
      }
      results.news = extraNews.length;
    }

    // 10. Gallery (additional with video type)
    const galCount = await prisma.gallery.count();
    if (galCount < 15) {
      const extras = [
        { title: "فيديو المؤتمر الدولي", description: "فيديو يوثق المؤتمر الدولي الأول", type: "video", fileUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", imageUrl: "/images/gallery/placeholder.jpg", album: "conferences", tags: "فيديو,مؤتمر" },
        { title: "وثائقي عن الرابطة", description: "فيلم وثائقي عن تاريخ وإنجازات الرابطة", type: "video", fileUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", imageUrl: "/images/gallery/placeholder2.jpg", album: "general", tags: "وثائقي,رابطة" },
        { title: "تقرير سنوي 2024", description: "التقرير السنوي الرسمي للرابطة", type: "document", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", imageUrl: "/images/gallery/placeholder3.jpg", album: "reports", tags: "تقرير,سنوي" },
      ];
      for (const item of extras) {
        await prisma.gallery.create({ data: { ...item, thumbnailUrl: null, authorId: admin.id, isActive: true } });
      }
      results.gallery = extras.length;
    }

    // 11. Posts (sample for the social feed)
    const postCount = await prisma.post.count();
    if (postCount === 0) {
      const members = await prisma.member.findMany({ take: 3, include: { user: true } });
      if (members.length > 0) {
        const posts = [
          { content: "يسعدني أن أكون جزءاً من مجتمع خريجي جامعة أفريقيا العالمية. تمنياتي للجميع بالتوفيق والنجاح في مسيرتهم المهنية!", authorId: members[0]?.id },
          { content: "أعلن عن نجاحي في الحصول على وظيفة جديدة في شركة تقنية عالمية. شكراً جزيلاً لرابطة الخريجين على الدعم والمساعدة في رحلة البحث عن العمل.", authorId: members[Math.min(1, members.length - 1)]?.id },
          { content: "مؤتمر الخريجين السنوي كان رائعاً! شكراً لكل من ساهم في تنظيم هذا الحدث المميز. نتطلع للمؤتمر القادم.", authorId: members[Math.min(2, members.length - 1)]?.id },
        ];
        for (const p of posts) {
          if (p.authorId) {
            await prisma.post.create({ data: p });
          }
        }
        results.posts = posts.length;
      }
    }

    // 12. Publications (NEW - was missing entirely)
    const pubCount = await prisma.publication.count();
    if (pubCount === 0) {
      const publications = [
        { title: "التقرير السنوي لرابطة الخريجين 2024", titleEn: "AIUAG Annual Report 2024", description: "التقرير السنوي الشامل لأنشطة وإنجازات رابطة خريجي جامعة أفريقيا العالمية للمالية 2024.", category: "report", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
        { title: "دراسة: سوق العمل للخريجين 2024", titleEn: "Study: Alumni Employment Market 2024", description: "دراسة مفصلة عن وظائف الخريجين وسوق العمل في السودان وأفريقيا.", category: "research", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
        { title: "دليل الخريج الجديد", titleEn: "New Alumni Guide", description: "دليل شامل للخريجين الجدد يتضمن معلومات عن خدمات الرابطة والفرص المتاحة.", category: "guide", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
        { title: "نشرة الرابطة الفصلية -🇶1 2024", titleEn: "AIUAG Quarterly Newsletter - Q1 2024", description: "النشرة الفصلية للرابطة تحتوي على آخر الأخبار والفعاليات والإنجازات.", category: "newsletter", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
        { title: "تقرير مؤتمر الخريجين السنوي 2024", titleEn: "Annual Alumni Conference Report 2024", description: "تقرير مفصل عن المؤتمر السنوي الخامس لرابطة الخريجين.", category: "report", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
        { title: "بحث: أثر التحول الرقمي على التعليم العالي", titleEn: "Research: Impact of Digital Transformation on Higher Education", description: "بحث أكاديمي يستعرض أثر التحول الرقمي على جامعات أفريقيا.", category: "research", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      ];
      for (const p of publications) {
        await prisma.publication.create({ data: { ...p, authorId: admin.id } });
      }
      results.publications = publications.length;
    }

    return NextResponse.json({ success: true, ...results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Seed error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
