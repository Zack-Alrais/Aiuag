import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating/updating users...");

  const adminPassword = await bcrypt.hash("admin123", 12);

  // Admin user (used for /ai.admin login)
  const admin = await prisma.user.upsert({
    where: { email: "admin@aiuag.org" },
    update: { password: adminPassword, role: "admin", emailVerified: new Date() },
    create: {
      email: "admin@aiuag.org",
      name: "Admin",
      password: adminPassword,
      role: "admin",
      emailVerified: new Date(),
    },
  });
  console.log("✓ Admin user:", admin.email, "(password: admin123)");

  // Second admin from create-admin.js
  const penPassword = await bcrypt.hash("Zack0407", 12);
  const penUser = await prisma.user.upsert({
    where: { email: "Pen@cube.com" },
    update: { password: penPassword, role: "admin", emailVerified: new Date() },
    create: {
      email: "Pen@cube.com",
      name: "مدير النظام",
      password: penPassword,
      role: "admin",
      emailVerified: new Date(),
    },
  });
  console.log("✓ Admin user:", penUser.email, "(password: Zack0407)");

  // Member user for testing
  const memberPassword = await bcrypt.hash("member123", 12);
  const member = await prisma.user.upsert({
    where: { email: "member@aiuag.com" },
    update: { password: memberPassword, role: "member", emailVerified: new Date() },
    create: {
      email: "member@aiuag.com",
      name: "أحمد محمد",
      password: memberPassword,
      role: "member",
      emailVerified: new Date(),
    },
  });
  console.log("✓ Member user:", member.email, "(password: member123)");

  await prisma.$disconnect();
  console.log("\n✅ Done! You can now log in with any of these accounts.");
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
