import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const ExcelJS = require("exceljs");
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("الأعضاء");

    // Define columns
    ws.columns = [
      { header: "م", key: "index", width: 5 },
      { header: "الاسم", key: "name", width: 25 },
      { header: "الاسم بالإنجليزية", key: "nameEn", width: 25 },
      { header: "البريد الإلكتروني", key: "email", width: 30 },
      { header: "رقم الهاتف", key: "phone", width: 18 },
      { header: "الجنس", key: "gender", width: 10 },
      { header: "تاريخ الميلاد", key: "birthDate", width: 15 },
      { header: "الدولة", key: "country", width: 18 },
      { header: "الولاية", key: "state", width: 18 },
      { header: "المدينة", key: "city", width: 18 },
      { header: "عنوان السكن", key: "address", width: 25 },
      { header: "الجامعة", key: "university", width: 25 },
      { header: "الكلية", key: "faculty", width: 20 },
      { header: "التخصص", key: "specialization", width: 20 },
      { header: "الدرجة العلمية", key: "degree", width: 15 },
      { header: "سنة التخرج", key: "graduationYear", width: 12 },
      { header: "جهة العمل", key: "employer", width: 25 },
      { header: "المسمى الوظيفي", key: "jobTitle", width: 20 },
      { header: "القطاع", key: "jobSector", width: 15 },
      { header: "سنوات الخبرة", key: "yearsOfExperience", width: 12 },
      { header: "نوع العضوية", key: "membershipType", width: 15 },
      { header: "رقم العضوية", key: "membershipNumber", width: 20 },
      { header: "الحالة", key: "status", width: 12 },
      { header: "تاريخ الانضمام", key: "createdAt", width: 15 },
      { header: "شهادة التخرج", key: "graduationCertificate", width: 40 },
    ];

    // Style header
    const headerStyle = {
      font: { bold: true, color: { argb: "FFFFFFFF" }, size: 11 },
      fill: { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FF1A3A6B" } },
      alignment: { horizontal: "center" as const, vertical: "middle" as const, wrapText: true },
      border: {
        top: { style: "thin" as const }, bottom: { style: "thin" as const },
        left: { style: "thin" as const }, right: { style: "thin" as const },
      },
    };

    ws.getRow(1).eachCell((cell: any) => { cell.style = headerStyle; });

    // Add data
    members.forEach((m, i) => {
      ws.addRow({
        index: i + 1,
        name: m.user?.name || "",
        nameEn: m.nameEn || "",
        email: m.user?.email || "",
        phone: m.phone || "",
        gender: m.gender || "",
        birthDate: m.birthDate || "",
        country: m.country || "",
        state: m.state || "",
        city: m.city || "",
        address: m.address || "",
        university: m.university || "",
        faculty: m.faculty || "",
        specialization: m.specialization || "",
        degree: m.degree || "",
        graduationYear: m.graduationYear || "",
        employer: m.employer || "",
        jobTitle: m.jobTitle || "",
        jobSector: m.jobSector || "",
        yearsOfExperience: m.yearsOfExperience || "",
        membershipType: m.membershipType || "",
        membershipNumber: m.membershipNumber || "",
        status: m.status === "approved" ? "مفعل" : m.status === "pending" ? "قيد الانتظار" : "مرفوض",
        createdAt: m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-GB") : "",
        graduationCertificate: m.graduationCertificate || "",
      });
    });

    // Auto filter
    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: members.length + 1, column: ws.columns.length },
    };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="members-${new Date().toLocaleDateString("en-CA")}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error("Export failed:", error);
    return NextResponse.json({ error: error.message || "Export failed" }, { status: 500 });
  }
}
