import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";

export async function GET() {
  try {
    const cacheKey = "filters:all";
    const cached = getCached(cacheKey, CACHE_TTL.LONG);
    if (cached) return NextResponse.json(cached);

    const facultiesFromGraduates = await prisma.graduate.findMany({
      distinct: ["faculty"],
      select: { faculty: true },
    });

    const facultiesFromMembers = await prisma.member.findMany({
      distinct: ["faculty"],
      select: { faculty: true },
    });

    const countriesFromGraduates = await prisma.graduate.findMany({
      distinct: ["country"],
      select: { country: true },
    });

    const countriesFromMembers = await prisma.member.findMany({
      distinct: ["country"],
      select: { country: true },
    });

    const FACULTIES = [
      "كلية الشريعة والقانون",
      "كلية اللغة العربية",
      "كلية التربية",
      "كلية الاقتصاد والإدارة",
      "كلية العلوم",
      "كلية التقنيات التطبيقية",
      "كلية الدعوة والعلوم الإسلامية",
      "كلية الدراسات الإسلامية",
    ];

    const allFaculties = [...new Set([
      ...FACULTIES,
      ...facultiesFromGraduates.map((g) => g.faculty).filter(Boolean) as string[],
      ...facultiesFromMembers.map((m) => m.faculty).filter(Boolean) as string[],
    ])].sort();

    const allCountries = [...new Set([
      ...countriesFromGraduates.map((g) => g.country).filter(Boolean) as string[],
      ...countriesFromMembers.map((m) => m.country).filter(Boolean) as string[],
    ])].sort();

    const result = {
      faculties: allFaculties,
      countries: allCountries,
      nationalities: allCountries,
    };

    setCache(cacheKey, result, CACHE_TTL.LONG);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch filters" }, { status: 500 });
  }
}
