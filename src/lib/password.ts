import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function findUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  return prisma.user.findFirst({
    where: {
      email: {
        equals: normalizedEmail,
        mode: "insensitive",
      },
    },
  });
}

export async function verifyStoredPassword(inputPassword: string, storedPassword: string) {
  if (!inputPassword || !storedPassword) {
    return { isValid: false, isPlainText: false };
  }

  if (storedPassword === inputPassword) {
    return { isValid: true, isPlainText: true };
  }

  try {
    const isValid = await bcrypt.compare(inputPassword, storedPassword);
    return { isValid, isPlainText: false };
  } catch {
    return { isValid: false, isPlainText: false };
  }
}
