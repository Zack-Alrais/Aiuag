import { redirect } from "next/navigation";

export default function HistoryPage({ params }: { params: { lang: string } }) {
  redirect(`/${params.lang}/about#history`);
}
