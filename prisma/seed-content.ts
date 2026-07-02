import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const pageContents = [
  // ============ HOME PAGE ============
  // Hero
  { page: "home", section: "hero", key: "title", valueAr: "رابطة خريجي جامعة أفريقيا العالمية", valueEn: "Association of IUA Graduates" },
  { page: "home", section: "hero", key: "subtitle", valueAr: "نجمع الخريجين لبناء مستقبل أفضل وتعزيز الروابط المهنية والأكاديمية", valueEn: "Uniting graduates for a better future and strengthening professional and academic bonds" },
  { page: "home", section: "hero", key: "button1_text", valueAr: "انضم إلينا", valueEn: "Join Us" },
  { page: "home", section: "hero", key: "button2_text", valueAr: "اعرف المزيد", valueEn: "Learn More" },

  // Stats
  { page: "home", section: "stats", key: "members_label", valueAr: "عضو مسجل", valueEn: "Registered Members" },
  { page: "home", section: "stats", key: "events_label", valueAr: "حدث وفعالية", valueEn: "Events & Activities" },
  { page: "home", section: "stats", key: "projects_label", valueAr: "مشروع تنفيذي", valueEn: "Implemented Projects" },
  { page: "home", section: "stats", key: "years_label", valueAr: "سنوات من العطاء", valueEn: "Years of Giving" },

  // News Section
  { page: "home", section: "news", key: "title", valueAr: "آخر الأخبار", valueEn: "Latest News" },
  { page: "home", section: "news", key: "read_more", valueAr: "اقرأ المزيد", valueEn: "Read More" },
  { page: "home", section: "news", key: "view_all", valueAr: "عرض جميع الأخبار", valueEn: "View All News" },

  // Gallery Section
  { page: "home", section: "gallery", key: "title", valueAr: "معرض الصور", valueEn: "Photo Gallery" },
  { page: "home", section: "gallery", key: "subtitle", valueAr: "لحظات لا تُنسى من أحداثنا وأنشطتنا", valueEn: "Unforgettable moments from our events and activities" },
  { page: "home", section: "gallery", key: "view_all", valueAr: "عرض المعرض كاملاً", valueEn: "View Full Gallery" },

  // Events Section
  { page: "home", section: "events", key: "title", valueAr: "الأحداث القادمة", valueEn: "Upcoming Events" },
  { page: "home", section: "events", key: "view_all", valueAr: "عرض جميع الأحداث", valueEn: "View All Events" },
  { page: "home", section: "events", key: "status_active", valueAr: "نشط", valueEn: "Active" },
  { page: "home", section: "events", key: "status_completed", valueAr: "مكتمل", valueEn: "Completed" },
  { page: "home", section: "events", key: "status_upcoming", valueAr: "قادم", valueEn: "Upcoming" },
  { page: "home", section: "events", key: "status_ongoing", valueAr: "جاري", valueEn: "Ongoing" },

  // Projects Section
  { page: "home", section: "projects", key: "title", valueAr: "المشاريع المميزة", valueEn: "Featured Projects" },
  { page: "home", section: "projects", key: "view_all", valueAr: "عرض جميع المشاريع", valueEn: "View All Projects" },

  // CTA Section
  { page: "home", section: "cta", key: "title", valueAr: "انضم إلى عائلة الرابطة", valueEn: "Join the Association Family" },
  { page: "home", section: "cta", key: "subtitle", valueAr: "كن جزءاً من مجتمع خريجي جامعة أفريقيا العالمية", valueEn: "Be part of the IUA graduates community" },
  { page: "home", section: "cta", key: "membership_button", valueAr: "طلب عضوية", valueEn: "Apply for Membership" },
  { page: "home", section: "cta", key: "donate_button", valueAr: "تبرع الآن", valueEn: "Donate Now" },

  // Contact Section
  { page: "home", section: "contact", key: "address_label", valueAr: "العنوان", valueEn: "Address" },
  { page: "home", section: "contact", key: "address_value", valueAr: "الخرطوم - السودان", valueEn: "Khartoum - Sudan" },
  { page: "home", section: "contact", key: "phone_label", valueAr: "الهاتف", valueEn: "Phone" },
  { page: "home", section: "contact", key: "phone_value", valueAr: "+249114210853", valueEn: "+249114210853" },
  { page: "home", section: "contact", key: "email_label", valueAr: "البريد الإلكتروني", valueEn: "Email" },
  { page: "home", section: "contact", key: "email_value", valueAr: "aiuagho@gmail.com", valueEn: "aiuagho@gmail.com" },

  // ============ ABOUT PAGE ============
  { page: "about", section: "hero", key: "title", valueAr: "من نحن", valueEn: "About Us" },
  { page: "about", section: "hero", key: "subtitle", valueAr: "تعرف على رؤيتنا ومهمتنا وأهدافنا", valueEn: "Learn about our vision, mission and goals" },

  { page: "about", section: "tabs", key: "who_we_are", valueAr: "من نحن", valueEn: "Who We Are" },
  { page: "about", section: "tabs", key: "vision", valueAr: "رؤيتنا", valueEn: "Our Vision" },
  { page: "about", section: "tabs", key: "mission", valueAr: "مهمتنا", valueEn: "Our Mission" },
  { page: "about", section: "tabs", key: "objectives", valueAr: "أهدافنا", valueEn: "Our Objectives" },
  { page: "about", section: "tabs", key: "history", valueAr: "تاريخنا", valueEn: "Our History" },

  // Who We Are
  { page: "about", section: "who_we_are", key: "description", valueAr: "رابطة خريجي جامعة أفريقيا العالمية هي منظمة غير ربحية تأسست عام 2013 بهدف تعزيز الروابط بين خريجي الجامعة وخدمة المجتمع الأكاديمي والمجتمعي. نسعى لبناء جسور التواصل بين الأجيال المختلفة من الخريجين وتمكينهم من المساهمة الفاعلة في تنمية السودان.", valueEn: "The Association of IUA Graduates is a non-profit organization founded in 2013 with the aim of strengthening bonds between university graduates and serving the academic and community society. We seek to build bridges of communication between different generations of graduates and enable them to contribute effectively to Sudan's development." },

  // Stats
  { page: "about", section: "stats", key: "founding_year", valueAr: "2013", valueEn: "2013" },
  { page: "about", section: "stats", key: "founding_year_label", valueAr: "سنة التأسيس", valueEn: "Year Founded" },
  { page: "about", section: "stats", key: "members_count", valueAr: "5,000+", valueEn: "5,000+" },
  { page: "about", section: "stats", key: "members_count_label", valueAr: "عضو", valueEn: "Members" },
  { page: "about", section: "stats", key: "events_count", valueAr: "50+", valueEn: "50+" },
  { page: "about", section: "stats", key: "events_count_label", valueAr: "فعالية", valueEn: "Events" },
  { page: "about", section: "stats", key: "projects_count", valueAr: "20+", valueEn: "20+" },
  { page: "about", section: "stats", key: "projects_count_label", valueAr: "مشروع", valueEn: "Projects" },

  // Vision
  { page: "about", section: "vision", key: "title", valueAr: "رؤيتنا", valueEn: "Our Vision" },
  { page: "about", section: "vision", key: "item1_title", valueAr: "الريادة", valueEn: "Leadership" },
  { page: "about", section: "vision", key: "item1_desc", valueAr: "أن نكون الروابطة الأكاديمية الأولى في المنطقة", valueEn: "To be the leading academic association in the region" },
  { page: "about", section: "vision", key: "item2_title", valueAr: "التواصل", valueEn: "Connection" },
  { page: "about", section: "vision", key: "item2_desc", valueAr: "بناء شبكة قوية من الخريجين المتخصصين", valueEn: "Building a strong network of specialized graduates" },
  { page: "about", section: "vision", key: "item3_title", valueAr: "الابتكار", valueEn: "Innovation" },
  { page: "about", section: "vision", key: "item3_desc", valueAr: "تقديم حلول إبداعية لتحديات المجتمع", valueEn: "Providing creative solutions to community challenges" },
  { page: "about", section: "vision", key: "item4_title", valueAr: "التنمية", valueEn: "Development" },
  { page: "about", section: "vision", key: "item4_desc", valueAr: "المساهمة في التنمية المستدامة للبلاد", valueEn: "Contributing to sustainable development of the country" },

  // Mission
  { page: "about", section: "mission", key: "title", valueAr: "مهمتنا", valueEn: "Our Mission" },
  { page: "about", section: "mission", key: "item1_title", valueAr: "التواصل والشبكات", valueEn: "Networking" },
  { page: "about", section: "mission", key: "item1_desc", valueAr: "تعزيز التواصل بين الخريجين وبناء شبكة مهنية قوية", valueEn: "Strengthening communication between graduates and building a strong professional network" },
  { page: "about", section: "mission", key: "item2_title", valueAr: "التطوير والتمكين", valueEn: "Development & Empowerment" },
  { page: "about", section: "mission", key: "item2_desc", valueAr: "تقديم برامج تدريبية وتطويرية للأعضاء", valueEn: "Providing training and development programs for members" },
  { page: "about", section: "mission", key: "item3_title", valueAr: "الخدمة والدعم", valueEn: "Service & Support" },
  { page: "about", section: "mission", key: "item3_desc", valueAr: "دعم الخريجين في مسيرتهم المهنية والأكاديمية", valueEn: "Supporting graduates in their professional and academic journey" },
  { page: "about", section: "mission", key: "item4_title", valueAr: "الابتكار والقيادة", valueEn: "Innovation & Leadership" },
  { page: "about", section: "mission", key: "item4_desc", valueAr: "تعزيزCulture of innovation and leadership among graduates", valueEn: "Fostering a culture of innovation and leadership among graduates" },

  // Objectives
  { page: "about", section: "objectives", key: "title", valueAr: "أهدافنا", valueEn: "Our Objectives" },
  { page: "about", section: "objectives", key: "item1_title", valueAr: "بناء شبكة خريجين", valueEn: "Building Alumni Network" },
  { page: "about", section: "objectives", key: "item1_desc", valueAr: "إنشاء منصة تواصل فعالة بين جميع خريجي الجامعة", valueEn: "Creating an effective communication platform for all university graduates" },
  { page: "about", section: "objectives", key: "item2_title", valueAr: "دعم التطور المهني", valueEn: "Supporting Professional Development" },
  { page: "about", section: "objectives", key: "item2_desc", valueAr: "تقديم برامج تدريبية وورش عمل لتطوير مهارات الأعضاء", valueEn: "Providing training programs and workshops to develop members' skills" },
  { page: "about", section: "objectives", key: "item3_title", valueAr: "خدمة المجتمع", valueEn: "Community Service" },
  { page: "about", section: "objectives", key: "item3_desc", valueAr: "المشاركة في المشاريع المجتمعية التنموية", valueEn: "Participating in community development projects" },
  { page: "about", section: "objectives", key: "item4_title", valueAr: "تعزيز الهوية الأكاديمية", valueEn: "Strengthening Academic Identity" },
  { page: "about", section: "objectives", key: "item4_desc", valueAr: "الحفاظ على الروابط الأكاديمية والبحثية مع الجامعة", valueEn: "Maintaining academic and research ties with the university" },
  { page: "about", section: "objectives", key: "item5_title", valueAr: "التعاون الدولي", valueEn: "International Cooperation" },
  { page: "about", section: "objectives", key: "item5_desc", valueAr: "بناء شراكات مع روابط خريجين دولية", valueEn: "Building partnerships with international alumni associations" },
  { page: "about", section: "objectives", key: "item6_title", valueAr: "الإرشاد الأكاديمي", valueEn: "Academic Guidance" },
  { page: "about", section: "objectives", key: "item6_desc", valueAr: "تقديم الإرشاد والاستشارات للطلاب والخريجين", valueEn: "Providing guidance and consultations for students and graduates" },
  { page: "about", section: "objectives", key: "item7_title", valueAr: "دعم البحث العلمي", valueEn: "Supporting Scientific Research" },
  { page: "about", section: "objectives", key: "item7_desc", valueAr: "تشجيع الأبحاث العلمية ونشر الإنتاج الأكاديمي", valueEn: "Encouraging scientific research and publishing academic output" },
  { page: "about", section: "objectives", key: "item8_title", valueAr: "التمكين الاقتصادي", valueEn: "Economic Empowerment" },
  { page: "about", section: "objectives", key: "item8_desc", valueAr: "دعم المشاريع الصغيرة والمتوسطة للأعضاء", valueEn: "Supporting small and medium enterprises for members" },

  // History/Timeline
  { page: "about", section: "history", key: "title", valueAr: "تاريخنا", valueEn: "Our History" },
  { page: "about", section: "history", key: "year2013_title", valueAr: "تأسيس الرابطة", valueEn: "Association Founded" },
  { page: "about", section: "history", key: "year2013_desc", valueAr: "تأسيس رابطة خريجي جامعة أفريقيا العالمية بهدف تعزيز الروابط بين الخريجين", valueEn: "Founded the Association of IUA Graduates to strengthen bonds between graduates" },
  { page: "about", section: "history", key: "year2015_title", valueAr: "أول مؤتمر وطني", valueEn: "First National Conference" },
  { page: "about", section: "history", key: "year2015_desc", valueAr: "عقد أول مؤتمر وطني للخريجين بمشاركة أكثر من 500 خريج", valueEn: "Held the first national graduates conference with over 500 attendees" },
  { page: "about", section: "history", key: "year2018_title", valueAr: "افتتاح الفروع", valueEn: "Branches Opened" },
  { page: "about", section: "history", key: "year2018_desc", valueAr: "افتتاح فروع الرابطة في عدة ولايات sudan", valueEn: "Opened association branches in several Sudanese states" },
  { page: "about", section: "history", key: "year2020_title", valueAr: "التحول الرقمي", valueEn: "Digital Transformation" },
  { page: "about", section: "history", key: "year2020_desc", valueAr: "إطلاق المنصة الرقمية لإدارة العضوية والأنشطة", valueEn: "Launched digital platform for membership and activities management" },
  { page: "about", section: "history", key: "year2023_title", valueAr: "توسيع الخدمات", valueEn: "Services Expansion" },
  { page: "about", section: "history", key: "year2023_desc", valueAr: "إطلاق برامج التدريب والاستشارات المهنية", valueEn: "Launched training programs and professional consultations" },
  { page: "about", section: "history", key: "year2025_title", valueAr: "شراكات دولية", valueEn: "International Partnerships" },
  { page: "about", section: "history", key: "year2025_desc", valueAr: "توقيع اتفاقيات تعاون مع روابط خريجين دولية", valueEn: "Signed cooperation agreements with international alumni associations" },
  { page: "about", section: "history", key: "year2026_title", valueAr: "مرحلة النمو", valueEn: "Growth Phase" },
  { page: "about", section: "history", key: "year2026_desc", valueAr: "توسيع قاعدة الأعضاء وتعزيز البرامج الجديدة", valueEn: "Expanding member base and strengthening new programs" },

  // CTA
  { page: "about", section: "cta", key: "title", valueAr: "كن جزءاً من رحلتنا", valueEn: "Be Part of Our Journey" },
  { page: "about", section: "cta", key: "subtitle", valueAr: "انضم الآن وساهم في بناء مستقبل أفضل", valueEn: "Join now and contribute to building a better future" },
  { page: "about", section: "cta", key: "button_text", valueAr: "انضم إلينا", valueEn: "Join Us" },

  // ============ CONTACT PAGE ============
  { page: "contact", section: "hero", key: "title", valueAr: "اتصل بنا", valueEn: "Contact Us" },
  { page: "contact", section: "hero", key: "subtitle", valueAr: "نحن هنا لمساعدتك. لا تتردد في التواصل معنا", valueEn: "We are here to help you. Don't hesitate to reach out" },
  { page: "contact", section: "info", key: "phone_label", valueAr: "الهاتف", valueEn: "Phone" },
  { page: "contact", section: "info", key: "phone_value", valueAr: "+249114210853", valueEn: "+249114210853" },
  { page: "contact", section: "info", key: "email_label", valueAr: "البريد الإلكتروني", valueEn: "Email" },
  { page: "contact", section: "info", key: "email_value", valueAr: "aiuagho@gmail.com", valueEn: "aiuagho@gmail.com" },
  { page: "contact", section: "info", key: "address_label", valueAr: "العنوان", valueEn: "Address" },
  { page: "contact", section: "info", key: "address_value", valueAr: "الخرطوم - السودان", valueEn: "Khartoum - Sudan" },
  { page: "contact", section: "info", key: "hours_label", valueAr: "ساعات العمل", valueEn: "Working Hours" },
  { page: "contact", section: "info", key: "hours_value", valueAr: "الأحد - الخميس: 8 ص - 4 م", valueEn: "Sun - Thu: 8 AM - 4 PM" },
  { page: "contact", section: "form", key: "title", valueAr: "أرسل لنا رسالة", valueEn: "Send Us a Message" },
  { page: "contact", section: "map", key: "title", valueAr: "موقعنا", valueEn: "Our Location" },

  // ============ SERVICES PAGE ============
  { page: "services", section: "hero", key: "title", valueAr: "خدماتنا", valueEn: "Our Services" },
  { page: "services", section: "hero", key: "subtitle", valueAr: "نقدم مجموعة متكاملة من الخدمات لخدمة أعضائنا ومجتمع الخريجين", valueEn: "We offer a comprehensive range of services for our members and the graduates community" },

  { page: "services", section: "service1", key: "title", valueAr: "خدمات الخريجين", valueEn: "Alumni Services" },
  { page: "services", section: "service1", key: "description", valueAr: "خدمات متكاملة مصممة خصيصاً لتلبية احتياجات الخريجين", valueEn: "Comprehensive services designed specifically to meet graduates' needs" },
  { page: "services", section: "service1", key: "feature1", valueAr: "إصدار شهادات التخريج", valueEn: "Issuing graduation certificates" },
  { page: "services", section: "service1", key: "feature2", valueAr: "التحقق من الهوية الأكاديمية", valueEn: "Academic identity verification" },
  { page: "services", section: "service1", key: "feature3", valueAr: "خدمات الترجمة المعتمدة", valueEn: "Certified translation services" },

  { page: "services", section: "service2", key: "title", valueAr: "الإرشاد الأكاديمي", valueEn: "Academic Guidance" },
  { page: "services", section: "service2", key: "description", valueAr: "إرشاد متخصص للطلاب والخريجين الراغبين في الاستمرار الأكاديمي", valueEn: "Specialized guidance for students and graduates wishing to continue academically" },
  { page: "services", section: "service2", key: "feature1", valueAr: "استشارات الدراسات العليا", valueEn: "Postgraduate consultations" },
  { page: "services", section: "service2", key: "feature2", valueAr: "مساعدة في اختيار التخصص", valueEn: "Help with major selection" },
  { page: "services", section: "service2", key: "feature3", valueAr: "ربط الطلاب بالمرشدين الأكاديميين", valueEn: "Connecting students with academic mentors" },

  { page: "services", section: "service3", key: "title", valueAr: "البحث عن العمل", valueEn: "Job Search" },
  { page: "services", section: "service3", key: "description", valueAr: "مساعدة الخريجين في العثور على فرص عمل مناسبة لمؤهلاتهم", valueEn: "Helping graduates find job opportunities matching their qualifications" },
  { page: "services", section: "service3", key: "feature1", valueAr: "نشر السير الذاتية", valueEn: "Resume posting" },
  { page: "services", section: "service3", key: "feature2", valueAr: "فرص العمل المتاحة", valueEn: "Available job opportunities" },
  { page: "services", section: "service3", key: "feature3", valueAr: "networking مهني", valueEn: "Professional networking" },

  { page: "services", section: "service4", key: "title", valueAr: "برامج التدريب", valueEn: "Training Programs" },
  { page: "services", section: "service4", key: "description", valueAr: "برامج تدريبية وتطويرية لتعزيز مهارات الأعضاء", valueEn: "Training and development programs to enhance members' skills" },
  { page: "services", section: "service4", key: "feature1", valueAr: "ورش عمل مهنية", valueEn: "Professional workshops" },
  { page: "services", section: "service4", key: "feature2", valueAr: "دورات تدريبية معتمدة", valueEn: "Certified training courses" },
  { page: "services", section: "service4", key: "feature3", valueAr: "شهادات إتمام", valueEn: "Completion certificates" },

  { page: "services", section: "service5", key: "title", valueAr: "الاستشارات المهنية", valueEn: "Career Consultations" },
  { page: "services", section: "service5", key: "description", valueAr: "استشارات مهنية متخصصة لبناء المسار الوظيفي", valueEn: "Specialized career consultations for building career paths" },
  { page: "services", section: "service5", key: "feature1", valueAr: "تقييم المهارات", valueEn: "Skills assessment" },
  { page: "services", section: "service5", key: "feature2", valueAr: "خطة تطوير مهني", valueEn: "Career development plan" },
  { page: "services", section: "service5", key: "feature3", valueAr: "إعداد للمقابلات", valueEn: "Interview preparation" },

  { page: "services", section: "service6", key: "title", valueAr: "فعاليات التواصل", valueEn: "Networking Events" },
  { page: "services", section: "service6", key: "description", valueAr: "فعاليات دورية لتقوية الروابط بين الخريجين", valueEn: "Regular events to strengthen bonds between graduates" },
  { page: "services", section: "service6", key: "feature1", valueAr: "لقاءات دورية", valueEn: "Regular meetups" },
  { page: "services", section: "service6", key: "feature2", valueAr: "مؤتمرات سنوية", valueEn: "Annual conferences" },
  { page: "services", section: "service6", key: "feature3", valueAr: " activities ترفيهية", valueEn: "Recreational activities" },

  { page: "services", section: "cta", key: "title", valueAr: "هل تحتاج مساعدة؟", valueEn: "Need Help?" },
  { page: "services", section: "cta", key: "button_text", valueAr: "تواصل معنا", valueEn: "Contact Us" },

  // ============ MEMBERSHIP PAGE ============
  { page: "membership", section: "hero", key: "title", valueAr: "العضوية", valueEn: "Membership" },
  { page: "membership", section: "hero", key: "subtitle", valueAr: "انضم إلى أكبر شبكة لخريجي جامعة أفريقيا العالمية", valueEn: "Join the largest network of IUA graduates" },

  { page: "membership", section: "benefits", key: "title", valueAr: "مزايا العضوية", valueEn: "Membership Benefits" },
  { page: "membership", section: "benefits", key: "benefit1_title", valueAr: "شبكة الخريجين", valueEn: "Alumni Network" },
  { page: "membership", section: "benefits", key: "benefit1_desc", valueAr: "تواصل مع آلاف الخريجين حول العالم", valueEn: "Connect with thousands of graduates worldwide" },
  { page: "membership", section: "benefits", key: "benefit2_title", valueAr: "فرص العمل", valueEn: "Career Opportunities" },
  { page: "membership", section: "benefits", key: "benefit2_desc", valueAr: "احصل على فرص عمل حصرية عبر الشبكة", valueEn: "Get exclusive job opportunities through the network" },
  { page: "membership", section: "benefits", key: "benefit3_title", valueAr: "برامج التدريب", valueEn: "Training Programs" },
  { page: "membership", section: "benefits", key: "benefit3_desc", valueAr: "وصول مجاني لبرامج التدريب والتطوير", valueEn: "Free access to training and development programs" },
  { page: "membership", section: "benefits", key: "benefit4_title", valueAr: "شهادات معتمدة", valueEn: "Certified Credentials" },
  { page: "membership", section: "benefits", key: "benefit4_desc", valueAr: "احصل على بطاقة عضوية معتمدة", valueEn: "Get a certified membership card" },
  { page: "membership", section: "benefits", key: "benefit5_title", valueAr: "فعاليات حصرية", valueEn: "Exclusive Events" },
  { page: "membership", section: "benefits", key: "benefit5_desc", valueAr: "حضور فعاليات ومؤتمرات خاصة بالأعضاء", valueEn: "Attend events and conferences exclusive to members" },
  { page: "membership", section: "benefits", key: "benefit6_title", valueAr: "دعم مستمر", valueEn: "Ongoing Support" },
  { page: "membership", section: "benefits", key: "benefit6_desc", valueAr: "دعم مستمر في مسيرتك المهنية", valueEn: "Continuous support in your professional journey" },

  // Pricing
  { page: "membership", section: "pricing", key: "title", valueAr: "خطط العضوية", valueEn: "Membership Plans" },
  { page: "membership", section: "pricing", key: "annual_name", valueAr: "العضوية السنوية", valueEn: "Annual Membership" },
  { page: "membership", section: "pricing", key: "annual_price", valueAr: "50,000", valueEn: "50,000" },
  { page: "membership", section: "pricing", key: "annual_currency", valueAr: "ج.س", valueEn: "SDG" },
  { page: "membership", section: "pricing", key: "premium_name", valueAr: "العضوية المميزة", valueEn: "Premium Membership" },
  { page: "membership", section: "pricing", key: "premium_price", valueAr: "100,000", valueEn: "100,000" },
  { page: "membership", section: "pricing", key: "premium_currency", valueAr: "ج.س", valueEn: "SDG" },
  { page: "membership", section: "pricing", key: "lifetime_name", valueAr: "عضوية مدى الحياة", valueEn: "Lifetime Membership" },
  { page: "membership", section: "pricing", key: "lifetime_price", valueAr: "500,000", valueEn: "500,000" },
  { page: "membership", section: "pricing", key: "lifetime_currency", valueAr: "ج.س", valueEn: "SDG" },
  { page: "membership", section: "pricing", key: "popular_badge", valueAr: "الأكثر طلباً", valueEn: "Most Popular" },

  // CTA
  { page: "membership", section: "cta", key: "title", valueAr: "جاهز للانضمام؟", valueEn: "Ready to Join?" },
  { page: "membership", section: "cta", key: "button_text", valueAr: "طلب عضوية", valueEn: "Apply for Membership" },

  // ============ MEDIA PAGE ============
  { page: "media", section: "hero", key: "title", valueAr: "المركز الإعلامي", valueEn: "Media Center" },
  { page: "media", section: "hero", key: "subtitle", valueAr: "تابع آخر أخبارنا وأحداثنا ومoutputاتنا الإعلامية", valueEn: "Follow our latest news, events and media output" },

  { page: "media", section: "stats", key: "images_label", valueAr: "صورة", valueEn: "Photos" },
  { page: "media", section: "stats", key: "videos_label", valueAr: "فيديو", valueEn: "Videos" },
  { page: "media", section: "stats", key: "publications_label", valueAr: "منشور", valueEn: "Publications" },
  { page: "media", section: "stats", key: "reports_label", valueAr: "تقرير", valueEn: "Reports" },

  { page: "media", section: "gallery", key: "title", valueAr: "معرض الصور", valueEn: "Photo Gallery" },
  { page: "media", section: "gallery", key: "description", valueAr: "ألبومات الصور من أنشطتنا المختلفة", valueEn: "Photo albums from our various activities" },
  { page: "media", section: "gallery", key: "explore", valueAr: "استكشف", valueEn: "Explore" },

  { page: "media", section: "videos", key: "title", valueAr: "الفيديوهات", valueEn: "Videos" },
  { page: "media", section: "videos", key: "description", valueAr: "فيديوهات من أحداثنا وبرامجنا", valueEn: "Videos from our events and programs" },
  { page: "media", section: "videos", key: "explore", valueAr: "استكشف", valueEn: "Explore" },

  { page: "media", section: "publications", key: "title", valueAr: "المنشورات", valueEn: "Publications" },
  { page: "media", section: "publications", key: "description", valueAr: "منشورات ومواد إعلامية", valueEn: "Publications and media materials" },
  { page: "media", section: "publications", key: "explore", valueAr: "استكشف", valueEn: "Explore" },

  { page: "media", section: "reports", key: "title", valueAr: "التقارير", valueEn: "Reports" },
  { page: "media", section: "reports", key: "description", valueAr: "التقارير السنوية والإدارية", valueEn: "Annual and administrative reports" },
  { page: "media", section: "reports", key: "explore", valueAr: "استكشف", valueEn: "Explore" },

  // ============ ORGANIZATION PAGE ============
  { page: "organization", section: "hero", key: "title", valueAr: "الهيكل التنظيمي", valueEn: "Organizational Structure" },
  { page: "organization", section: "hero", key: "subtitle", valueAr: "تعرّف على الهيكل التنظيمي للرابطة", valueEn: "Learn about the association's organizational structure" },

  { page: "organization", section: "board", key: "title", valueAr: "مجلس الإدارة", valueEn: "Board of Directors" },
  { page: "organization", section: "board", key: "description", valueAr: "الهيئة العليا التي تحدد السياسات والاستراتيجيات", valueEn: "The supreme body that sets policies and strategies" },

  { page: "organization", section: "secretariat", key: "title", valueAr: "الأمانة العامة", valueEn: "The Secretariat" },
  { page: "organization", section: "secretariat", key: "description", valueAr: "الجهاز التنفيذي الذي يدير العمليات اليومية", valueEn: "The executive body managing daily operations" },

  { page: "organization", section: "committees", key: "title", valueAr: "اللجان", valueEn: "Committees" },
  { page: "organization", section: "committees", key: "description", valueAr: "اللجان المتخصصة في إدارة الأنشطة المختلفة", valueEn: "Specialized committees for managing various activities" },

  { page: "organization", section: "branches", key: "title", valueAr: "الفروع", valueEn: "Branches" },
  { page: "organization", section: "branches", key: "description", valueAr: "فروع الرابطة في مختلف الولايات", valueEn: "Association branches in various states" },

  // ============ ORGANIZATION / SECRETARIAT PAGE ============
  { page: "secretariat", section: "hero", key: "title", valueAr: "الأمانة العامة", valueEn: "The Secretariat" },
  { page: "secretariat", section: "hero", key: "subtitle", valueAr: "الجهاز التنفيذي الإداري الذي يضمن سير عمل الرابطة بفعالية وكفاءة", valueEn: "The executive administrative body ensuring the association's efficient and effective operations" },

  { page: "secretariat", section: "about", key: "title", valueAr: "نبذة عن الأمانة العامة", valueEn: "About the Secretariat" },
  { page: "secretariat", section: "about", key: "paragraph1", valueAr: "الأمانة العامة هي الجهاز التنفيذي الإداري للرابطة، وتضم فريقاً من الكوادر المؤهلة التي تضمن سير عمل الرابطة بفعالية وكفاءة. تتولى الأمانة العامة مسؤولية إدارة الشؤون الإدارية والمالية والفنية للرابطة.", valueEn: "The Secretariat is the executive administrative body of the Association, comprising a team of qualified cadres that ensure the association's efficient and effective operations. The Secretariat manages the association's administrative, financial, and technical affairs." },
  { page: "secretariat", section: "about", key: "paragraph2", valueAr: "تسعى الأمانة العامة لتحقيق أهداف الرابطة من خلال التنسيق بين الأقسام المختلفة وضمان تنفيذ القرارات الصادرة عن مجلس الإدارة بكفاءة وفعالية.", valueEn: "The Secretariat seeks to achieve the association's objectives by coordinating between different departments and ensuring the efficient and effective implementation of decisions issued by the Board of Directors." },

  { page: "secretariat", section: "structure", key: "title", valueAr: "الهيكل التنظيمي", valueEn: "Organizational Structure" },

  // Responsibilities
  { page: "secretariat", section: "responsibilities", key: "title", valueAr: "المسؤوليات الرئيسية", valueEn: "Key Responsibilities" },
  { page: "secretariat", section: "responsibilities", key: "item1_title", valueAr: "إدارة الوثائق الرسمية", valueEn: "Official Documents Management" },
  { page: "secretariat", section: "responsibilities", key: "item1_desc", valueAr: "إدارة وحفظ جميع الوثائق الرسمية للرابطة", valueEn: "Managing and preserving all official association documents" },
  { page: "secretariat", section: "responsibilities", key: "item2_title", valueAr: "تنفيذ القرارات", valueEn: "Decision Implementation" },
  { page: "secretariat", section: "responsibilities", key: "item2_desc", valueAr: "تنفيذ قرارات مجلس الإدارة بدقة وفعالية", valueEn: "Implementing Board of Directors decisions accurately and effectively" },
  { page: "secretariat", section: "responsibilities", key: "item3_title", valueAr: "إدارة شؤون الأعضاء", valueEn: "Member Affairs Management" },
  { page: "secretariat", section: "responsibilities", key: "item3_desc", valueAr: "إدارة جميع شؤون الأعضاء من تسجيل وتجديد وتصديق", valueEn: "Managing all member affairs including registration, renewal, and verification" },
  { page: "secretariat", section: "responsibilities", key: "item4_title", valueAr: "تنسيق الأنشطة", valueEn: "Activity Coordination" },
  { page: "secretariat", section: "responsibilities", key: "item4_desc", valueAr: "تنسيق جميع الأنشطة والفعاليات التي تنظمها الرابطة", valueEn: "Coordinating all activities and events organized by the association" },
  { page: "secretariat", section: "responsibilities", key: "item5_title", valueAr: "إدارة المعلومات", valueEn: "Information Management" },
  { page: "secretariat", section: "responsibilities", key: "item5_desc", valueAr: "إدارة قواعد البيانات والمعلومات الخاصة بالأعضاء والأنشطة", valueEn: "Managing databases and information for members and activities" },
  { page: "secretariat", section: "responsibilities", key: "item6_title", valueAr: "التنسيق الإداري", valueEn: "Administrative Coordination" },
  { page: "secretariat", section: "responsibilities", key: "item6_desc", valueAr: "التنسيق بين جميع أقسام الرابطة المختلفة", valueEn: "Coordinating between all different association departments" },

  // Departments
  { page: "secretariat", section: "departments", key: "title", valueAr: "الأقسام", valueEn: "Departments" },
  { page: "secretariat", section: "departments", key: "admin_title", valueAr: "القسم الإداري", valueEn: "Administrative Department" },
  { page: "secretariat", section: "departments", key: "admin_desc", valueAr: "يختص بالشؤون الإدارية والمالية والموارد البشرية", valueEn: "Handles administrative, financial, and human resources affairs" },
  { page: "secretariat", section: "departments", key: "admin_item1", valueAr: "إدارة المالية والميزانية", valueEn: "Financial and budget management" },
  { page: "secretariat", section: "departments", key: "admin_item2", valueAr: "الموارد البشرية", valueEn: "Human resources" },
  { page: "secretariat", section: "departments", key: "admin_item3", valueAr: "اللوازم والمعدات", valueEn: "Supplies and equipment" },
  { page: "secretariat", section: "departments", key: "admin_item4", valueAr: "الصيانة والخدمات", valueEn: "Maintenance and services" },

  { page: "secretariat", section: "departments", key: "membership_title", valueAr: "قسم العضوية", valueEn: "Membership Department" },
  { page: "secretariat", section: "departments", key: "membership_desc", valueAr: "يختص بجميع شؤون العضوية من تسجيل وتجديد وتصديق", valueEn: "Handles all membership affairs including registration, renewal, and verification" },
  { page: "secretariat", section: "departments", key: "membership_item1", valueAr: "تسجيل الأعضاء الجدد", valueEn: "Registering new members" },
  { page: "secretariat", section: "departments", key: "membership_item2", valueAr: "تجديد العضوية", valueEn: "Membership renewal" },
  { page: "secretariat", section: "departments", key: "membership_item3", valueAr: "إصدار بطاقات العضوية", valueEn: "Issuing membership cards" },
  { page: "secretariat", section: "departments", key: "membership_item4", valueAr: "إدارة قاعدة بيانات الأعضاء", valueEn: "Managing members database" },

  { page: "secretariat", section: "departments", key: "media_title", valueAr: "قسم الإعلام والعلاقات", valueEn: "Media & Relations Department" },
  { page: "secretariat", section: "departments", key: "media_desc", valueAr: "يختص بالعلاقات العامة والإعلام والتواصل الاجتماعي", valueEn: "Handles public relations, media, and social communication" },
  { page: "secretariat", section: "departments", key: "media_item1", valueAr: "العلاقات العامة", valueEn: "Public relations" },
  { page: "secretariat", section: "departments", key: "media_item2", valueAr: "إدارة وسائل التواصل الاجتماعي", valueEn: "Social media management" },
  { page: "secretariat", section: "departments", key: "media_item3", valueAr: "النشر والإعلام", valueEn: "Publishing and media" },
  { page: "secretariat", section: "departments", key: "media_item4", valueAr: "الفعاليات والتغطيات", valueEn: "Events and coverage" },

  // Contact
  { page: "secretariat", section: "contact", key: "title", valueAr: "تواصل مع الأمانة العامة", valueEn: "Contact the Secretariat" },
  { page: "secretariat", section: "contact", key: "description", valueAr: "نحن هنا لمساعدتك. لا تتردد في التواصل معنا", valueEn: "We are here to help you. Don't hesitate to reach out" },

  // ============ FOOTER ============
  { page: "footer", section: "newsletter", key: "title", valueAr: "اشترك في نشرتنا البريدية", valueEn: "Subscribe to Our Newsletter" },
  { page: "footer", section: "newsletter", key: "placeholder", valueAr: "أدخل بريدك الإلكتروني", valueEn: "Enter your email" },
  { page: "footer", section: "newsletter", key: "button", valueAr: "اشتراك", valueEn: "Subscribe" },
  { page: "footer", section: "about", key: "description", valueAr: "رابطة خريجي جامعة أفريقيا العالمية - منظمة غير ربحية تهدف لتعزيز الروابط بين الخريجين وخدمة المجتمع", valueEn: "Association of IUA Graduates - A non-profit organization aimed at strengthening bonds between graduates and serving the community" },
  { page: "footer", section: "links", key: "quick_links", valueAr: "روابط سريعة", valueEn: "Quick Links" },
  { page: "footer", section: "links", key: "services", valueAr: "خدماتنا", valueEn: "Our Services" },
  { page: "footer", section: "links", key: "contact", valueAr: "اتصل بنا", valueEn: "Contact Us" },
  { page: "footer", section: "copyright", key: "text", valueAr: "© 2025 رابطة خريجي جامعة أفريقيا العالمية. جميع الحقوق محفوظة.", valueEn: "© 2025 Association of IUA Graduates. All rights reserved." },

  // ============ FAQ PAGE ============
  { page: "faq", section: "hero", key: "title", valueAr: "الأسئلة الشائعة", valueEn: "Frequently Asked Questions" },
  { page: "faq", section: "hero", key: "subtitle", valueAr: "إجابات على الأسئلة الأكثر شيوعاً", valueEn: "Answers to the most common questions" },

  // ============ POSTS PAGE ============
  { page: "posts", section: "hero", key: "title", valueAr: "المشاركات", valueEn: "Posts" },
  { page: "posts", section: "hero", key: "subtitle", valueAr: "تابع أحدث المشاركات والأخبار من مجتمع الخريجين", valueEn: "Follow the latest posts and news from the graduates community" },

  // ============ PROJECTS PAGE ============
  { page: "projects", section: "hero", key: "title", valueAr: "المشاريع", valueEn: "Projects" },
  { page: "projects", section: "hero", key: "subtitle", valueAr: "اكتشف مشاريعناуниципالية والتنموية", valueEn: "Discover our community and development projects" },

  // ============ NEWS PAGE ============
  { page: "news", section: "hero", key: "title", valueAr: "الأخبار", valueEn: "News" },
  { page: "news", section: "hero", key: "subtitle", valueAr: "تابع آخر الأخبار والمستجدات", valueEn: "Follow the latest news and updates" },

  // ============ EVENTS PAGE ============
  { page: "events", section: "hero", key: "title", valueAr: "الأحداث والفعاليات", valueEn: "Events & Activities" },
  { page: "events", section: "hero", key: "subtitle", valueAr: "اكتشف أحداثنا القادمة وال过去了", valueEn: "Discover our upcoming and past events" },

  // ============ PARTNERS PAGE ============
  { page: "partners", section: "hero", key: "title", valueAr: "شركاؤنا", valueEn: "Our Partners" },
  { page: "partners", section: "hero", key: "subtitle", valueAr: "المنظمات والجهات الداعمة للرابطة", valueEn: "Organizations and entities supporting the association" },

  // ============ VOLUNTEER PAGE ============
  { page: "volunteer", section: "hero", key: "title", valueAr: "التطوع", valueEn: "Volunteer" },
  { page: "volunteer", section: "hero", key: "subtitle", valueAr: "كن جزءاً من فريق التطوع وساهم في خدمة المجتمع", valueEn: "Be part of the volunteer team and contribute to community service" },

  // ============ DONATIONS PAGE ============
  { page: "donations", section: "hero", key: "title", valueAr: "التبرعات", valueEn: "Donations" },
  { page: "donations", section: "hero", key: "subtitle", valueAr: "ادعم مشاريعنا وprogrammes بتصدقك", valueEn: "Support our projects and programs with your donation" },
];

const secretariatMembers = [
  {
    name: "د. أحمد محمد علي",
    nameEn: "Dr. Ahmed Mohamed Ali",
    role: "الأمين العام",
    roleEn: "Secretary General",
    bio: "دكتور في إدارة الأعمال، له خبرة أكثر من 15 عاماً في الإدارة التنفيذية. يقود الأمانة العامة منذ تأسيس الرابطة.",
    bioEn: "PhD in Business Administration with over 15 years of executive management experience. Has led the Secretariat since the association's founding.",
    phone: "+249114210853",
    email: "ahmed.ali@aiuag.org",
    category: "secretariat",
    order: 1,
  },
  {
    name: "أ. فاطمة أحمد حسن",
    nameEn: "Ms. Fatima Ahmed Hassan",
    role: "نائبة الأمين العام للشؤون الإدارية",
    roleEn: "Deputy Secretary General for Administrative Affairs",
    bio: "ماجستير في الإدارة العامة، متخصصة في الشؤون الإدارية والموارد البشرية.",
    bioEn: "Master's in Public Administration, specialized in administrative affairs and human resources.",
    phone: "+249114210854",
    email: "fatima.hassan@aiuag.org",
    category: "secretariat",
    order: 2,
  },
  {
    name: "أ. محمد عبدالله أحمد",
    nameEn: "Mr. Mohammed Abdullah Ahmed",
    role: "نائب الأمين العام للشؤون المالية",
    roleEn: "Deputy Secretary General for Financial Affairs",
    bio: "محاسب معتمد، خبرة 12 عاماً في الإدارة المالية والمراجعية.",
    bioEn: "Certified accountant with 12 years of experience in financial management and auditing.",
    phone: "+249114210855",
    email: "mohammed.abdullah@aiuag.org",
    category: "secretariat",
    order: 3,
  },
  {
    name: "د. سارة يوسف Ibrahim",
    nameEn: "Dr. Sara Youssef Ibrahim",
    role: "مديرة قسم العضوية",
    roleEn: "Head of Membership Department",
    bio: "دكتوراه في_soc sciences، مسؤولة عن إدارة شؤون الأعضاء وتنمية قاعدة الأعضاء.",
    bioEn: "PhD in Social Sciences, responsible for managing member affairs and growing the member base.",
    phone: "+249114210856",
    email: "sara.ibrahim@aiuag.org",
    category: "department",
    order: 4,
  },
  {
    name: "أ. خالد عمر المصطفى",
    nameEn: "Mr. Khalid Omar Mustafa",
    role: "مدير قسم الإعلام والعلاقات",
    roleEn: "Head of Media & Relations Department",
    bio: "بكالوريوس صحافة وإعلام، خبرة واسعة في العلاقات العامة وإدارة وسائل التواصل الاجتماعي.",
    bioEn: "Bachelor's in Journalism and Media, extensive experience in public relations and social media management.",
    phone: "+249114210857",
    email: "khalid.omar@aiuag.org",
    category: "department",
    order: 5,
  },
  {
    name: "أ. نورة حسين محمد",
    nameEn: "Ms. Noura Hussein Mohammed",
    role: "مديرة قسم البرامج والأنشطة",
    roleEn: "Head of Programs & Activities Department",
    bio: "ماجستير في إدارة المشاريع، متخصصة في التخطيط والتنفيذ وال تنسيق البرامج والأنشطة.",
    bioEn: "Master's in Project Management, specialized in planning, implementing and coordinating programs and activities.",
    phone: "+249114210858",
    email: "noura.hussein@aiuag.org",
    category: "department",
    order: 6,
  },
  {
    name: "د. عبدالله علي الصالح",
    nameEn: "Dr. Abdullah Ali Al-Salah",
    role: "مستشار الأمين العام للشؤون الأكاديمية",
    roleEn: "Academic Affairs Advisor to the Secretary General",
    bio: "أستاذ جامعي، خبرة في الإرشاد الأكاديمي وتطوير المناهج الدراسية.",
    bioEn: "University professor with experience in academic guidance and curriculum development.",
    phone: "+249114210859",
    email: "abdullah.saleh@aiuag.org",
    category: "secretariat",
    order: 7,
  },
  {
    name: "أ. مريم عثمان أحمد",
    nameEn: "Ms. Mariam Othman Ahmed",
    role: "مشرفة على لجنة العضوية",
    roleEn: "Membership Committee Supervisor",
    bio: "خبرة 8 سنوات في إدارة العضوية والتحقق من البيانات الأكاديمية.",
    bioEn: "8 years of experience in membership management and academic data verification.",
    phone: "+249114210860",
    email: "mariam.othman@aiuag.org",
    category: "committee",
    order: 8,
  },
];

async function main() {
  console.log("Seeding PageContent...");
  for (const item of pageContents) {
    await prisma.pageContent.upsert({
      where: { page_section_key: { page: item.page, section: item.section, key: item.key } },
      update: { valueAr: item.valueAr, valueEn: item.valueEn },
      create: item,
    });
  }
  console.log(`Seeded ${pageContents.length} PageContent entries`);

  console.log("Seeding SecretariatMembers...");
  for (const member of secretariatMembers) {
    const existing = await prisma.secretariatMember.findFirst({ where: { name: member.name } });
    if (!existing) {
      await prisma.secretariatMember.create({ data: member });
    }
  }
  console.log(`Seeded ${secretariatMembers.length} SecretariatMembers`);

  console.log("Seeding complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
