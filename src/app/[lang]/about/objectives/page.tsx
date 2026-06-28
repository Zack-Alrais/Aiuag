import { redirect } from "next/navigation";

export default function ObjectivesPage({ params }: { params: { lang: string } }) {
  redirect(`/${params.lang}/about#objectives`);
}
