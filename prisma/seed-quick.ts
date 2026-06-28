import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  let userId = "admin-placeholder";

  const existing = await prisma.user.findFirst({ where: { role: "admin" } });
  if (existing) {
    userId = existing.id;
  } else {
    const user = await prisma.user.create({
      data: {
        email: "admin@test.com",
        name: "Admin",
        password: "test",
        role: "admin",
      },
    });
    userId = user.id;
  }

  const items = [
    { slug: "test-news-1", titleAr: "اختبار الخبر الأول", titleEn: "Test News 1", contentAr: "هذا هو محتوى الخبر الأول.", contentEn: "This is the first test news.", excerptAr: "ملخص الخبر الأول", excerptEn: "First news summary", category: "أخبار" },
    { slug: "test-news-2", titleAr: "المؤتمر السنوي للخريجين", titleEn: "Annual Alumni Conference", contentAr: "عقد المؤتمر السنوي للخريجين.", contentEn: "The annual alumni conference was held.", excerptAr: "ملخص المؤتمر", excerptEn: "Conference summary", category: "مؤتمرات" },
  ];

  for (const item of items) {
    const news = await prisma.news.upsert({
      where: { slug: item.slug },
      update: {},
      create: { ...item, authorId: userId, status: "published", publishedAt: new Date() },
    });
    console.log(`Created: ${news.slug}`);
  }

  const count = await prisma.news.count();
  console.log(`Total news: ${count}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
