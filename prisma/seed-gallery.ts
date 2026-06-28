import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const titleAr = "فعالية خريجي جامعة أفريقيا العالمية - فبراير 2023";
  const titleEn = "AIU Alumni Event - February 2023";
  const descriptionAr = "صور من فعالية رابطة خريجي جامعة أفريقيا العالمية التي أقيمت في فبراير 2023";
  const descriptionEn = "Photos from the Africa International University Alumni Association event held in February 2023";
  const album = "general";

  const files = Array.from({ length: 27 }, (_, i) => ({
    name: `alumni-event-2023-${String(i + 1).padStart(2, "0")}.jpeg`,
    index: i + 1,
  }));
  files.push({ name: "alumni-event-2023-28.jpg", index: 28 });

  let created = 0;
  let skipped = 0;

  for (const file of files) {
    const imageUrl = `/uploads/gallery/${file.name}`;
    const existing = await prisma.gallery.findFirst({ where: { imageUrl } });
    if (existing) {
      skipped++;
      continue;
    }
    await prisma.gallery.create({
      data: {
        title: `${titleAr} - ${file.index}`,
        description: descriptionAr,
        imageUrl,
        thumbnailUrl: null,
        album,
        tags: "خريجين,2023,فعالية,aiu,alumni",
        isActive: true,
      },
    });
    created++;
  }

  const total = await prisma.gallery.count();
  console.log(`Created: ${created}, Skipped: ${skipped}, Total in DB: ${total}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
