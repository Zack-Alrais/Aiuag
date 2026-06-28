import { NextResponse } from "next/server";

const sampleProjects = [
  {
    id: "1",
    title: "AI Ethics Framework for Africa",
    description: "Developing a continent-wide ethical framework for AI development and deployment.",
    status: "Active",
    lead: "Dr. Amina Okafor",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    funding: "African Development Bank",
    image: "/images/projects/ethics.jpg",
  },
  {
    id: "2",
    title: "AI for Climate Action Initiative",
    description: "Leveraging AI technologies to address climate change challenges across Africa.",
    status: "Active",
    lead: "Prof. Kwame Mensah",
    startDate: "2026-03-01",
    endDate: "2027-02-28",
    funding: "UNDP",
    image: "/images/projects/climate.jpg",
  },
  {
    id: "3",
    title: "Youth AI Literacy Program",
    description: "Educational program to build AI literacy among African youth.",
    status: "Completed",
    lead: "Fatima Al-Rashid",
    startDate: "2025-06-01",
    endDate: "2026-05-31",
    funding: "Google.org",
    image: "/images/projects/youth.jpg",
  },
];

export async function GET() {
  return NextResponse.json({ success: true, data: sampleProjects });
}
