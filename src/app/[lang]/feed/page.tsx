import { redirect } from "next/navigation";

// The friends feed is now a filter inside the community posts hub (/posts).
// Keep /feed as a redirect for old links.
interface Props {
  params: Promise<{ lang: string }>;
}

export default async function FriendsFeedPage({ params }: Props) {
  const { lang } = await params;
  redirect(`/${lang}/posts`);
}