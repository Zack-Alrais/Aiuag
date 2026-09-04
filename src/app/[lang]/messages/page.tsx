"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  MessageCircle,
  Send,
  Users,
  ArrowRight,
  Check,
  CheckCheck,
  Search,
  X,
  Plus,
  UserPlus,
} from "lucide-react";
import { useMember } from "@/hooks/use-member";
import { usePusher } from "@/components/chat/pusher-provider";
import { conversationChannel, presenceChannel } from "@/lib/pusher-client";

interface ParticipantBrief {
  id: string;
  name: string;
  email: string;
  image: string | null;
  nameEn: string | null;
  faculty: string | null;
  graduationYear: number | null;
  city: string | null;
  country: string | null;
  lastReadAt: string | null;
  role: string;
}

interface FriendBrief {
  id: string;
  name: string;
  email: string;
  image: string | null;
  nameEn: string | null;
  faculty: string | null;
}

interface ConversationSummary {
  id: string;
  type: "direct" | "group";
  name: string | null;
  avatar: string | null;
  otherParticipants: ParticipantBrief[];
  participantCount: number;
  lastMessage: { id: string; content: string; senderId: string; attachmentType: string | null; createdAt: string } | null;
  unread: number;
  lastMessageAt: string | null;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string | null;
  senderImage: string | null;
  content: string;
  attachmentUrl: string | null;
  attachmentType: string | null;
  replyToId: string | null;
  editedAt: string | null;
  createdAt: string;
}

interface RealtimePusherEvent {
  channel: string;
  event: string;
  data: unknown;
}

export default function MessagesPage() {
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "ar";
  const isAr = lang === "ar";
  const router = useRouter();
  const searchParams = useSearchParams();
  const { member, status } = useMember();
  const { pusher, subscribe } = usePusher();

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeId, setActiveId] = useState<string | null | undefined>(undefined);
  const [active, setActive] = useState<ConversationSummary | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [listOpen, setListOpen] = useState(true);
  const [typing, setTyping] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const threadEndRef = useRef<HTMLDivElement>(null);
  const historyCursor = useRef<string | null>(null);
  const hasMoreRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const [picker, setPicker] = useState<"create" | "add" | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [groups, setGroups] = useState<FriendBrief[]>([]);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [creatingGroup, setCreatingGroup] = useState(false);

  const myId = member?.id;

  const loadConversations = useCallback(async () => {
    const res = await fetch("/api/conversations");
    const d = await res.json();
    const list: ConversationSummary[] = d?.data ?? [];
    setConversations(list);
    setLoaded(true);
    return list;
  }, []);

  const loadFriends = useCallback(async () => {
    try {
      const res = await fetch("/api/friends?limit=100");
      const d = await res.json();
      const list: FriendBrief[] = (d?.data ?? []).map((f: { id: string; name: string; email: string; image: string | null; nameEn: string | null; faculty: string | null }) => ({
        id: f.id, name: f.name, email: f.email, image: f.image, nameEn: f.nameEn, faculty: f.faculty,
      }));
      setGroups(list);
    } catch {}
  }, []);

  const createGroup = async () => {
    if (!selectedMembers.length) return;
    setCreatingGroup(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "group", name: groupName, participantIds: selectedMembers }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error || "فشل إنشاء المجموعة");
      toast.success(isAr ? "تم إنشاء المجموعة" : "Group created");
      setPicker(null);
      setGroupName("");
      setSelectedMembers([]);
      loadConversations().then((list) => {
        const created = list.find((c) => c.id === d.conversationId);
        openConversation(created?.id ?? d.conversationId ?? null);
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل إنشاء المجموعة");
    } finally {
      setCreatingGroup(false);
    }
  };

  const addMember = async () => {
    if (!activeId || !selectedMembers.length) return;
    for (const memberId of selectedMembers) {
      try {
        await fetch(`/api/conversations/${activeId}/participants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberIds: [memberId] }),
        });
      } catch {}
    }
    toast.success(isAr ? "تمت إضافة الأعضاء" : "Members added");
    setPicker(null);
    setSelectedMembers([]);
    setShowMembers(false);
    loadConversations();
  };

  const removeMember = async (memberId: string) => {
    if (!activeId) return;
    try {
      const res = await fetch(`/api/conversations/${activeId}/participants?memberId=${encodeURIComponent(memberId)}`, {
        method: "DELETE",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error || "فشل الإزالة");
      toast.success(isAr ? "تمت إزالة العضو" : "Member removed");
      loadConversations();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الإزالة");
    }
  };

  const leaveGroup = async () => {
    if (!activeId) return;
    try {
      const res = await fetch(`/api/conversations/${activeId}`, { method: "DELETE" });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error || "فشل المغادرة");
      toast.success(isAr ? "غادرت المجموعة" : "Left the group");
      setActiveId(null);
      loadConversations().then((list) => setActiveId(list[0]?.id ?? null));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل المغادرة");
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/auth/login?callbackUrl=${encodeURIComponent(`/${lang}/messages`)}`);
      return;
    }
    if (status !== "authenticated" || !myId) return;
    loadConversations().then((list) => {
      const fromQuery = searchParams.get("conversation");
      if (fromQuery) setActiveId(fromQuery);
      else setActiveId(list[0]?.id ?? null);
    });
  }, [status, myId, lang, router, loadConversations, searchParams]);

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => {
      const label = (c.name || "") + " " + (c.otherParticipants.map((p) => `${p.name} ${p.nameEn ?? ""}`).join(" "));
      return label.toLowerCase().includes(q);
    });
  }, [conversations, search]);

  const openConversation = useCallback(
    (id: string | null) => {
      setActiveId(id);
      setListOpen(false);
      if (typeof window !== "undefined" && window.innerWidth >= 1024) setListOpen(true);
      historyCursor.current = null;
      hasMoreRef.current = false;
    },
    []
  );

  const loadMessages = useCallback(async () => {
    if (!activeId || !myId) return;
    const markSeen = async () => {
      try {
        fetch(`/api/conversations/${activeId}/read`, { method: "POST" });
      } catch {}
    };
    markSeen();
    const res = await fetch(`/api/conversations/${activeId}/messages?limit=40`);
    const d = await res.json();
    setMessages((d?.data ?? []) as ChatMessage[]);
    historyCursor.current = d?.cursor ?? null;
    hasMoreRef.current = d?.hasMore ?? false;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, unread: 0 } : c))
    );
  }, [activeId, myId]);

  useEffect(() => {
    if (activeId) loadMessages();
  }, [activeId, loadMessages]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "instant" as ScrollBehavior });
  }, [messages.length, activeId]);

  const loadOlder = async () => {
    if (!activeId || loadingMoreRef.current || !historyCursor.current || !hasMoreRef.current) return;
    loadingMoreRef.current = true;
    const res = await fetch(`/api/conversations/${activeId}/messages?limit=40&before=${historyCursor.current}`);
    const d = await res.json();
    const older = (d?.data ?? []) as ChatMessage[];
    setMessages((prev) => [...older, ...prev]);
    historyCursor.current = d?.cursor ?? null;
    hasMoreRef.current = d?.hasMore ?? false;
    loadingMoreRef.current = false;
  };

  const onScrollTop = () => {
    loadOlder();
  };

  // ---- Pusher subscriptions ----
  useEffect(() => {
    if (!myId) return;

    // Refresh the conversation list whenever something changes (badge updates).
    const unsubUser = subscribe(`private-user-${myId}`, "conversation:update", () => {
      loadConversations();
    });

    return () => {
      unsubUser();
    };
  }, [myId, subscribe, loadConversations]);

  // Live message/read/typing events on the ACTIVE conversation channel.
  useEffect(() => {
    if (!activeId) return;
    const ch = conversationChannel(activeId);

    const unsubNew = subscribe(ch, "message:new", (data) => {
      const { message } = (data ?? {}) as { message: ChatMessage };
      if (!message) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        const next = [...prev, message];
        return next.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      });
      if (message.senderId !== myId) {
        fetch(`/api/conversations/${activeId}/read`, { method: "POST" }).catch(() => {});
      }
      loadConversations();
    });

    const unsubRead = subscribe(ch, "message:read", () => {
      // Re-fetch the participant list to update "seen" ticks.
      fetch(`/api/conversations/${activeId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d?.participants) {
            setActive((a) =>
              a
                ? {
                    ...a,
                    otherParticipants: d.participants.filter(
                      (p: { id: string }) => p.id !== myId
                    ),
                  }
                : a
            );
          }
        })
        .catch(() => {});
    });

    const unsubTyping = subscribe(`presence-conversation-${activeId}`, "client-typing", (data) => {
      const { memberId } = (data ?? {}) as { memberId?: string };
      if (!memberId || memberId === myId) return;
      setTyping((prev) => (prev.includes(memberId) ? prev : [...prev, memberId]));
      setTimeout(() => {
        setTyping((prev) => prev.filter((m) => m !== memberId));
      }, 2500);
    });

    return () => {
      unsubNew();
      unsubRead();
      unsubTyping();
    };
  }, [activeId, myId, subscribe, loadConversations]);

  const sendTyping = useCallback(() => {
    if (!activeId || !myId) return;
    try {
      pusher?.connection.send_event("client-typing", { memberId: myId }, presenceChannel(activeId));
    } catch {}
  }, [activeId, myId, pusher]);

  const sendMessage = async () => {
    const content = draft.trim();
    if (!content || !activeId || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${activeId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error || "فشل الإرسال");
      setMessages((prev) => (prev.some((m) => m.id === d.message.id) ? prev : [...prev, d.message]));
      setDraft("");
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? { ...c, lastMessage: { id: d.message.id, content: d.message.content, senderId: myId!, attachmentType: null, createdAt: d.message.createdAt }, lastMessageAt: d.message.createdAt, unread: 0 }
            : c
        )
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الإرسال");
    } finally {
      setSending(false);
    }
  };

  // Recompute active summary whenever the list refreshes.
  useEffect(() => {
    if (!activeId || activeId === null) return;
    const found = conversations.find((c) => c.id === activeId) ?? null;
    setActive(found);
  }, [conversations, activeId]);

  if (status !== "authenticated" || !member) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center pt-24">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const activeLabel = (c: ConversationSummary): { title: string; sub: string } => {
    if (c.type === "group") {
      return { title: c.name || (isAr ? "مجموعة" : "Group"), sub: `${c.participantCount}` };
    }
    const other = c.otherParticipants[0];
    return { title: other?.name || "", sub: other?.nameEn || "" };
  };

  const avatarFor = (c: ConversationSummary) => {
    if (c.type === "group") {
      return c.avatar || "G";
    }
    return c.otherParticipants[0]?.image ?? c.otherParticipants[0]?.name?.charAt(0) ?? "?";
  };

  const currentLabel = active ? activeLabel(active) : { title: "", sub: "" };

  return (
    <div className="max-w-6xl mx-auto px-4 py-28">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <MessageCircle className="w-7 h-7 text-primary" />
          {isAr ? "المراسلات" : "Messages"}
        </h1>
        <button
          onClick={() => {
            loadFriends();
            setPicker("create");
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{isAr ? "مجموعة جديدة" : "New Group"}</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-4 h-[calc(100dvh-220px)] min-h-[480px]">
        {/* Conversation list */}
        <div className={`${listOpen ? "flex" : "hidden"} lg:flex flex-col bg-white dark:bg-[#16212f] border border-gray-100 dark:border-[#1e2d42] rounded-2xl overflow-hidden`}>
          <div className="p-3 border-b border-gray-100 dark:border-[#1e2d42]">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isAr ? "بحث في المحادثات..." : "Search conversations..."}
                className="w-full py-2.5 ps-9 pe-3 rounded-xl bg-gray-50 dark:bg-[#1e2d42] text-sm outline-none focus:ring-2 ring-primary/40"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {!loaded ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400 px-4">
                {isAr ? "لا توجد محادثات بعد. ابدأ بالمراسلة من صفحة الأصدقاء." : "No conversations yet. Start chatting from the friends page."}
              </div>
            ) : (
              filteredConversations.map((c) => {
                const { title, sub } = activeLabel(c);
                const other = c.otherParticipants[0];
                const isGroup = c.type === "group";
                const avatarSrc = isGroup ? c.avatar : other?.image;
                const avatarInitial = avatarSrc ? "" : (isGroup ? "G" : (other?.name?.charAt(0) ?? "?"));
                return (
                  <button
                    key={c.id}
                    onClick={() => openConversation(c.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 text-start hover:bg-gray-50 dark:hover:bg-[#1e2d42] transition-colors border-b border-gray-50 dark:border-[#1e2d42] ${activeId === c.id ? "bg-primary/5 dark:bg-primary/10" : ""}`}
                  >
                    <div className="relative w-11 h-11 rounded-full overflow-hidden bg-gray-100 dark:bg-[#1e2d42] shrink-0">
                      {avatarSrc ? (
                        <img src={avatarSrc} alt={title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-sm">
                          {avatarInitial}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{title}</p>
                        {c.unread > 0 && (
                          <span className="min-w-5 h-5 px-1.5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">{c.unread}</span>
                        )}
                      </div>
                      <p className={`text-xs truncate ${c.unread > 0 ? "text-gray-700 dark:text-gray-200 font-medium" : "text-gray-500 dark:text-gray-400"}`}>
                        {c.lastMessage
                          ? c.lastMessage.senderId === myId
                            ? isAr ? "أنت: " : "You: "
                            : ""
                          : isAr ? "ابدأ المحادثة" : "Say hi"}
                        {c.lastMessage ? (c.lastMessage.content || (c.lastMessage.attachmentType ?? "")) : ""}
                      </p>
                      {typing.length > 0 && activeId === c.id && (
                        <p className="text-xs text-primary">{isAr ? "يكتب الآن..." : "typing..."}</p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Thread */}
        {active ? (
          <div className="flex flex-col bg-white dark:bg-[#16212f] border border-gray-100 dark:border-[#1e2d42] rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-[#1e2d42]">
              <button onClick={() => setListOpen(true)} className="lg:hidden text-gray-500 dark:text-gray-300">
                {isAr ? <ArrowRight className="w-5 h-5 rotate-180" /> : <ArrowRight className="w-5 h-5" />}
              </button>
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-[#1e2d42] shrink-0">
                {active.type === "group" && active.avatar ? (
                  <img src={active.avatar} alt="" className="w-full h-full object-cover" />
                ) : active.otherParticipants[0]?.image ? (
                  <img src={active.otherParticipants[0].image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold">
                    {activeLabel(active).title.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{currentLabel.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {typing.length > 0
                    ? isAr ? "يكتب الآن..." : "typing..."
                    : active.type === "group"
                      ? `${active.participantCount} ${isAr ? "مشارك" : (active.participantCount === 1 ? "member" : "members")}`
                      : active.otherParticipants[0]?.faculty || currentLabel.sub}
                </p>
              </div>
              {active.type === "group" && (
                <button
                  onClick={() => setShowMembers((s) => !s)}
                  className={`p-2 rounded-lg transition-colors ${showMembers ? "bg-primary/10 text-primary" : "hover:bg-gray-100 dark:hover:bg-[#1e2d42] text-gray-500 dark:text-gray-300"}`}
                >
                  <Users className="w-5 h-5" />
                </button>
              )}
              {active.type === "group" && (
                <button
                  onClick={leaveGroup}
                  title={isAr ? "مغادرة المجموعة" : "Leave group"}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 dark:text-gray-300 hover:text-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Group members panel */}
            {showMembers && active.type === "group" && (
              <div className="border-b border-gray-100 dark:border-[#1e2d42] px-4 py-3 max-h-48 overflow-y-auto">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2 uppercase">
                  {isAr ? "الأعضاء" : "Members"} ({active.participantCount})
                </p>
                <div className="space-y-1.5">
                  {active.otherParticipants.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-100 dark:bg-[#1e2d42] shrink-0">
                          {p.image ? (
                            <img src={p.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">{p.name.charAt(0)}</div>
                          )}
                        </div>
                        <span className="text-sm text-gray-800 dark:text-gray-200 truncate">{p.name}</span>
                        {p.role === "admin" && <span className="text-[10px] text-primary font-medium">{isAr ? "مدير" : "admin"}</span>}
                      </div>
                      <button
                        onClick={() => removeMember(p.id)}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors p-1"
                        title={isAr ? "إزالة" : "Remove"}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <div className="pt-1.5">
                    <button
                      onClick={() => {
                        loadFriends();
                        setPicker("add");
                      }}
                      className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark"
                    >
                      <UserPlus className="w-4 h-4" />
                      {isAr ? "إضافة عضو" : "Add member"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
              onScroll={(e) => {
                if (e.currentTarget.scrollTop < 40) onScrollTop();
              }}
            >
              {hasMoreRef.current && (
                <div className="flex justify-center py-2">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              )}
              {messages.map((m) => {
                const mine = m.senderId === myId;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"} items-end gap-2`}>
                    {!mine && (
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-100 dark:bg-[#1e2d42] shrink-0 hidden sm:block">
                        {m.senderImage ? (
                          <img src={m.senderImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                            {m.senderName?.charAt(0) || "?"}
                          </div>
                        )}
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                        mine
                          ? "bg-primary text-white rounded-br-md"
                          : "bg-gray-100 dark:bg-[#1e2d42] text-gray-900 dark:text-gray-100 rounded-bl-md"
                      }`}
                    >
                      {!mine && active.type === "group" && (
                        <p className="text-[10px] font-semibold text-primary mb-0.5">{m.senderName}</p>
                      )}
                      {m.attachmentType === "image" && m.attachmentUrl && (
                        <img src={m.attachmentUrl} alt="" className="rounded-lg max-h-60 my-1" />
                      )}
                      {m.content && <p className="whitespace-pre-wrap break-words">{m.content}</p>}
                      <p className={`text-[10px] mt-1 ${mine ? "text-white/70" : "text-gray-400 dark:text-gray-500"} flex items-center justify-end gap-1`}>
                        {new Date(m.createdAt).toLocaleTimeString(lang === "ar" ? "ar" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                        {mine && (m.editedAt ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />)}
                      </p>
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 && (
                <div className="py-16 text-center text-sm text-gray-400 dark:text-gray-500">
                  {isAr ? "ابدأ المحادثة مع أصدقائك" : "Start chatting with your friends"}
                </div>
              )}
              <div ref={threadEndRef} />
            </div>

            {/* Composer */}
            <div className="p-3 border-t border-gray-100 dark:border-[#1e2d42]">
              <div className="flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    sendTyping();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  rows={1}
                  placeholder={isAr ? "اكتب رسالة..." : "Type a message..."}
                  className="flex-1 resize-none py-2.5 px-4 rounded-xl bg-gray-50 dark:bg-[#1e2d42] text-sm outline-none focus:ring-2 ring-primary/40 max-h-32"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !draft.trim()}
                  className="p-2.5 rounded-xl bg-primary text-white disabled:opacity-50 hover:bg-primary-dark transition-colors shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-col items-center justify-center bg-white dark:bg-[#16212f] border border-gray-100 dark:border-[#1e2d42] rounded-2xl text-center p-10">
            <div className="w-16 h-16 bg-gray-100 dark:bg-[#1e2d42] rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-medium text-gray-700 dark:text-gray-200">{isAr ? "اختر محادثة للبدء" : "Pick a conversation to start chatting"}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{isAr ? "المراسلة متاحة بين الأصدقاء فقط" : "Messaging is available between friends only"}</p>
          </div>
        )}
      </div>

      {picker && (
        <div className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4" onClick={() => setPicker(null)}>
          <div className="bg-white dark:bg-[#1a2440] rounded-2xl w-full max-w-md p-5 shadow-2xl max-h-[80dvh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">
                {picker === "create"
                  ? (isAr ? "إنشاء مجموعة جديدة" : "New group")
                  : (isAr ? "إضافة أعضاء" : "Add members")}
              </h3>
              <button onClick={() => setPicker(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-[#2a3f5f] rounded-full"><X className="w-5 h-5" /></button>
            </div>

            {picker === "create" && (
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder={isAr ? "اسم المجموعة (اختياري)" : "Group name (optional)"}
                className="w-full mb-4 py-2.5 px-4 rounded-xl bg-gray-50 dark:bg-[#0d1525] text-sm outline-none focus:ring-2 ring-primary/40"
                dir="rtl"
              />
            )}

            <div className="flex-1 overflow-y-auto space-y-1.5 mb-4">
              {groups.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  {isAr ? "لا يوجد أصدقاء لإضافتهم" : "No friends to add"}
                </p>
              ) : (
                groups.map((f) => (
                  <label
                    key={f.id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                      selectedMembers.includes(f.id)
                        ? "bg-primary/5 border border-primary/40"
                        : "hover:bg-gray-50 dark:hover:bg-[#1e2d42] border border-transparent"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(f.id)}
                      onChange={() =>
                        setSelectedMembers((prev) =>
                          prev.includes(f.id) ? prev.filter((id) => id !== f.id) : [...prev, f.id]
                        )
                      }
                      className="accent-primary"
                    />
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 dark:bg-[#1e2d42] shrink-0">
                      {f.image ? (
                        <img src={f.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-xs font-bold">{f.name.charAt(0)}</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{f.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{f.faculty || f.nameEn || ""}</p>
                    </div>
                  </label>
                ))
              )}
            </div>

            <button
              onClick={picker === "create" ? createGroup : addMember}
              disabled={!selectedMembers.length || creatingGroup}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              {creatingGroup
                ? (isAr ? "جارٍ الإنشاء..." : "Creating...")
                : (picker === "create" ? (isAr ? "إنشاء المجموعة" : "Create group") : (isAr ? "إضافة" : "Add"))}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}