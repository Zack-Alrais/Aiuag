import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const pageContents = [
  // HOME
  { page: "home", section: "hero", key: "title", valueAr: "رابطة خريجي جامعة أفريقيا العالمية", valueEn: "Association of IUA Graduates" },
  { page: "home", section: "hero", key: "subtitle", valueAr: "نجمع الخريجين لبناء مستقبل أفضل وتعزيز الروابط المهنية والأكاديمية", valueEn: "Uniting graduates for a better future and strengthening professional and academic bonds" },
  { page: "home", section: "hero", key: "button1_text", valueAr: "انضم إلينا", valueEn: "Join Us" },
  { page: "home", section: "hero", key: "button2_text", valueAr: "اعرف المزيد", valueEn: "Learn More" },
  { page: "home", section: "stats", key: "members_label", valueAr: "عضو مسجل", valueEn: "Registered Members" },
  { page: "home", section: "stats", key: "events_label", valueAr: "حدث وفعالية", valueEn: "Events & Activities" },
  { page: "home", section: "stats", key: "projects_label", valueAr: "مشروع تنفيذي", valueEn: "Implemented Projects" },
  { page: "home", section: "stats", key: "years_label", valueAr: "سنوات من العطاء", valueEn: "Years of Giving" },
  { page: "home", section: "news", key: "title", valueAr: "آخر الأخبار", valueEn: "Latest News" },
  { page: "home", section: "news", key: "read_more", valueAr: "اقرأ المزيد", valueEn: "Read More" },
  { page: "home", section: "news", key: "view_all", valueAr: "عرض جميع الأخبار", valueEn: "View All News" },
  { page: "home", section: "gallery", key: "title", valueAr: "معرض الصور", valueEn: "Photo Gallery" },
  { page: "home", section: "gallery", key: "subtitle", valueAr: "لحظات لا تُنسى من أحداثنا وأنشطتنا", valueEn: "Unforgettable moments from our events and activities" },
  { page: "home", section: "gallery", key: "view_all", valueAr: "عرض المعرض كاملاً", valueEn: "View Full Gallery" },
  { page: "home", section: "events", key: "title", valueAr: "الأحداث القادمة", valueEn: "Upcoming Events" },
  { page: "home", section: "events", key: "view_all", valueAr: "عرض جميع الأحداث", valueEn: "View All Events" },
  { page: "home", section: "events", key: "status_active", valueAr: "نشط", valueEn: "Active" },
  { page: "home", section: "events", key: "status_completed", valueAr: "مكتمل", valueEn: "Completed" },
  { page: "home", section: "events", key: "status_upcoming", valueAr: "قادم", valueEn: "Upcoming" },
  { page: "home", section: "events", key: "status_ongoing", valueAr: "جاري", valueEn: "Ongoing" },
  { page: "home", section: "projects", key: "title", valueAr: "المشاريع المميزة", valueEn: "Featured Projects" },
  { page: "home", section: "projects", key: "view_all", valueAr: "عرض جميع المشاريع", valueEn: "View All Projects" },
  { page: "home", section: "cta", key: "title", valueAr: "انضم إلى عائلة الرابطة", valueEn: "Join the Association Family" },
  { page: "home", section: "cta", key: "subtitle", valueAr: "كن جزءاً من مجتمع خريجي جامعة أفريقيا العالمية", valueEn: "Be part of the IUA graduates community" },
  { page: "home", section: "cta", key: "membership_button", valueAr: "طلب عضوية", valueEn: "Apply for Membership" },
  { page: "home", section: "cta", key: "donate_button", valueAr: "تبرع الآن", valueEn: "Donate Now" },
  { page: "home", section: "contact", key: "address_label", valueAr: "العنوان", valueEn: "Address" },
  { page: "home", section: "contact", key: "address_value", valueAr: "الخرطوم - السودان", valueEn: "Khartoum - Sudan" },
  { page: "home", section: "contact", key: "phone_label", valueAr: "الهاتف", valueEn: "Phone" },
  { page: "home", section: "contact", key: "phone_value", valueAr: "+249114210853", valueEn: "+249114210853" },
  { page: "home", section: "contact", key: "email_label", valueAr: "البريد الإلكتروني", valueEn: "Email" },
  { page: "home", section: "contact", key: "email_value", valueAr: "aiuagho@gmail.com", valueEn: "aiuagho@gmail.com" },
  // ABOUT
  { page: "about", section: "hero", key: "title", valueAr: "من نحن", valueEn: "About Us" },
  { page: "about", section: "hero", key: "subtitle", valueAr: "تعرف على رؤيتنا ومهمتنا وأهدافنا", valueEn: "Learn about our vision, mission and goals" },
  { page: "about", section: "tabs", key: "who_we_are", valueAr: "من نحن", valueEn: "Who We Are" },
  { page: "about", section: "tabs", key: "vision", valueAr: "رؤيتنا", valueEn: "Our Vision" },
  { page: "about", section: "tabs", key: "mission", valueAr: "مهمتنا", valueEn: "Our Mission" },
  { page: "about", section: "tabs", key: "objectives", valueAr: "أهدافنا", valueEn: "Our Objectives" },
  { page: "about", section: "tabs", key: "history", valueAr: "تاريخنا", valueEn: "Our History" },
  { page: "about", section: "who_we_are", key: "description", valueAr: "رابطة خريجي جامعة أفريقيا العالمية هي منظمة غير ربحية تأسست عام 2013 بهدف تعزيز الروابط بين خريجي الجامعة وخدمة المجتمع الأكاديمي والمجتمعي.", valueEn: "The Association of IUA Graduates is a non-profit organization founded in 2013 to strengthen bonds between graduates and serve the academic and community society." },
  { page: "about", section: "stats", key: "founding_year", valueAr: "2013", valueEn: "2013" },
  { page: "about", section: "stats", key: "founding_year_label", valueAr: "سنة التأسيس", valueEn: "Year Founded" },
  { page: "about", section: "stats", key: "members_count", valueAr: "5,000+", valueEn: "5,000+" },
  { page: "about", section: "stats", key: "members_count_label", valueAr: "عضو", valueEn: "Members" },
  { page: "about", section: "stats", key: "events_count", valueAr: "50+", valueEn: "50+" },
  { page: "about", section: "stats", key: "events_count_label", valueAr: "فعالية", valueEn: "Events" },
  { page: "about", section: "stats", key: "projects_count", valueAr: "20+", valueEn: "20+" },
  { page: "about", section: "stats", key: "projects_count_label", valueAr: "مشروع", valueEn: "Projects" },
  { page: "about", section: "vision", key: "title", valueAr: "رؤيتنا", valueEn: "Our Vision" },
  { page: "about", section: "vision", key: "item1_title", valueAr: "الريادة", valueEn: "Leadership" },
  { page: "about", section: "vision", key: "item1_desc", valueAr: "أن نكون الروابطة الأكاديمية الأولى في المنطقة", valueEn: "To be the leading academic association in the region" },
  { page: "about", section: "vision", key: "item2_title", valueAr: "التواصل", valueEn: "Connection" },
  { page: "about", section: "vision", key: "item2_desc", valueAr: "بناء شبكة قوية من الخريجين المتخصصين", valueEn: "Building a strong network of specialized graduates" },
  { page: "about", section: "vision", key: "item3_title", valueAr: "الابتكار", valueEn: "Innovation" },
  { page: "about", section: "vision", key: "item3_desc", valueAr: "تقديم حلول إبداعية لتحديات المجتمع", valueEn: "Providing creative solutions to community challenges" },
  { page: "about", section: "vision", key: "item4_title", valueAr: "التنمية", valueEn: "Development" },
  { page: "about", section: "vision", key: "item4_desc", valueAr: "المساهمة في التنمية المستدامة للبلاد", valueEn: "Contributing to sustainable development of the country" },
  { page: "about", section: "mission", key: "title", valueAr: "مهمتنا", valueEn: "Our Mission" },
  { page: "about", section: "mission", key: "item1_title", valueAr: "التواصل والشبكات", valueEn: "Networking" },
  { page: "about", section: "mission", key: "item1_desc", valueAr: "تعزيز التواصل بين الخريجين وبناء شبكة مهنية قوية", valueEn: "Strengthening communication between graduates and building a strong professional network" },
  { page: "about", section: "mission", key: "item2_title", valueAr: "التطوير والتمكين", valueEn: "Development & Empowerment" },
  { page: "about", section: "mission", key: "item2_desc", valueAr: "تقديم برامج تدريبية وتطويرية للأعضاء", valueEn: "Providing training and development programs for members" },
  { page: "about", section: "mission", key: "item3_title", valueAr: "الخدمة والدعم", valueEn: "Service & Support" },
  { page: "about", section: "mission", key: "item3_desc", valueAr: "دعم الخريجين في مسيرتهم المهنية والأكاديمية", valueEn: "Supporting graduates in their professional and academic journey" },
  { page: "about", section: "mission", key: "item4_title", valueAr: "الابتكار والقيادة", valueEn: "Innovation & Leadership" },
  { page: "about", section: "mission", key: "item4_desc", valueAr: "تعزيز ثقافة الابتكار والقيادة بين الخريجين", valueEn: "Fostering a culture of innovation and leadership among graduates" },
  { page: "about", section: "objectives", key: "title", valueAr: "أهدافنا", valueEn: "Our Objectives" },
  { page: "about", section: "objectives", key: "item1_title", valueAr: "بناء شبكة خريجين", valueEn: "Building Alumni Network" },
  { page: "about", section: "objectives", key: "item1_desc", valueAr: "إنشاء منصة تواصل فعالة بين جميع خريجي الجامعة", valueEn: "Creating an effective communication platform for all university graduates" },
  { page: "about", section: "objectives", key: "item2_title", valueAr: "دعم التطور المهني", valueEn: "Supporting Professional Development" },
  { page: "about", section: "objectives", key: "item2_desc", valueAr: "تقديم برامج تدريبية وورش عمل لتطوير مهارات الأعضاء", valueEn: "Providing training programs and workshops to develop members' skills" },
  { page: "about", section: "objectives", key: "item3_title", valueAr: "خدمة المجتمع", valueEn: "Community Service" },
  { page: "about", section: "objectives", key: "item3_desc", valueAr: "المشاركة في المشاريع المجتمعية التنموية", valueEn: "Participating in community development projects" },
  { page: "about", section: "objectives", key: "item4_title", valueAr: "تعزيز الهوية الأكاديمية", valueEn: "Strengthening Academic Identity" },
  { page: "about", section: "objectives", key: "item4_desc", valueAr: "الحفاظ على الروابط الأكاديمية والبحثية مع الجامعة", valueEn: "Maintaining academic and research ties with the university" },
  { page: "about", section: "history", key: "title", valueAr: "تاريخنا", valueEn: "Our History" },
  { page: "about", section: "history", key: "year2013_title", valueAr: "تأسيس الرابطة", valueEn: "Association Founded" },
  { page: "about", section: "history", key: "year2013_desc", valueAr: "تأسيس رابطة خريجي جامعة أفريقيا العالمية", valueEn: "Founded the Association of IUA Graduates" },
  { page: "about", section: "history", key: "year2015_title", valueAr: "أول مؤتمر وطني", valueEn: "First National Conference" },
  { page: "about", section: "history", key: "year2015_desc", valueAr: "عقد أول مؤتمر وطني للخريجين", valueEn: "Held the first national graduates conference" },
  { page: "about", section: "history", key: "year2018_title", valueAr: "افتتاح الفروع", valueEn: "Branches Opened" },
  { page: "about", section: "history", key: "year2018_desc", valueAr: "افتتاح فروع الرابطة في عدة ولايات", valueEn: "Opened association branches in several states" },
  { page: "about", section: "history", key: "year2020_title", valueAr: "التحول الرقمي", valueEn: "Digital Transformation" },
  { page: "about", section: "history", key: "year2020_desc", valueAr: "إطلاق المنصة الرقمية لإدارة العضوية", valueEn: "Launched digital platform for membership management" },
  { page: "about", section: "history", key: "year2023_title", valueAr: "توسيع الخدمات", valueEn: "Services Expansion" },
  { page: "about", section: "history", key: "year2023_desc", valueAr: "إطلاق برامج التدريب والاستشارات المهنية", valueEn: "Launched training and career consultation programs" },
  { page: "about", section: "history", key: "year2025_title", valueAr: "شراكات دولية", valueEn: "International Partnerships" },
  { page: "about", section: "history", key: "year2025_desc", valueAr: "توقيع اتفاقيات تعاون دولية", valueEn: "Signed international cooperation agreements" },
  { page: "about", section: "history", key: "year2026_title", valueAr: "مرحلة النمو", valueEn: "Growth Phase" },
  { page: "about", section: "history", key: "year2026_desc", valueAr: "توسيع قاعدة الأعضاء وتعزيز البرامج", valueEn: "Expanding member base and strengthening programs" },
  { page: "about", section: "cta", key: "title", valueAr: "كن جزءاً من رحلتنا", valueEn: "Be Part of Our Journey" },
  { page: "about", section: "cta", key: "button_text", valueAr: "انضم إلينا", valueEn: "Join Us" },
  // CONTACT
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
  // SERVICES
  { page: "services", section: "hero", key: "title", valueAr: "خدماتنا", valueEn: "Our Services" },
  { page: "services", section: "hero", key: "subtitle", valueAr: "نقدم مجموعة متكاملة من الخدمات لخدمة أعضائنا", valueEn: "We offer a comprehensive range of services for our members" },
  { page: "services", section: "service1", key: "title", valueAr: "خدمات الخريجين", valueEn: "Alumni Services" },
  { page: "services", section: "service1", key: "description", valueAr: "خدمات متكاملة مصممة خصيصاً لتلبية احتياجات الخريجين", valueEn: "Comprehensive services designed specifically to meet graduates' needs" },
  { page: "services", section: "service2", key: "title", valueAr: "الإرشاد الأكاديمي", valueEn: "Academic Guidance" },
  { page: "services", section: "service2", key: "description", valueAr: "إرشاد متخصص للطلاب والخريجين الراغبين في الاستمرار الأكاديمي", valueEn: "Specialized guidance for students and graduates wishing to continue academically" },
  { page: "services", section: "service3", key: "title", valueAr: "البحث عن العمل", valueEn: "Job Search" },
  { page: "services", section: "service3", key: "description", valueAr: "مساعدة الخريجين في العثور على فرص عمل مناسبة", valueEn: "Helping graduates find suitable job opportunities" },
  { page: "services", section: "service4", key: "title", valueAr: "برامج التدريب", valueEn: "Training Programs" },
  { page: "services", section: "service4", key: "description", valueAr: "برامج تدريبية وتطويرية لتعزيز مهارات الأعضاء", valueEn: "Training and development programs to enhance members' skills" },
  { page: "services", section: "service5", key: "title", valueAr: "الاستشارات المهنية", valueEn: "Career Consultations" },
  { page: "services", section: "service5", key: "description", valueAr: "استشارات مهنية متخصصة لبناء المسار الوظيفي", valueEn: "Specialized career consultations for building career paths" },
  { page: "services", section: "service6", key: "title", valueAr: "فعاليات التواصل", valueEn: "Networking Events" },
  { page: "services", section: "service6", key: "description", valueAr: "فعاليات دورية لتقوية الروابط بين الخريجين", valueEn: "Regular events to strengthen bonds between graduates" },
  { page: "services", section: "cta", key: "title", valueAr: "هل تحتاج مساعدة؟", valueEn: "Need Help?" },
  { page: "services", section: "cta", key: "button_text", valueAr: "تواصل معنا", valueEn: "Contact Us" },
  // MEMBERSHIP
  { page: "membership", section: "hero", key: "title", valueAr: "العضوية", valueEn: "Membership" },
  { page: "membership", section: "hero", key: "subtitle", valueAr: "انضم إلى أكبر شبكة لخريجي جامعة أفريقيا العالمية", valueEn: "Join the largest network of IUA graduates" },
  { page: "membership", section: "benefits", key: "title", valueAr: "مزايا العضوية", valueEn: "Membership Benefits" },
  { page: "membership", section: "pricing", key: "title", valueAr: "خطط العضوية", valueEn: "Membership Plans" },
  { page: "membership", section: "pricing", key: "annual_name", valueAr: "العضوية السنوية", valueEn: "Annual Membership" },
  { page: "membership", section: "pricing", key: "annual_price", valueAr: "50,000", valueEn: "50,000" },
  { page: "membership", section: "pricing", key: "premium_name", valueAr: "العضوية المميزة", valueEn: "Premium Membership" },
  { page: "membership", section: "pricing", key: "premium_price", valueAr: "100,000", valueEn: "100,000" },
  { page: "membership", section: "pricing", key: "lifetime_name", valueAr: "عضوية مدى الحياة", valueEn: "Lifetime Membership" },
  { page: "membership", section: "pricing", key: "lifetime_price", valueAr: "500,000", valueEn: "500,000" },
  { page: "membership", section: "pricing", key: "popular_badge", valueAr: "الأكثر طلباً", valueEn: "Most Popular" },
  { page: "membership", section: "cta", key: "title", valueAr: "جاهز للانضمام؟", valueEn: "Ready to Join?" },
  { page: "membership", section: "cta", key: "button_text", valueAr: "طلب عضوية", valueEn: "Apply for Membership" },
  // MEDIA
  { page: "media", section: "hero", key: "title", valueAr: "المركز الإعلامي", valueEn: "Media Center" },
  { page: "media", section: "hero", key: "subtitle", valueAr: "تابع آخر أخبارنا وأحداثنا", valueEn: "Follow our latest news and events" },
  { page: "media", section: "gallery", key: "title", valueAr: "معرض الصور", valueEn: "Photo Gallery" },
  { page: "media", section: "videos", key: "title", valueAr: "الفيديوهات", valueEn: "Videos" },
  { page: "media", section: "publications", key: "title", valueAr: "المنشورات", valueEn: "Publications" },
  { page: "media", section: "reports", key: "title", valueAr: "التقارير", valueEn: "Reports" },
  // ORGANIZATION
  { page: "organization", section: "hero", key: "title", valueAr: "الهيكل التنظيمي", valueEn: "Organizational Structure" },
  { page: "organization", section: "hero", key: "subtitle", valueAr: "تعرّف على الهيكل التنظيمي للرابطة", valueEn: "Learn about the association's organizational structure" },
  { page: "organization", section: "board", key: "title", valueAr: "مجلس الإدارة", valueEn: "Board of Directors" },
  { page: "organization", section: "secretariat", key: "title", valueAr: "الأمانة العامة", valueEn: "The Secretariat" },
  { page: "organization", section: "committees", key: "title", valueAr: "اللجان", valueEn: "Committees" },
  { page: "organization", section: "branches", key: "title", valueAr: "الفروع", valueEn: "Branches" },
  // SECRETARIAT
  { page: "secretariat", section: "hero", key: "title", valueAr: "الأمانة العامة", valueEn: "The Secretariat" },
  { page: "secretariat", section: "hero", key: "subtitle", valueAr: "الجهاز التنفيذي الإداري الذي يضمن سير عمل الرابطة بفعالية وكفاءة", valueEn: "The executive administrative body ensuring efficient operations" },
  { page: "secretariat", section: "about", key: "title", valueAr: "نبذة عن الأمانة العامة", valueEn: "About the Secretariat" },
  { page: "secretariat", section: "responsibilities", key: "title", valueAr: "المسؤوليات الرئيسية", valueEn: "Key Responsibilities" },
  { page: "secretariat", section: "departments", key: "title", valueAr: "الأقسام", valueEn: "Departments" },
  { page: "secretariat", section: "contact", key: "title", valueAr: "تواصل مع الأمانة العامة", valueEn: "Contact the Secretariat" },
  // OTHER PAGES
  { page: "faq", section: "hero", key: "title", valueAr: "الأسئلة الشائعة", valueEn: "Frequently Asked Questions" },
  { page: "posts", section: "hero", key: "title", valueAr: "المشاركات", valueEn: "Posts" },
  { page: "projects", section: "hero", key: "title", valueAr: "المشاريع", valueEn: "Projects" },
  { page: "news", section: "hero", key: "title", valueAr: "الأخبار", valueEn: "News" },
  { page: "events", section: "hero", key: "title", valueAr: "الأحداث والفعاليات", valueEn: "Events & Activities" },
  { page: "partners", section: "hero", key: "title", valueAr: "شركاؤنا", valueEn: "Our Partners" },
  { page: "volunteer", section: "hero", key: "title", valueAr: "التطوع", valueEn: "Volunteer" },
  { page: "donations", section: "hero", key: "title", valueAr: "التبرعات", valueEn: "Donations" },
  // FOOTER
  { page: "footer", section: "newsletter", key: "title", valueAr: "اشترك في نشرتنا البريدية", valueEn: "Subscribe to Our Newsletter" },
  { page: "footer", section: "about", key: "description", valueAr: "رابطة خريجي جامعة أفريقيا العالمية - منظمة غير ربحية", valueEn: "Association of IUA Graduates - A non-profit organization" },
  { page: "footer", section: "copyright", key: "text", valueAr: "© 2025 رابطة خريجي جامعة أفريقيا العالمية. جميع الحقوق محفوظة.", valueEn: "© 2025 Association of IUA Graduates. All rights reserved." },
];

const secretariatMembers = [
  { name: "د. أحمد محمد علي", nameEn: "Dr. Ahmed Mohamed Ali", role: "الأمين العام", roleEn: "Secretary General", bio: "دكتور في إدارة الأعمال، خبرة أكثر من 15 عاماً في الإدارة التنفيذية.", bioEn: "PhD in Business Administration with over 15 years of executive management experience.", phone: "+249114210853", email: "ahmed.ali@aiuag.org", category: "secretariat", order: 1 },
  { name: "أ. فاطمة أحمد حسن", nameEn: "Ms. Fatima Ahmed Hassan", role: "نائبة الأمين العام للشؤون الإدارية", roleEn: "Deputy Secretary General for Administrative Affairs", bio: "ماجستير في الإدارة العامة، متخصصة في الشؤون الإدارية والموارد البشرية.", bioEn: "Master's in Public Administration, specialized in administrative affairs.", phone: "+249114210854", email: "fatima.hassan@aiuag.org", category: "secretariat", order: 2 },
  { name: "أ. محمد عبدالله أحمد", nameEn: "Mr. Mohammed Abdullah Ahmed", role: "نائب الأمين العام للشؤون المالية", roleEn: "Deputy Secretary General for Financial Affairs", bio: "محاسب معتمد، خبرة 12 عاماً في الإدارة المالية والمراجعية.", bioEn: "Certified accountant with 12 years of experience in financial management.", phone: "+249114210855", email: "mohammed.abdullah@aiuag.org", category: "secretariat", order: 3 },
  { name: "د. سارة يوسف إبراهيم", nameEn: "Dr. Sara Youssef Ibrahim", role: "مديرة قسم العضوية", roleEn: "Head of Membership Department", bio: "دكتوراه في العلوم الاجتماعية، مسؤولة عن إدارة شؤون الأعضاء.", bioEn: "PhD in Social Sciences, responsible for managing member affairs.", phone: "+249114210856", email: "sara.ibrahim@aiuag.org", category: "department", order: 4 },
  { name: "أ. خالد عمر المصطفى", nameEn: "Mr. Khalid Omar Mustafa", role: "مدير قسم الإعلام والعلاقات", roleEn: "Head of Media & Relations Department", bio: "بكالوريوس صحافة وإعلام، خبرة واسعة في العلاقات العامة.", bioEn: "Bachelor's in Journalism and Media, extensive experience in public relations.", phone: "+249114210857", email: "khalid.omar@aiuag.org", category: "department", order: 5 },
  { name: "أ. نورة حسين محمد", nameEn: "Ms. Noura Hussein Mohammed", role: "مديرة قسم البرامج والأنشطة", roleEn: "Head of Programs & Activities Department", bio: "ماجستير في إدارة المشاريع، متخصصة في التخطيط والتنفيذ.", bioEn: "Master's in Project Management, specialized in planning and implementation.", phone: "+249114210858", email: "noura.hussein@aiuag.org", category: "department", order: 6 },
  { name: "د. عبدالله علي الصالح", nameEn: "Dr. Abdullah Ali Al-Salah", role: "مستشار الأمين العام للشؤون الأكاديمية", roleEn: "Academic Affairs Advisor", bio: "أستاذ جامعي، خبرة في الإرشاد الأكاديمي وتطوير المناهج.", bioEn: "University professor with experience in academic guidance.", phone: "+249114210859", email: "abdullah.saleh@aiuag.org", category: "secretariat", order: 7 },
  { name: "أ. مريم عثمان أحمد", nameEn: "Ms. Mariam Othman Ahmed", role: "مشرفة على لجنة العضوية", roleEn: "Membership Committee Supervisor", bio: "خبرة 8 سنوات في إدارة العضوية والتحقق من البيانات.", bioEn: "8 years of experience in membership management.", phone: "+249114210860", email: "mariam.othman@aiuag.org", category: "committee", order: 8 },
];

export async function POST() {
  try {
    let pageCount = 0;
    for (const item of pageContents) {
      try {
        await prisma.pageContent.upsert({
          where: { page_section_key: { page: item.page, section: item.section, key: item.key } },
          update: { valueAr: item.valueAr, valueEn: item.valueEn },
          create: item,
        });
        pageCount++;
      } catch { /* skip duplicates */ }
    }

    let memberCount = 0;
    for (const member of secretariatMembers) {
      const existing = await prisma.secretariatMember.findFirst({ where: { name: member.name } });
      if (!existing) {
        await prisma.secretariatMember.create({ data: member });
        memberCount++;
      }
    }

    return NextResponse.json({ success: true, pageCount, memberCount });
  } catch (error) {
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
