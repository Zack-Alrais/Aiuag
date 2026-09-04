"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Pusher, { PresenceChannel } from "pusher-js";
import { useSession } from "next-auth/react";
import { getClientPusher, userChannel, globalPresenceChannel } from "@/lib/pusher-client";

export interface OnlineMember {
  /** Pusher presence member id == the Member.id */
  id: string;
  name: string;
  image?: string;
}

export interface RealtimeEvent {
  channel: string;
  event: string;
  data: unknown;
}

interface PusherContextValue {
  pusher: Pusher | null;
  enabled: boolean;
  tick: number;
  lastEvent: RealtimeEvent | null;
  resetEvents: () => void;
  subscribe: (
    channel: string,
    event: string,
    handler: (data: unknown) => void
  ) => () => void;
  /** Members currently subscribed to presence-global (online right now). */
  onlineMembers: OnlineMember[];
  /** Map of all online member ids currently known. */
  onlineIds: Set<string>;
}

const EMPTY_SET = new Set<string>();

const PusherContext = createContext<PusherContextValue>({
  pusher: null,
  enabled: false,
  tick: 0,
  lastEvent: null,
  resetEvents: () => {},
  subscribe: () => () => {},
  onlineMembers: [],
  onlineIds: EMPTY_SET,
});

export function usePusher(): PusherContextValue {
  return useContext(PusherContext);
}

export function PusherProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const memberId = (session?.user as { memberId?: string | null } | undefined)
    ?.memberId;
  const isAuthed = status === "authenticated" && !!memberId;

  const [pusher, setPusher] = useState<Pusher | null>(null);
  const [tick, setTick] = useState(0);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const [onlineMembers, setOnlineMembers] = useState<OnlineMember[]>([]);
  const [onlineIds, setOnlineIds] = useState<Set<string>>(EMPTY_SET);
  const nonceRef = useRef(0);

  // Keep event handlers registered with subscribe() across renders.
  const handlersRef = useRef<
    Map<string, Set<(data: unknown) => void>>
  >(new Map());

  useEffect(() => {
    if (!isAuthed) return;
    const p = getClientPusher();
    if (!p) return;
    setPusher(p);

    const channel = p.subscribe(userChannel(memberId!));
    const onEvent = (data: unknown) => {
      nonceRef.current += 1;
      setLastEvent({ channel: channel.name, event: "", data });
      setTick(nonceRef.current);
    };
    channel.bind("notification:new", onEvent);
    channel.bind("conversation:update", onEvent);

    // Global presence: track who's online across the community.
    const presence = p.subscribe(globalPresenceChannel()) as PresenceChannel;
    const avail: OnlineMember[] = [];
    const snap = (c: PresenceChannel) => {
      avail.length = 0;
      c.members.each((id: string, info: unknown) => {
        const i = (info ?? {}) as { name?: string; image?: string };
        avail.push({
          id,
          name: i.name || "",
          image: i.image || undefined,
        });
      });
      setOnlineMembers([...avail]);
      setOnlineIds(new Set(avail.map((m) => m.id)));
    };
    const subSucceeded = () => snap(presence);
    const onMemberAdded = (m: unknown) => {
      const m2 = m as { id: string; info?: { name?: string; image?: string } };
      if (m2?.id) {
        const info = m2.info ?? {};
        setOnlineMembers((prev) =>
          prev.some((x) => x.id === m2.id)
            ? prev
            : [...prev, { id: m2.id, name: info.name || "", image: info.image || undefined }]
        );
        setOnlineIds((prev) => new Set(prev).add(m2.id));
      }
    };
    const onMemberRemoved = (m: unknown) => {
      const id = (m as { id?: string })?.id;
      if (!id) return;
      setOnlineMembers((prev) => prev.filter((x) => x.id !== id));
      setOnlineIds((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    };
    presence.bind("pusher:subscription_succeeded", subSucceeded);
    presence.bind("pusher:member_added", onMemberAdded);
    presence.bind("pusher:member_removed", onMemberRemoved);

    return () => {
      try {
        channel.unbind("notification:new", onEvent);
        channel.unbind("conversation:update", onEvent);
        p.unsubscribe(userChannel(memberId!));
        presence.unbind("pusher:subscription_succeeded", subSucceeded);
        presence.unbind("pusher:member_added", onMemberAdded);
        presence.unbind("pusher:member_removed", onMemberRemoved);
        p.unsubscribe(globalPresenceChannel());
      } catch {}
      setPusher(null);
      setOnlineMembers([]);
      setOnlineIds(EMPTY_SET);
    };
  }, [isAuthed, memberId]);

  const subscribe = useCallback(
    (channelName: string, event: string, handler: (data: unknown) => void) => {
      const p = getClientPusher();
      if (!p) return () => {};
      let set = handlersRef.current.get(channelName + "::" + event);
      if (!set) {
        set = new Set();
        handlersRef.current.set(channelName + "::" + event, set);
        const ch = p.subscribe(channelName);
        const namespaced = (data: unknown) => {
          set?.forEach((h) => h(data));
        };
        ch.bind(event, namespaced);
      }
      set.add(handler);
      return () => {
        set.delete(handler);
      };
    },
    []
  );

  const resetEvents = useCallback(() => {
    setLastEvent(null);
  }, []);

  return (
    <PusherContext.Provider
      value={{ pusher, enabled: isAuthed && !!pusher, tick, lastEvent, resetEvents, subscribe, onlineMembers, onlineIds }}
    >
      {children}
    </PusherContext.Provider>
  );
}