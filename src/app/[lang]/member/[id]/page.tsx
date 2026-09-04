"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  GraduationCap,
  MapPin,
  Building2,
  Briefcase,
  Mail,
  ArrowLeft,
  Loader2,
  Calendar,
  Linkedin,
  UserX,
} from "lucide-react";
import { useMember } from "@/hooks/use-member";
import { FriendButton } from "@/components/social/friend-button";
import PostsFeed from "@/app/[lang]/media/posts/feed";

interface MemberProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  cardPhoto: string | null;
  nameEn: string | null;
  faculty: string | null;
  specialization: string | null;
  graduationYear: number | null;
  country: string | null;
  city: string | null;
  state: string | null;
  degree: string | null;
  university: string | null;
  membershipType: string | null;
  joinedAt: string;
  bio: string | null;
  linkedin: string | null;
}

function Avatar({ src, name, size = 96 }: { src?: string | null; name?: string; size?: number }) {
  if (src) {
    return (
      <div className="rounded-full overflow-hidden ring-4 ring-white/70 dark:ring-[#1e2d42] shrink-0" style={{ width: size, height: size }}>
        <img src={src} alt={name || ""} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className="rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name?.charAt(0) || "U"}
    </div>
  );
}

export default function MemberPage() {
  const params = useParams<{ lang: string; id: string }>();
  const lang = params?.lang ?? "ar";
  const id = params?.id ?? "";
  const isAr = lang === "ar";
  const router = useRouter();
  const { member } = useMember();

  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const res = await fetch(`/api/members/${encodeURIComponent(id)}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error || "فشل التحميل");
      setProfile(d?.data ?? null);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) load();
  }, [id, load]);

  const messageMember = () => {
    if (!profile) return;
    if (!member) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/${lang}/member/${id}`)}`);
      return;
    }
    fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "direct", participantIds: [profile.id] }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.conversationId) router.push(`/${lang}/messages?conversation=${d.conversationId}`);
        else toast.error(d?.error || (isAr ? "تعذر بدء المحادثة" : "Could not start chat"));
      })
      .catch(() => toast.error(isAr ? "تعذر بدء المحادثة" : "Could not start chat"));
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 pt-24">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">{isAr ? "جارٍ التحميل..." : "Loading..."}</p>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 pt-24 text-center">
        <UserX className="w-12 h-12 text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400">{isAr ? "العضو غير موجود" : "Member not found"}</p>
        <Link href={`/${lang}/posts`} className="text-primary hover:underline text-sm">
          {isAr ? "عودة إلى المنشورات" : "Back to posts"}
        </Link>
      </div>
    );
  }

  const metaRows = [
    { icon: GraduationCap, value: [profile.faculty].filter(Boolean).join(", "), show: !!profile.faculty },
    { icon: Briefcase, value: profile.specialization, show: !!profile.specialization },
    { icon: Calendar, value: profile.graduationYear ? (isAr ? `دفعة ${profile.graduationYear}` : `Class of ${profile.graduationYear}`) : "", show: !!profile.graduationYear },
    { icon: Building2, value: profile.university, show: !!profile.university },
    { icon: MapPin, value: [profile.city, profile.state, profile.country].filter(Boolean).join(", "), show: !!(profile.city || profile.state || profile.country) },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1a]" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <Link
          href={`/${lang}/posts`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          {isAr ? "العودة إلى المنشورات" : "Back to posts"}
        </Link>

        {/* Profile card */}
        <div className="bg-white dark:bg-[#111927] rounded-2xl shadow-sm border border-gray-100 dark:border-[#1e2d42] overflow-hidden">
          <div className="h-32 bg-gradient-to-br from-primary via-primary-light to-primary-dark" />
          <div className="px-6 pb-6 -mt-12">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <Avatar src={profile.image || profile.cardPhoto} name={profile.name} size={96} />
              <div className="flex items-center gap-2 pb-1">
                {member && profile.id !== member.id && (
                  <>
                    <button
                      onClick={messageMember}
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#1e2d42] dark:text-gray-300 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      {isAr ? "مراسلة" : "Message"}
                    </button>
                    <FriendButton memberId={profile.id} lang={lang} />
                  </>
                )}
              </div>
            </div>

            <div className="mt-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
              {profile.nameEn && profile.nameEn !== profile.name && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{profile.nameEn}</p>
              )}
              {profile.membershipType && (
                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {profile.membershipType}
                </span>
              )}
            </div>

            {profile.bio && (
              <p className="mt-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{profile.bio}</p>
            )}

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {metaRows
                .filter((r) => r.show)
                .map((r, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#1e2d42] flex items-center justify-center text-primary shrink-0">
                      <r.icon className="w-4 h-4" />
                    </div>
                    <span className="truncate" dir="auto">{r.value}</span>
                  </div>
                ))}
              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#1e2d42] flex items-center justify-center text-primary shrink-0">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Member's posts */}
        <div className="mt-6">
          <PostsFeed authorId={profile.id} title={isAr ? `منشورات ${profile.name}` : `Posts by ${profile.name}`} showComposer={false} />
        </div>
      </div>
    </div>
  );
}
