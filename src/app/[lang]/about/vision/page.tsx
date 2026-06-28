import { redirect } from "next/navigation";

export default function VisionPage({ params }: { params: { lang: string } }) {
  redirect(`/${params.lang}/about#vision`);
}
