const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("Zack0407", 12);
  await prisma.user.update({
    where: { email: "Pen@cube.com" },
    data: { password: hash, role: "admin", emailVerified: new Date() },
  });
  console.log("Password updated for Pen@cube.com!");

  const hash2 = await bcrypt.hash("admin123", 12);
  await prisma.user.update({
    where: { email: "admin@aiuag.org" },
    data: { password: hash2, role: "admin", emailVerified: new Date() },
  });
  console.log("Password updated for admin@aiuag.org!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
