import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPusher } from "@/lib/pusher";
import { getSessionMember } from "@/lib/social-auth";

// Authorizes Pusher private/presence channel subscriptions so users can only
// subscribe to channels that belong to them or they participate in.
export async function POST(request: NextRequest) {
  const session = await getSessionMember();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pusher = getPusher();
  if (!pusher) {
    return NextResponse.json(
      { error: "Realtime is not configured" },
      { status: 503 }
    );
  }

  const form = await request.formData();
  const socketId = form.get("socket_id");
  const channelName = form.get("channel_name");
  if (typeof socketId !== "string" || typeof channelName !== "string") {
    return NextResponse.json({ error: "Missing subscription data" }, { status: 400 });
  }

  const authorized = await canSubscribe(session.memberId, channelName);
  if (!authorized) {
    return NextResponse.json({ error: "Forbidden channel" }, { status: 403 });
  }

  // Presence channels require user_data serialized into the signature.
  const isPresence = channelName.startsWith("presence-");
  const presenceData = isPresence
    ? {
        user_id: session.memberId,
        user_info: { name: session.name, email: session.email },
      }
    : undefined;

  const auth = pusher.authorizeChannel(socketId, channelName, presenceData);
  return NextResponse.json(auth);
}

async function canSubscribe(memberId: string, channelName: string): Promise<boolean> {
  // Global presence channel (who's online across the community).
  if (channelName === "presence-global") return true;

  // Own user channel (private-user-{memberId})
  if (channelName === `private-user-${memberId}`) return true;

  // Conversation channels (private-conversation-{id} | presence-conversation-{id})
  const prefix = channelName.startsWith("presence-")
    ? `presence-conversation-`
    : `private-conversation-`;
  if (channelName.startsWith(prefix)) {
    const conversationId = channelName.slice(prefix.length);
    if (!conversationId) return false;
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_memberId: { conversationId, memberId },
      },
      select: { id: true },
    });
    return !!participant;
  }

  return false;
}