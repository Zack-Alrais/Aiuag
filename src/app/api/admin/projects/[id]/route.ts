import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      titleAr,
      titleEn,
      slug,
      descriptionAr,
      descriptionEn,
      featuredImage,
      gallery,
      startDate,
      endDate,
      status,
      category,
      budget,
      partnerId,
    } = body;

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.project.findUnique({ where: { slug } });
      if (slugExists) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
      }
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(titleAr && { titleAr }),
        ...(titleEn && { titleEn }),
        ...(slug && { slug }),
        ...(descriptionAr && { descriptionAr }),
        ...(descriptionEn && { descriptionEn }),
        ...(featuredImage !== undefined && { featuredImage }),
        ...(gallery !== undefined && { gallery }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(status && { status }),
        ...(category !== undefined && { category }),
        ...(budget !== undefined && { budget: budget ? parseFloat(budget) : null }),
        ...(partnerId !== undefined && { partnerId }),
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
