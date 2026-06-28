import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  const faculties = await prisma.graduate.findMany({
    select: { faculty: true },
    distinct: ["faculty"],
    where: { faculty: { not: "" } },
  })
  console.log("=== Faculties in DB ===")
  faculties.map(f => f.faculty).filter(Boolean).sort().forEach(f => console.log(f))

  const countries = await prisma.graduate.findMany({
    select: { country: true },
    distinct: ["country"],
    where: { country: { not: "" } },
  })
  console.log("\n=== Countries in DB ===")
  countries.map(c => c.country).filter(Boolean).sort().forEach(c => console.log(c))

  const years = await prisma.graduate.findMany({
    select: { graduationYear: true },
    distinct: ["graduationYear"],
    orderBy: { graduationYear: "desc" },
  })
  console.log("\n=== Years in DB ===")
  years.map(y => y.graduationYear).forEach(y => console.log(y))

  await prisma.$disconnect()
}

main()
