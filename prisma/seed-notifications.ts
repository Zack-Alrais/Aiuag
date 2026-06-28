import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const notifications = [
    {
      titleAr: "عضو جديد مسجل",
      titleEn: "New Member Registered",
      messageAr: "تم تسجيل عضو جديد في الرابطة",
      messageEn: "A new member has registered in the association",
      type: "success",
      entityType: "member",
    },
    {
      titleAr: "رسالة اتصال جديدة",
      titleEn: "New Contact Message",
      messageAr: "تم استلام رسالة اتصال جديدة من زائر الموقع",
      messageEn: "A new contact message has been received from a site visitor",
      type: "info",
      entityType: "contact",
    },
    {
      titleAr: "خبر جديد منشور",
      titleEn: "New News Published",
      messageAr: "تم نشر خبر جديد في صفحة الأخبار",
      messageEn: "A new article has been published on the news page",
      type: "info",
      entityType: "news",
    },
    {
      titleAr: "تبرع جديد",
      titleEn: "New Donation Received",
      messageAr: "تم استلام تبرع جديد بقيمة 50,000 ج.س",
      messageEn: "A new donation of 50,000 SDG has been received",
      type: "success",
      entityType: "donation",
    },
    {
      titleAr: "حدث قادم قريب",
      titleEn: "Upcoming Event Soon",
      messageAr: "يوجد حدث مقرره خلال 3 أيام - مؤتمر الخريجين السنوي",
      messageEn: "An event is scheduled in 3 days - Annual Alumni Conference",
      type: "warning",
      entityType: "event",
    },
  ];

  let count = 0;
  for (const notif of notifications) {
    const existing = await prisma.notification.findFirst({
      where: { titleAr: notif.titleAr },
    });
    if (!existing) {
      await prisma.notification.create({ data: notif as any });
      count++;
    }
  }

  const total = await prisma.notification.count();
  console.log(`Created: ${count}, Total: ${total}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
