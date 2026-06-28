const { PrismaClient } = require('../node_modules/.prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aiuag.com' },
    update: {},
    create: {
      email: 'admin@aiuag.com',
      name: 'مدير النظام',
      password: 'admin123',
      role: 'admin',
    },
  });
  console.log('Admin user:', admin.id);

  // Create moderator user
  const mod = await prisma.user.upsert({
    where: { email: 'mod@aiuag.com' },
    update: {},
    create: {
      email: 'mod@aiuag.com',
      name: 'المشرف',
      password: 'mod123',
      role: 'moderator',
    },
  });
  console.log('Moderator user:', mod.id);

  // Create sample member user
  const memberUser = await prisma.user.upsert({
    where: { email: 'member@aiuag.com' },
    update: {},
    create: {
      email: 'member@aiuag.com',
      name: 'أحمد محمد',
      password: 'member123',
      role: 'member',
    },
  });

  // Create member profile
  await prisma.member.upsert({
    where: { userId: memberUser.id },
    update: {},
    create: {
      userId: memberUser.id,
      studentId: 'CS-2020-001',
      membershipNumber: 'M-001',
      graduationYear: 2020,
      faculty: '计算机科学',
      department: 'هندسة البرمجيات',
      phone: '+249123456789',
      address: 'الخرطوم، السودان',
      status: 'approved',
      bio: 'خريج كلية الحاسوب',
    },
  });
  console.log('Member user created');

  // Create news
  const newsItems = [
    {
      titleAr: 'افتتاح مقر الرابطة الجديد',
      titleEn: 'New Headquarters Opening',
      slug: 'new-hq-opening',
      contentAr: 'تم افتتاح المقر الجديد لرابطة خريجي جامعة أفريقيا العالمية في حفل رسمي حضره عدد كبير من الخريجين والضيوف.',
      contentEn: 'The new headquarters of AIUAG was officially opened in a ceremony attended by many graduates and guests.',
      excerptAr: 'افتتاح مقر الرابطة الجديد',
      excerptEn: 'New HQ Opening',
      status: 'published',
      category: 'announcement',
      authorId: admin.id,
      publishedAt: new Date(),
    },
    {
      titleAr: 'دورة تدريبية في الذكاء الاصطناعي',
      titleEn: 'AI Training Workshop',
      slug: 'ai-workshop-2026',
      contentAr: 'تنظم الرابطة دورة تدريبية حول تطبيقات الذكاء الاصطناعي في سوق العمل السوداني.',
      contentEn: 'The association is organizing a training course on AI applications in the Sudanese job market.',
      excerptAr: 'دورة تدريبية في الذكاء الاصطناعي',
      excerptEn: 'AI Training Workshop',
      status: 'published',
      category: 'training',
      authorId: admin.id,
      publishedAt: new Date(),
    },
    {
      titleAr: 'نتائج الانتخابات الجديدة',
      titleEn: 'Election Results',
      slug: 'election-results-2026',
      contentAr: 'أعلنت اللجنة المشرفة على الانتخابات عن النتائج النهائية لمجلس الإدارة الجديد للرابطة.',
      contentEn: 'The election committee announced the final results for the new board of directors.',
      excerptAr: 'نتائج الانتخابات',
      excerptEn: 'Election Results',
      status: 'published',
      category: 'announcement',
      authorId: admin.id,
      publishedAt: new Date(),
    },
  ];

  for (const item of newsItems) {
    await prisma.news.upsert({
      where: { slug: item.slug },
      update: {},
      create: item,
    });
  }
  console.log('News items created');

  // Create events
  const eventItems = [
    {
      titleAr: 'مؤتمر الخريجين السنوي 2026',
      titleEn: 'Annual Alumni Conference 2026',
      slug: 'annual-conference-2026',
      descriptionAr: 'المؤتمر السنوي الذي يجمع خريجي جامعة أفريقيا العالمية لمناقشة المستجدات والتحديات.',
      descriptionEn: 'The annual conference bringing together AIU graduates to discuss updates and challenges.',
      location: 'قاعة المؤتمرات - الخطوم',
      date: new Date('2026-09-15T09:00:00Z'),
      time: '09:00',
      endTime: '17:00',
      status: 'upcoming',
      category: 'conference',
    },
    {
      titleAr: 'ورشة عمل بناء السيرة الذاتية',
      titleEn: 'CV Building Workshop',
      slug: 'cv-workshop-2026',
      descriptionAr: 'ورشة عملية لبناء سيرة ذاتية احترافية ومهارات المقابلات الشخصية.',
      descriptionEn: 'Practical workshop on building professional CVs and interview skills.',
      location: 'مركز التدريب - الخرطوم',
      date: new Date('2026-08-10T14:00:00Z'),
      time: '14:00',
      endTime: '17:00',
      status: 'upcoming',
      category: 'workshop',
    },
  ];

  for (const item of eventItems) {
    await prisma.event.upsert({
      where: { slug: item.slug },
      update: {},
      create: item,
    });
  }
  console.log('Events created');

  // Create board members
  const boardItems = [
    {
      nameAr: 'د. عبدالله أحمد',
      nameEn: 'Dr. Abdullah Ahmed',
      positionAr: 'رئيس مجلس الإدارة',
      positionEn: 'Chairman of the Board',
      bioAr: 'أكاديمي وباحث في مجال تكنولوجيا المعلومات',
      bioEn: 'Academic and researcher in IT',
      email: 'abdullah@aiuag.com',
      order: 1,
      term: '2024-2027',
    },
    {
      nameAr: 'م. سارة محمد',
      nameEn: 'Eng. Sara Mohamed',
      positionAr: 'نائب الرئيس',
      positionEn: 'Vice Chairman',
      bioAr: 'مهندسة برمجيات تعمل في شركة تقنية عالمية',
      bioEn: 'Software engineer at a global tech company',
      email: 'sara@aiuag.com',
      order: 2,
      term: '2024-2027',
    },
    {
      nameAr: 'أ. عمر حسن',
      nameEn: 'Mr. Omar Hassan',
      positionAr: 'الأمين العام',
      positionEn: 'Secretary General',
      bioAr: 'خبير في إدارة المشاريع والمنظمات',
      bioEn: 'Expert in project and organization management',
      email: 'omar@aiuag.com',
      order: 3,
      term: '2024-2027',
    },
  ];

  for (let i = 0; i < boardItems.length; i++) {
    const item = boardItems[i];
    await prisma.boardMember.create({
      data: item,
    });
  }
  console.log('Board members created');

  // Create committees
  const committeeItems = [
    {
      nameAr: 'اللجنة العلمية',
      nameEn: 'Academic Committee',
      slug: 'academic-committee',
      descriptionAr: 'الإشراف على البرامج العلمية والتدريبية',
      descriptionEn: 'Overseeing academic and training programs',
      type: 'standing',
      chairNameAr: 'د. أحمد علي',
      chairNameEn: 'Dr. Ahmed Ali',
      email: 'academic@aiuag.com',
      order: 1,
    },
    {
      nameAr: 'اللجنة الاجتماعية',
      nameEn: 'Social Committee',
      slug: 'social-committee',
      descriptionAr: 'تنظيم الفعاليات الاجتماعية والتراثية',
      descriptionEn: 'Organizing social and cultural events',
      type: 'standing',
      chairNameAr: 'أ. فاطمة خالد',
      chairNameEn: 'Ms. Fatima Khalid',
      email: 'social@aiuag.com',
      order: 2,
    },
  ];

  for (const item of committeeItems) {
    await prisma.committee.upsert({
      where: { slug: item.slug },
      update: {},
      create: item,
    });
  }
  console.log('Committees created');

  // Create partners
  const partnerItems = [
    {
      nameAr: 'جامعة أفريقيا العالمية',
      nameEn: 'Africa International University',
      website: 'https://aiu.edu.sd',
      descriptionAr: 'الجامعة الأم لرابطة الخريجين',
      descriptionEn: 'The parent university of the alumni association',
      type: 'partner',
      order: 1,
    },
    {
      nameAr: 'شركة Sudatel',
      nameEn: 'Sudatel',
      website: 'https://sudatel.net',
      descriptionAr: 'شريك تقني رئيسي',
      descriptionEn: 'Main technology partner',
      type: 'sponsor',
      order: 2,
    },
  ];

  for (const item of partnerItems) {
    const existing = await prisma.partner.findFirst({ where: { nameAr: item.nameAr } });
    if (!existing) {
      await prisma.partner.create({ data: item });
    }
  }
  console.log('Partners created');

  // Create FAQs
  const faqItems = [
    {
      questionAr: 'كيف يمكنني الانضمام للرابطة؟',
      questionEn: 'How can I join the association?',
      answerAr: 'يمكنك التسجيل عبر صفحة الانضمام على الموقع وتقديم طلب العضوية.',
      answerEn: 'You can register through the membership page on the website and submit a membership application.',
      category: 'membership',
      order: 1,
    },
    {
      questionAr: 'ما هي شروط العضوية؟',
      questionEn: 'What are the membership requirements?',
      answerAr: 'يجب أن تكون خريجًا من جامعة أفريقيا العالمية ولديك إثبات التخرج.',
      answerEn: 'You must be a graduate of Africa International University with proof of graduation.',
      category: 'membership',
      order: 2,
    },
    {
      questionAr: 'هل يمكن للطلاب الحاليين الانضمام؟',
      questionEn: 'Can current students join?',
      answerAr: 'الرابطة مخصصة للخريجين فقط، لكن الطلاب يمكنهم المشاركة في بعض الفعاليات.',
      answerEn: 'The association is for graduates only, but students can participate in some events.',
      category: 'membership',
      order: 3,
    },
  ];

  for (const item of faqItems) {
    await prisma.fAQ.create({
      data: item,
    });
  }
  console.log('FAQs created');

  // Create sample projects
  const projectItems = [
    {
      titleAr: 'مبادرة التوظيف المباشر',
      titleEn: 'Direct Employment Initiative',
      slug: 'employment-initiative',
      descriptionAr: 'مبادرة لربط الخريجين بفرص العمل في الشركات والمؤسسات الكبرى.',
      descriptionEn: 'An initiative to connect graduates with job opportunities at major companies and organizations.',
      status: 'active',
      category: 'employment',
    },
    {
      titleAr: 'مشروع المكتبة الرقمية',
      titleEn: 'Digital Library Project',
      slug: 'digital-library',
      descriptionAr: 'إنشاء مكتبة رقمية تحتوي على مراجع وأبحاث الخريجين.',
      descriptionEn: 'Creating a digital library containing graduate references and research.',
      status: 'active',
      category: 'education',
    },
  ];

  for (const item of projectItems) {
    await prisma.project.upsert({
      where: { slug: item.slug },
      update: {},
      create: item,
    });
  }
  console.log('Projects created');

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
