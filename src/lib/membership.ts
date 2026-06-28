import prisma from "@/lib/prisma"

export async function generateMembershipNumber(): Promise<string> {
  const last = await prisma.member.findFirst({
    where: { membershipNumber: { startsWith: "AIUAG-" } },
    orderBy: { membershipNumber: "desc" },
    select: { membershipNumber: true },
  })
  let nextNum = 1
  if (last?.membershipNumber) {
    const match = last.membershipNumber.match(/AIUAG-(\d+)/)
    if (match) nextNum = parseInt(match[1]) + 1
  }
  return `AIUAG-${String(nextNum).padStart(10, "0")}`
}
