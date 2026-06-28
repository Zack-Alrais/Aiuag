import { redirect } from "next/navigation";

export default function MissionPage({ params }: { params: { lang: string } }) {
  redirect(`/${params.lang}/about#mission`);
}
