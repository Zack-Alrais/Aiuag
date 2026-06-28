const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "Pen@cube.com";
  const password = "Zack0407";
  const name = "مدير النظام";

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    const updated = await prisma.user.update({
      where: { email },
      data: {
        role: "admin",
        name: existingUser.name || name,
      },
    });
    console.log("Updated existing user to admin:", updated.email);
  } else {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "admin",
        emailVerified: new Date(),
      },
    });
    console.log("Created admin user:", user.email);
  }

  // Also make sure the old admin exists
  const oldAdmin = await prisma.user.findUnique({
    where: { email: "admin@aiuag.org" },
  });

  if (!oldAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 12);
    await prisma.user.create({
      data: {
        name: "مدير النظام القديم",
        email: "admin@aiuag.org",
        password: hashedPassword,
        role: "admin",
        emailVerified: new Date(),
      },
    });
    console.log("Created old admin user");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
