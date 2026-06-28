import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding gallery and news...");

  // Get the first admin user to be the author
  const admin = await prisma.user.findFirst({ where: { role: "admin" } });
  if (!admin) {
    console.error("No admin user found. Please create an admin first.");
    return;
  }
  console.log(`Using admin: ${admin.name} (${admin.id})`);

  // ========== SEED GALLERY ==========
  const existingGallery = await prisma.gallery.count();
  if (existingGallery === 0) {
    const galleryItems = [
      { title: "حفل التخرج 2023", description: "حفل تخرج دفعة 2023 من جامعة أفريقيا العالمية", type: "image", imageUrl: "/uploads/gallery/alumni-event-2023-01.jpeg", album: "events", tags: "تخرج,2023" },
      { title: "المؤتمر السنوي", description: "افتتاح المؤتمر السنوي لرابطة الخريجين", type: "image", imageUrl: "/uploads/gallery/alumni-event-2023-05.jpeg", album: "conferences", tags: "مؤتمر" },
      { title: "ورشة العمل البحثية", description: "ورشة عمل حول مناهج البحث العلمي", type: "image", imageUrl: "/uploads/gallery/alumni-event-2023-10.jpeg", album: "events", tags: "ورشة,بحث" },
      { title: "لقاء الخريجين", description: "لقاء تواصلي مع خريجي الجامعة", type: "image", imageUrl: "/uploads/gallery/alumni-event-2023-15.jpeg", album: "events", tags: "لقاء,خريجين" },
      { title: "الحرم الجامعي", description: "مناظر جميلة من حرم الجامعة", type: "image", imageUrl: "/uploads/gallery/alumni-event-2023-20.jpeg", album: "campus", tags: "حرم,جامعة" },
      { title: "نشاط طلابي", description: "الأنشطة الطلابية المتنوعة", type: "image", imageUrl: "/uploads/gallery/alumni-event-2023-25.jpeg", album: "general", tags: "نشاط,طلاب" },
      { title: "مؤتمر التقنية", description: "مؤتمر التقنية الحديثة والذكاء الاصطناعي", type: "image", imageUrl: "/uploads/projects/1782278813617-5b6i4x.jpg", album: "conferences", tags: "تقنية,ذكاء_اصطناعي" },
      { title: "مشروع تخرج", description: "عرض مشاريع التخرج للطلاب", type: "image", imageUrl: "/uploads/projects/1782263742971-qctx76.jpg", album: "general", tags: "مشروع,تخرج" },
    ];

    for (const item of galleryItems) {
      await prisma.gallery.create({
        data: {
          title: item.title,
          description: item.description,
          type: item.type,
          imageUrl: item.imageUrl,
          fileUrl: null,
          thumbnailUrl: null,
          album: item.album,
          tags: item.tags,
          authorId: admin.id,
          isActive: true,
        },
      });
    }
    console.log(`Created ${galleryItems.length} gallery items`);
  } else {
    console.log(`Gallery already has ${existingGallery} items, skipping`);
  }

  // ========== SEED NEWS ==========
  const existingNews = await prisma.news.count();
  if (existingNews === 0) {
    const newsItems = [
      {
        titleAr: "افتتاح المؤتمر الدولي الأول لرابطة الخريجين",
        titleEn: "Opening of the First International Conference of the Alumni Association",
        slug: "first-international-conference-2024",
        contentAr: `<p>افتتح المؤتمر الدولي الأول لرابطة خريجي جامعة أفريقيا العالمية بحضور أكثر من 500 خريج من مختلف الدول العربية والأفريقية. تناول المؤتمر عدة محاور تتعلق بمستقبل التعليم العالي في أفريقيا ودور الخريجين في التنمية المستدامة.</p>
<p>شهد المؤتمر عرضاًForResultات البحث العلمي التي أجراها خريجو الجامعة في مجالات الذكاء الاصطناعي والطاقة المتجددة والتنمية المجتمعية. كما تم تكريم نخبة من المتميزينamong الخريجين الذين أسهموا في בנاء المجتمع الأهلي.</p>
<p>اختتم المؤتمر بوضع خطة عمل مشتركة لتعزيز التعاون بين الخريجين والجامعة في المجالات الأكاديمية والمهنية والبحثية.</p>`,
        contentEn: `<p>The first international conference of the AIUAG Alumni Association was inaugurated with the attendance of over 500 graduates from various Arab and African countries.</p>
<p>The conference addressed several topics related to the future of higher education in Africa and the role of graduates in sustainable development.</p>`,
        excerptAr: "مؤتمر دولي بمشاركة أكثر من 500 خريج من 15 دولة لمناقشة مستقبل التعليم العالي في أفريقيا",
        excerptEn: "An international conference with over 500 graduates from 15 countries discussing the future of higher education in Africa",
        featuredImage: "/uploads/gallery/alumni-event-2023-05.jpeg",
        category: "conferences",
        tags: "مؤتمر,دولي,تعليم",
        status: "published",
      },
      {
        titleAr: "برنامج التدريب المهني للخريجين الجدد",
        titleEn: "Professional Training Program for New Graduates",
        slug: "professional-training-program-new-graduates",
        contentAr: `<p>أعلنت رابطة خريجي جامعة أفريقيا العالمية عن إطلاق برنامج التدريب المهني الجديد للخريجين الحاصلين على الشهادات في عام 2024. يهدف البرنامج إلى تأهيل الخريجين لسوق العمل من خلال دورات تدريبية عملية في مجالات متعددة.</p>
<p>يشمل البرنامج تدريبات في إدارة الأعمال والتسويق الرقمي والبرمجة وتصميم المواقع الإلكترونية. كما يوفر البرنامج فرصاً للتدريب في الشركات الرائدة في السودان وخارجها.</p>
<p>يمكن للخريجين المتقدمين للبرنامج من خلال portal الخريجين على الموقع الإلكتروني للرابطة. المدة التدريبية ثلاثة أشهر مع إمكانية التوظيف بعدها.</p>`,
        contentEn: `<p>The AIUAG Alumni Association announced the launch of a new professional training program for graduates who obtained their degrees in 2024.</p>
<p>The program aims to qualify graduates for the job market through practical training courses in multiple fields.</p>`,
        excerptAr: "برنامج تدريب مدته 3 أشهر يشمل إدارة أعمال وتسويق رقمي وبرمجة مع فرص توظيف",
        excerptEn: "A 3-month training program covering business management, digital marketing, and programming with employment opportunities",
        featuredImage: "/uploads/gallery/alumni-event-2023-10.jpeg",
        category: "workshops",
        tags: "تدريب,مهني,خريجين",
        status: "published",
      },
      {
        titleAr: "حملة التبرع لبناء مكتبة الجامعة الجديدة",
        titleEn: "Fundraising Campaign for Building the New University Library",
        slug: "fundraising-campaign-new-university-library",
        contentAr: `<p>أطلقت الرابطة حملة تبرعات موسعة لبناء مكتبة جديدة مجهزة بأحدث التقنيات لخدمة الطلاب والباحثين. تهدف الحملة إلى جمع مبلغ مليون دولار لتمويل المشروع الذي سيبدأ في الربع الأول من عام 2025.</p>
<p>ستتضمن المكتبة الجديدة قاعات للقراءة والبحث ومختبرات للحوسبة وال的学习 الرقمي. كما ستوفر قسماً خاصاً بالأرشيف الرقمي للمؤلفات الأفريقية والعربية.</p>
<p>دعت الرابطة جميع الخريجين والشركات الراعية للمساهمة في هذا المشروع التنموي الذي يخدم الأجيال المقبلة من الطلاب والباحثين.</p>`,
        contentEn: `<p>The Association launched an extensive fundraising campaign to build a new library equipped with the latest technologies to serve students and researchers.</p>
<p>The new library will include reading halls, research labs, and a special section for the digital archive of African and Arab publications.</p>`,
        excerptAr: "حملة لجمع مليون دولار لبناء مكتبة مجهزة بأحدث التقنيات تخدم الطلاب والباحثين",
        excerptEn: "A campaign to raise one million dollars to build a state-of-the-art library for students and researchers",
        featuredImage: "/uploads/general/1782565575771-j3dh1v.jpg",
        category: "projects",
        tags: "مكتبة,تبرع,مشروع",
        status: "published",
      },
    ];

    for (const item of newsItems) {
      await prisma.news.create({
        data: {
          titleAr: item.titleAr,
          titleEn: item.titleEn,
          slug: item.slug,
          contentAr: item.contentAr,
          contentEn: item.contentEn,
          excerptAr: item.excerptAr,
          excerptEn: item.excerptEn,
          featuredImage: item.featuredImage,
          authorId: admin.id,
          status: item.status,
          category: item.category,
          tags: item.tags,
          publishedAt: new Date(),
        },
      });
    }
    console.log(`Created ${newsItems.length} news items`);
  } else {
    console.log(`News already has ${existingNews} items, skipping`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
