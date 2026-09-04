import Pusher from "pusher";

// Server-side Pusher. Never expose appId/secret to the client.
let pusherInstance: Pusher | null = null;

export function getPusher(): Pusher | null {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER || "mt1";
  if (!appId || !key || !secret) return null;
  if (!pusherInstance) {
    pusherInstance = new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    });
  }
  return pusherInstance;
}

// Trigger a realtime event. Gracefully no-ops when Pusher is not configured
// (e.g. local dev without keys) so the app keeps working.
export async function triggerEvent(
  channel: string,
  event: string,
  data: Record<string, unknown>
): Promise<void> {
  const pusher = getPusher();
  if (!pusher) return;
  try {
    await pusher.trigger(channel, event, data);
  } catch {
    // Swallow realtime delivery errors; persistence already happened in the DB.
  }
}

// Authorization payload for private / presence channels.
export function pusherAuthParams(): {
  appId: string | undefined;
  key: string | undefined;
  cluster: string | undefined;
  configured: boolean;
} {
  return {
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    cluster: process.env.PUSHER_CLUSTER || "mt1",
    configured: !!(process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET),
  };
}