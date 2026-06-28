import { NextResponse } from "next/server";

const sampleGallery = [
  {
    id: "1",
    title: "AI Ethics Workshop 2026",
    image: "/images/gallery/workshop-1.jpg",
    category: "Events",
    date: "2026-03-15",
    description: "Participants engaging in hands-on AI ethics exercises.",
  },
  {
    id: "2",
    title: "AIUAG Annual Conference",
    image: "/images/gallery/conference-1.jpg",
    category: "Conferences",
    date: "2026-02-20",
    description: "Opening ceremony of the AIUAG Annual Conference.",
  },
  {
    id: "3",
    title: "Team Building Retreat",
    image: "/images/gallery/retreat-1.jpg",
    category: "Culture",
    date: "2026-01-10",
    description: "AIUAG staff during the annual team building retreat.",
  },
  {
    id: "4",
    title: "Youth Innovation Showcase",
    image: "/images/gallery/youth-1.jpg",
    category: "Events",
    date: "2026-04-05",
    description: "Young innovators presenting their AI projects.",
  },
  {
    id: "5",
    title: "Policy Roundtable Discussion",
    image: "/images/gallery/roundtable-1.jpg",
    category: "Conferences",
    date: "2026-05-12",
    description: "Policymakers and researchers discussing AI governance.",
  },
];

export async function GET() {
  return NextResponse.json({ success: true, data: sampleGallery });
}
