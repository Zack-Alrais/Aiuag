import { Metadata } from "next"
import UnifiedAbout from "@/components/about/unified-about"

export const metadata: Metadata = {
  title: "About AIUAG | من نحن",
  description: "Learn about the Africa International University Alumni Association (AIUAG) - our vision, mission, objectives, and history.",
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <UnifiedAbout lang={lang} />
}
