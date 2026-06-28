import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function GET() {
  try {
    const [
      membersCount,
      pendingMembersCount,
      newsCount,
      eventsCount,
      projectsCount,
      galleryCount,
      contactsCount,
      donationsAggregate,
      committeesCount,
      partnersCount,
      faqsCount,
      boardCount,
      videosCount,
      publicationsCount,
      reportsCount,
      branchesCount,
    ] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { status: "pending" } }),
      prisma.news.count(),
      prisma.event.count(),
      prisma.project.count(),
      prisma.gallery.count(),
      prisma.contactMessage.count(),
      prisma.donation.aggregate({ _sum: { amount: true }, where: { status: "completed" } }),
      prisma.committee.count(),
      prisma.partner.count(),
      prisma.fAQ.count(),
      prisma.boardMember.count(),
      prisma.video.count(),
      prisma.publication.count(),
      prisma.report.count(),
      prisma.branch.count(),
    ]);

    return NextResponse.json({
      members: membersCount,
      pendingMembers: pendingMembersCount,
      news: newsCount,
      events: eventsCount,
      projects: projectsCount,
      gallery: galleryCount,
      contacts: contactsCount,
      donationsTotal: donationsAggregate._sum.amount || 0,
      committees: committeesCount,
      partners: partnersCount,
      faqs: faqsCount,
      boardMembers: boardCount,
      videos: videosCount,
      publications: publicationsCount,
      reports: reportsCount,
      branches: branchesCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
