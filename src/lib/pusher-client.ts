import Pusher from "pusher-js";

let instance: Pusher | null = null;

export function getClientPusher(): Pusher | null {
  if (typeof window === "undefined") return null;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  if (!key) return null;
  if (!instance) {
    instance = new Pusher(key, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1",
      authEndpoint: "/api/realtime/auth",
      auth: {
        headers: {},
        params: {},
      },
      enabledTransports: ["ws", "wss"],
    });
  }
  return instance;
}

export function userChannel(memberId: string): string {
  return `private-user-${memberId}`;
}

export function globalPresenceChannel(): string {
  return `presence-global`;
}

export function conversationChannel(conversationId: string): string {
  return `private-conversation-${conversationId}`;
}

export function presenceChannel(conversationId: string): string {
  return `presence-conversation-${conversationId}`;
}