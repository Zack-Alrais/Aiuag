// Shared small UI for social widgets (sidebar columns, suggestions, online list).
export function SocialAvatar({
  src,
  name,
  size = 36,
}: {
  src?: string | null;
  name?: string;
  size?: number;
}) {
  if (src) {
    return (
      <div className="rounded-full overflow-hidden shrink-0" style={{ width: size, height: size }}>
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

export function memberProfileUrl(lang: string, memberId: string): string {
  return `/${lang}/member/${memberId}`;
}

// Guard against malformed member ids reaching the /member/[id] route. Some list
// payloads have shipped an object where an id string was expected; never build
// a link like /member/[object Object].
export function safeMemberId(id: unknown): string {
  return typeof id === "string" && id.length > 0 ? id : "";
}

export function safeMemberUrl(lang: string, id: unknown): string | null {
  const sid = safeMemberId(id);
  return sid ? memberProfileUrl(lang, sid) : null;
}