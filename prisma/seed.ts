import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("Seeding database...");

  const adminPassword = await hashPassword("admin123");

  // 1. Admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@aiuag.org" },
    update: {},
    create: {
      email: "admin@aiuag.org",
      name: "Admin",
      password: adminPassword,
      role: "admin",
      emailVerified: new Date(),
    },
  });
  console.log("Admin user created:", admin.email);

  // 2. Board members based on AIUAG executive office
  const boardMembers = [
    {
      nameAr: "د. محمد أحمد حمد الخطيب",
      nameEn: "Dr. Mohammed Ahmed Hamad Al-Khatib",
      positionAr: "رئيس مجلس الإدارة",
      positionEn: "President of the Board",
      bioAr: "رئيس مجلس إدارة اتحاد خريجي الجامعة الأمريكية في الإمارات. يتمتع بخبرة واسعة في مجالات ريادة الأعمال والتطوير المجتمعي.",
      bioEn: "President of the American University in Emirates Graduates Union. Extensive experience in entrepreneurship and community development.",
      order: 1,
      term: "2024-2026",
    },
    {
      nameAr: "د. سعيد بن خالد الراشدي",
      nameEn: "Dr. Saeed bin Khalid Al-Rashidi",
      positionAr: "نائب رئيس مجلس الإدارة",
      positionEn: "Vice President of the Board",
      bioAr: "نائب الرئيس، خبير في مجالات الإدارة الاستراتيجية وتطوير المؤسسات.",
      bioEn: "Vice President, expert in strategic management and institutional development.",
      order: 2,
      term: "2024-2026",
    },
    {
      nameAr: "أ. فاطمة علي المحمود",
      nameEn: "Ms. Fatima Ali Al-Mahmoud",
      positionAr: "أمينة عام المجلس",
      positionEn: "Board Secretary",
      bioAr: "أمينة عامة مختصة في الشؤون الإدارية والتنظيمية.",
      bioEn: "Secretary General specializing in administrative and organizational affairs.",
      order: 3,
      term: "2024-2026",
    },
    {
      nameAr: "د. أحمد محمد البوسعيدي",
      nameEn: "Dr. Ahmed Mohammed Al-Busaidi",
      positionAr: "عضو مجلس الإدارة",
      positionEn: "Board Member",
      bioAr: "عضو مجلس، خبير في مجالات التمويل وإدارة الأعمال.",
      bioEn: "Board member, expert in finance and business management.",
      order: 4,
      term: "2024-2026",
    },
    {
      nameAr: "د. نورة سعيد الفلاسي",
      nameEn: "Dr. Noura Saeed Al-Falasi",
      positionAr: "عضو مجلس الإدارة",
      positionEn: "Board Member",
      bioAr: "عضو مجلس، متخصصة في مجالات التعليم والتطوير المهني.",
      bioEn: "Board member, specializing in education and professional development.",
      order: 5,
      term: "2024-2026",
    },
    {
      nameAr: "أ. خالد عبيد الكندي",
      nameEn: "Mr. Khaled Obaid Al-Kindi",
      positionAr: "عضو مجلس الإدارة",
      positionEn: "Board Member",
      bioAr: "عضو مجلس، متخصص في مجالات التسويق الرقمي والתקשורת.",
      bioEn: "Board member, specializing in digital marketing and communications.",
      order: 6,
      term: "2024-2026",
    },
    {
      nameAr: "د. مريم حسن الشامسي",
      nameEn: "Dr. Maryam Hassan Al-Shamsi",
      positionAr: "عضو مجلس الإدارة",
      positionEn: "Board Member",
      bioAr: "عضو مجلس، خبرة في مجالات البحث العلمي والتطوير الأكاديمي.",
      bioEn: "Board member, experience in scientific research and academic development.",
      order: 7,
      term: "2024-2026",
    },
    {
      nameAr: "أ. عبدالله يوسف المنصوري",
      nameEn: "Mr. Abdullah Yousuf Al-Mansouri",
      positionAr: "عضو مجلس الإدارة",
      positionEn: "Board Member",
      bioAr: "عضو مجلس، متخصص في مجالات ريادة الأعمال والابتكار.",
      bioEn: "Board member, specializing in entrepreneurship and innovation.",
      order: 8,
      term: "2024-2026",
    },
  ];

  for (const member of boardMembers) {
    await prisma.boardMember.upsert({
      where: { id: member.nameEn },
      update: {},
      create: {
        ...member,
        isActive: true,
      },
    });
  }
  console.log("Board members created:", boardMembers.length);

  // 3. Committees
  const committees = [
    {
      nameAr: "اللجنة الدائمة للعضوية",
      nameEn: "Standing Committee for Membership",
      slug: "membership-committee",
      descriptionAr: "اللجنة المسؤولة عن إدارة شؤون الأعضاء والعضوية في الاتحاد.",
      descriptionEn: "Committee responsible for managing member affairs and union membership.",
      type: "standing",
      chairNameAr: "د. سعيد بن خالد الراشدي",
      chairNameEn: "Dr. Saeed bin Khalid Al-Rashidi",
      email: "membership@aiuag.org",
      order: 1,
    },
    {
      nameAr: "اللجنة الدائمة للأنشطة والفعاليات",
      nameEn: "Standing Committee for Activities and Events",
      slug: "activities-committee",
      descriptionAr: "اللجنة المسؤولة عن تنظيم الفعاليات والأنشطة المختلفة للاتحاد.",
      descriptionEn: "Committee responsible for organizing various union activities and events.",
      type: "standing",
      chairNameAr: "أ. فاطمة علي المحمود",
      chairNameEn: "Ms. Fatima Ali Al-Mahmoud",
      email: "activities@aiuag.org",
      order: 2,
    },
    {
      nameAr: "اللجنة الدائمة للتطوير والمشاريع",
      nameEn: "Standing Committee for Development and Projects",
      slug: "development-committee",
      descriptionAr: "اللجنة المسؤولة عن تطوير مشاريع الاتحاد ومبادراته التنموية.",
      descriptionEn: "Committee responsible for developing union projects and developmental initiatives.",
      type: "standing",
      chairNameAr: "د. أحمد محمد البوسعيدي",
      chairNameEn: "Dr. Ahmed Mohammed Al-Busaidi",
      email: "development@aiuag.org",
      order: 3,
    },
    {
      nameAr: "اللجنة الدائمة للإعلام والاتصالات",
      nameEn: "Standing Committee for Media and Communications",
      slug: "media-committee",
      descriptionAr: "اللجنة المسؤولة عن التواصلا مع الأعضاء والمجتمع والإعلام.",
      descriptionEn: "Committee responsible for communicating with members, community, and media.",
      type: "standing",
      chairNameAr: "أ. خالد عبيد الكندي",
      chairNameEn: "Mr. Khaled Obaid Al-Kindi",
      email: "media@aiuag.org",
      order: 4,
    },
    {
      nameAr: "اللجنة الدائمة للشئون المالية والإدارية",
      nameEn: "Standing Committee for Financial and Administrative Affairs",
      slug: "finance-committee",
      descriptionAr: "اللجنة المسؤولة عن الشؤون المالية والإدارية في الاتحاد.",
      descriptionEn: "Committee responsible for financial and administrative affairs of the union.",
      type: "standing",
      chairNameAr: "د. نورة سعيد الفلاسي",
      chairNameEn: "Dr. Noura Saeed Al-Falasi",
      email: "finance@aiuag.org",
      order: 5,
    },
    {
      nameAr: "اللجنة الدائمة للبحث العلمي والتطوير",
      nameEn: "Standing Committee for Research and Development",
      slug: "research-committee",
      descriptionAr: "اللجنة المسؤولة عن الأبحاث العلمية ومبادرات التطوير.",
      descriptionEn: "Committee responsible for scientific research and development initiatives.",
      type: "standing",
      chairNameAr: "د. مريم حسن الشامسي",
      chairNameEn: "Dr. Maryam Hassan Al-Shamsi",
      email: "research@aiuag.org",
      order: 6,
    },
    {
      nameAr: "اللجنة الدائمة لريادة الأعمال والابتكار",
      nameEn: "Standing Committee for Entrepreneurship and Innovation",
      slug: "entrepreneurship-committee",
      descriptionAr: "اللجنة المسؤولة عن دعم ريادة الأعمال والابتكار بين الخريجين.",
      descriptionEn: "Committee responsible for supporting entrepreneurship and innovation among graduates.",
      type: "standing",
      chairNameAr: "أ. عبدالله يوسف المنصوري",
      chairNameEn: "Mr. Abdullah Yousuf Al-Mansouri",
      email: "entrepreneurship@aiuag.org",
      order: 7,
    },
  ];

  for (const committee of committees) {
    await prisma.committee.upsert({
      where: { slug: committee.slug },
      update: {},
      create: {
        ...committee,
        isActive: true,
      },
    });
  }
  console.log("Committees created:", committees.length);

  // 4. FAQs
  const faqs = [
    {
      questionAr: "ما هو اتحاد خريجي الجامعة الأمريكية في الإمارات؟",
      questionEn: "What is the American University in Emirates Graduates Union?",
      answerAr: "اتحاد خريجي الجامعة الأمريكية في الإمارات هو مؤسسة تضم جميع خريجي الجامعة، ويهدف إلى تعزيز التواصل بين الخريجين ودعم التنمية المهنية والمجتمعية.",
      answerEn: "The American University in Emirates Graduates Union is an institution that brings together all university graduates, aiming to enhance communication between graduates and support professional and community development.",
      category: "about",
      order: 1,
    },
    {
      questionAr: "كيف يمكنني الانضمام إلى الاتحاد؟",
      questionEn: "How can I join the union?",
      answerAr: "يمكنك الانضمام إلى الاتحاد من خلال زيارة موقعنا الإلكتروني وملء نموذج العضوية. يتم مراجعة الطلبات من قبل اللجنة المختصة والموافقة عليها.",
      answerEn: "You can join the union by visiting our website and filling out the membership form. Applications are reviewed and approved by the relevant committee.",
      category: "membership",
      order: 2,
    },
    {
      questionAr: "ما هي فوائد العضوية في الاتحاد؟",
      questionEn: "What are the benefits of union membership?",
      answerAr: "تشمل فوائد العضوية المشاركة في الفعاليات والحصول على خصومات مع شركاء الاتحاد، والدعم المهني، والوصول إلى شبكة واسعة من الخريجين.",
      answerEn: "Membership benefits include participation in events, discounts with union partners, professional support, and access to a wide network of graduates.",
      category: "membership",
      order: 3,
    },
    {
      questionAr: "كيف يمكنني التواصل مع الاتحاد؟",
      questionEn: "How can I contact the union?",
      answerAr: "يمكنك التواصل معنا من خلال نموذج الاتصال على موقعنا الإلكتروني، أو عبر البريد الإلكتروني info@aiuag.org، أو من خلال وسائل التواصل الاجتماعي.",
      answerEn: "You can contact us through the contact form on our website, via email at info@aiuag.org, or through social media.",
      category: "contact",
      order: 4,
    },
    {
      questionAr: "ما هي أنشطة الاتحاد الرئيسية؟",
      questionEn: "What are the main activities of the union?",
      answerAr: "تنظم الاتحاد مجموعة متنوعة من الأنشطة تشمل الفعاليات الاجتماعية والأكاديمية والمهنية، وورش العمل، والمحاضرات، والرحلات.",
      answerEn: "The union organizes a variety of activities including social, academic, and professional events, workshops, lectures, and trips.",
      category: "activities",
      order: 5,
    },
    {
      questionAr: "هل يمكنني التبرع لصالح الاتحاد؟",
      questionEn: "Can I make a donation to the union?",
      answerAr: "نعم، يمكنك التبرع لصالح الاتحاد من خلال صفحة التبرعات على موقعنا الإلكتروني. جميع التبرعات تُستخدم لدعم أنشطة ومشاريع الاتحاد.",
      answerEn: "Yes, you can donate to the union through the donations page on our website. All donations are used to support union activities and projects.",
      category: "donations",
      order: 6,
    },
    {
      questionAr: "كيف يمكنني تحديث بياناتي الشخصية؟",
      questionEn: "How can I update my personal information?",
      answerAr: "يمكنك تحديث بياناتك الشخصية من خلال تسجيل الدخول إلى حسابك على موقعنا الإلكتروني والذهاب إلى قسم الملف الشخصي.",
      answerEn: "You can update your personal information by logging into your account on our website and going to the profile section.",
      category: "account",
      order: 7,
    },
    {
      questionAr: "ما هي شروط العضوية؟",
      questionEn: "What are the membership conditions?",
      answerAr: "يجب أن تكون خريجاً من الجامعة الأمريكية في الإمارات، وملء نموذج العضوية، والموافقة على النظام الداخلي للاتحاد.",
      answerEn: "You must be a graduate of the American University in Emirates, fill out the membership form, and agree to the union's internal regulations.",
      category: "membership",
      order: 8,
    },
  ];

  for (const faq of faqs) {
    await prisma.fAQ.create({
      data: {
        ...faq,
        isActive: true,
      },
    });
  }
  console.log("FAQs created:", faqs.length);

  // 5. News articles
  const newsArticles = [
    {
      titleAr: "افتتاح مقر الاتحاد الجديد",
      titleEn: "Opening of the New Union Headquarters",
      slug: "opening-new-hq",
      contentAr: "يسر اتحاد خريجي الجامعة الأمريكية في الإمارات أن يعلن عن افتتاح مقره الجديد في حي الإمارات بدبي. يأتي افتتاح المقر الجديد كجزء من جهود الاتحاد لتعزيز وجوده وتوسيع نطاق خدماته لأعضائه. يضم المقر الجديد مرافق متنوعة تشمل قاعة مؤتمرات مجهزة بأحدث التقنيات، ومكاتب إدارية، ومنطقة للاجتماعات، ومساحات عمل مشتركة. كما يهدف المقر الجديد إلى توفير بيئة مثالية لتنظيم الفعاليات والأنشطة المختلفة التي يقيمها الاتحاد. دعا الاتحاد جميع الأعضاء والمهتمين لحضور حفل الافتتاح الرسمي الذي سيقام في الشهر المقبل.",
      contentEn: "The American University in Emirates Graduates Union is pleased to announce the opening of its new headquarters in Emirates District, Dubai. The opening of the new headquarters comes as part of the union's efforts to enhance its presence and expand its services to its members. The new headquarters includes various facilities including a conference hall equipped with the latest technologies, administrative offices, meeting areas, and co-working spaces. The new headquarters also aims to provide an ideal environment for organizing the various events and activities hosted by the union. The union invites all members and interested parties to attend the official opening ceremony to be held next month.",
      excerptAr: "افتتح الاتحاد مقره الجديد في حي الإمارات بدبي لتعزيز خدماته لأعضائه.",
      excerptEn: "The union opened its new headquarters in Emirates District, Dubai to enhance services for its members.",
      status: "published",
      category: "announcement",
      publishedAt: new Date("2026-03-01"),
    },
    {
      titleAr: "مؤتمر ريادة الأعمال 2026",
      titleEn: "Entrepreneurship Conference 2026",
      slug: "entrepreneurship-conference-2026",
      contentAr: "ينظم اتحاد خريجي الجامعة الأمريكية في الإمارات مؤتمر ريادة الأعمال السنوي bajo عنوان \"بناء المستقبل: ريادة الأعمال في عصر التحول الرقمي". سيجمع المؤتمر رواد الأعمال والخبراء الاقتصاديين من مختلف القطاعات لمناقشة أحدث التوجهات في عالم ريادة الأعمال. يشمل البرنامج جلسات نقاشية وورش عمل عملية حول مواضيع مثل الابتكار التقني، والتمويل الناشئ، والتسويق الرقمي، وإدارة الأعمال الصغيرة. كما سيوفر المؤتمر فرصاً للتواصل المهني وتبادل الخبرات بين المشاركين. ملاحظة: المؤتمر مفتوح للأعضاء وغير الأعضاء.",
      contentEn: "The American University in Emirates Graduates Union organizes the annual Entrepreneurship Conference under the title 'Building the Future: Entrepreneurship in the Age of Digital Transformation'. The conference brings together entrepreneurs and economic experts from various sectors to discuss the latest trends in entrepreneurship. The program includes panel discussions and practical workshops on topics such as technical innovation, emerging finance, digital marketing, and small business management. The conference also provides opportunities for professional networking and knowledge exchange among participants. Note: The conference is open to members and non-members.",
      excerptAr: "مؤتمر ريادة الأعمال السنوي يجمع رواد الأعمال والخبراء لمناقشة التحول الرقمي.",
      excerptEn: "The annual Entrepreneurship Conference brings together entrepreneurs and experts to discuss digital transformation.",
      status: "published",
      category: "event",
      publishedAt: new Date("2026-02-15"),
    },
    {
      titleAr: "برنامج التدريب المهني للخريجين",
      titleEn: "Professional Training Program for Graduates",
      slug: "professional-training-program",
      contentAr: "أعلن اتحاد خريجي الجامعة الأمريكية في الإمارات عن إطلاق برنامج التدريب المهني الجديد للخريجين. يهدف البرنامج إلى تمكين الخريجين من اكتساب المهارات العملية المطلوبة في سوق العمل. يشمل البرنامج دورات تدريبية في مجالات متعددة منها التسويق الرقمي، وتطوير الويب، وإدارة المشاريع، والقيادة الإدارية. يتميز البرنامج بㄚتشارته مع شركات رائدة في سوق العمل الإماراتي، مما يوفر فرص تدريب حقيقية للمشاركين. يمكن للخريجين التسجيل عبر موقع الاتحاد electronically.",
      contentEn: "The American University in Emirates Graduates Union announced the launch of a new professional training program for graduates. The program aims to enable graduates to acquire the practical skills required in the job market. The program includes training courses in multiple fields including digital marketing, web development, project management, and administrative leadership. The program is characterized by its partnership with leading companies in the UAE job market, providing real training opportunities for participants. Graduates can register through the union's website electronically.",
      excerptAr: "برنامج تدريب مهني جديد للخريجين يوفر دورات في مجالات متنوعة.",
      excerptEn: "A new professional training program for graduates offers courses in various fields.",
      status: "published",
      category: "announcement",
      publishedAt: new Date("2026-01-20"),
    },
  ];

  for (const article of newsArticles) {
    await prisma.news.upsert({
      where: { slug: article.slug },
      update: {},
      create: {
        ...article,
        authorId: admin.id,
        contentAr: article.contentAr,
        contentEn: article.contentEn,
      },
    });
  }
  console.log("News articles created:", newsArticles.length);

  // 6. Events
  const events = [
    {
      titleAr: "حفل تخرج 2026",
      titleEn: "Graduation Ceremony 2026",
      slug: "graduation-ceremony-2026",
      descriptionAr: "يسر الاتحاد أن يدعوكم لحضور حفل التخرج السنوي 2026. سيجمع الحفل خريجي الجامعة الأمريكية في الإمارات من مختلف الدفعتين للاحتجاز بإنجازاتهم الأكاديمية. يشمل الحفل فقرات فنية وثقافية، فضلاً عن كلمة رؤساء الأقسام وتوزيع الشهادات. كما سيتوفر صور جماعية للدفعة الجديدة.",
      descriptionEn: "The union is pleased to invite you to attend the Annual Graduation Ceremony 2026. The ceremony brings together graduates from the American University in Emirates from various batches to celebrate their academic achievements. The ceremony includes artistic and cultural segments, in addition to department heads' speeches and certificate distribution. Group photos for the new batch will also be available.",
      date: new Date("2026-06-15"),
      time: "18:00",
      endTime: "22:00",
      location: "قاعة المؤتمرات الكبرى - الجامعة الأمريكية في الإمارات",
      locationUrl: "https://maps.google.com/?q=American+University+in+Emirates",
      capacity: 500,
      status: "upcoming",
      category: "ceremony",
    },
    {
      titleAr: "ورشة عمل: أساسيات التسويق الرقمي",
      titleEn: "Workshop: Digital Marketing Fundamentals",
      slug: "digital-marketing-workshop",
      descriptionAr: "ورشة عمل عملية تغطي أساسيات التسويق الرقمي للمبتدئين والمتوسطين. سنتناول موضوعات مثل تحسين محركات البحث، والتسويق عبر وسائل التواصل الاجتماعي، وإنشاء المحتوى، وتحليل البيانات. الورشة مفتوحة لأعضاء الاتحاد والخريجين غير الأعضاء.",
      descriptionEn: "A practical workshop covering digital marketing fundamentals for beginners and intermediate learners. Topics include search engine optimization, social media marketing, content creation, and data analytics. The workshop is open to union members and non-member graduates.",
      date: new Date("2026-04-10"),
      time: "14:00",
      endTime: "17:00",
      location: "مركز الابتكار - حي الإمارات",
      capacity: 50,
      status: "upcoming",
      category: "workshop",
    },
    {
      titleAr: "لقاءNetworking الشهري",
      titleEn: "Monthly Networking Meetup",
      slug: "monthly-networking-meetup",
      descriptionAr: "لقاء شهري غير رسمي لخريجي الجامعة الأمريكية في الإمارات للتواصل وتبادل الخبرات. يتميز اللقاء ببيئة مريحة ومحادثات مفتوحة حول فرص العمل والمشاريع المشتركة. يوفر اللقاء فرصة للتعارف مع خريجين من تخصصات مختلفة.",
      descriptionEn: "An informal monthly meetup for graduates of the American University in Emirates to network and exchange experiences. The meetup features a comfortable environment and open conversations about job opportunities and joint projects. It provides an opportunity to meet graduates from different specialties.",
      date: new Date("2026-04-20"),
      time: "19:00",
      endTime: "22:00",
      location: "مقهى الابتكار - وسط مدينة دبي",
      capacity: 100,
      status: "upcoming",
      category: "networking",
    },
    {
      titleAr: "مؤتمر ريادة الأعمال 2026",
      titleEn: "Entrepreneurship Conference 2026",
      slug: "entrepreneurship-conference-2026",
      descriptionAr: "مؤتمر ريادة الأعمال السنوي 2026 بعنوان \"بناء المستقبل: ريادة الأعمال في عصر التحول الرقمي". سيجمع المؤتمر رواد الأعمال والخبراء الاقتصاديين من مختلف القطاعات لمناقشة أحدث التوجهات في عالم ريادة الأعمال. يشمل المؤتمر جلسات نقاشية وورش عمل عملية.",
      descriptionEn: "The Annual Entrepreneurship Conference 2026 titled 'Building the Future: Entrepreneurship in the Age of Digital Transformation'. The conference brings together entrepreneurs and economic experts from various sectors to discuss the latest trends in entrepreneurship. The conference includes panel discussions and practical workshops.",
      date: new Date("2026-05-05"),
      time: "09:00",
      endTime: "17:00",
      location: "المركز الدولي للمؤتمرات - دبي",
      locationUrl: "https://maps.google.com/?q=Dubai+International+Convention+Center",
      capacity: 300,
      status: "upcoming",
      category: "conference",
    },
    {
      titleAr: "رحلة خريجي الشارقة",
      titleEn: "Sharjah Alumni Trip",
      slug: "sharjah-alumni-trip",
      descriptionAr: "رحلة ترفيهية لخريجي الجامعة إلى إمارة الشارقة. تشمل الرحلة زيارة المتاحف والمواقع الثقافية الشهيرة، بالإضافة إلى غداء جماعي في مطعم مميز. رحلة مثالية للتواصل في بيئة مريحة.",
      descriptionEn: "A recreational trip for university graduates to Sharjah emirate. The trip includes visits to famous museums and cultural sites, in addition to a group lunch at a distinctive restaurant. An ideal trip for networking in a comfortable environment.",
      date: new Date("2026-05-15"),
      time: "08:00",
      endTime: "18:00",
      location: "نقطة التجمع: مبنى الجامعة الأمريكي في الإمارات",
      capacity: 40,
      status: "upcoming",
      category: "social",
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: {},
      create: {
        ...event,
        registeredCount: 0,
      },
    });
  }
  console.log("Events created:", events.length);

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
